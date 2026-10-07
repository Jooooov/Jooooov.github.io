"""Smoke tests — JoaoSite (site pessoal trilingue)."""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(path):
    with open(os.path.join(ROOT, path), encoding="utf-8") as f:
        return f.read()


def test_structure():
    for p in ("index.html", "assets/styles.css", "assets/main.js", "assets/i18n.js", "requirements.txt"):
        assert os.path.exists(os.path.join(ROOT, p)), f"falta {p}"


def test_html_essentials():
    html = read("index.html")
    assert "João Vicente" in html
    assert "jooooov@gmail.com" not in html  # email montado em JS
    assert 'id="net"' in html and 'id="seam"' in html  # canvases do hero
    for anchor in ("quem-sou", "ai", "ba", "contacto"):
        assert f'id="{anchor}"' in html, f"falta secção #{anchor}"
    assert "github.com/Jooooov" in html  # conta certa (4 o's)


def test_i18n_coverage():
    html = read("index.html")
    js = read("assets/i18n.js")
    keys = set(re.findall(r'data-i18n(?:-html)?="([^"]+)"', html))
    assert keys, "sem chaves i18n"
    for lang in ("pt:", "en:", "es:"):
        assert lang in js
    for key in keys:
        occ = len(re.findall(rf'\b{re.escape(key)}\s*:', js))
        assert occ >= 3, f"chave '{key}' não coberta nas 3 línguas ({occ}x)"


def test_no_private_info():
    """Sem nomes de empregador nem dados sensíveis no site público."""
    for p in ("index.html", "assets/i18n.js"):
        content = read(p).lower()
        for banned in ("brambles", "chemetil", "barbara", "workcortex"):
            assert banned not in content, f"'{banned}' não deve aparecer no site pessoal"


def test_share_preview():
    """Pré-visualização ao partilhar (LinkedIn/WhatsApp): og:image absoluto e ficheiro presente."""
    html = read("index.html")
    m = re.search(r'<meta property="og:image" content="([^"]+)"', html)
    assert m, "falta og:image"
    assert m.group(1).startswith("https://jooooov.github.io/"), "og:image tem de ser URL absoluto"
    assert os.path.exists(os.path.join(ROOT, m.group(1).split("jooooov.github.io/")[1])), "imagem og em falta"
    assert '<meta property="og:url"' in html


def test_linkedin_contact():
    assert "linkedin.com/in/joao-vicente129" in read("index.html")


def test_language_follows_browser():
    """Sem ?lang nem escolha guardada, a língua vem do browser (PT/ES, senão EN)."""
    js = read("assets/main.js")
    assert "navigator.language" in js
