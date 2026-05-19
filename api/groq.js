export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      code: "METHOD_NOT_ALLOWED",
      message: "Invalid request method."
    });
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        code: "MISSING_PROMPT",
        message: "Please enter a prompt first."
      });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a professional creator assistant. Keep answers practical, concise, and structured."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(groqRes.status).json({
        code: "GROQ_REQUEST_FAILED",
        message: "We couldn’t generate content right now. Please try again.",
        details: data?.error?.message || "Groq request failed"
      });
    }

    const output = data?.choices?.[0]?.message?.content?.trim();

    if (!output) {
      return res.status(502).json({
        code: "EMPTY_GROQ_RESPONSE",
        message: "We couldn’t generate a response right now. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      content: output
    });
  } catch (error) {
    return res.status(500).json({
      code: "GROQ_SERVER_ERROR",
      message: "Something went wrong while generating content. Please try again.",
      details: error.message
    });
  }
}
