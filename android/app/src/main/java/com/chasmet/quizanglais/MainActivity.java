package com.chasmet.quizanglais;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.media.AudioManager;
import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.graphics.Bitmap;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    private static final int REQUEST_RECORD_AUDIO = 41;
    private static final String TTS_UTTERANCE_ID = "quiz-english";
    private static final String TTS_FRENCH_UTTERANCE_ID = "quiz-french";

    private WebView webView;
    private TextToSpeech textToSpeech;
    private TextToSpeech frenchTextToSpeech;
    private KokoroTtsManager kokoro;
    private SpeechRecognizer speechRecognizer;
    private UpdateManager updateManager;
    private BackupManager backupManager;
    private AudioManager audioManager;
    private String currentRequestId = "", currentText = "";
    private float currentRate = .78f;
    private int recognitionGeneration = 0;
    private boolean destroyed = false;
    private final AudioManager.OnAudioFocusChangeListener focusListener = change -> {
        if (change < 0) runOnUiThread(() -> { stopAllAudio(); cancelRecognition(); evaluate("if(window.onNativeAudioInterrupted)window.onNativeAudioInterrupted();"); });
    };
    private String pendingRecognitionLang = "en-US";
    private boolean ttsReady = false;
    private boolean frenchTtsReady = false;
    private boolean recognitionBusy = false;
    private String activeVoiceName = "Voix anglaise système";
    private String activeFrenchVoiceName = "Voix française système";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.appRoot), (view, insets) -> {
            Insets safe = insets.getInsets(WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.ime());
            view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
            return insets;
        });

        textToSpeech = new TextToSpeech(this, this);
        frenchTextToSpeech = new TextToSpeech(this, status -> initFrenchTts(status));
        kokoro = new KokoroTtsManager(this);
        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
        kokoro.setPlaybackListener(new KokoroTtsManager.PlaybackListener() {
            public void onStarted(String id) { sendTtsStarted(id); }
            public void onFinished(String id, boolean success) {
                if (!id.equals(currentRequestId)) return;
                if (success) sendTtsFinished(id, "done"); else speakSystem(currentText, currentRate, false, id);
            }
        });
        webView = findViewById(R.id.webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(Math.round(getResources().getConfiguration().fontScale * 100));
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);

        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageStarted(WebView view, String url, Bitmap icon) { stopAllAudio(); cancelRecognition(); }
            private boolean navigate(String url) {
                if (url.startsWith("file:///android_asset/")) return false;
                if (url.startsWith("https://")) { try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception ignored) {} }
                return true;
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) { return navigate(url); }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return navigate(request.getUrl().toString()); }
        });
        webView.setWebChromeClient(new WebChromeClient());
        updateManager = new UpdateManager(this, webView);
        backupManager = new BackupManager(this, webView);
        webView.addJavascriptInterface(new TtsBridge(), "AndroidTTS");
        webView.addJavascriptInterface(new SpeechBridge(), "AndroidSpeech");
        webView.addJavascriptInterface(new UpdateBridge(), "AndroidUpdater");
        webView.addJavascriptInterface(new BackupBridge(), "AndroidBackup");
        webView.loadUrl("file:///android_asset/index.html");
        webView.postDelayed(() -> { if (updateManager != null) updateManager.autoCheck(); }, 1800);
    }

    @Override
    public void onInit(int status) {
        if (destroyed || status != TextToSpeech.SUCCESS || textToSpeech == null) return;
        int result = textToSpeech.setLanguage(Locale.US);
        ttsReady = result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED;
        if (ttsReady) {
            selectBestEnglishVoice();
            textToSpeech.setPitch(1.0f);
            textToSpeech.setSpeechRate(0.82f);
            textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String utteranceId) { sendTtsStarted(utteranceId); }
                @Override public void onDone(String utteranceId) { sendTtsFinished(utteranceId, "done"); }
                @Override public void onError(String utteranceId) { sendTtsFinished(utteranceId, "error"); }
            });
        }
    }

    private void initFrenchTts(int status) {
        if (destroyed || status != TextToSpeech.SUCCESS || frenchTextToSpeech == null) return;
        int result = frenchTextToSpeech.setLanguage(Locale.FRANCE);
        frenchTtsReady = result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED;
        if (frenchTtsReady) {
            selectBestFrenchVoice();
            frenchTextToSpeech.setPitch(1.0f);
            frenchTextToSpeech.setSpeechRate(0.94f);
            frenchTextToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String utteranceId) { sendTtsStarted(utteranceId); }
                @Override public void onDone(String utteranceId) { sendTtsFinished(utteranceId, "done"); }
                @Override public void onError(String utteranceId) { sendTtsFinished(utteranceId, "error"); }
            });
        }
    }

    private void selectBestEnglishVoice() {
        Set<Voice> voices = textToSpeech.getVoices();
        if (voices == null || voices.isEmpty()) return;
        Voice bestVoice = null;
        int bestScore = Integer.MIN_VALUE;
        for (Voice voice : voices) {
            Locale locale = voice.getLocale();
            if (locale == null || !"en".equalsIgnoreCase(locale.getLanguage())) continue;
            int score = voice.getQuality() * 3 - voice.getLatency() * 25;
            String country = locale.getCountry();
            if ("US".equalsIgnoreCase(country)) score += 70; else if ("GB".equalsIgnoreCase(country)) score += 55; else score += 20;
            if (!voice.isNetworkConnectionRequired()) score += 100000;
            String name = voice.getName() == null ? "" : voice.getName().toLowerCase(Locale.US);
            if (name.contains("enhanced") || name.contains("premium") || name.contains("high")) score += 35;
            if (name.contains("compact") || name.contains("low")) score -= 15;
            if (score > bestScore) { bestScore = score; bestVoice = voice; }
        }
        if (bestVoice != null && textToSpeech.setVoice(bestVoice) == TextToSpeech.SUCCESS) activeVoiceName = bestVoice.getName();
    }

    private void selectBestFrenchVoice() {
        Set<Voice> voices = frenchTextToSpeech.getVoices();
        if (voices == null || voices.isEmpty()) return;
        Voice bestVoice = null;
        int bestScore = Integer.MIN_VALUE;
        for (Voice voice : voices) {
            Locale locale = voice.getLocale();
            if (locale == null || !"fr".equalsIgnoreCase(locale.getLanguage())) continue;
            int score = voice.getQuality() * 3 - voice.getLatency() * 25;
            String country = locale.getCountry();
            if ("FR".equalsIgnoreCase(country)) score += 90; else if ("BE".equalsIgnoreCase(country) || "CA".equalsIgnoreCase(country) || "CH".equalsIgnoreCase(country)) score += 45; else score += 20;
            if (!voice.isNetworkConnectionRequired()) score += 100000;
            String name = voice.getName() == null ? "" : voice.getName().toLowerCase(Locale.FRANCE);
            if (name.contains("enhanced") || name.contains("premium") || name.contains("high")) score += 35;
            if (name.contains("compact") || name.contains("low")) score -= 15;
            if (score > bestScore) { bestScore = score; bestVoice = voice; }
        }
        if (bestVoice != null && frenchTextToSpeech.setVoice(bestVoice) == TextToSpeech.SUCCESS) activeFrenchVoiceName = bestVoice.getName();
    }

    private void evaluate(String script) { if (webView != null && !destroyed) webView.evaluateJavascript(script, null); }
    private void stopAllAudio() {
        currentRequestId = "";
        if (kokoro != null) kokoro.stop();
        if (textToSpeech != null) textToSpeech.stop();
        if (frenchTextToSpeech != null) frenchTextToSpeech.stop();
        if (audioManager != null) audioManager.abandonAudioFocus(focusListener);
    }
    private void sendTtsStarted(String id) { runOnUiThread(() -> { if (id.equals(currentRequestId)) evaluate("if(window.onNativeTtsStarted)window.onNativeTtsStarted(" + JSONObject.quote(id) + ");"); }); }
    private void sendTtsFinished(String id, String status) {
        runOnUiThread(() -> {
            if (!id.equals(currentRequestId)) return;
            currentRequestId = "";
            if (audioManager != null) audioManager.abandonAudioFocus(focusListener);
            evaluate("if(window.onNativeTtsFinished)window.onNativeTtsFinished(" + JSONObject.quote(id) + "," + JSONObject.quote(status) + ");");
        });
    }
    private void speakSystem(String text, float rate, boolean french, String id) {
        TextToSpeech engine = french ? frenchTextToSpeech : textToSpeech;
        if (engine == null || !(french ? frenchTtsReady : ttsReady)) { sendTtsFinished(id, "error"); return; }
        engine.setSpeechRate(Math.max(.4f, Math.min(rate, 1.25f)));
        if (engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, id) == TextToSpeech.ERROR) sendTtsFinished(id, "error");
    }
    private void speakRequest(String text, float rate, String language, String id) {
        runOnUiThread(() -> {
            stopAllAudio(); cancelRecognition();
            currentRequestId = id; currentText = text; currentRate = rate;
            if (text == null || text.trim().isEmpty()) { sendTtsFinished(id, "done"); return; }
            if (audioManager != null && audioManager.requestAudioFocus(focusListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT) != AudioManager.AUDIOFOCUS_REQUEST_GRANTED) { sendTtsFinished(id, "error"); return; }
            boolean french = language != null && language.startsWith("fr");
            if (!french && "natural".equals(getSharedPreferences("quiz_anglais_voice", MODE_PRIVATE).getString("engine", "fast")) && kokoro.speak(text, rate, id)) return;
            speakSystem(text, rate, french, id);
        });
    }
    private void cancelRecognition() {
        recognitionGeneration++; recognitionBusy = false;
        if (speechRecognizer != null) { try { speechRecognizer.cancel(); speechRecognizer.destroy(); } catch (Exception ignored) {} speechRecognizer = null; }
    }

    private void sendSpeechResult(String text) {
        recognitionBusy = false;
        if (webView == null) return;
        final String quoted = JSONObject.quote(text == null ? "" : text);
        runOnUiThread(() -> webView.evaluateJavascript("if(window.onNativeSpeechResult){window.onNativeSpeechResult(" + quoted + ");}", null));
    }

    private void sendSpeechError(String text) {
        recognitionBusy = false;
        if (webView == null) return;
        final String quoted = JSONObject.quote(text == null ? "Erreur de reconnaissance" : text);
        runOnUiThread(() -> webView.evaluateJavascript("if(window.onNativeSpeechError){window.onNativeSpeechError(" + quoted + ");}", null));
    }

    private String speechErrorLabel(int code) {
        switch (code) {
            case SpeechRecognizer.ERROR_AUDIO: return "erreur audio";
            case SpeechRecognizer.ERROR_CLIENT: return "reconnaissance interrompue";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: return "permission micro refusée";
            case SpeechRecognizer.ERROR_NETWORK: return "réseau indisponible pour ce moteur";
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: return "délai réseau dépassé";
            case SpeechRecognizer.ERROR_NO_MATCH: return "je n’ai pas compris, recommence";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: return "micro déjà occupé";
            case SpeechRecognizer.ERROR_SERVER: return "service de reconnaissance indisponible";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: return "aucune parole détectée";
            default: return "erreur de reconnaissance (" + code + ")";
        }
    }

    private void ensureSpeechRecognizer() {
        if (speechRecognizer != null) return;
        final int requestGeneration = recognitionGeneration;
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) { if (requestGeneration == recognitionGeneration) evaluate("if(window.onNativeSpeechState)window.onNativeSpeechState(\"listening\");"); }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float rmsdB) { }
            @Override public void onBufferReceived(byte[] buffer) { }
            @Override public void onEndOfSpeech() { if (requestGeneration == recognitionGeneration) evaluate("if(window.onNativeSpeechState)window.onNativeSpeechState(\"processing\");"); }
            @Override public void onPartialResults(Bundle partialResults) { }
            @Override public void onEvent(int eventType, Bundle params) { }
            @Override public void onError(int error) { if (requestGeneration == recognitionGeneration) sendSpeechError(speechErrorLabel(error)); }
            @Override public void onResults(Bundle results) {
                if (requestGeneration != recognitionGeneration) return;
                ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                sendSpeechResult(matches != null && !matches.isEmpty() ? matches.get(0) : "");
            }
        });
    }

    private void startNativeRecognition(String language) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) { sendSpeechError("reconnaissance vocale non disponible sur ce téléphone"); return; }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            pendingRecognitionLang = language == null ? "en-US" : language;
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_RECORD_AUDIO);
            return;
        }
        if (recognitionBusy) return;
        stopAllAudio();
        ensureSpeechRecognizer();
        recognitionBusy = true;
        String lang = language == null ? "en-US" : language;
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
        // Let the recognition service choose its endpoint; short forced silences cut off learners.
        try { speechRecognizer.startListening(intent); }
        catch (Exception error) { recognitionBusy = false; sendSpeechError("micro indisponible, réessaie"); }
    }

    public final class TtsBridge {
        @JavascriptInterface public void speak(String text, float rate) { MainActivity.this.speakRequest(text, rate, "en-US", "legacy-" + System.nanoTime()); }
        @JavascriptInterface public void speakWithLanguage(String text, float rate, String language) { MainActivity.this.speakRequest(text, rate, language, "legacy-" + System.nanoTime()); }
        @JavascriptInterface public void speakRequest(String text, float rate, String language, String id) { if (id != null) MainActivity.this.speakRequest(text, rate, language, id); }
        @JavascriptInterface public void stop() { runOnUiThread(MainActivity.this::stopAllAudio); }
        @JavascriptInterface public boolean preload(String text, float rate) { return "natural".equals(getEngine()) && kokoro != null && kokoro.preload(text, rate); }
        @JavascriptInterface public String getEngine() { return getSharedPreferences("quiz_anglais_voice", MODE_PRIVATE).getString("engine", "fast"); }
        @JavascriptInterface public void setEngine(String engine) {
            if (!"fast".equals(engine) && !"natural".equals(engine)) return;
            getSharedPreferences("quiz_anglais_voice", MODE_PRIVATE).edit().putString("engine", engine).apply();
            runOnUiThread(() -> { stopAllAudio(); if ("natural".equals(engine)) kokoro.prepare(); });
        }
        @JavascriptInterface public String getVoiceName() { return "natural".equals(getEngine()) && kokoro != null ? kokoro.getStatus() : activeVoiceName; }
        @JavascriptInterface public String getFrenchVoiceName() { return activeFrenchVoiceName; }
        @JavascriptInterface public boolean isKokoroReady() { return kokoro != null && kokoro.isReady(); }
        @JavascriptInterface public boolean isFrenchReady() { return frenchTtsReady; }
    }
    public final class BackupBridge {
        @JavascriptInterface public void exportData(String json) { runOnUiThread(() -> backupManager.exportData(json)); }
        @JavascriptInterface public void importData() { runOnUiThread(() -> backupManager.importData()); }
    }

    public final class SpeechBridge {
        @JavascriptInterface public void startRecognition(final String language) { runOnUiThread(() -> startNativeRecognition(language)); }
        @JavascriptInterface public void cancelRecognition() { runOnUiThread(MainActivity.this::cancelRecognition); }
        @JavascriptInterface public boolean isAvailable() { return SpeechRecognizer.isRecognitionAvailable(MainActivity.this); }
    }

    public final class UpdateBridge {
        @JavascriptInterface public String getCurrentVersion() { return updateManager == null ? BuildConfig.VERSION_NAME : updateManager.getCurrentVersion(); }
        @JavascriptInterface public boolean isAutoCheckEnabled() { return updateManager != null && updateManager.isAutoCheckEnabled(); }
        @JavascriptInterface public void setAutoCheckEnabled(boolean enabled) { if (updateManager != null) updateManager.setAutoCheckEnabled(enabled); }
        @JavascriptInterface public void checkLatest() { if (updateManager != null) updateManager.checkLatest(true); }
        @JavascriptInterface public void downloadAndInstall(String url, String version) { if (updateManager != null) updateManager.downloadAndInstall(url, version); }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_RECORD_AUDIO) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) sendSpeechError("Micro autorisé. Appuie de nouveau sur le micro pour parler.");
            else sendSpeechError("permission micro refusée");
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) { webView.goBack(); return; }
        if (webView != null && webView.getUrl() != null && webView.getUrl().endsWith("quiz.html")) { evaluate("if(window.appBack)window.appBack();"); return; }
        super.onBackPressed();
    }

    @Override protected void onPause() {
        stopAllAudio(); cancelRecognition();
        evaluate("if(window.onNativeAudioInterrupted)window.onNativeAudioInterrupted();");
        super.onPause();
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (backupManager != null) backupManager.onResult(request, result, data);
    }
    @Override protected void onResume() { super.onResume(); if (updateManager != null) updateManager.resumePendingInstall(); }
    @Override
    protected void onDestroy() {
        destroyed = true;
        if (backupManager != null) backupManager.release();
        recognitionBusy = false;
        if (speechRecognizer != null) {
            try { speechRecognizer.cancel(); } catch (Exception ignored) { }
            try { speechRecognizer.destroy(); } catch (Exception ignored) { }
            speechRecognizer = null;
        }
        if (updateManager != null) { updateManager.release(); updateManager = null; }
        if (webView != null) {
            webView.removeJavascriptInterface("AndroidTTS");
            webView.removeJavascriptInterface("AndroidSpeech");
            webView.removeJavascriptInterface("AndroidUpdater");
            webView.removeJavascriptInterface("AndroidBackup");
            webView.destroy();
        }
        if (kokoro != null) kokoro.release();
        if (frenchTextToSpeech != null) { frenchTextToSpeech.stop(); frenchTextToSpeech.shutdown(); }
        if (textToSpeech != null) { textToSpeech.stop(); textToSpeech.shutdown(); }
        super.onDestroy();
    }
}
