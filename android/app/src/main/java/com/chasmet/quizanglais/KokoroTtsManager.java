package com.chasmet.quizanglais;

import android.content.Context;
import android.content.SharedPreferences;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.Looper;

import com.jokobee.tts.core.DefaultStyleResolver;
import com.jokobee.tts.free.Tts;
import com.jokobee.tts.free.Voice;
import com.jokobee.tts.free.VoiceCatalog;

import java.io.File;
import java.io.FileOutputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class KokoroTtsManager {
    private static final String PREFS = "quiz_anglais_voice";
    private static final String PREF_VOICE_ID = "kokoro_voice_id";
    private static final String DEFAULT_VOICE = "af_heart";

    private final Context context;
    private final SharedPreferences prefs;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final Handler main = new Handler(Looper.getMainLooper());

    private volatile boolean ready = false;
    private volatile boolean preparing = false;
    private volatile String status = "Kokoro : préparation";
    private volatile String selectedVoiceId;
    private volatile String selectedLanguage = "en_US";

    private Tts tts;
    private Voice selectedVoice;
    private MediaPlayer player;

    public KokoroTtsManager(Context context) {
        this.context = context.getApplicationContext();
        this.prefs = this.context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        this.selectedVoiceId = prefs.getString(PREF_VOICE_ID, DEFAULT_VOICE);
    }

    public void prepare() {
        if (ready || preparing) return;
        preparing = true;
        worker.execute(() -> {
            try {
                status = "Kokoro : chargement du modèle intégré";
                tts = Tts.Companion.create(context, new DefaultStyleResolver<>());
                applySelectedVoice();
                ready = true;
                preparing = false;
                status = "Kokoro — " + selectedVoiceId + " — prêt hors ligne";
            } catch (Throwable error) {
                ready = false;
                preparing = false;
                status = "Kokoro indisponible — voix Android utilisée";
            }
        });
    }

    private void applySelectedVoice() {
        if (tts == null) return;
        VoiceCatalog catalog = tts.getVoices();
        if (catalog == null) return;
        try {
            selectedVoice = catalog.get(selectedVoiceId);
        } catch (Throwable missing) {
            selectedVoiceId = DEFAULT_VOICE;
            selectedVoice = catalog.get(DEFAULT_VOICE);
            prefs.edit().putString(PREF_VOICE_ID, DEFAULT_VOICE).apply();
        }
        if (selectedVoice != null) selectedLanguage = selectedVoice.getLang();
    }

    public boolean setVoice(String voiceId) {
        if (voiceId == null || voiceId.trim().isEmpty()) return false;
        selectedVoiceId = voiceId.trim();
        prefs.edit().putString(PREF_VOICE_ID, selectedVoiceId).apply();
        if (!ready || tts == null) {
            prepare();
            return true;
        }
        try {
            VoiceCatalog catalog = tts.getVoices();
            if (catalog == null) return false;
            Voice voice = catalog.get(selectedVoiceId);
            selectedVoice = voice;
            selectedLanguage = voice.getLang();
            status = "Kokoro — " + selectedVoiceId + " — prêt hors ligne";
            return true;
        } catch (Throwable error) {
            return false;
        }
    }

    public String getSelectedVoiceId() {
        return selectedVoiceId;
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
        return ready ? "Kokoro-82M • " + selectedVoiceId + " • hors ligne" : status;
    }

    private void synthesize(String text, float rate) {
        try {
            float speed = Math.max(0.60f, Math.min(rate / 0.82f, 1.15f));
            Voice voice = selectedVoice;
            String lang = selectedLanguage;
            byte[] wav = tts.synthesizeToWav(text, lang, voice, speed, 100, 70);
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
        selectedVoice = null;
        worker.shutdownNow();
    }
}
