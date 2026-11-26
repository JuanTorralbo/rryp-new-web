#!/usr/bin/env python3
"""
Servidor local de previsualizacion para el build de produccion Astro 5 (rryp-astro/dist):
- Sirve las 73 paginas estaticas compiladas en http://127.0.0.1:4321/
- Aplica redireccion 302 SEO-safe en "/" (excluye bots, respeta cookie rryp_lang, respaldo /en/)
- Sirve Gzip + cache inmutable de activos + cabeceras de seguridad
- Conecta /api/legal-intelligence en vivo con Groq GPT-OSS 120B desde .env (sin exponer la clave)
"""

import gzip
import json
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.request
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ASTRO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST_DIR = os.path.join(ASTRO_DIR, "dist")
PARENT_DIR = os.path.dirname(ASTRO_DIR)
WP_DATA_DIR = os.path.join(ASTRO_DIR, "src", "data", "wp")

SUPPORTED_LOCALES = ("es", "en", "de", "pt", "ru", "zh")
DEFAULT_LOCALE = "en"
BOT_RE = re.compile(
    r"bot|crawl|spider|slurp|mediapartners|facebookexternalhit|linkedinbot|whatsapp|telegrambot|gptbot|claudebot|perplexitybot|oai-searchbot|google-extended|bingpreview",
    re.I,
)
COMPRESSIBLE_EXTS = (".html", ".css", ".js", ".json", ".xml", ".txt", ".svg", ".webmanifest", ".otf", ".ttf")
IMMUTABLE_EXTS = (".avif", ".webp", ".png", ".ttf", ".otf", ".woff2")

# Sinonimos multilingues hacia terminos clave del corpus juridico de RRYP Global
RAG_SYNONYMS = {
    "divorce": ["divorcio", "conyugales", "gananciales"],
    "scheidung": ["divorcio", "conyugales"],
    "custody": ["custodia", "menores", "paternofiliales"],
    "sorgerecht": ["custodia", "menores"],
    "abduction": ["sustraccion", "menores", "restitucion"],
    "child": ["menor", "menores", "custodia"],
    "inheritance": ["herencia", "sucesiones", "testamento"],
    "will": ["testamento", "sucesiones", "herencia"],
    "erbrecht": ["herencia", "sucesiones", "testamento"],
    "estate": ["herencia", "sucesiones", "patrimonio"],
    "crypto": ["criptoactivos", "patrimonio", "digital"],
    "bitcoin": ["criptoactivos", "patrimonio"],
    "extradition": ["extradicion", "oede", "entrega"],
    "eaw": ["oede", "entrega", "audiencia", "extradicion"],
    "arrest": ["oede", "detencion", "entrega", "extradicion"],
    "fraud": ["estafa", "querella", "penal"],
    "bankruptcy": ["concurso", "insolvencia", "exoneracion", "deuda"],
    "insolvency": ["insolvencia", "concurso", "exoneracion"],
    "contract": ["contrato", "contratos", "software", "licencia"],
    "software": ["software", "tecnologicos", "saas", "licencia"],
    "saas": ["saas", "software", "tecnologicos"],
    "competition": ["competencia", "desleal"],
    "patent": ["patente", "propiedad"],
    "judgment": ["exequatur", "sentencia", "reconocimiento"],
    "exequatur": ["exequatur", "reconocimiento", "sentencia"],
    "alimony": ["alimentos", "pension", "compensatoria"],
    "switzerland": ["suiza"],
    "usa": ["estados", "unidos", "eeuu"],
    "france": ["francia"],
    "portugal": ["portugal", "portugueses"],
    "marbella": ["marbella", "malaga"],
}

STOPWORDS = {
    "para", "como", "sobre", "entre", "desde", "hasta", "donde", "cuando", "porque",
    "este", "esta", "estos", "estas", "unos", "unas", "pero", "tiene", "tengo", "puede",
    "puedo", "quiero", "necesito", "espana", "spain", "with", "from", "that", "this",
    "have", "what", "when", "where", "about", "your", "their", "into", "more", "than",
}


def _norm_text(text):
    s = unicodedata.normalize("NFD", str(text or "").lower())
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    return s


def _tokenize(text):
    raw = re.findall(r"[a-z0-9]{3,}", _norm_text(text))
    tokens = []
    for tok in raw:
        if tok in STOPWORDS:
            continue
        tokens.append(tok)
        if tok in RAG_SYNONYMS:
            tokens.extend(RAG_SYNONYMS[tok])
    return tokens


def _load_rag_corpus():
    docs = []
    # 1. 28 casos reales
    cases_path = os.path.join(WP_DATA_DIR, "cases.json")
    if os.path.isfile(cases_path):
        for c in json.load(open(cases_path, encoding="utf-8")):
            title = c.get("title", "")
            lead = c.get("lead", "")
            docs.append({
                "kind": "case",
                "slug": c.get("slug", ""),
                "title": title,
                "excerpt": lead[:260],
                "title_norm": _norm_text(title),
                "body_norm": _norm_text(f"{title} {c.get('pillarLabel', '')} {lead}"),
                "boost": 1.6,
            })
    # 2. 17 especialidades
    specs_path = os.path.join(WP_DATA_DIR, "specialties.json")
    if os.path.isfile(specs_path):
        for s in json.load(open(specs_path, encoding="utf-8")):
            title = s.get("title", "")
            lead = s.get("lead", "")
            docs.append({
                "kind": "specialty",
                "slug": s.get("slug", ""),
                "title": title,
                "excerpt": lead[:260],
                "title_norm": _norm_text(title),
                "body_norm": _norm_text(f"{title} {s.get('pillarLabel', '')} {lead}"),
                "boost": 1.45,
            })
    # 3. 429 articulos de Legal Intelligence
    arts_path = os.path.join(WP_DATA_DIR, "articles.json")
    if os.path.isfile(arts_path):
        for a in json.load(open(arts_path, encoding="utf-8")):
            title = a.get("title", "")
            excerpt = a.get("excerpt", "")
            docs.append({
                "kind": "article",
                "slug": a.get("slug", ""),
                "title": title,
                "excerpt": excerpt[:240],
                "title_norm": _norm_text(title),
                "body_norm": _norm_text(f"{title} {a.get('category', '')} {excerpt}"),
                "boost": 1.0,
            })
    return docs


RAG_CORPUS = _load_rag_corpus()


def retrieve_rag_docs(query, lang_code="es", limit=4):
    tokens = list(dict.fromkeys(_tokenize(query)))
    if not tokens or not RAG_CORPUS:
        return []
    safe_lang = lang_code if lang_code in SUPPORTED_LOCALES else "es"
    scored = []
    for doc in RAG_CORPUS:
        score = 0.0
        for tok in tokens:
            if tok in doc["title_norm"]:
                score += 4.0
            elif tok in doc["body_norm"]:
                score += 1.5
        if score > 0:
            scored.append((score * doc["boost"], doc))
    scored.sort(key=lambda x: x[0], reverse=True)
    # Diversify: max 2 cases, max 1 specialty, max 2 articles
    out = []
    counts = {"case": 0, "specialty": 0, "article": 0}
    caps = {"case": 2, "specialty": 1, "article": 2}
    for _, doc in scored:
        k = doc["kind"]
        if counts[k] >= caps[k]:
            continue
        counts[k] += 1
        if k == "case":
            url = f"/{safe_lang}/casos/{doc['slug']}/"
        elif k == "specialty":
            url = f"/{safe_lang}/especialidades/{doc['slug']}/"
        else:
            # 393 articles are ES-only; check if localized version exists in dist/
            loc_cand = os.path.join(DIST_DIR, safe_lang, "legal-intelligence", doc["slug"], "index.html")
            url = f"/{safe_lang}/legal-intelligence/{doc['slug']}/" if os.path.isfile(loc_cand) else f"/es/legal-intelligence/{doc['slug']}/"
        out.append({
            "kind": k,
            "title": doc["title"],
            "excerpt": doc["excerpt"],
            "url": url,
        })
        if len(out) >= limit:
            break
    return out


def load_env(path):
    env = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return env


ENV = {**load_env(os.path.join(PARENT_DIR, ".env")), **load_env(os.path.join(ASTRO_DIR, ".env"))}
GROQ_API_KEY = ENV.get("GROQ_API_KEY") or os.environ.get("GROQ_API_KEY", "")

SYSTEM_PROMPT = """Eres RRYP Legal Intelligence, el asistente conversacional de inteligencia artificial de RRYP Global (International Legal Boutique).
Reglas obligatorias:
1. Responde siempre integramente en el idioma solicitado, con claridad, empatia, rigor y tono editorial sobrio (nivel boutique juridica internacional de banca privada).
2. Nunca uses el caracter de punto intermedio en ninguna parte de tu respuesta.
3. Usa exclusivamente datos reales de RRYP Global:
   - Pilares: Private Clients, Private Wealth y Business Disputes, construccion estrategica del caso y reconduccion de casos de maxima complejidad.
   - Sedes reales (solo 3): Madrid (Pº de la Castellana 40, 8ª, 28046), Malaga (C/ Martinez Campos 16, 3D, 29001; Marbella y Costa del Sol son area de servicio atendida desde Malaga) y Cordoba (Avda. Sta. Mª de Trassierra 98, 14011).
   - Contacto: +34 957 858 952, info@rrypglobal.com. Horario (hora de Madrid): L-J 09:00-14:00 y 16:00-19:15; V 08:00-15:00.
   - Vias de entrada: Llamada inicial (30 min, sin coste, sin valoracion juridica), Primera reunion juridica (30 min con direccion, 350 EUR IVA incluido) y Atencion urgente (500 EUR).
4. Comportamiento conversacional:
   - En los primeros 1-2 mensajes, ayuda primero de verdad al usuario con orientacion practica y haz 1-2 preguntas concretas sin presionarle todavia a reservar (salvo urgencia inminente o si pregunta por citas/tarifas).
   - Si expresa urgencia o inmediatez ("lo necesito ya", "asap", "dringend", "urgente", "срочно", "紧急", "马上"), recomienda inmediatamente el canal de Atencion urgente (500 EUR).
   - A partir del segundo o tercer intercambio, recomienda con naturalidad agendar cita con RRYP Global."""


def negotiate_locale(accept_lang):
    if not accept_lang:
        return DEFAULT_LOCALE
    parsed = []
    for part in accept_lang.split(","):
        pieces = part.strip().split(";q=")
        code = pieces[0].strip().lower().split("-")[0]
        try:
            q = float(pieces[1]) if len(pieces) > 1 else 1.0
        except ValueError:
            q = 0.0
        parsed.append((q, code))
    parsed.sort(reverse=True)
    for _, code in parsed:
        if code in SUPPORTED_LOCALES:
            return code
    return DEFAULT_LOCALE


class AstroPreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def end_headers(self):
        clean_path = self.path.split("?", 1)[0]
        if clean_path.endswith(IMMUTABLE_EXTS):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        elif clean_path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        else:
            self.send_header("Cache-Control", "public, max-age=0, must-revalidate")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        super().end_headers()

    def _send_json(self, status, obj):
        raw = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_GET(self):
        clean_path = self.path.split("?", 1)[0]
        if clean_path == "/api/legal-intelligence/status":
            self._send_json(200, {"connected": bool(GROQ_API_KEY), "provider": "Groq GPT-OSS 120B"})
            return

        # SEO-safe HTTP 302 redirect on root "/" (never redirects bots)
        if clean_path == "/":
            ua = self.headers.get("User-Agent", "")
            if not BOT_RE.search(ua):
                cookie_header = self.headers.get("Cookie", "")
                cookie = SimpleCookie()
                cookie.load(cookie_header)
                cookie_lang = cookie["rryp_lang"].value if "rryp_lang" in cookie else ""
                target = cookie_lang if cookie_lang in SUPPORTED_LOCALES else negotiate_locale(self.headers.get("Accept-Language", ""))
                self.send_response(302)
                self.send_header("Location", f"/{target}/")
                self.send_header("Vary", "Accept-Language, Cookie")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return

        # Resolve trailing slash index.html with Gzip when supported
        rel = clean_path.lstrip("/")
        candidate = os.path.normpath(os.path.join(DIST_DIR, rel))
        if os.path.isdir(candidate):
            candidate = os.path.join(candidate, "index.html")
        accept_enc = self.headers.get("Accept-Encoding", "")
        if "gzip" in accept_enc and candidate.startswith(DIST_DIR) and os.path.isfile(candidate) and candidate.endswith(COMPRESSIBLE_EXTS):
            with open(candidate, "rb") as f:
                raw = f.read()
            gz = gzip.compress(raw, compresslevel=6)
            ctype = self.guess_type(candidate)
            self.send_response(200)
            self.send_header("Content-Type", f"{ctype}; charset=utf-8" if ctype.startswith("text/") or "javascript" in ctype or "json" in ctype or "xml" in ctype else ctype)
            self.send_header("Content-Encoding", "gzip")
            self.send_header("Vary", "Accept-Encoding")
            self.send_header("Content-Length", str(len(gz)))
            self.end_headers()
            self.wfile.write(gz)
            return

        # Serve branded 404.html with HTTP 404 for unknown paths (matching Cloudflare/Vercel)
        if not (candidate.startswith(DIST_DIR) and os.path.isfile(candidate)):
            not_found = os.path.join(DIST_DIR, "404.html")
            if os.path.isfile(not_found):
                with open(not_found, "rb") as f:
                    raw = f.read()
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(raw)))
                self.end_headers()
                self.wfile.write(raw)
                return

        super().do_GET()

    def do_POST(self):
        if self.path != "/api/legal-intelligence":
            self.send_error(404, "Not found")
            return
        if not GROQ_API_KEY:
            self._send_json(503, {"error": "GROQ_API_KEY no configurada"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            self._send_json(400, {"error": "JSON invalido"})
            return

        user_msg = (body.get("message") or "").strip()
        if not user_msg:
            self._send_json(400, {"error": "Mensaje vacio"})
            return

        lang_code = (body.get("lang") or "es").lower()
        lang_names = {
            "es": "Español",
            "en": "English",
            "de": "Deutsch",
            "pt": "Português",
            "ru": "Русский",
            "zh": "简体中文 (Simplified Chinese)",
        }
        target_lang = lang_names.get(lang_code, "the user's language")
        articles = body.get("relevantArticles") or []
        history = body.get("history") or []
        turn_num = int(body.get("userTurnCount") or 1)
        rag_docs = retrieve_rag_docs(user_msg, lang_code, limit=4)

        ctx = [
            f"IDIOMA OBLIGATORIO DE RESPUESTA: responde INTEGRAMENTE en {target_lang} (o en el idioma exacto del usuario). No mezcles frases en español."
        ]
        if rag_docs:
            ctx.append("Base documental interna real de RRYP Global relevante para esta consulta (citala de forma natural cuando ayude al usuario):")
            for i, d in enumerate(rag_docs, 1):
                kind_lbl = {"case": "Caso real resuelto", "specialty": "Guia de especialidad", "article": "Articulo Legal Intelligence"}.get(d["kind"], "Documento")
                ctx.append(f"{i}. [{kind_lbl}] {d['title']} -> {d['excerpt']} (URL: {d['url']})")
        elif articles:
            ctx.append("Articulos relevantes de RRYP Global:")
            for i, a in enumerate(articles[:3], 1):
                ctx.append(f"{i}. {a.get('title', '')} ({a.get('url', '')})")
        ctx.append(f"Turno del usuario: {turn_num}.")

        messages = [{"role": "system", "content": SYSTEM_PROMPT + "\n\n" + "\n".join(ctx)}]
        for item in history[-8:]:
            role = "assistant" if item.get("role") == "assistant" else "user"
            txt = (item.get("text") or "").strip()
            if txt:
                messages.append({"role": role, "content": txt})
        messages.append({"role": "user", "content": user_msg})

        payload = json.dumps({
            "model": "openai/gpt-oss-120b",
            "messages": messages,
            "temperature": 0.4,
            "max_tokens": 900,
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "User-Agent": "RRYP-Astro-Preview/1.0",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                reply = (data.get("choices", [{}])[0].get("message", {}).get("content") or "").replace("\u00b7", ",").strip()
                sources = [{"title": d["title"], "url": d["url"], "kind": d["kind"]} for d in rag_docs]
                self._send_json(200, {"reply": reply, "provider": "Groq GPT-OSS 120B", "sources": sources})
        except urllib.error.HTTPError as e:
            self._send_json(502, {"error": f"Groq HTTP {e.code}"})
        except Exception as e:
            self._send_json(502, {"error": str(e)})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", "4321"))
    server = ThreadingHTTPServer(("127.0.0.1", port), AstroPreviewHandler)
    print(f"RRYP Global Astro 5 production preview running at http://127.0.0.1:{port}/ (Groq connected: {bool(GROQ_API_KEY)})", flush=True)
    server.serve_forever()
