package com.chasmet.quizanglais;

import android.content.Context;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.Looper;

import com.jokobee.tts.core.DefaultStyleResolver;
import com.jokobee.tts.free.Tts;

import java.io.File;
import java.io.FileOutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class KokoroTtsManager {
    private final Context context;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final Handler main = new Handler(Looper.getMainLooper());
    private volatile boolean ready = false;
    private volatile boolean preparing = false;
    private volatile String status = "Kokoro : préparation";
    private Tts tts;
    private MediaPlayer player;

    public KokoroTtsManager(Context context) {
        this.context = context.getApplicationContext();
    }

    public void prepare() {
        if (ready || preparing) return;
        preparing = true;
        worker.execute(() -> {
            try {
                status = "Kokoro : chargement du modèle intégré";
                tts = Tts.Companion.create(context, new DefaultStyleResolver<>());
                ready = true;
                preparing = false;
                status = "Kokoro — prêt hors ligne";
            } catch (Throwable error) {
                ready = false;
                preparing = false;
                status = "Kokoro indisponible — voix Android utilisée";
            }
        });
    }

    public boolean speak(String text, float rate) {
        if (text == null || text.trim().isEmpty()) return false;
        if (!ready || tts == null) {
            prepare();
            return false;
        }
        worker.execute(() -> synthesize(text, rate));
        return true;
    }

    public boolean isReady() {
        return ready;
    }

    public String getStatus() {
        return ready ? "Kokoro-82M — voix neuronale hors ligne" : status;
    }

    private void synthesize(String text, float rate) {
        try {
            float speed = Math.max(0.60f, Math.min(rate / 0.82f, 1.15f));
            byte[] wav = tts.synthesizeToWav(text, "en", null, speed, 100, 70);
            File audio = new File(context.getCacheDir(), "kokoro-last.wav");
            try (FileOutputStream out = new FileOutputStream(audio)) {
                out.write(wav);
                out.flush();
            }
            main.post(() -> playFile(audio));
        } catch (Throwable error) {
            ready = false;
            status = "Kokoro : erreur de synthèse — voix Android utilisée";
        }
    }

    private void playFile(File file) {
        stopPlayer();
        try {
            player = new MediaPlayer();
            player.setDataSource(file.getAbsolutePath());
            player.setOnCompletionListener(mp -> stopPlayer());
            player.prepare();
            player.start();
        } catch (Exception error) {
            stopPlayer();
            ready = false;
            status = "Kokoro : erreur audio — voix Android utilisée";
        }
    }

    private void stopPlayer() {
        if (player == null) return;
        try { player.stop(); } catch (Exception ignored) { }
        try { player.release(); } catch (Exception ignored) { }
        player = null;
    }

    public void release() {
        ready = false;
        main.post(this::stopPlayer);
        tts = null;
        worker.shutdownNow();
    }
}
