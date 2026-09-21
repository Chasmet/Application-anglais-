#!/usr/bin/env bash
set -euo pipefail
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb logcat -c
adb shell am start -W -n com.chasmet.quizanglais.preview/com.chasmet.quizanglais.MainActivity
python scripts/smoke-android.py
