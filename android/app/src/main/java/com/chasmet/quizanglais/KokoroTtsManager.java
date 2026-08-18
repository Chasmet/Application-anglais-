package com.chasmet.quizanglais;

import android.content.Context;
import android.media.MediaPlayer;
import android.os.Handler;
import android.os.Looper;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class KokoroTtsManager {
    private static final String MODEL_URL = "https://huggingface.co/hexgrad/Kokoro-82M/resolve/e6a2633a608163a6383195168a1abf0c4b8aeaa7/kokoro-v0_19.onnx?download=true";
    private static final String MODEL_NAME = "kokoro-v0_19.onnx";
    private static final long MIN_MODEL_BYTES = 300L * 1024L * 1024L;

    private final Context context;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final Handler main = new Handler(Looper.getMainLooper());
    private volatile boolean ready = false;
    private volatile boolean preparing = false;
    private volatile String status = "Kokoro : préparation";
    private MediaPlayer player;

    public KokoroTtsManager(Context context) {
        this.context = context.getApplicationContext();
    }

    public void prepare() {
        if (ready || preparing) return;
        preparing = true;
        worker.execute(() -> {
            try {
                File model = new File(context.getExternalFilesDir(null), MODEL_NAME);
                if (!model.exists() || model.length() < MIN_MODEL_BYTES) {
                    status = "Kokoro : téléchargement du modèle";
                    downloadModel(model);
                }
                status = "Kokoro : initialisation";
                initialize(model);
            } catch (Throwable error) {
                ready = false;
                status = "Kokoro indisponible — voix Android utilisée";
                preparing = false;
            }
        });
    }

    public boolean speak(String text, float rate) {
        if (!ready || text == null || text.trim().isEmpty()) {
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
        return ready ? "Kokoro af_heart — voix neuronale hors ligne" : status;
    }

    public void release() {
        ready = false;
        try {
            Class<?> ttsClass = Class.forName("dev.ffmpegkit.kokoro.KokoroTTS");
            Object instance = ttsClass.getField("INSTANCE").get(null);
            ttsClass.getMethod("release").invoke(instance);
        } catch (Throwable ignored) { }
        main.post(this::stopPlayer);
        worker.shutdownNow();
    }

    private void downloadModel(File target) throws Exception {
        File parent = target.getParentFile();
        if (parent != null && !parent.exists()) parent.mkdirs();
        File temp = new File(target.getAbsolutePath() + ".part");
        if (temp.exists()) temp.delete();

        HttpURLConnection connection = (HttpURLConnection) new URL(MODEL_URL).openConnection();
        connection.setConnectTimeout(20000);
        connection.setReadTimeout(45000);
        connection.setInstanceFollowRedirects(true);
        connection.setRequestProperty("User-Agent", "QuizAnglais-Kokoro/3.5");
        int code = connection.getResponseCode();
        if (code < 200 || code >= 300) throw new IllegalStateException("HTTP " + code);

        try (InputStream input = new BufferedInputStream(connection.getInputStream());
             FileOutputStream output = new FileOutputStream(temp)) {
            byte[] buffer = new byte[1024 * 256];
            int read;
            while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
            output.getFD().sync();
        } finally {
            connection.disconnect();
        }
        if (temp.length() < MIN_MODEL_BYTES) throw new IllegalStateException("Modèle incomplet");
        if (target.exists()) target.delete();
        if (!temp.renameTo(target)) throw new IllegalStateException("Impossible d'installer le modèle");
    }

    private void initialize(File model) throws Exception {
        Class<?> ttsClass = Class.forName("dev.ffmpegkit.kokoro.KokoroTTS");
        Object instance = ttsClass.getField("INSTANCE").get(null);

        Class<?> voiceClass = Class.forName("dev.ffmpegkit.kokoro.KokoroVoice");
        Field companionField = voiceClass.getField("Companion");
        Object companion = companionField.get(null);
        Method getHeart = companion.getClass().getMethod("getAF_HEART");
        Object heartVoice = getHeart.invoke(companion);

        Method initialize = null;
        for (Method method : ttsClass.getMethods()) {
            if (method.getName().equals("initialize") && method.getParameterTypes().length == 4) {
                initialize = method;
                break;
            }
        }
        if (initialize == null) throw new NoSuchMethodException("Kokoro initialize");

        final Method initMethod = initialize;
        Object continuation = continuation(value -> {
            ready = true;
            preparing = false;
            status = "Kokoro af_heart — prêt";
        }, error -> {
            ready = false;
            preparing = false;
            status = "Kokoro indisponible — voix Android utilisée";
        });

        Object result = initMethod.invoke(instance, context, model.getAbsolutePath(), heartVoice, continuation);
        if (!isSuspended(result)) {
            ready = true;
            preparing = false;
            status = "Kokoro af_heart — prêt";
        }
    }

    private void synthesize(String text, float rate) {
        try {
            Class<?> ttsClass = Class.forName("dev.ffmpegkit.kokoro.KokoroTTS");
            Object instance = ttsClass.getField("INSTANCE").get(null);

            Class<?> formatClass = Class.forName("dev.ffmpegkit.kokoro.AudioFormat");
            Object wav = Enum.valueOf((Class<Enum>) formatClass.asSubclass(Enum.class), "WAV");
            Class<?> configClass = Class.forName("dev.ffmpegkit.kokoro.KokoroConfig");
            Constructor<?> configConstructor = configClass.getConstructor(float.class, int.class, formatClass);
            float speed = Math.max(0.60f, Math.min(rate / 0.82f, 1.15f));
            Object config = configConstructor.newInstance(speed, 24000, wav);

            Method speak = null;
            for (Method method : ttsClass.getMethods()) {
                if (method.getName().equals("speak") && method.getParameterTypes().length == 3) {
                    speak = method;
                    break;
                }
            }
            if (speak == null) throw new NoSuchMethodException("Kokoro speak");

            Object continuation = continuation(this::playResult, error -> {
                ready = false;
                status = "Kokoro : erreur de synthèse";
            });
            Object result = speak.invoke(instance, text, config, continuation);
            if (!isSuspended(result) && result != null) playResult(result);
        } catch (Throwable error) {
            ready = false;
            status = "Kokoro : erreur de synthèse";
        }
    }

    private void playResult(Object result) {
        try {
            Method getter = result.getClass().getMethod("getAudioData");
            byte[] wav = (byte[]) getter.invoke(result);
            File audio = new File(context.getCacheDir(), "kokoro-last.wav");
            try (FileOutputStream out = new FileOutputStream(audio)) {
                out.write(wav);
            }
            main.post(() -> playFile(audio));
        } catch (Throwable ignored) { }
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
        }
    }

    private void stopPlayer() {
        if (player == null) return;
        try { player.stop(); } catch (Exception ignored) { }
        try { player.release(); } catch (Exception ignored) { }
        player = null;
    }

    private interface Success { void accept(Object value); }
    private interface Failure { void accept(Throwable error); }

    private Object continuation(Success success, Failure failure) throws Exception {
        Class<?> continuationClass = Class.forName("kotlin.coroutines.Continuation");
        return Proxy.newProxyInstance(
                continuationClass.getClassLoader(),
                new Class[]{continuationClass},
                (proxy, method, args) -> {
                    if ("getContext".equals(method.getName())) {
                        Class<?> empty = Class.forName("kotlin.coroutines.EmptyCoroutineContext");
                        return empty.getField("INSTANCE").get(null);
                    }
                    if ("resumeWith".equals(method.getName())) {
                        Object value = args == null || args.length == 0 ? null : args[0];
                        if (value != null && value.getClass().getName().contains("Result$Failure")) {
                            try {
                                Field exception = value.getClass().getDeclaredField("exception");
                                exception.setAccessible(true);
                                failure.accept((Throwable) exception.get(value));
                            } catch (Throwable e) {
                                failure.accept(e);
                            }
                        } else {
                            success.accept(value);
                        }
                        return null;
                    }
                    return null;
                });
    }

    private boolean isSuspended(Object value) {
        try {
            Class<?> intrinsics = Class.forName("kotlin.coroutines.intrinsics.IntrinsicsKt");
            Object suspended = intrinsics.getMethod("getCOROUTINE_SUSPENDED").invoke(null);
            return value == suspended;
        } catch (Throwable ignored) {
            return false;
        }
    }
}
