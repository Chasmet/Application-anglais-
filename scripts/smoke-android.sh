#!/usr/bin/env bash
set -euo pipefail
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb logcat -c
adb shell am start -W -n com.chasmet.quizanglais.preview/com.chasmet.quizanglais.MainActivity
for attempt in 1 2 3 4 5; do
  adb shell uiautomator dump /sdcard/anglais-smoke.xml >/dev/null
  adb pull /sdcard/anglais-smoke.xml android-smoke.xml >/dev/null
  if python -c "assert 'Anglais' in open('android-smoke.xml').read()"; then break; fi
  if [[ "$attempt" == 5 ]]; then exit 1; fi
done
APP_PID=$(adb shell pidof com.chasmet.quizanglais.preview | tr -d '\r')
test -n "$APP_PID"
adb logcat -d --pid="$APP_PID" > android-smoke.log
python - <<'PY'
from pathlib import Path
log = Path('android-smoke.log').read_text()
assert 'FATAL EXCEPTION' not in log, log
assert 'Uncaught ReferenceError' not in log, log
assert 'Uncaught TypeError' not in log, log
print('Android 35: app starts, home screen visible, no fatal or JavaScript startup error')
PY
