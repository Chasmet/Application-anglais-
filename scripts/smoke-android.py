"""Exercise the rendered WebView and its native updater bridge on a fresh emulator."""
import pathlib, re, subprocess, time, xml.etree.ElementTree as ET

def adb(*args):
    return subprocess.check_output(['adb', *args], text=True)

def screen(filename):
    for attempt in range(3):
        try:
            adb('shell', 'uiautomator', 'dump', '/sdcard/anglais-smoke.xml')
            break
        except subprocess.CalledProcessError:
            if attempt == 2: raise
            time.sleep(2)
    adb('pull', '/sdcard/anglais-smoke.xml', filename)
    return pathlib.Path(filename).read_text()

def wait_text(text, filename):
    for _ in range(5):
        xml = screen(filename)
        if text in xml:
            return xml
    raise AssertionError(f'Screen never displayed {text}: {xml}')

def tap(xml, label):
    nodes = [node for node in ET.fromstring(xml).iter('node') if label in (node.get('text', '') + node.get('content-desc', '')) and node.get('clickable') == 'true']
    assert nodes, f'No clickable control: {label}'
    bounds = [tuple(map(int, re.findall(r'\d+', node.get('bounds', '')))) for node in nodes]
    bounds = [b for b in bounds if len(b) == 4 and b[2] > b[0] and b[3] > b[1] and b[1] > 0]
    assert bounds, f'No visible control: {label}'
    x1, y1, x2, y2 = min(bounds, key=lambda b: (b[2]-b[0])*(b[3]-b[1]))
    print(f'Tapping visible {label}: {(x1, y1, x2, y2)}', flush=True)
    assert y1 > 0 and x2 > x1 and y2 > y1
    adb('shell', 'input', 'tap', str((x1+x2)//2), str((y1+y2)//2))

home = wait_text('Anglais', 'android-smoke-home.xml')
tap(home, 'Réglages')
settings = wait_text('4.0.0-preview', 'android-smoke-settings.xml')
tap(settings, 'Rechercher une mise à jour')
wait_text('Version de test', 'android-smoke-update.xml')
with open('android-smoke.png', 'wb') as image:
    subprocess.run(['adb', 'exec-out', 'screencap', '-p'], stdout=image, check=True)
pid = adb('shell', 'pidof', 'com.chasmet.quizanglais.preview').strip()
assert pid
log = adb('logcat', '-d', '--pid='+pid)
pathlib.Path('android-smoke.log').write_text(log)
assert 'FATAL EXCEPTION' not in log, log
assert 'Uncaught ReferenceError' not in log, log
assert 'Uncaught TypeError' not in log, log
print('Android 35: home, settings, version and native updater bridge verified')
