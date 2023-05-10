import { OAIStreamingCompletion } from "../src/api";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || !process.env.OPENAI_API_KEY) {
    return new Response(null);
  }

  const stream = await OAIStreamingCompletion(
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: q }],
    },
    process.env.OPENAI_API_KEY
  );
  return new Response(stream);
}
