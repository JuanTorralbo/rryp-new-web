interface Env {
  GROQ_API_KEY?: string;
  ASSETS?: { fetch: (input: RequestInfo | URL) => Promise<Response> };
}

interface RagDoc {
  k: "case" | "specialty" | "article";
  s: string;
  t: string;
  p: string;
  e: string;
}

const SUPPORTED_LOCALES = new Set(["es", "en", "de", "pt", "ru", "zh"]);

const LANG_NAMES: Record<string, string> = {
  es: "Español",
  en: "English",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский",
  zh: "简体中文 (Simplified Chinese)",
};

const SYNONYMS: Record<string, string[]> = {
  divorce: ["divorcio", "conyugales", "gananciales"],
  scheidung: ["divorcio", "conyugales"],
  custody: ["custodia", "menores", "paternofiliales"],
  abduction: ["sustraccion", "menores", "restitucion"],
  inheritance: ["herencia", "sucesiones", "testamento"],
  will: ["testamento", "sucesiones", "herencia"],
  crypto: ["criptoactivos", "patrimonio", "digital"],
  extradition: ["extradicion", "oede", "entrega"],
  eaw: ["oede", "entrega", "audiencia", "extradicion"],
  fraud: ["estafa", "querella", "penal"],
  insolvency: ["insolvencia", "concurso", "exoneracion"],
  contract: ["contrato", "contratos", "software", "licencia"],
  software: ["software", "tecnologicos", "saas", "licencia"],
  competition: ["competencia", "desleal"],
  exequatur: ["exequatur", "reconocimiento", "sentencia"],
};

const SYSTEM_PROMPT = `Eres RRYP Legal Intelligence, el asistente conversacional de inteligencia artificial de RRYP Global (International Legal Boutique).
Reglas obligatorias:
1. Responde siempre integramente en el idioma solicitado, con claridad, empatia, rigor y tono editorial sobrio (nivel boutique juridica internacional de banca privada).
2. Nunca uses el caracter de punto intermedio en ninguna parte de tu respuesta.
3. Usa exclusivamente datos reales de RRYP Global:
   - Pilares: Private Clients, Private Wealth y Business Disputes, construccion estrategica del caso y reconduccion de casos de maxima complejidad.
   - Sedes reales (solo 3): Madrid (Pº de la Castellana 40, 8ª, 28046), Malaga (C/ Martinez Campos 16, 3D, 29001; Marbella y Costa del Sol son area de servicio atendida desde Malaga) y Cordoba (Avda. Sta. Mª de Trassierra 98, 14011).
   - Contacto: +34 957 858 952, info@rrypglobal.com. Horario (Europe/Madrid): L-J 09:00-14:00 y 16:00-19:15; V 08:00-15:00.
   - Vias de entrada: Llamada inicial (30 min, 0 EUR), Primera reunion juridica (350 EUR IVA incl.) y Atencion urgente (500 EUR).
4. En los primeros 1-2 mensajes ayuda con orientacion practica y 1-2 preguntas concretas sin presionar a reservar (salvo urgencia inminente o consulta sobre tarifas/citas).`;

function norm(s: string): string {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function tokenize(query: string): string[] {
  const base = norm(query).match(/[a-z0-9]{3,}/g) || [];
  const out = new Set<string>();
  for (const tok of base) {
    out.add(tok);
    for (const syn of SYNONYMS[tok] || []) out.add(syn);
  }
  return Array.from(out);
}

let cachedRag: RagDoc[] | null = null;

async function loadRag(request: Request, env: Env): Promise<RagDoc[]> {
  if (cachedRag) return cachedRag;
  try {
    const url = new URL("/data/rag-index.json", request.url);
    const res = env.ASSETS ? await env.ASSETS.fetch(url) : await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as RagDoc[];
      if (Array.isArray(data)) {
        cachedRag = data;
        return data;
      }
    }
  } catch {
    // ignore edge asset load error
  }
  return [];
}

function retrieveDocs(corpus: RagDoc[], query: string, lang: string) {
  const tokens = tokenize(query);
  if (!tokens.length || !corpus.length) return [];
  const safeLang = SUPPORTED_LOCALES.has(lang) ? lang : "es";
  const scored: { score: number; doc: RagDoc }[] = [];

  for (const doc of corpus) {
    const tn = norm(doc.t);
    const bn = norm(`${doc.t} ${doc.p} ${doc.e}`);
    let score = 0;
    for (const tok of tokens) {
      if (tn.includes(tok)) score += 4;
      else if (bn.includes(tok)) score += 1.5;
    }
    if (score > 0) {
      const boost = doc.k === "case" ? 1.6 : doc.k === "specialty" ? 1.45 : 1.0;
      scored.push({ score: score * boost, doc });
    }
  }
  scored.sort((a, b) => b.score - a.score);

  const counts = { case: 0, specialty: 0, article: 0 };
  const caps = { case: 2, specialty: 1, article: 2 };
  const results: { kind: string; title: string; excerpt: string; url: string }[] = [];

  for (const { doc } of scored) {
    if (counts[doc.k] >= caps[doc.k]) continue;
    counts[doc.k] += 1;
    const url =
      doc.k === "case"
        ? `/${safeLang}/casos/${doc.s}/`
        : doc.k === "specialty"
          ? `/${safeLang}/especialidades/${doc.s}/`
          : `/es/legal-intelligence/${doc.s}/`;
    results.push({ kind: doc.k, title: doc.t, excerpt: doc.e, url });
    if (results.length >= 4) break;
  }
  return results;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY no configurada" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: "JSON invalido" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const userMsg = String(body.message || "").trim();
  if (!userMsg) {
    return new Response(JSON.stringify({ error: "Mensaje vacio" }), {
      status: 400,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const langCode = String(body.lang || "es").toLowerCase();
  const targetLang = LANG_NAMES[langCode] || "the user's language";
  const history = Array.isArray(body.history) ? (body.history as { role?: string; text?: string }[]) : [];
  const turnNum = Number(body.userTurnCount || 1);

  const corpus = await loadRag(request, env);
  const ragDocs = retrieveDocs(corpus, userMsg, langCode);

  const ctx = [
    `IDIOMA OBLIGATORIO DE RESPUESTA: responde INTEGRAMENTE en ${targetLang} (o en el idioma exacto del usuario).`,
  ];
  if (ragDocs.length) {
    ctx.push("Base documental interna real de RRYP Global relevante para esta consulta:");
    ragDocs.forEach((d, idx) => {
      ctx.push(`${idx + 1}. [${d.kind}] ${d.title} -> ${d.excerpt} (URL: ${d.url})`);
    });
  }
  ctx.push(`Turno del usuario: ${turnNum}.`);

  const messages: { role: string; content: string }[] = [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n${ctx.join("\n")}` },
  ];
  for (const item of history.slice(-8)) {
    const txt = String(item.text || "").trim();
    if (txt) {
      messages.push({ role: item.role === "assistant" ? "assistant" : "user", content: txt });
    }
  }
  messages.push({ role: "user", content: userMsg });

  try {
    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        temperature: 0.4,
        max_tokens: 900,
      }),
    });

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `Groq HTTP ${resp.status}` }), {
        status: 502,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const data = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = String(data.choices?.[0]?.message?.content || "")
      .replace(/\u00b7/g, ",")
      .trim();
    const sources = ragDocs.map((d) => ({ title: d.title, url: d.url, kind: d.kind }));

    return new Response(JSON.stringify({ reply, provider: "Groq GPT-OSS 120B", sources }), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
