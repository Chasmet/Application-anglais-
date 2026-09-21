package com.chasmet.quizanglais;

import android.content.Context;
import android.content.SharedPreferences;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.Looper;
import com.jokobee.tts.core.DefaultStyleResolver;
import com.jokobee.tts.free.Tts;
import com.jokobee.tts.free.Voice;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/** Serial inference, cancellation by generation, bounded cache, async playback. */
public final class KokoroTtsManager {
    public interface PlaybackListener { void onStarted(String id); void onFinished(String id, boolean success); }
    private final Context context;
    private final SharedPreferences prefs;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final ThreadPoolExecutor worker = new ThreadPoolExecutor(1, 1, 0, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<>());
    private final AtomicLong generation = new AtomicLong();
    private final Set<String> inFlight = new HashSet<>();
    private volatile boolean ready, preparing, released;
    private volatile String selectedVoiceId;
    private volatile String status = "Voix naturelle disponible à la demande";
    private PlaybackListener listener;
    private Tts tts;
    private MediaPlayer player;
    private static final long CACHE_LIMIT = 48L * 1024 * 1024;
    public KokoroTtsManager(Context context) {
        this.context = context.getApplicationContext();
        prefs = this.context.getSharedPreferences("quiz_anglais_voice", Context.MODE_PRIVATE);
        selectedVoiceId = prefs.getString("kokoro_voice_id", "af_heart");
    }
    public void setPlaybackListener(PlaybackListener value) { listener = value; }
    public synchronized void prepare() {
        if (ready || preparing || released) return;
        preparing = true; status = "Préparation de la voix naturelle…";
        worker.execute(() -> {
            try { tts = Tts.Companion.create(context, new DefaultStyleResolver<>()); ready = !released; status = "Kokoro — " + selectedVoiceId + " — hors ligne"; trimCache(null); }
            catch (Throwable error) { ready = false; status = "Voix Android utilisée : moteur naturel indisponible"; }
            finally { preparing = false; }
        });
    }
    public boolean setVoice(String id) {
        if (id == null || !id.matches("[a-z]{2}_[a-z]+")) return false;
        stop(); selectedVoiceId = id; prefs.edit().putString("kokoro_voice_id", id).apply(); return true;
    }
    public String getSelectedVoiceId() { return selectedVoiceId; }
    public String getStatus() { return status; }
    public boolean isReady() { return ready; }
    private File fileFor(String text, float rate, String voiceId) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256").digest((voiceId + "|" + Math.round(rate * 100) + "|" + text).getBytes(StandardCharsets.UTF_8));
        StringBuilder key = new StringBuilder(); for (byte b : digest) key.append(String.format("%02x", b & 255));
        return new File(context.getCacheDir(), "kokoro-" + key + ".wav");
    }
    private File synthesize(String text, float rate, String voiceId) throws Exception {
        File file = fileFor(text, rate, voiceId);
        if (file.exists() && file.length() > 44) { file.setLastModified(System.currentTimeMillis()); return file; }
        Voice voice;
        try { voice = tts.getVoices().get(voiceId); } catch (Throwable error) { voice = tts.getVoices().get("af_heart"); }
        if (voice == null) throw new IllegalStateException("Voix indisponible");
        byte[] wav = tts.synthesizeToWav(text, voice.getLang(), voice, Math.max(.60f, Math.min(rate / .82f, 1.15f)), 100, 70);
        File temporary = new File(file.getPath() + ".tmp");
        try (FileOutputStream out = new FileOutputStream(temporary)) { out.write(wav); }
        if (!temporary.renameTo(file)) { temporary.delete(); throw new IllegalStateException("Cache audio indisponible"); }
        trimCache(file); return file;
    }
    private void trimCache(File keep) {
        File[] files = context.getCacheDir().listFiles((dir, name) -> name.startsWith("kokoro-") && name.endsWith(".wav"));
        if (files == null) return;
        Arrays.sort(files, Comparator.comparingLong(File::lastModified));
        long size = 0; for (File f : files) size += f.length();
        for (File f : files) { if (size <= CACHE_LIMIT) break; if (f.equals(keep)) continue; long n = f.length(); if (f.delete()) size -= n; }
    }
    public boolean preload(String text, float rate) {
        if (text == null || text.trim().isEmpty() || released) return false;
        if (!ready) { prepare(); return false; }
        String voiceId = selectedVoiceId, key = voiceId + "|" + rate + "|" + text;
        synchronized (inFlight) { if (inFlight.contains(key) || inFlight.size() >= 2) return false; inFlight.add(key); }
        worker.execute(() -> { try { synthesize(text, rate, voiceId); } catch (Throwable ignored) {} finally { synchronized (inFlight) { inFlight.remove(key); } } });
        return true;
    }
    public boolean speak(String text, float rate, String id) {
        if (released || text == null || text.trim().isEmpty()) return false;
        if (!ready) { prepare(); return false; }
        long token = generation.incrementAndGet(); String voiceId = selectedVoiceId;
        worker.getQueue().clear(); synchronized (inFlight) { inFlight.clear(); }
        main.post(this::stopPlayer);
        worker.execute(() -> {
            try { File file = synthesize(text, rate, voiceId); main.post(() -> { if (!released && generation.get() == token) play(file, id, token); }); }
            catch (Throwable error) { main.post(() -> { if (generation.get() == token && listener != null) listener.onFinished(id, false); }); }
        });
        return true;
    }
    private void play(File file, String id, long token) {
        stopPlayer();
        try {
            MediaPlayer next = new MediaPlayer(); player = next; next.setDataSource(file.getAbsolutePath());
            next.setOnPreparedListener(mp -> { if (player != mp || generation.get() != token || released) { if (player == mp) stopPlayer(); return; } mp.start(); if (listener != null) listener.onStarted(id); });
            next.setOnCompletionListener(mp -> { if (player == mp && generation.get() == token) { stopPlayer(); if (listener != null) listener.onFinished(id, true); } });
            next.setOnErrorListener((mp, what, extra) -> { if (player == mp && generation.get() == token) { stopPlayer(); if (listener != null) listener.onFinished(id, false); } return true; });
            next.prepareAsync();
        } catch (Exception error) { stopPlayer(); if (listener != null) listener.onFinished(id, false); }
    }
    private void stopPlayer() { if (player != null) { try { player.release(); } catch (Exception ignored) {} player = null; } }
    public void stop() { generation.incrementAndGet(); if (ready) { worker.getQueue().clear(); synchronized (inFlight) { inFlight.clear(); } } main.post(this::stopPlayer); }
    public void release() {
        released = true; stop(); ready = false; listener = null;
        worker.execute(() -> { Object engine = tts; tts = null; if (engine instanceof AutoCloseable) { try { ((AutoCloseable) engine).close(); } catch (Exception ignored) {} } });
        worker.shutdown();
    }
}
