export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { topic, category, tone, platform } = req.body;
  if (!topic) return res.status(400).json({ error: "Topic is required" });

  const prompt = `You are a viral social media strategist. Generate content for ${platform} about "${topic}" in the "${category}" niche with a "${tone}" tone.

Respond ONLY with a valid JSON object. No markdown, no backticks, no explanation:
{
  "caption": "punchy 2-4 sentence caption with 1-2 emojis and a strong hook in the first line",
  "hashtags": ["25","unique","hashtags","without","hash","symbol","mix","of","niche","trending","and","broad","tags","for","maximum","reach","targeting","the","right","audience","for","this","specific","topic","and","platform"],
  "hook": "Exactly what to say or show in the first 3 seconds to stop the scroll",
  "cta": "One punchy call to action line",
  "bestPostTime": "Best day and time to post for maximum reach on ${platform}"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.content?.map((i) => i.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Generation failed. Try again." });
  }
}
