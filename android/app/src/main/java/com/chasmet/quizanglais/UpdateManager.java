package com.chasmet.quizanglais;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class UpdateManager {
    private static final String PREFS = "anglais_plus_updates";
    private static final String PREF_AUTO = "auto_check";
    private static final String LATEST_URL = "https://api.github.com/repos/Chasmet/Application-anglais-/releases/latest";

    private final Activity activity;
    private final WebView webView;
    private final SharedPreferences prefs;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();

    public UpdateManager(Activity activity, WebView webView) {
        this.activity = activity;
        this.webView = webView;
        this.prefs = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    public String getCurrentVersion() {
        try {
            String v = activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0).versionName;
            return v == null ? "0.0.0" : v;
        } catch (Exception e) {
            return "0.0.0";
        }
    }

    public boolean isAutoCheckEnabled() { return prefs.getBoolean(PREF_AUTO, true); }
    public void setAutoCheckEnabled(boolean enabled) { prefs.edit().putBoolean(PREF_AUTO, enabled).apply(); }
    public void autoCheck() { if (isAutoCheckEnabled()) checkLatest(false); }

    public void checkLatest(boolean userRequested) {
        worker.execute(() -> {
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection) new URL(LATEST_URL).openConnection();
                c.setConnectTimeout(7000);
                c.setReadTimeout(7000);
                c.setRequestProperty("Accept", "application/vnd.github+json");
                c.setRequestProperty("User-Agent", "AnglaisPlus-Android");
                int response = c.getResponseCode();
                if (response != 200) throw new Exception("GitHub répond " + response);
                StringBuilder sb = new StringBuilder();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(c.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                }
                JSONObject release = new JSONObject(sb.toString());
                String tag = release.optString("tag_name", "");
                String latest = tag.startsWith("v") ? tag.substring(1) : tag;
                String apkUrl = "";
                JSONArray assets = release.optJSONArray("assets");
                if (assets != null) {
                    for (int i = 0; i < assets.length(); i++) {
                        JSONObject a = assets.getJSONObject(i);
                        String name = a.optString("name", "");
                        if (name.toLowerCase().endsWith(".apk")) {
                            apkUrl = a.optString("browser_download_url", "");
                            break;
                        }
                    }
                }
                String current = getCurrentVersion();
                boolean available = !latest.isEmpty() && compareVersions(latest, current) > 0 && !apkUrl.isEmpty();
                String msg;
                if (available) msg = "Nouvelle version " + latest + " disponible.";
                else if (!latest.isEmpty() && apkUrl.isEmpty()) msg = "Release " + latest + " trouvée, mais aucun APK n’est joint.";
                else msg = "Application à jour (" + current + ").";
                if (userRequested) sendCheckResult(available, latest, apkUrl, msg);
                else if (available) {
                    String fLatest = latest;
                    activity.runOnUiThread(() -> Toast.makeText(activity, "Anglais+ : mise à jour " + fLatest + " disponible dans Réglages", Toast.LENGTH_LONG).show());
                }
            } catch (Throwable e) {
                if (userRequested) sendError("Vérification impossible : " + safeMessage(e));
            } finally {
                if (c != null) c.disconnect();
            }
        });
    }

    public void downloadAndInstall(String url, String version) {
        if (url == null || !url.startsWith("https://github.com/") || !url.endsWith(".apk")) {
            sendError("Lien APK GitHub invalide.");
            return;
        }
        worker.execute(() -> {
            HttpURLConnection c = null;
            try {
                sendProgress(1, "Connexion à GitHub…");
                c = (HttpURLConnection) new URL(url).openConnection();
                c.setConnectTimeout(10000);
                c.setReadTimeout(25000);
                c.setInstanceFollowRedirects(true);
                c.setRequestProperty("User-Agent", "AnglaisPlus-Android");
                int code = c.getResponseCode();
                if (code < 200 || code >= 400) throw new Exception("Téléchargement HTTP " + code);
                long total = c.getContentLengthLong();
                File dir = activity.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (dir == null) dir = activity.getCacheDir();
                File apk = new File(dir, "Anglais-Plus-" + version + ".apk");
                try (BufferedInputStream in = new BufferedInputStream(c.getInputStream()); FileOutputStream out = new FileOutputStream(apk)) {
                    byte[] buf = new byte[64 * 1024];
                    long done = 0;
                    int n;
                    int last = -1;
                    while ((n = in.read(buf)) > 0) {
                        out.write(buf, 0, n);
                        done += n;
                        int pct = total > 0 ? (int) Math.min(99, done * 100 / total) : 50;
                        if (pct != last) { last = pct; sendProgress(pct, "Téléchargement " + pct + "%"); }
                    }
                    out.flush();
                }
                sendProgress(100, "Téléchargement terminé.");
                activity.runOnUiThread(() -> installApk(apk));
            } catch (Throwable e) {
                sendError("Mise à jour impossible : " + safeMessage(e));
            } finally {
                if (c != null) c.disconnect();
            }
        });
    }

    private void installApk(File apk) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !activity.getPackageManager().canRequestPackageInstalls()) {
                Intent permission = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + activity.getPackageName()));
                activity.startActivity(permission);
                sendReady("Autorise Anglais+ à installer la mise à jour, puis appuie de nouveau sur Télécharger et installer.");
                return;
            }
            Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", apk);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(intent);
            sendReady("APK prêt. Confirme l’installation Android. Tes données restent conservées si la signature de l’application est identique.");
        } catch (Throwable e) {
            sendError("Installation impossible : " + safeMessage(e));
        }
    }

    private static int compareVersions(String a, String b) {
        String[] aa = a.split("\\.");
        String[] bb = b.split("\\.");
        int n = Math.max(aa.length, bb.length);
        for (int i = 0; i < n; i++) {
            int x = i < aa.length ? parse(aa[i]) : 0;
            int y = i < bb.length ? parse(bb[i]) : 0;
            if (x != y) return Integer.compare(x, y);
        }
        return 0;
    }

    private static int parse(String s) {
        try {
            String cleaned = s.replaceFirst("[^0-9].*$", "");
            return cleaned.isEmpty() ? 0 : Integer.parseInt(cleaned);
        } catch (Exception e) { return 0; }
    }

    private static String safeMessage(Throwable e) {
        String m = e == null ? null : e.getMessage();
        return m == null || m.trim().isEmpty() ? "erreur inconnue" : m;
    }

    private void js(String script) { activity.runOnUiThread(() -> webView.evaluateJavascript(script, null)); }
    private static String q(String s) { return JSONObject.quote(s == null ? "" : s); }
    private void sendCheckResult(boolean available, String version, String url, String msg) { js("if(window.onUpdateCheck)onUpdateCheck(" + available + "," + q(version) + "," + q(url) + "," + q(msg) + ");"); }
    private void sendProgress(int pct, String msg) { js("if(window.onUpdateProgress)onUpdateProgress(" + pct + "," + q(msg) + ");"); }
    private void sendError(String msg) { js("if(window.onUpdateError)onUpdateError(" + q(msg) + ");"); }
    private void sendReady(String msg) { js("if(window.onUpdateReady)onUpdateReady(" + q(msg) + ");"); }
    public void release() { worker.shutdownNow(); }
}
