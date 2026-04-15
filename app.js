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
Format: return only a numbered list 1-10. Each idea should be a clear video/post title with a one-line hook.
No extra explanation, no intro text, just the 10 numbered ideas.`;

  try {
    const text = await callGemini(prompt);
    const lines = text.split("\n").filter(l => l.trim().length > 0);

    const listEl = document.getElementById("ideasList");
    listEl.innerHTML = "";

    lines.forEach((line, i) => {
      const clean = line.replace(/^\d+[\.\)]\s*/, "").trim();
      if (!clean) return;
      const div = document.createElement("div");
      div.className = "idea-item";
      div.innerHTML = `<span class="idea-number">${i + 1}.</span>${clean}`;
      listEl.appendChild(div);
    });

    document.getElementById("ideasLoader").classList.add("hidden");
    document.getElementById("ideasOutput").classList.remove("hidden");
  } catch (e) {
    document.getElementById("ideasLoader").classList.add("hidden");
    alert("Something went wrong. Check your API key.");
  }
});

/* ── COPY IDEAS ── */
document.getElementById("copyIdeas").addEventListener("click", () => {
  const items = document.querySelectorAll("#ideasList .idea-item");
  const text = Array.from(items)
    .map((el, i) => `${i + 1}. ${el.textContent.replace(/^\d+\./, "").trim()}`)
    .join("\n");
  navigator.clipboard.writeText(text);
  document.getElementById("copyIdeas").textContent = "Copied!";
  setTimeout(() => {
    document.getElementById("copyIdeas").textContent = "Copy all";
  }, 2000);
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
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&nologo=true&seed=${Date.now()}`;

  const img = document.getElementById("generatedImage");
  img.src = imageUrl;

  img.onload = () => {
    document.getElementById("downloadImage").href = imageUrl;
    document.getElementById("imageLoader").classList.add("hidden");
    document.getElementById("imageOutput").classList.remove("hidden");
  };

  img.onerror = () => {
    document.getElementById("imageLoader").classList.add("hidden");
    alert("Image generation failed. Please try a different prompt.");
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
Create a detailed shot-by-shot storyboard with exactly 6 shots.
For each shot include:
- Shot number
- Shot type (close-up, wide, etc.)
- What is shown on screen
- Voiceover or caption text
- Duration in seconds

Format each shot clearly. No intro text, just the 6 shots.`;

  try {
    const text = await callGemini(prompt);
    const shots = text.split(/shot\s*\d+/i).filter(s => s.trim().length > 0);

    const listEl = document.getElementById("videoList");
    listEl.innerHTML = "";

    if (shots.length === 0) {
      const lines = text.split("\n\n").filter(l => l.trim().length > 0);
      lines.forEach((block, i) => {
        const div = document.createElement("div");
        div.className = "idea-item";
        div.innerHTML = `<span class="idea-number">Shot ${i + 1}.</span>${block.trim()}`;
        listEl.appendChild(div);
      });
    } else {
      shots.forEach((shot, i) => {
        const div = document.createElement("div");
        div.className = "idea-item";
        div.innerHTML = `<span class="idea-number">Shot ${i + 1}.</span>${shot.trim()}`;
        listEl.appendChild(div);
      });
    }

    document.getElementById("videoLoader").classList.add("hidden");
    document.getElementById("videoOutput").classList.remove("hidden");
  } catch (e) {
    document.getElementById("videoLoader").classList.add("hidden");
    alert("Something went wrong. Check your API key.");
  }
});

/* ── COPY STORYBOARD ── */
document.getElementById("copyVideo").addEventListener("click", () => {
  const items = document.querySelectorAll("#videoList .idea-item");
  const text = Array.from(items)
    .map((el, i) => `Shot ${i + 1}: ${el.textContent.replace(/^Shot \d+\./, "").trim()}`)
    .join("\n\n");
  navigator.clipboard.writeText(text);
  document.getElementById("copyVideo").textContent = "Copied!";
  setTimeout(() => {
    document.getElementById("copyVideo").textContent = "Copy all";
  }, 2000);
});
