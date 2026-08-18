package com.chasmet.quizanglais;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;
import java.util.Set;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    private WebView webView;
    private TextToSpeech textToSpeech;
    private KokoroTtsManager kokoro;
    private boolean ttsReady = false;
    private String activeVoiceName = "Voix anglaise système";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_main);

        textToSpeech = new TextToSpeech(this, this);
        kokoro = new KokoroTtsManager(this);
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

            int score = 0;
            score += voice.getQuality() * 25;
            score -= voice.getLatency() * 3;

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
            if (!ttsReady || text == null || text.trim().isEmpty()) return;
            textToSpeech.stop();
            textToSpeech.setSpeechRate(Math.max(0.35f, Math.min(rate, 1.25f)));
            textToSpeech.setPitch(1.0f);
            textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "quiz-english");
        });
    }

    public final class TtsBridge {
        @JavascriptInterface
        public void speak(final String text, final float rate) {
            if (text == null || text.trim().isEmpty()) return;
            if (kokoro != null && kokoro.speak(text, rate)) return;
            speakFallback(text, rate);
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
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        if (webView != null) {
            webView.evaluateJavascript(
                    "if (typeof window.appBack === 'function') { window.appBack(); }",
                    null
            );
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.removeJavascriptInterface("AndroidTTS");
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
