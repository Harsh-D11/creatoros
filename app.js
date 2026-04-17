// Helper: call /api/generate
async function callGemini(prompt) {
  var res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt })
  });
  if (!res.ok) {
    var err = await res.json();
    throw new Error(err.error || 'API error');
  }
  var data = await res.json();
  return data.text;
}

// IDEA GENERATOR
document.getElementById('generateIdeas').addEventListener('click', async function() {
  var niche = document.getElementById('nicheInput').value.trim();
  var mode = document.getElementById('modeSelect').value;
  var platform = document.getElementById('platformSelect').value;

  if (!niche) {
    alert('Please enter a niche first.');
    return;
  }

  document.getElementById('ideasOutput').classList.add('hidden');
  document.getElementById('ideasLoader').classList.remove('hidden');

  var prompt = 'You are a content strategist for ' + platform + '. Generate exactly 10 creative content ideas for a ' + mode + ' in the ' + niche + ' niche. Return a numbered list 1 to 10. Each idea is a clear video title with a one-line hook. No intro, just the 10 numbered ideas.';

  try {
    var text = await callGemini(prompt);
    var lines = text.split('\n').filter(function(l) { return l.trim().length > 0; });
    var listEl = document.getElementById('ideasList');
    listEl.innerHTML = '';
    var count = 0;
    lines.forEach(function(line) {
      if (count >= 10) return;
      var clean = line.replace(/^\d+\.\s*/, '').trim();
      if (clean) {
        var li = document.createElement('li');
        li.textContent = clean;
        listEl.appendChild(li);
        count++;
      }
    });
    document.getElementById('ideasLoader').classList.add('hidden');
    document.getElementById('ideasOutput').classList.remove('hidden');
  } catch (err) {
    document.getElementById('ideasLoader').classList.add('hidden');
    alert('Error: ' + err.message);
  }
});

document.getElementById('copyIdeas').addEventListener('click', function() {
  var items = document.querySelectorAll('#ideasList li');
  var text = Array.from(items).map(function(li, i) { return (i+1) + '. ' + li.textContent; }).join('\n');
  navigator.clipboard.writeText(text).then(function() { alert('Copied!'); });
});

// AI IMAGE GENERATOR
document.getElementById('generateImage').addEventListener('click', function() {
  var prompt = document.getElementById('imagePrompt').value.trim();
  if (!prompt) {
    alert('Please enter an image description first.');
    return;
  }

  document.getElementById('imageOutput').classList.add('hidden');
  document.getElementById('imageLoader').classList.remove('hidden');

  var encodedPrompt = encodeURIComponent(prompt);
  var imageUrl = 'https://image.pollinations.ai/prompt/' + encodedPrompt + '?width=1024&height=576&nologo=true&enhance=true';

  var img = document.getElementById('generatedImage');
  img.onload = function() {
    document.getElementById('imageLoader').classList.add('hidden');
    document.getElementById('imageOutput').classList.remove('hidden');
  };
  img.onerror = function() {
    document.getElementById('imageLoader').classList.add('hidden');
    alert('Image generation failed. Please try again.');
  };
  img.src = imageUrl;
});

// STORYBOARD GENERATOR
document.getElementById('generateStoryboard').addEventListener('click', async function() {
  var concept = document.getElementById('videoPrompt').value.trim();
  var videoType = document.getElementById('videoType').value;

  if (!concept) {
    alert('Please enter a video concept first.');
    return;
  }

  document.getElementById('videoOutput').classList.add('hidden');
  document.getElementById('videoLoader').classList.remove('hidden');

  var prompt = 'You are a video director. Create a shot-by-shot storyboard for a ' + videoType + ' about: ' + concept + '. Write exactly 6 shots. Format each shot as: Shot N: [visual] | [voiceover] | [duration]. Return only the 6 shots.';

  try {
    var text = await callGemini(prompt);
    var lines = text.split('\n').filter(function(l) { return l.trim().length > 0; });
    var listEl = document.getElementById('storyboardList');
    listEl.innerHTML = '';
    lines.forEach(function(line) {
      var li = document.createElement('li');
      li.textContent = line.trim();
      listEl.appendChild(li);
    });
    document.getElementById('videoLoader').classList.add('hidden');
    document.getElementById('videoOutput').classList.remove('hidden');
  } catch (err) {
    document.getElementById('videoLoader').classList.add('hidden');
    alert('Error: ' + err.message);
  }
});

document.getElementById('copyStoryboard').addEventListener('click', function() {
  var items = document.querySelectorAll('#storyboardList li');
  var text = Array.from(items).map(function(li) { return li.textContent; }).join('\n');
  navigator.clipboard.writeText(text).then(function() { alert('Copied!'); });
});
