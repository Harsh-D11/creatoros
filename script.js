const themeToggle = document.getElementById("themeToggle");
let dark = false;

themeToggle.addEventListener("click", () => {
  dark = !dark;

  if (dark) {
    document.documentElement.style.setProperty("--bg", "#131312");
    document.documentElement.style.setProperty("--surface", "#1c1c1a");
    document.documentElement.style.setProperty("--surface-2", "#252521");
    document.documentElement.style.setProperty("--text", "#f2efe9");
    document.documentElement.style.setProperty("--muted", "#b8b0a5");
    document.documentElement.style.setProperty("--border", "#35342f");
    document.documentElement.style.setProperty("--primary-soft", "#1e3335");
    themeToggle.textContent = "☀️";
  } else {
    document.documentElement.style.setProperty("--bg", "#f7f6f2");
    document.documentElement.style.setProperty("--surface", "#ffffff");
    document.documentElement.style.setProperty("--surface-2", "#f1eee8");
    document.documentElement.style.setProperty("--text", "#23211d");
    document.documentElement.style.setProperty("--muted", "#6a655d");
    document.documentElement.style.setProperty("--border", "#ddd7cf");
    document.documentElement.style.setProperty("--primary-soft", "#d9ecea");
    themeToggle.textContent = "🌙";
  }
});