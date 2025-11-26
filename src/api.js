import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ⚠️ for dev only, use backend in production
});

// Get text response
export async function askLLM(userMessage) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: userMessage }],
  });
  return response.choices[0].message.content;
}

// Convert text to speech (browser safe)
export async function getTTS(text) {
  const response = await client.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy", // voices: alloy, verse, shimmer
    input: text,
  });

  // ✅ Use arrayBuffer → Blob → URL (no Buffer in browser)
  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: "audio/mp3" });
  return URL.createObjectURL(blob);
}
