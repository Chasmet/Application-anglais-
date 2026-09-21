"""Check the built APK, not just the web source list."""
import pathlib, sys, zipfile
with zipfile.ZipFile(sys.argv[1]) as apk:
    names = set(apk.namelist())
    for suffix in ('*.html', '*.js', '*.css'):
        for source in pathlib.Path('.').glob(suffix):
            assert 'assets/' + source.name in names, f'Missing asset: {source}'
    assert any(name.endswith('.onnx') for name in names), 'Offline voice model missing'
    assert any(name.endswith('.so') for name in names), 'Native libraries missing'
print('APK: web assets, offline model and native libraries present')
