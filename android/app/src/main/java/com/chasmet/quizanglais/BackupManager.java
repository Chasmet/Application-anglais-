package com.chasmet.quizanglais;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.webkit.WebView;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** User-chosen documents; no storage permission and no external upload. */
public final class BackupManager {
    private static final int EXPORT = 810, IMPORT = 811, LIMIT = 4000000;
    private final Activity activity;
    private final WebView web;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private String pendingExport;
    private boolean busy, released;
    public BackupManager(Activity activity, WebView web) { this.activity = activity; this.web = web; }
    public void exportData(String json) {
        if (busy || json == null || json.length() > LIMIT) return;
        try {
            JSONObject data = new JSONObject(json);
            if (!"AnglaisPlus".equals(data.optString("app")) || data.optInt("schema") != 1) throw new Exception();
            busy = true; pendingExport = json;
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json");
            intent.putExtra(Intent.EXTRA_TITLE, "AnglaisPlus-sauvegarde.json"); activity.startActivityForResult(intent, EXPORT);
        } catch (Exception error) { busy = false; reply("onBackupStatus", "Impossible d’ouvrir l’export."); }
    }
    public void importData() {
        if (busy) return;
        try { busy = true; activity.startActivityForResult(new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*").putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/plain"}), IMPORT); }
        catch (Exception error) { busy = false; reply("onBackupStatus", "Impossible d’ouvrir le fichier."); }
    }
    public boolean onResult(int request, int result, Intent data) {
        if (request != EXPORT && request != IMPORT) return false;
        busy = false;
        if (result != Activity.RESULT_OK || data == null || data.getData() == null) { pendingExport = null; reply("onBackupStatus", "Opération annulée."); return true; }
        Uri uri = data.getData(); String payload = pendingExport; pendingExport = null;
        worker.execute(() -> {
            try {
                if (request == EXPORT) {
                    if (payload == null) throw new Exception();
                    try (OutputStream out = activity.getContentResolver().openOutputStream(uri, "wt")) { if (out == null) throw new Exception(); out.write(payload.getBytes(StandardCharsets.UTF_8)); }
                    reply("onBackupStatus", "Sauvegarde enregistrée.");
                } else {
                    try (InputStream in = activity.getContentResolver().openInputStream(uri); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                        if (in == null) throw new Exception(); byte[] bytes = new byte[8192]; int n;
                        while ((n = in.read(bytes)) != -1) { if (out.size() + n > LIMIT) throw new Exception(); out.write(bytes, 0, n); }
                        reply("onBackupLoaded", out.toString("UTF-8"));
                    }
                }
            } catch (Exception error) { reply("onBackupStatus", "Fichier inaccessible ou trop volumineux. Aucune donnée d’apprentissage modifiée."); }
        }); return true;
    }
    private void reply(String method, String text) { activity.runOnUiThread(() -> { if (!released) web.evaluateJavascript("if(window." + method + ")window." + method + "(" + JSONObject.quote(text) + ");", null); }); }
    public void release() { released = true; pendingExport = null; worker.shutdown(); }
}
