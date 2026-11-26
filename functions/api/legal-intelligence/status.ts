interface Env {
  GROQ_API_KEY?: string;
}

export const onRequestGet = async ({ env }: { env: Env }) => {
  return new Response(
    JSON.stringify({
      connected: Boolean(env.GROQ_API_KEY),
      provider: "Groq GPT-OSS 120B",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
};
