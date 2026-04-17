/* ── Helper: call our secure serverless API ── */
async function callGemini(prompt) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "API error");
  }
  const data = await res.json();
  return data.text;
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
      if (count >= 10) return;
      const clean = line.replace(/^\d+\.\s*/, "").trim();
      if (clean) {
        const li = document.createElement("li");
        li.textContent = clean;
        listEl.appendChild(li);
        count++;
      }
    });
    document.getElementById("ideasLoader").classList.add("hidden");
    document.getElementById("ideasOutput").classList.remove("hidden");
  } catch (err) {
    document.getElementById("ideasLoader").classList.add("hidden");
    alert("Error: " + err.message);
  }
});

document.getElementById("copyIdeas").addEventListener("click", () => {
  const items = document.querySelectorAll("#ideasList li");
  const text = Array.from(items).map((li, i) => `${i + 1}. ${li.textContent}`).join("\n");
  navigator.clipboard.writeText(text).then(() => alert("Copied!"));
});

/* ── AI IMAGE GENERATOR (Pollinations - free, no key needed) ── */
document.getElementById("generateImage").addEventListener("click", async () => {
  const prompt = document.getElementById("imagePrompt").value.trim();
  if (!prompt) {
    alert("Please enter an image description first.");
    return;
  }

  document.getElementById("imageOutput").classList.add("hidden");
  document.getElementById("imageLoader").classList.remove("hidden");

  const encodedPrompt = encodeURIComponent(prompt);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&nologo=true&enhance=true`;

  const img = document.getElementById("generatedImage");
  img.onload = () => {
    document.getElementById("imageLoader").classList.add("hidden");
    document.getElementById("imageOutput").classList.remove("hidden");
  };
  img.onerror = () => {
    document.getElementById("imageLoader").classList.add("hidden");
    alert("Image generation failed. Please try again.");
  };
  img.src = imageUrl;
});

/* ── STORYBOARD GENERATOR ── */
document.getElementById("generateStoryboard").addEventListener("click", async () => {
  const concept = document.getElementById("videoPrompt").value.trim();
  const videoType = document.getElementById("videoType").value;

  if (!concept) {
    alert("Please enter a video concept first.");
    return;
  }

  document.getElementById("videoOutput").classList.add("hidden");
  document.getElementById("videoLoader").classList.remove("hidden");

  const prompt = `You are a professional video director creating a storyboard for ${videoType}.
Concept: "${concept}"
Create a shot-by-shot storyboard with exactly 6 shots.
For each shot write:
Shot [number]: [Visual description] | [Voiceover/text on screen] | [Duration in seconds]
Return only the 6 shots, no intro, no explanation.`;

  try {
    const text = await callGemini(prompt);
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    const listEl = document.getElementById("storyboardList");
    listEl.innerHTML = "";
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line.trim();
      listEl.appendChild(li);
    });
    document.getElementById("videoLoader").classList.add("hidden");
    document.getElementById("videoOutput").classList.remove("hidden");
  } catch (err) {
    document.getElementById("videoLoader").classList.add("hidden");
    alert("Error: " + err.message);
  }
});

document.getElementById("copyStoryboard").addEventListener("click", () => {
  const items = document.querySelectorAll("#storyboardList li");
  const text = Array.from(items).map(li => li.textContent).join("\n");
  navigator.clipboard.writeText(text).then(() => alert("Copied!"));
});
