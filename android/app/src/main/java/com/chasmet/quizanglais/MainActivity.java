package com.chasmet.quizanglais;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
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

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    private static final int REQUEST_RECORD_AUDIO = 41;
    private static final String TTS_UTTERANCE_ID = "quiz-english";

    private WebView webView;
    private TextToSpeech textToSpeech;
    private KokoroTtsManager kokoro;
    private SpeechRecognizer speechRecognizer;
    private String pendingRecognitionLang = "en-US";
    private boolean ttsReady = false;
    private boolean recognitionBusy = false;
    private String activeVoiceName = "Voix anglaise système";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_main);

        textToSpeech = new TextToSpeech(this, this);
        kokoro = new KokoroTtsManager(this);
        kokoro.setOnPlaybackCompleteListener(this::sendTtsFinished);
        kokoro.prepare();
        webView = findViewById(R.id.webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new TtsBridge(), "AndroidTTS");
        webView.addJavascriptInterface(new SpeechBridge(), "AndroidSpeech");
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onInit(int status) {
        if (status != TextToSpeech.SUCCESS) return;
        int result = textToSpeech.setLanguage(Locale.US);
        ttsReady = result != TextToSpeech.LANG_MISSING_DATA
                && result != TextToSpeech.LANG_NOT_SUPPORTED;
        if (ttsReady) {
            selectBestEnglishVoice();
            textToSpeech.setPitch(1.0f);
            textToSpeech.setSpeechRate(0.82f);
            textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String utteranceId) { }
                @Override public void onDone(String utteranceId) {
                    if (TTS_UTTERANCE_ID.equals(utteranceId)) sendTtsFinished();
                }
                @Override public void onError(String utteranceId) {
                    if (TTS_UTTERANCE_ID.equals(utteranceId)) sendTtsFinished();
                }
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
            int score = voice.getQuality() * 25 - voice.getLatency() * 3;
            String country = locale.getCountry();
            if ("US".equalsIgnoreCase(country)) score += 70;
            else if ("GB".equalsIgnoreCase(country)) score += 55;
            else score += 20;
            if (!voice.isNetworkConnectionRequired()) score += 45;
            String name = voice.getName() == null ? "" : voice.getName().toLowerCase(Locale.US);
            if (name.contains("enhanced") || name.contains("premium") || name.contains("high")) score += 35;
            if (name.contains("compact") || name.contains("low")) score -= 15;
            if (score > bestScore) {
                bestScore = score;
                bestVoice = voice;
            }
        }
        if (bestVoice != null && textToSpeech.setVoice(bestVoice) == TextToSpeech.SUCCESS) {
            activeVoiceName = bestVoice.getName();
        }
    }

    private void speakFallback(String text, float rate) {
        runOnUiThread(() -> {
            if (!ttsReady || text == null || text.trim().isEmpty()) {
                sendTtsFinished();
                return;
            }
            textToSpeech.stop();
            textToSpeech.setSpeechRate(Math.max(0.35f, Math.min(rate, 1.25f)));
            textToSpeech.setPitch(1.0f);
            textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, TTS_UTTERANCE_ID);
        });
    }

    private void sendTtsFinished() {
        if (webView == null) return;
        runOnUiThread(() -> webView.evaluateJavascript(
                "if(window.onNativeTtsFinished){window.onNativeTtsFinished();}", null));
    }

    private void sendSpeechResult(String text) {
        recognitionBusy = false;
        if (webView == null) return;
        final String quoted = JSONObject.quote(text == null ? "" : text);
        runOnUiThread(() -> webView.evaluateJavascript(
                "if(window.onNativeSpeechResult){window.onNativeSpeechResult(" + quoted + ");}", null));
    }

    private void sendSpeechError(String text) {
        recognitionBusy = false;
        if (webView == null) return;
        final String quoted = JSONObject.quote(text == null ? "Erreur de reconnaissance" : text);
        runOnUiThread(() -> webView.evaluateJavascript(
                "if(window.onNativeSpeechError){window.onNativeSpeechError(" + quoted + ");}", null));
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
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            @Override public void onReadyForSpeech(Bundle params) { }
            @Override public void onBeginningOfSpeech() { }
            @Override public void onRmsChanged(float rmsdB) { }
            @Override public void onBufferReceived(byte[] buffer) { }
            @Override public void onEndOfSpeech() { }
            @Override public void onPartialResults(Bundle partialResults) { }
            @Override public void onEvent(int eventType, Bundle params) { }
            @Override public void onError(int error) { sendSpeechError(speechErrorLabel(error)); }
            @Override public void onResults(Bundle results) {
                ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                sendSpeechResult(matches != null && !matches.isEmpty() ? matches.get(0) : "");
            }
        });
    }

    private void startNativeRecognition(String language) {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            sendSpeechError("reconnaissance vocale non disponible sur ce téléphone");
            return;
        }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            pendingRecognitionLang = language == null ? "en-US" : language;
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_RECORD_AUDIO);
            return;
        }
        if (recognitionBusy) return;

        ensureSpeechRecognizer();
        recognitionBusy = true;
        String lang = language == null ? "en-US" : language;
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, lang);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false);
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 450L);
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 300L);
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 250L);
        try {
            speechRecognizer.startListening(intent);
        } catch (Exception error) {
            recognitionBusy = false;
            sendSpeechError("micro indisponible, réessaie");
        }
    }

    public final class TtsBridge {
        @JavascriptInterface
        public void speak(final String text, final float rate) {
            if (text == null || text.trim().isEmpty()) {
                sendTtsFinished();
                return;
            }
            if (kokoro != null && kokoro.speak(text, rate)) return;
            speakFallback(text, rate);
        }

        @JavascriptInterface
        public boolean setVoice(final String voiceId) {
            return kokoro != null && kokoro.setVoice(voiceId);
        }

        @JavascriptInterface
        public String getSelectedVoiceId() {
            return kokoro == null ? "af_heart" : kokoro.getSelectedVoiceId();
        }

        @JavascriptInterface
        public String getVoiceName() {
            if (kokoro != null && kokoro.isReady()) return kokoro.getStatus();
            return activeVoiceName + " • " + (kokoro == null ? "Kokoro indisponible" : kokoro.getStatus());
        }

        @JavascriptInterface
        public boolean isKokoroReady() {
            return kokoro != null && kokoro.isReady();
        }

        @JavascriptInterface
        public boolean isSpeaking() {
            return kokoro != null && kokoro.isSpeaking();
        }
    }

    public final class SpeechBridge {
        @JavascriptInterface
        public void startRecognition(final String language) {
            runOnUiThread(() -> startNativeRecognition(language));
        }

        @JavascriptInterface
        public boolean isAvailable() {
            return SpeechRecognizer.isRecognitionAvailable(MainActivity.this);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_RECORD_AUDIO) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startNativeRecognition(pendingRecognitionLang);
            } else {
                sendSpeechError("permission micro refusée");
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        if (webView != null) {
            webView.evaluateJavascript("if (typeof window.appBack === 'function') { window.appBack(); }", null);
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        recognitionBusy = false;
        if (speechRecognizer != null) {
            try { speechRecognizer.cancel(); } catch (Exception ignored) { }
            try { speechRecognizer.destroy(); } catch (Exception ignored) { }
            speechRecognizer = null;
        }
        if (webView != null) {
            webView.removeJavascriptInterface("AndroidTTS");
            webView.removeJavascriptInterface("AndroidSpeech");
            webView.destroy();
        }
        if (kokoro != null) kokoro.release();
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        super.onDestroy();
    }
}
