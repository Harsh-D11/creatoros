const GROQ_KEY = "YOUR_GROQ_API_KEY";
const UNSPLASH_KEY = "YOUR_UNSPLASH_ACCESS_KEY";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function getOrCreateStatus() {
  let el = document.getElementById("statusMsg");
  if (!el) {
    el = document.createElement("div");
    el.id = "statusMsg";
    el.style.cssText =
      "display:none;color:#f5f7fb;padding:12px 16px;background:#2a1215;border:1px solid #5b232a;border-radius:10px;margin:16px auto;max-width:1100px;font-weight:500;";
    const main = document.querySelector("main");
    if (main) main.prepend(el);
    else document.body.prepend(el);
  }
  return el;
}

function showStatus(msg) {
  const el = getOrCreateStatus();
  el.textContent = msg;
  el.style.display = msg ? "block" : "none";
}

async function groqChat(prompt) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful creator assistant. Keep answers practical, concise, and structured."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "No response received.";
}

async function fetchUnsplashImage(query) {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${UNSPLASH_KEY}`
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Unsplash API error: ${errText}`);
  }

  const data = await res.json();

  if (!data.results || !data.results.length) {
    throw new Error("No visual reference found.");
  }

  return data.results[0];
}

function makeBulletList(text) {
  return text
    .split("\n")
    .map(line => line.replace(/^[-*0-9.)\s]+/, "").trim())
    .filter(Boolean);
}

document.addEventListener("DOMContentLoaded", function () {
  const generateIdeasBtn = document.getElementById("generateIdeas");
  const generateImageBtn = document.getElementById("generateImage");
  const generateStoryboardBtn = document.getElementById("generateStoryboard");

  if (!generateIdeasBtn || !generateImageBtn || !generateStoryboardBtn) {
    showStatus("JS loaded but one or more buttons were not found.");
    return;
  }

  const nicheInput = document.getElementById("nicheInput");
  const modeSelect = document.getElementById("modeSelect");
  const platformSelect = document.getElementById("platformSelect");

  const imagePrompt = document.getElementById("imagePrompt");

  const videoPrompt = document.getElementById("videoPrompt");
  const videoType = document.getElementById("videoType");

  const ideasLoader = document.getElementById("ideasLoader");
  const ideasOutput = document.getElementById("ideasOutput");
  const ideasList = document.getElementById("ideasList");

  const imageLoader = document.getElementById("imageLoader");
  const imageOutput = document.getElementById("imageOutput");

  const videoLoader = document.getElementById("videoLoader");
  const videoOutput = document.getElementById("videoOutput");
  const storyboardList = document.getElementById("storyboardList");

  generateIdeasBtn.addEventListener("click", async function () {
    const niche = nicheInput.value.trim();
    const mode = modeSelect.value;
    const platform = platformSelect.value;

    if (!niche) {
      showStatus("Please enter a niche first.");
      return;
    }

    showStatus("");
    ideasOutput.classList.add("hidden");
    ideasLoader.classList.remove("hidden");
    ideasList.innerHTML = "";
    generateIdeasBtn.disabled = true;

    const prompt = `Generate exactly 10 creative content ideas for a ${mode} in the ${niche} niche for ${platform}. Return only a numbered list from 1 to 10. Each idea should be a strong title plus a one-line hook.`;

    try {
      const text = await groqChat(prompt);
      const items = makeBulletList(text).slice(0, 10);

      items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ideasList.appendChild(li);
      });

      ideasLoader.classList.add("hidden");
      ideasOutput.classList.remove("hidden");
    } catch (err) {
      ideasLoader.classList.add("hidden");
      showStatus("Error: " + err.message);
    } finally {
      generateIdeasBtn.disabled = false;
    }
  });

  const copyIdeas = document.getElementById("copyIdeas");
  if (copyIdeas) {
    copyIdeas.addEventListener("click", function () {
      const items = document.querySelectorAll("#ideasList li");
      const text = Array.from(items)
        .map((li, i) => `${i + 1}. ${li.textContent}`)
        .join("\n");

      navigator.clipboard.writeText(text).then(function () {
        showStatus("Ideas copied to clipboard.");
      });
    });
  }

  generateImageBtn.addEventListener("click", async function () {
    const prompt = imagePrompt.value.trim();

    if (!prompt) {
      showStatus("Please enter a visual description.");
      return;
    }

    showStatus("");
    imageOutput.classList.add("hidden");
    imageLoader.classList.remove("hidden");
    imageOutput.innerHTML = "";
    generateImageBtn.disabled = true;

    try {
      const photo = await fetchUnsplashImage(prompt);

      imageOutput.innerHTML = `
        <div class="output-head">
          <span>Reference Image</span>
          <a class="copy-btn" href="${photo.links.html}?utm_source=creatoros&utm_medium=referral" target="_blank" rel="noopener noreferrer">View Source</a>
        </div>
        <img src="${photo.urls.regular}" alt="${photo.alt_description || prompt}">
        <div style="padding:14px 16px;color:#8b949e;font-size:14px;">
          Photo by
          <a href="${photo.user.links.html}?utm_source=creatoros&utm_medium=referral" target="_blank" rel="noopener noreferrer">${photo.user.name}</a>
          on Unsplash
        </div>
      `;

      imageLoader.classList.add("hidden");
      imageOutput.classList.remove("hidden");
    } catch (err) {
      imageLoader.classList.add("hidden");
      showStatus("Error: " + err.message);
    } finally {
      generateImageBtn.disabled = false;
    }
  });

  generateStoryboardBtn.addEventListener("click", async function () {
    const concept = videoPrompt.value.trim();
    const type = videoType.value;

    if (!concept) {
      showStatus("Please enter a video concept.");
      return;
    }

    showStatus("");
    videoOutput.classList.add("hidden");
    videoLoader.classList.remove("hidden");
    storyboardList.innerHTML = "";
    generateStoryboardBtn.disabled = true;

    const prompt = `Create a shot-by-shot storyboard for a ${type} about: ${concept}. Write exactly 6 shots. Format each as: Shot N: [visual] | [voiceover] | [duration in seconds]. Return only the 6 shots.`;

    try {
      const text = await groqChat(prompt);
      const lines = text.split("\n").filter(line => line.trim().length > 0);

      lines.forEach(line => {
        const li = document.createElement("li");
        li.textContent = line.trim();
        storyboardList.appendChild(li);
      });

      videoLoader.classList.add("hidden");
      videoOutput.classList.remove("hidden");
    } catch (err) {
      videoLoader.classList.add("hidden");
      showStatus("Error: " + err.message);
    } finally {
      generateStoryboardBtn.disabled = false;
    }
  });

  const copyStoryboard = document.getElementById("copyStoryboard");
  if (copyStoryboard) {
    copyStoryboard.addEventListener("click", function () {
      const items = document.querySelectorAll("#storyboardList li");
      const text = Array.from(items)
        .map(li => li.textContent)
        .join("\n");

      navigator.clipboard.writeText(text).then(function () {
        showStatus("Storyboard copied to clipboard.");
      });
    });
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  function attachMic(buttonId, inputId) {
    const btn = document.getElementById(buttonId);
    const input = document.getElementById(inputId);

    if (!btn || !input || !SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    btn.addEventListener("click", function () {
      recognition.start();
      btn.textContent = "Listening...";
    });

    recognition.addEventListener("result", function (e) {
      input.value = e.results[0][0].transcript;
      btn.textContent = "🎤";
    });

    recognition.addEventListener("end", function () {
      btn.textContent = "🎤";
    });

    recognition.addEventListener("error", function () {
      btn.textContent = "🎤";
    });
  }

  attachMic("ideaMicBtn", "nicheInput");
  attachMic("imageMicBtn", "imagePrompt");
  attachMic("storyMicBtn", "videoPrompt");
});