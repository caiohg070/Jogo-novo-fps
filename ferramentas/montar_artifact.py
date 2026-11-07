#!/usr/bin/env python3
"""Junta prototipo/ (index.html + css + js + sons) em UM arquivo para publicar no artifact.
Uso: python3 ferramentas/montar_artifact.py saida.html"""
import re, sys, pathlib
P = pathlib.Path(__file__).resolve().parent.parent / 'prototipo'
html = (P / 'index.html').read_text()
arquivos = re.findall(r"'([^']+\.js)'", (P / 'js/arquivos.js').read_text())
codigo = "import * as THREE from 'three';\n" + ''.join(
    f"// ===== {f} =====\n" + (P / f).read_text().replace("'use strict';\n", '', 1) for f in arquivos)
html = html.replace('<link rel="stylesheet" href="css/estilo.css">', '<style>\n' + (P / 'css/estilo.css').read_text() + '</style>')
html = html.replace('<script>document.write(\'<script src="sons/sons.js?v=\' + Date.now() + \'"><\\/script>\');</script>', '<script>' + (P / 'sons/sons.js').read_text() + '</script>')
html = re.sub(r'<script type="module">\s*// carrega o Three.js.*?</script>',
              lambda _: '<script type="module">\n' + codigo + '</script>', html, flags=re.S)
html = re.sub(r'<!doctype html>\s*', '', html, flags=re.I)
html = re.sub(r'</?html[^>]*>|</?head>|</?body[^>]*>', '', html)
pathlib.Path(sys.argv[1]).write_text(html)
print('ok', sys.argv[1], len(html), 'bytes')
