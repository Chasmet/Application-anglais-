package com.chasmet.quizanglais;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Environment;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
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

    public String getCurrentVersion() { return BuildConfig.VERSION_NAME; }
    public boolean isAutoCheckEnabled() { return prefs.getBoolean(PREF_AUTO, true); }
    public void setAutoCheckEnabled(boolean enabled) { prefs.edit().putBoolean(PREF_AUTO, enabled).apply(); }

    public void autoCheck() {
        if (!isAutoCheckEnabled()) return;
        checkLatest(false);
    }

    public void checkLatest(boolean userRequested) {
        worker.execute(() -> {
            HttpURLConnection c = null;
            try {
                c = (HttpURLConnection) new URL(LATEST_URL).openConnection();
                c.setConnectTimeout(7000);
                c.setReadTimeout(7000);
                c.setRequestProperty("Accept", "application/vnd.github+json");
                c.setRequestProperty("User-Agent", "AnglaisPlus-Android");
                if (c.getResponseCode() != 200) throw new Exception("GitHub répond " + c.getResponseCode());
                String json = new String(c.getInputStream().readAllBytes());
                JSONObject release = new JSONObject(json);
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
                boolean available = !latest.isEmpty() && compareVersions(latest, BuildConfig.VERSION_NAME) > 0 && !apkUrl.isEmpty();
                final String fLatest = latest;
                final String fUrl = apkUrl;
                final boolean fAvailable = available;
                final String msg = available ? "Nouvelle version " + latest + " disponible." : "Application à jour (" + BuildConfig.VERSION_NAME + ").";
                if (userRequested) sendCheckResult(fAvailable, fLatest, fUrl, msg);
                else if (available) activity.runOnUiThread(() -> Toast.makeText(activity, "Anglais+ : mise à jour " + fLatest + " disponible dans Réglages", Toast.LENGTH_LONG).show());
            } catch (Throwable e) {
                if (userRequested) sendError("Vérification impossible : " + e.getMessage());
            } finally {
                if (c != null) c.disconnect();
            }
        });
    }

    public void downloadAndInstall(String url, String version) {
        worker.execute(() -> {
            HttpURLConnection c = null;
            try {
                sendProgress(1, "Connexion à GitHub…");
                c = (HttpURLConnection) new URL(url).openConnection();
                c.setConnectTimeout(10000);
                c.setReadTimeout(20000);
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
                sendError("Mise à jour impossible : " + e.getMessage());
            } finally {
                if (c != null) c.disconnect();
            }
        });
    }

    private void installApk(File apk) {
        try {
            Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", apk);
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(intent);
            sendReady("APK prêt. Confirme l’installation Android pour conserver tes données.");
        } catch (Throwable e) {
            sendError("Installation impossible : " + e.getMessage());
        }
    }

    private static int compareVersions(String a, String b) {
        String[] aa = a.split("\\."); String[] bb = b.split("\\.");
        int n = Math.max(aa.length, bb.length);
        for (int i = 0; i < n; i++) {
            int x = i < aa.length ? parse(aa[i]) : 0;
            int y = i < bb.length ? parse(bb[i]) : 0;
            if (x != y) return Integer.compare(x, y);
        }
        return 0;
    }
    private static int parse(String s) { try { return Integer.parseInt(s.replaceAll("[^0-9].*", "")); } catch (Exception e) { return 0; } }

    private void js(String script) { activity.runOnUiThread(() -> webView.evaluateJavascript(script, null)); }
    private static String q(String s) { return JSONObject.quote(s == null ? "" : s); }
    private void sendCheckResult(boolean available, String version, String url, String msg) { js("if(window.onUpdateCheck)onUpdateCheck(" + available + "," + q(version) + "," + q(url) + "," + q(msg) + ");"); }
    private void sendProgress(int pct, String msg) { js("if(window.onUpdateProgress)onUpdateProgress(" + pct + "," + q(msg) + ");"); }
    private void sendError(String msg) { js("if(window.onUpdateError)onUpdateError(" + q(msg) + ");"); }
    private void sendReady(String msg) { js("if(window.onUpdateReady)onUpdateReady(" + q(msg) + ");"); }

    public void release() { worker.shutdownNow(); }
}
