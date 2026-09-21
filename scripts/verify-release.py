"""Never publish an update with a different certificate or older version code."""
import os, pathlib, re, subprocess, sys
sdk = pathlib.Path(os.environ['ANDROID_HOME']) / 'build-tools'
build_tools = sorted(sdk.iterdir(), key=lambda p: [int(n) for n in re.findall(r'\d+', p.name)])[-1]
def read(apk):
    signatures = subprocess.check_output([str(build_tools/'apksigner'), 'verify', '--verbose', '--print-certs', str(apk)], text=True)
    certs = set(re.findall(r'Signer #\d+ certificate SHA-256 digest: (\w+)', signatures))
    assert certs, 'Missing signing certificate'
    badging = subprocess.check_output([str(build_tools/'aapt'), 'dump', 'badging', str(apk)], text=True)
    package, code, version = re.search(r"package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'", badging).groups()
    return certs, package, int(code), version
previous = list(pathlib.Path(sys.argv[2]).glob('*.apk'))
assert len(previous) == 1, 'Cannot identify the currently distributed APK'
old, new = read(previous[0]), read(pathlib.Path(sys.argv[1]))
assert old[0] == new[0], 'Signing certificate differs: keep the existing release and recover its original private key'
assert old[1] == new[1] == 'com.chasmet.quizanglais', 'Wrong package name'
assert new[2] > old[2], 'Version code must increase'
expected = re.search(r"versionName '([^']+)'", pathlib.Path('android/app/build.gradle').read_text())[1]
assert new[3] == expected, 'Unexpected APK version'
print('Release certificate, package and version verified')
