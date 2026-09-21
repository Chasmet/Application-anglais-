package com.chasmet.quizanglais;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public final class UpdateManager {
    private static final String LATEST_URL = "https://api.github.com/repos/Chasmet/Application-anglais-/releases/latest";
    private static final long MAX_APK = 400L * 1024 * 1024;
    private final Activity activity;
    private final WebView webView;
    private final SharedPreferences prefs;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final AtomicBoolean checking = new AtomicBoolean(), downloading = new AtomicBoolean();
    private volatile boolean released;
    private volatile String expectedUrl = "", expectedVersion = "", expectedHash = "";
    private volatile long expectedSize;

    public UpdateManager(Activity activity, WebView webView) {
        this.activity = activity; this.webView = webView;
        prefs = activity.getSharedPreferences("anglais_plus_updates", Context.MODE_PRIVATE);
    }
    public String getCurrentVersion() {
        try { return activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0).versionName; }
        catch (Exception e) { return "0.0.0"; }
    }
    public boolean isAutoCheckEnabled() { return prefs.getBoolean("auto_check", true); }
    public void setAutoCheckEnabled(boolean enabled) { prefs.edit().putBoolean("auto_check", enabled).apply(); }
    public void autoCheck() { if (!BuildConfig.DEBUG && isAutoCheckEnabled()) checkLatest(false); }
    public void checkLatest(boolean userRequested) {
        if (released) return;
        if (BuildConfig.DEBUG) { sendCheckResult(false, "", "", "Version de test : les mises à jour de l’application principale sont séparées."); return; }
        if (!checking.compareAndSet(false, true)) { if (userRequested) sendError("Une vérification est déjà en cours. Réessaie dans quelques secondes."); return; }
        worker.execute(() -> {
            HttpURLConnection connection = null;
            try {
                connection = connect(LATEST_URL, 7000);
                if (connection.getResponseCode() != 200) throw new IOException("serveur indisponible");
                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                try (InputStream in = connection.getInputStream()) {
                    byte[] buffer = new byte[8192]; int n;
                    while ((n = in.read(buffer)) != -1) { if (bytes.size() + n > 2000000) throw new IOException("réponse invalide"); bytes.write(buffer, 0, n); }
                }
                JSONObject release = new JSONObject(bytes.toString(StandardCharsets.UTF_8.name()));
                String version = release.optString("tag_name", "").replaceFirst("^v", "");
                if (!UpdatePolicy.validVersion(version)) throw new IOException("version non reconnue");
                String url = "", hash = ""; long size = 0;
                JSONArray assets = release.optJSONArray("assets");
                for (int i = 0; assets != null && i < assets.length(); i++) {
                    JSONObject asset = assets.getJSONObject(i);
                    String candidate = asset.optString("browser_download_url", "");
                    if (UpdatePolicy.officialAsset(candidate, version)) {
                        url = candidate; hash = asset.optString("digest", "").replaceFirst("^sha256:", ""); size = asset.optLong("size", 0); break;
                    }
                }
                boolean newer = UpdatePolicy.compareVersions(version, getCurrentVersion()) > 0;
                boolean verifiedMetadata = hash.matches("[a-fA-F0-9]{64}") && size > 0 && size <= MAX_APK;
                boolean available = newer && !url.isEmpty() && verifiedMetadata;
                expectedUrl = available ? url : ""; expectedVersion = version; expectedHash = hash; expectedSize = size;
                String message = available ? "Nouvelle version " + version + " disponible." : newer ? "La nouvelle version n’est pas encore prête à être installée." : "Application à jour (" + getCurrentVersion() + ").";
                if (userRequested) sendCheckResult(available, version, available ? url : "", message);
                else if (available) activity.runOnUiThread(() -> { if (!released) Toast.makeText(activity, "Anglais+ : mise à jour disponible dans Réglages", Toast.LENGTH_LONG).show(); });
            } catch (Exception error) { if (userRequested) sendError("Vérification impossible : " + message(error)); }
            finally { checking.set(false); if (connection != null) connection.disconnect(); }
        });
    }
    public void downloadAndInstall(String url, String version) {
        if (released) return;
        if (!UpdatePolicy.officialAsset(url, version) || !url.equals(expectedUrl) || !version.equals(expectedVersion)) { sendError("Vérifie à nouveau les mises à jour avant de télécharger."); return; }
        if (!downloading.compareAndSet(false, true)) return;
        final String digest = expectedHash; final long size = expectedSize;
        worker.execute(() -> {
            HttpURLConnection connection = null; File temporary = new File(updateDir(), "update.part.apk");
            try {
                File apk = new File(updateDir(), "update.apk");
                if (apk.isFile() && version.equals(prefs.getString("pending_version", "")) && digest.equalsIgnoreCase(fileHash(apk))) {
                    validateApk(apk, version); activity.runOnUiThread(() -> installApk(apk)); return;
                }
                connection = connect(url, 25000);
                if (connection.getResponseCode() != 200) throw new IOException("téléchargement refusé");
                sendProgress(0, "Téléchargement…"); long done = 0; int last = -1;
                MessageDigest sha = MessageDigest.getInstance("SHA-256");
                try (InputStream in = new BufferedInputStream(connection.getInputStream()); FileOutputStream out = new FileOutputStream(temporary)) {
                    byte[] buffer = new byte[65536]; int n;
                    while ((n = in.read(buffer)) != -1) {
                        if (released || Thread.currentThread().isInterrupted()) throw new IOException("téléchargement interrompu");
                        done += n; if (done > size || done > MAX_APK) throw new IOException("taille inattendue");
                        out.write(buffer, 0, n); sha.update(buffer, 0, n);
                        int percent = (int) Math.min(99, done * 100 / size);
                        if (percent != last) { last = percent; sendProgress(percent, "Téléchargement " + percent + "%"); }
                    }
                    out.getFD().sync();
                }
                if (done != size || !hex(sha.digest()).equalsIgnoreCase(digest)) throw new IOException("fichier incomplet ou modifié. Réessaie le téléchargement");
                validateApk(temporary, version);
                if (apk.exists() && !apk.delete()) throw new IOException("ancien fichier verrouillé");
                if (!temporary.renameTo(apk)) throw new IOException("enregistrement impossible");
                prefs.edit().putString("pending_version", version).putString("pending_hash", digest).apply();
                sendProgress(100, "Fichier vérifié. Installation prête.");
                activity.runOnUiThread(() -> installApk(apk));
            } catch (Exception error) { sendError("Mise à jour impossible : " + message(error)); }
            finally { temporary.delete(); downloading.set(false); if (connection != null) connection.disconnect(); }
        });
    }
    private HttpURLConnection connect(String url, int timeout) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setConnectTimeout(7000); connection.setReadTimeout(timeout); connection.setInstanceFollowRedirects(true);
        connection.setRequestProperty("User-Agent", "AnglaisPlus-Android"); return connection;
    }
    private File updateDir() { File dir = new File(activity.getCacheDir(), "updates"); dir.mkdirs(); return dir; }
    @SuppressWarnings("deprecation")
    private void validateApk(File apk, String version) throws Exception {
        PackageManager pm = activity.getPackageManager();
        int flags = Build.VERSION.SDK_INT >= 28 ? PackageManager.GET_SIGNING_CERTIFICATES : PackageManager.GET_SIGNATURES;
        PackageInfo installed = pm.getPackageInfo(activity.getPackageName(), flags);
        PackageInfo candidate = pm.getPackageArchiveInfo(apk.getAbsolutePath(), flags);
        if (candidate == null || !activity.getPackageName().equals(candidate.packageName) || !version.equals(candidate.versionName)) throw new IOException("ce fichier ne correspond pas à Anglais+");
        long next = Build.VERSION.SDK_INT >= 28 ? candidate.getLongVersionCode() : candidate.versionCode;
        long current = Build.VERSION.SDK_INT >= 28 ? installed.getLongVersionCode() : installed.versionCode;
        if (next <= current) throw new IOException("cette version est déjà installée ou plus ancienne");
        Set<String> existing = certificates(installed), incoming = certificates(candidate);
        if (existing.isEmpty() || !existing.equals(incoming)) throw new IOException("signature incompatible avec ton installation. Garde l’application actuelle et sa progression");
    }
    @SuppressWarnings("deprecation")
    private Set<String> certificates(PackageInfo info) throws Exception {
        Signature[] signatures = Build.VERSION.SDK_INT >= 28 ? (info.signingInfo == null ? null : info.signingInfo.getApkContentsSigners()) : info.signatures;
        Set<String> result = new HashSet<>();
        if (signatures != null) for (Signature signature : signatures) result.add(hex(MessageDigest.getInstance("SHA-256").digest(signature.toByteArray())));
        return result;
    }
    private void installApk(File apk) {
        if (released) return;
        try {
            if (Build.VERSION.SDK_INT >= 26 && !activity.getPackageManager().canRequestPackageInstalls()) {
                prefs.edit().putBoolean("awaiting_permission", true).apply();
                activity.startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + activity.getPackageName())));
                sendReady("Autorise l’installation, puis reviens ici. Le fichier est déjà téléchargé."); return;
            }
            prefs.edit().putBoolean("awaiting_permission", false).apply();
            Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", apk);
            Intent intent = new Intent(Intent.ACTION_VIEW).setDataAndType(uri, "application/vnd.android.package-archive").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            activity.startActivity(intent); sendReady("Confirme l’installation dans la fenêtre Android.");
        } catch (Exception error) { sendError("Installation impossible : " + message(error)); }
    }
    public void resumePendingInstall() {
        if (released || !prefs.getBoolean("awaiting_permission", false)) return;
        if (Build.VERSION.SDK_INT >= 26 && !activity.getPackageManager().canRequestPackageInstalls()) return;
        if (!downloading.compareAndSet(false, true)) return;
        prefs.edit().putBoolean("awaiting_permission", false).apply();
        worker.execute(() -> {
            try {
                File apk = new File(updateDir(), "update.apk"); String version = prefs.getString("pending_version", "");
                if (!apk.isFile() || !fileHash(apk).equalsIgnoreCase(prefs.getString("pending_hash", ""))) throw new IOException("fichier expiré. Relance le téléchargement");
                validateApk(apk, version); activity.runOnUiThread(() -> installApk(apk));
            } catch (Exception error) { sendError("Installation impossible : " + message(error)); }
            finally { downloading.set(false); }
        });
    }
    private String fileHash(File file) throws Exception {
        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        try (InputStream in = new FileInputStream(file)) { byte[] b = new byte[65536]; int n; while ((n = in.read(b)) != -1) sha.update(b, 0, n); }
        return hex(sha.digest());
    }
    private static String hex(byte[] bytes) { StringBuilder b = new StringBuilder(); for (byte v : bytes) b.append(String.format(java.util.Locale.ROOT, "%02x", v & 255)); return b.toString(); }
    private static String message(Exception error) { return error.getMessage() == null ? "réessaie plus tard" : error.getMessage(); }
    private void js(String script) { activity.runOnUiThread(() -> { if (!released) webView.evaluateJavascript(script, null); }); }
    private static String q(String s) { return JSONObject.quote(s == null ? "" : s); }
    private void sendCheckResult(boolean available, String version, String url, String message) { js("if(window.onUpdateCheck)onUpdateCheck(" + available + "," + q(version) + "," + q(url) + "," + q(message) + ");"); }
    private void sendProgress(int percent, String message) { js("if(window.onUpdateProgress)onUpdateProgress(" + percent + "," + q(message) + ");"); }
    private void sendError(String message) { js("if(window.onUpdateError)onUpdateError(" + q(message) + ");"); }
    private void sendReady(String message) { js("if(window.onUpdateReady)onUpdateReady(" + q(message) + ");"); }
    public void release() { released = true; worker.shutdownNow(); }
}
