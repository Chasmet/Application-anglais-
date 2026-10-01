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

def scroll_and_tap(label, filename):
    for _ in range(4):
        xml = screen(filename)
        for node in ET.fromstring(xml).iter('node'):
            if label not in (node.get('text', '') + node.get('content-desc', '')) or node.get('clickable') != 'true':
                continue
            bounds = list(map(int, re.findall(r'\d+', node.get('bounds', ''))))
            if len(bounds) == 4 and bounds[2] > bounds[0] and bounds[3] > bounds[1] and bounds[1] > 0:
                tap(xml, label)
                return
        size = re.search(r'(\d+)x(\d+)', adb('shell', 'wm', 'size'))
        width, height = map(int, size.groups())
        adb('shell', 'input', 'swipe', str(width//2), str(height*4//5), str(width//2), str(height//4), '350')
    raise AssertionError(f'Control not visible after scrolling: {label}')

home = wait_text('Anglais', 'android-smoke-home.xml')
tap(home, 'Réglages')
version = re.search(r"versionName '([^']+)'", pathlib.Path('android/app/build.gradle').read_text()).group(1)
settings = wait_text(version + '-preview', 'android-smoke-settings.xml')
tap(settings, 'Rechercher une mise à jour')
wait_text('Version de test', 'android-smoke-update.xml')
tap(screen('android-smoke-update.xml'), 'Retour')
home = wait_text('Mode Classique', 'android-smoke-return.xml')
tap(home, 'Mode Classique')
classic = wait_text('Entraînement type 2', 'android-smoke-classic.xml')
tap(classic, 'Entraînement type 2')
reading = wait_text('Lecture seule', 'android-smoke-reading-home.xml')
scroll_and_tap('5 questions', 'android-smoke-reading-home.xml')
question = wait_text('Lis et choisis la traduction', 'android-smoke-reading-question.xml')
buttons = [n for n in ET.fromstring(question).iter('node') if n.get('class') == 'android.widget.Button' and n.get('clickable') == 'true' and n.get('text') not in ('Retour', 'AFFICHER UN INDICE', 'VALIDER') and n.get('text')]
assert len(buttons) == 4, f'Expected four written choices: {question}'
tap(question, buttons[0].get('text'))
tap(screen('android-smoke-reading-selected.xml'), 'VALIDER')
correction = wait_text('CONTINUER', 'android-smoke-reading-correction.xml')
assert 'Écouter la bonne réponse' not in correction, correction
assert 'Lent' not in correction, correction
with open('android-smoke.png', 'wb') as image:
    subprocess.run(['adb', 'exec-out', 'screencap', '-p'], stdout=image, check=True)
pid = adb('shell', 'pidof', 'com.chasmet.quizanglais.preview').strip()
assert pid
log = adb('logcat', '-d', '--pid='+pid)
pathlib.Path('android-smoke.log').write_text(log)
assert 'FATAL EXCEPTION' not in log, log
assert 'Uncaught ReferenceError' not in log, log
assert 'Uncaught TypeError' not in log, log
print('Android 35: home, updater and reading type 2 question/correction verified')
