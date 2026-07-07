/* ──────────────────────────────────────────────
   BigQuery Release Notes – client JS
   ────────────────────────────────────────────── */

const $content     = document.getElementById("content");
const $refreshBtn  = document.getElementById("refresh-btn");
const $exportBtn   = document.getElementById("export-btn");
const $themeToggle = document.getElementById("theme-toggle");
const $toast       = document.getElementById("toast");

let currentNotes = [];

// ── Bootstrap ──────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  fetchNotes();
  $refreshBtn.addEventListener("click", fetchNotes);
  $exportBtn.addEventListener("click", exportToCSV);
  $themeToggle.addEventListener("click", toggleTheme);
});

// ── Fetch notes ────────────────────────────────
async function fetchNotes() {
  $refreshBtn.classList.add("loading");
  $refreshBtn.disabled = true;
  $exportBtn.disabled = true;

  // show skeleton
  $content.innerHTML = buildSkeleton();

  try {
    const res  = await fetch("/api/notes");
    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "Unknown error");

    currentNotes = data.notes;
    renderNotes(data.notes);
    showToast(`Loaded ${data.notes.length} release notes`);
    $exportBtn.disabled = false;
  } catch (err) {
    currentNotes = [];
    $content.innerHTML = `
      <div class="error-state">
        <h2>😵 Failed to load notes</h2>
        <p>${escapeHtml(err.message)}</p>
      </div>`;
  } finally {
    $refreshBtn.classList.remove("loading");
    $refreshBtn.disabled = false;
  }
}

// ── Render ─────────────────────────────────────
function renderNotes(notes) {
  if (!notes.length) {
    $content.innerHTML = `<div class="error-state"><h2>No release notes found</h2></div>`;
    return;
  }

  $content.innerHTML = notes.map((n, i) => {
    const tags   = extractTags(n.content);
    const body   = n.content;
    const delay  = Math.min(i * 0.04, 0.6);

    return `
    <article class="note-card" style="--i:${delay}s" id="note-${i}">
      <div class="note-header">
        <span class="note-date">${escapeHtml(n.title)}</span>
        <div class="note-tags">${tags.map(t => `<span class="tag tag-${t.cls}">${t.label}</span>`).join("")}</div>
      </div>
      <div class="note-body">${body}</div>
      <div class="note-footer">
        <a class="note-link" href="${escapeAttr(n.link)}" target="_blank" rel="noopener">
          Read on Google Cloud
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
        <div class="note-actions">
          <button class="btn-copy" onclick="copyNote(${i})" title="Copy to clipboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
          <button class="btn-tweet" onclick="tweetNote(${i})" title="Post on X (Twitter)">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Post on X
          </button>
        </div>
      </div>
    </article>`;
  }).join("");
}

// ── Tweet handler ──────────────────────────────
function tweetNote(index) {
  const card   = document.getElementById(`note-${index}`);
  const title  = card.querySelector(".note-date").textContent;
  // Build a clean plain-text summary from the card body
  const body   = card.querySelector(".note-body");
  const plain  = body.innerText.replace(/\s+/g, " ").trim();
  const link   = card.querySelector(".note-link").href;

  // Compose tweet text (280-char safe)
  const prefix = `📢 BigQuery Release Note — ${title}\n\n`;
  const maxBody = 280 - prefix.length - link.length - 5;   // 5 for newlines/spaces
  const snippet = plain.length > maxBody ? plain.slice(0, maxBody - 1) + "…" : plain;
  const text    = `${prefix}${snippet}\n\n${link}`;

  const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "width=600,height=420,noopener");
}

// ── Helpers ────────────────────────────────────
function extractTags(html) {
  const tags = [];
  const seen = new Set();
  const regex = /<h3>(.*?)<\/h3>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const raw = m[1].trim().toLowerCase();
    if (seen.has(raw)) continue;
    seen.add(raw);
    let cls = "default";
    if (raw === "feature")     cls = "feature";
    else if (raw === "change") cls = "change";
    else if (raw === "fix" || raw === "fixed") cls = "fix";
    tags.push({ label: m[1].trim(), cls });
  }
  return tags;
}

function buildSkeleton() {
  return `<div class="skeleton-container">${
    [0,1,2,3].map(i => `<div class="skeleton-card" style="--delay:${i*0.1}s"></div>`).join("")
  }</div>`;
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function showToast(msg) {
  $toast.textContent = msg;
  $toast.classList.add("show");
  setTimeout(() => $toast.classList.remove("show"), 2500);
}

// ── Copy note ──────────────────────────────────
function copyNote(index) {
  const card = document.getElementById(`note-${index}`);
  const title = card.querySelector(".note-date").textContent;
  const body = card.querySelector(".note-body");
  const plainText = body.innerText.trim();
  const link = card.querySelector(".note-link").href;

  const fullText = `📢 BigQuery Release Note — ${title}\n\n${plainText}\n\nRead more: ${link}`;

  navigator.clipboard.writeText(fullText)
    .then(() => showToast("Copied to clipboard!"))
    .catch(err => {
      console.error("Failed to copy note: ", err);
      showToast("Failed to copy note");
    });
}

// ── Export CSV ─────────────────────────────────
function exportToCSV() {
  if (!currentNotes || !currentNotes.length) return;

  const headers = ["Title", "Updated", "Link", "Content"];
  const rows = currentNotes.map(n => {
    return [
      n.title,
      n.updated,
      n.link,
      cleanHtml(n.content)
    ].map(val => `"${val.replace(/"/g, '""')}"`).join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "bigquery_release_notes.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function cleanHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.innerText || tmp.textContent || "";
}

// ── Theme management ───────────────────────────
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeToggleUI(savedTheme);
}

// Global scope toggleTheme for index.html access or element listeners
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeToggleUI(newTheme);
  showToast(`Switched to ${newTheme} mode`);
}

function updateThemeToggleUI(theme) {
  if (!$themeToggle) return;
  const sunIcon = $themeToggle.querySelector(".sun-icon");
  const moonIcon = $themeToggle.querySelector(".moon-icon");
  if (theme === "light") {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  }
}
