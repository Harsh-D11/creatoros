const GEMINI_KEY = "YOUR_GEMINI_API_KEY";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

async function callGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

/* ── IDEA GENERATOR ── */
document.getElementById("generateIdeas").addEventListener("click", async () => {
  const niche = document.getElementById("nicheInput").value.trim();
  const mode = document.getElementById("modeSelect").value;
  const platform = document.getElementById("platformSelect").value;

  if (!niche) {
    alert("Please enter a niche first.");
    return;
  }

  document.getElementById("ideasOutput").classList.add("hidden");
  document.getElementById("ideasLoader").classList.remove("hidden");

  const prompt = `You are a content strategist for ${platform}.
Generate exactly 10 creative and specific content ideas for a ${mode} in the "${niche}" niche.
Format: return only a numbered list 1 to 10.
Each idea should be a clear video or post title with a one-line hook.
No intro text, no explanation, just the 10 numbered ideas.`;

  try {
    const text = await callGemini(prompt);
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const listEl = document.getElementById("ideasList");
    listEl.innerHTML = "";
    let count = 0;
    lines.forEach((line) => {
      const clean = line.replace(/^\d+[\.\)]\s*/, "").trim();
      if (!clean) return;
      count++;
      const div = document.createElement("div");
      div.className = "idea-item";
      div.innerHTML = `<span class="idea-number">${count}.</span>${clean}`;
      listEl.appendChild(div);
    });
    document.getElementById("ideasLoader").classList.add("hidden");
    document.getElementById("ideasOutput").classList.remove("hidden");
  } catch (e) {
    document.getElementById("ideasLoader").classList.add("hidden");
    alert("Something went wrong. Please check your API key.");
  }
});

/* ── COPY IDEAS ── */
document.getElementById("copyIdeas").addEventListener("click", () => {
  const items = document.querySelectorAll("#ideasList .idea-item");
  const text = Array.from(items)
    .map((el, i) => `${i + 1}. ${el.textContent.replace(/^\d+\./, "").trim()}`)
    .join("\n");
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyIdeas");
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = "Copy all"; }, 2000);
  });
});

/* ── AI IMAGE GENERATOR ── */
document.getElementById("generateImage").addEventListener("click", () => {
  const prompt = document.getElementById("imagePrompt").value.trim();

  if (!prompt) {
    alert("Please enter an image prompt first.");
    return;
  }

  document.getElementById("imageOutput").classList.add("hidden");
  document.getElementById("imageLoader").classList.remove("hidden");

  const encoded = encodeURIComponent(prompt);
  const seed = Date.now();
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${seed}`;

  const img = document.getElementById("generatedImage");
  img.src = imageUrl;

  img.onload = () => {
    const dl = document.getElementById("downloadImage");
    dl.href = imageUrl;
    document.getElementById("imageLoader").classList.add("hidden");
    document.getElementById("imageOutput").classList.remove("hidden");
  };

  img.onerror = () => {
    document.getElementById("imageLoader").classList.add("hidden");
    alert("Image generation failed. Try a different prompt.");
  };
});

/* ── VIDEO STORYBOARD GENERATOR ── */
document.getElementById("generateVideo").addEventListener("click", async () => {
  const concept = document.getElementById("videoPrompt").value.trim();
  const type = document.getElementById("videoType").value;

  if (!concept) {
    alert("Please enter a video concept first.");
    return;
  }

  document.getElementById("videoOutput").classList.add("hidden");
  document.getElementById("videoLoader").classList.remove("hidden");

  const prompt = `You are a video director creating a storyboard for a ${type}.
Concept: "${concept}"
Create a shot-by-shot storyboard with exactly 6 shots.
For each shot include:
- Shot number and type (e.g. close-up, wide shot)
- What is shown on screen
- Voiceover or caption text
- Duration in seconds
Separate each shot with a blank line.
No intro text, just the 6 shots.`;

  try {
    const text = await callGemini(prompt);
    const listEl = document.getElementById("videoList");
    listEl.innerHTML = "";

    const blocks = text.split(/\n\s*\n/).filter(b => b.trim().length > 0);

    blocks.forEach((block, i) => {
      const div = document.createElement("div");
      div.className = "idea-item";
      div.style.whiteSpace = "pre-line";
      div.innerHTML = `<span class="idea-number">Shot ${i + 1}.</span>${block.trim()}`;
      listEl.appendChild(div);
    });

    document.getElementById("videoLoader").classList.add("hidden");
    document.getElementById("videoOutput").classList.remove("hidden");
  } catch (e) {
    document.getElementById("videoLoader").classList.add("hidden");
    alert("Something went wrong. Please check your API key.");
  }
});

/* ── COPY STORYBOARD ── */
document.getElementById("copyVideo").addEventListener("click", () => {
  const items = document.querySelectorAll("#videoList .idea-item");
  const text = Array.from(items)
    .map((el, i) => `Shot ${i + 1}:\n${el.textContent.replace(/^Shot \d+\./, "").trim()}`)
    .join("\n\n");
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyVideo");
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = "Copy all"; }, 2000);
  });
});