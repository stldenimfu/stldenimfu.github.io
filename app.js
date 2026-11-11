/* STL Fabric Directory - standalone client. Data lives in Google Sheets via the Apps Script web app in config.js. */
/* ---------- denim textures: 3/1 right-hand twill drawn on the phone, set as CSS variables ---------- */
(function makeDenim() {
  const N = 192, s = 4, ends = N / s;                       // 48 ends x 48 picks per tile, shown at 80px
  function tile(o) {
    const c = document.createElement("canvas"); c.width = c.height = N;
    const g = c.getContext("2d"); let seed = o.seed;
    const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
    const endL = Array.from({ length: ends }, () => o.l[0] + rnd() * (o.l[1] - o.l[0]));   // ring-dyed ends vary end to end
    for (let p = 0; p < ends; p++) {                                                    // weft picks (ecru, mostly hidden)
      g.fillStyle = o.weft; g.globalAlpha = .75 + rnd() * .25; g.fillRect(0, p * s, N, s);
    }
    g.globalAlpha = 1;
    for (let e = 0; e < ends; e++) {
      for (let p = 0; p < ends; p++) {
        if ((e + p) % 4 !== 0) continue;                                                // 3/1: warp floats over 3 picks
        const L = endL[e] + (rnd() - .5) * o.j + (rnd() < o.slubs ? o.slubL : 0);
        const x = e * s, y = p * s + s * .55;
        const gr = g.createLinearGradient(x, 0, x + s, 0);
        gr.addColorStop(0, `hsl(${o.h},${o.sat}%,${L - o.round}%)`);
        gr.addColorStop(.5, `hsl(${o.h},${o.sat}%,${L + o.round * .5}%)`);
        gr.addColorStop(1, `hsl(${o.h},${o.sat}%,${L - o.round}%)`);
        g.fillStyle = gr;
        for (const dy of [0, N]) g.fillRect(x + .2, y - dy, s - .4, 3 * s + s * .45);    // float covers most of the 4th pick
      }
    }
    for (let k = 0; k < 7; k++) {                                                       // soft mottling, wrapped so the tile repeats cleanly
      const cx = rnd() * N, cy = rnd() * N, r = 40 + rnd() * 70, light = rnd() < .5;
      for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) {
        const rg = g.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r);
        rg.addColorStop(0, light ? `rgba(255,255,255,${o.mottle})` : `rgba(0,0,0,${o.mottle})`); rg.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = rg; g.fillRect(cx + ox - r, cy + oy - r, 2 * r, 2 * r);
      }
    }
    const im = g.getImageData(0, 0, N, N), d = im.data;                                 // fine fibre noise
    for (let i = 0; i < d.length; i += 4) { const n = (rnd() - .5) * o.noise; d[i] += n; d[i + 1] += n; d[i + 2] += n }
    g.putImageData(im, 0, 0);
    return `url(${c.toDataURL("image/png")})`;
  }
  const base = { h: 222, j: 3, slubs: .05, noise: 12, round: 4, mottle: .035 };
  const T = {
    raw:   tile({ ...base, seed: 11, sat: 55, l: [18, 27], slubL: 8,  weft: "#7d8597" }),
    wash:  tile({ ...base, seed: 23, sat: 38, l: [46, 60], slubL: 12, weft: "#c9ced8", round: 5 }),
    black: tile({ ...base, seed: 31, h: 225, sat: 8, l: [13, 20], slubL: 8, weft: "#5e5e60" }),
    grey:  tile({ ...base, seed: 37, h: 220, sat: 7, l: [43, 54], slubL: 10, weft: "#a9a8a6" }),
    ecru:  tile({ ...base, seed: 41, h: 42, sat: 20, l: [80, 87], slubL: 5, weft: "#ece6d8", round: 3, noise: 9 }),
    pale:  tile({ ...base, seed: 53, h: 218, sat: 26, l: [88, 91.5], slubL: 2, weft: "#e9edf3", round: 1.2, noise: 5, mottle: 0 }),
    deep:  tile({ ...base, seed: 61, h: 224, sat: 42, l: [8, 11], slubL: 3, weft: "#1a2238", round: 1.2, noise: 5, mottle: 0 })
  };
  const r = document.documentElement.style;
  Object.entries(T).forEach(([k, v]) => r.setProperty("--tw-" + k, v));
})();
/* ---------- machine illustrations (line drawings; colours come from CSS: ink, yarn, liquor) ---------- */
const MACH = (() => {
  const svg = (inner, label) => `<svg class="mach" viewBox="0 0 160 90" role="img" aria-label="${label}">${inner}</svg>`;
  // Development: 3/1 twill drawn on point paper, pick glass, yarn cone
  let grid = "";
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) if ((c + r) % 4 !== 0) grid += `<rect x="${10 + c * 8}" y="${16 + r * 8}" width="8" height="8"/>`;
  let lines = "";
  for (let i = 0; i <= 7; i++) lines += `<path d="M${10 + i * 8} 16V72M10 ${16 + i * 8}H66"/>`;
  const development = svg(`
    <g class="fill">${grid}</g><g class="ln thin">${lines}</g>
    <g class="ln"><path d="M4 80H156"/>
      <rect x="84" y="64" width="36" height="8" rx="1.5"/><path d="M89 42 86 64M115 42 118 64"/>
      <rect x="87" y="20" width="30" height="22" rx="3"/></g>
    <circle class="liq" cx="102" cy="31" r="8"/><circle class="ln" cx="102" cy="31" r="8"/>
    <g class="ln"><path d="M134 24h12l8 48h-28z"/><rect x="137" y="15" width="6" height="9" rx="1"/></g>
    <g class="yarn thin"><path d="M131 40l18-6M129 52l22-6M127 64l25-6"/><path d="M140 15C136 4 112 4 104 12"/></g>`, "Development: weave draft, pick glass and yarn cone");
  // Dyeing: slasher indigo range
  const dyeing = svg(`
    <path class="liq" d="M31 55q6-3 12 0t12 0V71H31zM65 55q6-3 12 0t12 0V71H65z"/>
    <g class="ln"><path d="M4 80H156"/><rect x="30" y="46" width="26" height="26" rx="1.5"/><rect x="64" y="46" width="26" height="26" rx="1.5"/>
      <path d="M33 72v8M53 72v8M67 72v8M87 72v8"/>
      <circle cx="14" cy="60" r="10"/><circle cx="14" cy="60" r="3.5"/>
      <circle cx="104" cy="30" r="7"/><circle cx="116" cy="54" r="7"/><circle cx="128" cy="30" r="7"/><path d="M104 37v43M116 61v19M128 37v43"/>
      <circle cx="145" cy="64" r="10"/><circle cx="145" cy="64" r="3.5"/></g>
    <path class="yarn" d="M14 50L32 37 43 69 54 37 62 14 66 37 77 69 88 37 96 14 104 23 117 61 128 23 137 28 145 54"/>
    <g class="ln roll"><circle cx="32" cy="40" r="3"/><circle cx="54" cy="40" r="3"/><circle cx="43" cy="66" r="3"/><circle cx="66" cy="40" r="3"/><circle cx="88" cy="40" r="3"/><circle cx="77" cy="66" r="3"/><circle cx="62" cy="14" r="2.5"/><circle cx="96" cy="14" r="2.5"/></g>`, "Dyeing: slasher range with indigo boxes and drying cans");
  // Weaving: loom side view, shed opened by two heald frames
  const weaving = svg(`
    <g class="ln"><path d="M4 80H156M12 80l8-28M140 80l-6-28"/>
      <circle cx="24" cy="62" r="12"/><circle cx="24" cy="62" r="4"/><circle cx="32" cy="28" r="4"/>
      <rect x="66" y="6" width="6" height="44" rx="1"/><rect x="77" y="12" width="6" height="44" rx="1"/>
      <path d="M100 14v32M104 14v32M100 14h4M100 46h4M102 46l-6 30"/>
      <circle cx="128" cy="30" r="4"/><circle cx="132" cy="64" r="12"/><circle cx="132" cy="64" r="4"/></g>
    <g class="yarn"><path d="M24 50 32 24M34 28 69 18 102 30M34 28 80 40 102 30M102 30H112"/></g>
    <path class="yarn cloth" d="M112 30H124M128 34 V52"/>
    <g class="fill"><circle cx="90" cy="29" r="1.6"/><circle cx="85" cy="29" r="1.1"/><circle cx="94.5" cy="29" r="1.1"/></g>`, "Weaving: loom with warp beam, heald frames, reed and cloth roll");
  // Finishing: sanforizer — steam, rubber belt under heated cylinder, palmer drum with felt, batch roll
  const finishing = svg(`
    <g class="ln"><path d="M4 80H156"/><circle cx="8" cy="26" r="3.5"/>
      <rect class="belt" x="38" y="44" width="50" height="26" rx="13"/>
      <circle cx="63" cy="33" r="11"/><path class="thin" d="M59 30q2-3 0-6M63 32q2-3 0-6M67 30q2-3 0-6"/>
      <circle cx="116" cy="40" r="18"/><circle cx="116" cy="40" r="4"/><path class="felt" d="M93 40a23 23 0 0 0 46 0"/>
      <circle cx="148" cy="70" r="8"/><circle cx="148" cy="70" r="2.5"/></g>
    <g class="steam"><path d="M20 20q2-3 0-6t0-6M26 20q2-3 0-6t0-6M32 20q2-3 0-6t0-6"/></g>
    <path class="yarn" d="M8 22.5H36L50 43Q63 49 76 43L95 40A21 21 0 0 0 137 40L146 62"/>`, "Finishing: sanforizer with rubber belt, heated cylinder and palmer drum");
  return { development, dyeing, weaving, finishing };
})();
/* small process icons for finishing steps */
const PICON = (() => {
  const s = (inner) => `<svg class="mach picon" viewBox="0 0 40 28" aria-hidden="true">${inner}</svg>`;
  const wash = s(`<path class="liq" d="M7 17q3-2 6 0t6 0 6 0 6 0 2 0V25H7z"/><g class="ln"><rect x="6" y="12" width="28" height="13" rx="1"/></g><path class="yarn" d="M1 7H10L20 23 30 7H39"/><g class="ln roll"><circle cx="10" cy="8" r="2"/><circle cx="30" cy="8" r="2"/><circle cx="20" cy="21" r="2"/></g>`);
  const stenter = s(`<g class="steam"><path d="M10 7q1.5-2 0-4M20 7q1.5-2 0-4M30 7q1.5-2 0-4"/></g><g class="ln"><rect x="3" y="10" width="34" height="12" rx="1.5"/></g><path class="yarn" d="M0 16H40"/><g class="fill"><circle cx="8" cy="12.5" r="1"/><circle cx="14" cy="12.5" r="1"/><circle cx="20" cy="12.5" r="1"/><circle cx="26" cy="12.5" r="1"/><circle cx="32" cy="12.5" r="1"/><circle cx="8" cy="19.5" r="1"/><circle cx="14" cy="19.5" r="1"/><circle cx="20" cy="19.5" r="1"/><circle cx="26" cy="19.5" r="1"/><circle cx="32" cy="19.5" r="1"/></g>`);
  const sanfor = s(`<g class="ln"><rect class="belt" x="4" y="15" width="20" height="10" rx="5"/><circle cx="14" cy="10" r="5"/><circle cx="31" cy="13" r="7"/></g><path class="yarn" d="M0 8H6L10 15H18L24 13A7 7 0 0 0 38 13"/>`);
  const singe = s(`<path class="yarn" d="M0 8H40"/><path class="flame" d="M20 11c4 4 5 7 3 10-1 2-5 2-6 0-2-3 0-5 1-6 0 2 1 3 2 3 1-2 0-4 0-7z"/><g class="ln"><rect x="11" y="22" width="18" height="4" rx="1"/></g>`);
  const print = s(`<g class="ln"><circle cx="16" cy="11" r="8"/></g><g class="fill"><circle cx="13" cy="9" r="1"/><circle cx="18" cy="8" r="1"/><circle cx="16" cy="13" r="1"/><circle cx="20" cy="12" r="1"/><circle cx="12" cy="13" r="1"/><circle cx="28" cy="22" r="1.2"/><circle cx="33" cy="21" r="1.2"/><circle cx="37" cy="23" r="1.2"/></g><path class="yarn" d="M0 20H40"/>`);
  const map = { "Stenter": stenter, "Heatset": stenter, "STF": stenter, "Sanforizing": sanfor, "Singeing": singe, "Print": print };
  return p => map[p] || wash;
})();

/* which denim a fabric looks like, from its shade and finishing route */
function toneOf(f) {
  const t = [f.dyeing?.shade, f.dyeing?.sulphur, ...(f.finishing?.processes || []).map(s => [s.process, s.odShade].join(" "))].join(" ").toLowerCase();
  if (/black|sulph?ur blk|\bblk\b/.test(t)) return "black";
  if (/grey|gray|\bash\b/.test(t)) return "grey";
  if (/ecru|greige|natural|white|\brfd\b/.test(t) && !/indigo/.test(t)) return "ecru";
  if (/light|bleach|stone|sky|mid/.test(t)) return "wash";
  return "raw";
}
const POCKET = `<svg class="pocket" viewBox="0 0 120 130" aria-hidden="true"><path d="M10 6h100v80L60 122 10 86z" fill="rgba(0,0,0,.18)"/><g fill="none" stroke="var(--thread)" stroke-width="2.2" stroke-dasharray="6 3.5" stroke-linecap="round"><path d="M15 11h90v73L60 116 15 84z"/><path d="M21 17h78v64L60 109 21 81z" opacity=".75"/><path d="M26 46q34-24 68 0"/><path d="M26 56q34-24 68 0" opacity=".75"/></g></svg>`;
const SWATCH = `<div class="swatch-ill tone-raw" aria-hidden="true"><span class="selv-edge"></span></div>`;
const shortComp = c => String(c || "").replace(/cotton/i, "Co").replace(/elastane|spandex|lycra/i, "El").replace(/polyester/i, "PES").replace(/\s+/g, " ").trim();

const CFG = window.DENIM_CONFIG || {};
const API = CFG.API_URL || "";
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const filled = v => v !== undefined && v !== null && String(v).trim() !== "";
const norm = c => String(c || "").trim().toUpperCase();
const imgUrl = id => "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w1600";
const store = { get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }, set(k, v) { try { localStorage.setItem(k, v) } catch (e) { } } };

let S = null;            // schema from the server
const all = new Map();   // code -> fabric
let waitFor = null;
let currentCode = null, currentImg = 0, dept = "development", steps = [], loaded = false, busy = false;
let teamKey = store.get("dl_key") || "", userName = store.get("dl_name") || "";
let pub = [], pendingCode = null;
let curJob, jobDraft = null, formKey = "", detJob = {};
const jk = v => String(v ?? "").trim().toUpperCase();
const jobsOf = (f, d) => (f && f.jobs && f.jobs[d] && f.jobs[d].length) ? f.jobs[d] : (f && f[d] ? [f[d]] : []);
const shortDate = v => { const m = String(v || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${+m[3]} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m[2] - 1]} ${m[1]}` : String(v || "") };
const jobLabel = j => [j.jobNo ? `Job ${j.jobNo}` : "First entry", j.jobDate ? shortDate(j.jobDate) : ""].filter(Boolean).join(" · ");
const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10) };
const isPublic = () => !teamKey;
const LOCK = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;

/* ---------- schema helpers ---------- */
const DEPT = d => S.depts[d];
const defs = d => DEPT(d).fields.filter(x => Array.isArray(x));
const procFields = p => (S.procOnly && S.procOnly[p]) ? [...S.procOnly[p], ["remarks", "Remarks", "textarea"]] : [...S.procCommon, ...(S.procExtra[p] || []), ["remarks", "Remarks", "textarea"]];
const procName = s => s.process === "Other" && s.otherName ? s.otherName : s.process;
const hasData = (f, d) => !!(f && f[d] && (defs(d).some(([k]) => filled(f[d][k])) || (d === "finishing" && (f[d].processes || []).length)));

/* ---------- UI basics ---------- */
function setStatus(t, err) { const s = $("#status"); s.textContent = t; s.classList.toggle("err", !!err) }
function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2600) }
function show(view) {
  ["login", "search", "detail", "entry"].forEach(v => $("#view-" + v).hidden = v !== view);
  $("#cover").hidden = view !== "search";
  $("#tab-search").setAttribute("aria-selected", view !== "entry");
  $("#tab-entry").setAttribute("aria-selected", view === "entry");
  document.querySelector("nav.tabs").hidden = view === "login";
  window.scrollTo(0, 0);
}
$("#tab-search").onclick = () => { currentCode = null; show("search") };
$("#tab-entry").onclick = () => isPublic() ? showLogin("Sign in with the team key to add or update data.") : openEntry(currentCode, dept);
function updateAuthUI() {
  $("#overview").hidden = isPublic();
  $("#signout").hidden = isPublic();
  $("#tab-entry span").textContent = isPublic() ? "Sign in" : "Add data";
  $("#q").placeholder = isPublic() ? "Search fabric code or colour…" : "Search fabric code, name, buyer…";
}

/* ---------- API ---------- */
async function apiGet(action) {
  const r = await fetch(`${API}?action=${action}&key=${encodeURIComponent(teamKey)}`, { redirect: "follow" });
  const j = await r.json(); if (!j.ok) throw new Error(j.error || "Request failed"); return j;
}
async function apiPost(body) {
  const r = await fetch(API, { method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ ...body, key: teamKey }) });
  const j = await r.json(); if (!j.ok) throw new Error(j.error || "Request failed"); return j;
}
function applyData(j) {
  S = j.schema; all.clear();
  (j.fabrics || []).forEach(f => {
    ["development", "dyeing", "weaving", "finishing"].forEach(d => { if (f[d] && f[d].jobNo == null) f[d].jobNo = ""; (f.jobs?.[d] || []).forEach(x => { if (x.jobNo == null) x.jobNo = "" }) });
    all.set(norm(f.code), { ...f, __id: norm(f.code) });
  });
  $("#codes").innerHTML = [...all.values()].map(f => `<option value="${esc(f.code)}">`).join("");
}
async function load(quiet) {
  if (busy) return; busy = true;
  if (!quiet) setStatus("Loading the directory…");
  try {
    const j = await apiGet("all");
    applyData(j); loaded = true;
    store.set("dl_cache", JSON.stringify({ schema: j.schema, fabrics: j.fabrics, at: Date.now() }));
    setStatus("");
  } catch (e) {
    if (String(e.message) === "wrong_key") { store.set("dl_key", ""); teamKey = ""; busy = false; updateAuthUI(); loadPublic(true); return showLogin("The team key has changed. Sign in again with the new key.") }
    setStatus(loaded ? "Couldn't refresh. Showing the last saved copy; check your internet connection." : "Couldn't reach the directory. Check your internet connection and tap Refresh.", true);
  } finally { busy = false }
  renderList();
  if (currentCode && !$("#view-detail").hidden) renderDetail();
  if (!$("#view-entry").hidden) updateCodeHint();
}
$("#refresh").onclick = () => isPublic() ? loadPublic() : load();
document.addEventListener("visibilitychange", () => { if (document.hidden) return; teamKey ? load(true) : loadPublic(true) });
/* public list: no key needed, the server sends only code, colour and weight */
async function loadPublic(quiet) {
  if (!quiet) setStatus("Loading fabric codes…");
  try {
    const r = await fetch(`${API}?action=public`, { redirect: "follow" });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "Request failed");
    pub = j.fabrics || []; store.set("dl_pub", JSON.stringify(pub)); setStatus("");
  } catch (e) {
    setStatus(String(e.message) === "wrong_key" ? "Update needed: the Google Sheet program (Code.gs) doesn't have the public view yet. Sign in to see the fabric codes."
      : pub.length ? "Couldn't refresh. Showing the last saved list." : "Couldn't reach the directory. Check your internet connection and tap Refresh.", true);
  }
  if (isPublic()) renderList();
}
function renderPublic() {
  const box = $("#results"), q = $("#q").value.trim().toLowerCase();
  const list = pub.filter(f => !q || q.split(/\s+/).every(w => [f.code, f.shade].join(" ").toLowerCase().includes(w)));
  $("#count").innerHTML = `${q ? `${list.length} of ${pub.length} codes match` : `${pub.length} fabric code${pub.length === 1 ? "" : "s"}`} · <button class="linkbtn" id="pub-signin">Sign in</button> for full details`;
  $("#pub-signin").onclick = () => showLogin("Sign in with the team key to see full details and add data.");
  if (!pub.length) { box.innerHTML = `<div class="empty" style="grid-column:1/-1">${SWATCH}<strong>No fabric codes to show</strong>Codes appear here once Development adds them.</div>`; return }
  if (!list.length) { box.innerHTML = `<div class="empty" style="grid-column:1/-1">${SWATCH}<strong>No fabric matches “${esc(q)}”</strong>Search by fabric code or colour.</div>`; return }
  box.innerHTML = list.map(f => `<button class="card" data-code="${esc(norm(f.code))}">
    <div class="swatch tone-${/^(raw|wash|black|grey|ecru)$/.test(f.tone) ? f.tone : "raw"}"><span class="selv-edge"></span></div>
    <div class="card-body"><div class="code">${esc(f.code)}</div>
      <div class="pub"><div><span>Colour</span><b>${filled(f.shade) ? esc(f.shade) : "—"}</b></div><div><span>Weight</span><b>${filled(f.weight) ? `${esc(f.weight)} <small>oz/yd²</small>` : "—"}</b></div></div>
      <div class="lockline">${LOCK}Sign in for the full spec sheet</div></div></button>`).join("");
}

/* ---------- login ---------- */
function showLogin(msg) {
  $("#l-name").value = userName; $("#l-why").textContent = msg || "Ask your admin for the team key. You only enter it once on this phone."; $("#l-msg").textContent = ""; setStatus(""); show("login");
}
$("#l-cancel").onclick = () => { pendingCode = null; show("search"); renderList() };
$("#signout").onclick = () => {
  teamKey = ""; store.set("dl_key", ""); store.set("dl_cache", ""); all.clear(); S = null; loaded = false; waitFor = null; currentCode = null;
  updateAuthUI(); show("search"); renderList(); loadPublic(); toast("Signed out");
};
$("#login").addEventListener("submit", async e => {
  e.preventDefault();
  teamKey = $("#l-key").value.trim(); userName = $("#l-name").value.trim();
  $("#l-msg").textContent = "Checking…";
  try {
    const j = await apiGet("all"); store.set("dl_key", teamKey); store.set("dl_name", userName); applyData(j); loaded = true; setStatus("");
    updateAuthUI(); show("search"); renderList();
    if (pendingCode && all.has(pendingCode)) openDetail(pendingCode);
    pendingCode = null; $("#l-key").value = "";
  } catch (err) { teamKey = ""; $("#l-msg").textContent = String(err.message) === "wrong_key" ? "That team key is not correct." : "Couldn't reach the directory. Check your internet connection." }
});

/* ---------- search ---------- */
function matches(f, q) {
  if (!q) return true;
  const hay = [f.code, f.development?.name, f.development?.buyer, f.dyeing?.shade, f.development?.weave, ...(f.finishing?.processes || []).map(procName), ...Object.values(f.jobs || {}).flat().map(j => j.jobNo)].join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
}
function progHtml(f) {
  const k = S.order.filter(d => hasData(f, d)).length;
  return `<div class="prog"><span class="seg">${S.order.map(d => `<i class="${hasData(f, d) ? "on" : ""}" title="${esc(DEPT(d).label)}${hasData(f, d) ? " done" : " pending"}"></i>`).join("")}</span><span class="prog-t">${k} of ${S.order.length} departments</span></div>`;
}
function chipsHtml(f) { return progHtml(f) }
function finMachineOf(f) { const ps = (f.finishing && f.finishing.processes) || []; for (let i = ps.length - 1; i >= 0; i--) if (ps[i].process === "Sanforizing" && filled(ps[i].machine)) return ps[i].machine; return "" }
const KINDS = ["Finished fabric", "Washed fabric"];
/* latest Finished fabric photo, latest Washed fabric photo, then any older photos */
function photosOf(f) {
  const im = (f && f.images) || [], out = [];
  KINDS.forEach(k => { for (let i = im.length - 1; i >= 0; i--) if (im[i].caption === k) { out.push(im[i]); break } });
  im.forEach(x => { if (!KINDS.includes(x.caption)) out.push(x) });
  return out;
}
function weightOf(f) { const fn = f.finishing || {}, dv = f.development || {}; return filled(fn.finishedWeight) ? fn.finishedWeight : dv.targetWeight }
function statusCls(st) { return /Approved|Bulk/.test(st) ? "ok" : /Dropped|On hold/.test(st) ? "off" : "" }
const CHEV = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const pct = (a, b) => b ? Math.round(a / b * 1000) / 10 : 0;
function renderMill() {
  const el = $("#mill"); if (!el) return;
  if (!S) { el.innerHTML = ""; return }
  const list = [...all.values()], n = list.length;
  const done = list.filter(f => S.order.every(d => hasData(f, d))).length;
  const photos = list.reduce((k, f) => k + (f.images || []).length, 0);
  el.innerHTML = `<div class="kpi dark"><div class="k-l">Fabric codes</div><div class="k-big">${n}</div>
      <div class="k-s">${done} complete in all ${S.order.length} departments</div><div class="k-s">${photos} photo${photos === 1 ? "" : "s"}</div></div>` +
    S.order.map(d => {
      const k = list.filter(f => hasData(f, d)).length, on = waitFor === d;
      return `<button class="kpi dept${on ? " active" : ""}" data-wait="${d}" aria-pressed="${on}" title="Show codes still waiting for ${esc(DEPT(d).label)} data">
        <span class="k-head"><span class="k-name">${esc(DEPT(d).label)}</span><span class="k-art">${MACH[d]}</span></span>
        <span class="k-l">Codes with data</span><span class="k-num">${k} <small>of ${n}</small></span>
        <span class="k-acc">${pct(k, n)}% entered</span><span class="bar"><i style="width:${pct(k, n)}%"></i></span>
        <span class="k-s">${n - k ? `${n - k} waiting · tap to see` : "Nothing waiting"}</span></button>`;
    }).join("");
  el.querySelectorAll("[data-wait]").forEach(b => b.onclick = () => { waitFor = waitFor === b.dataset.wait ? null : b.dataset.wait; renderList() });
}
function renderStats() { renderMill() }
function renderList() {
  if (isPublic()) return renderPublic();
  const box = $("#results");
  renderStats();
  if (!S) { box.innerHTML = ""; $("#count").textContent = "Loading…"; return }
  const q = $("#q").value.trim();
  const list = [...all.values()].filter(f => matches(f, q) && (!waitFor || !hasData(f, waitFor))).sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  if (waitFor) {
    $("#count").innerHTML = `${list.length} code${list.length === 1 ? "" : "s"} waiting for ${esc(DEPT(waitFor).label)} data <button class="linkbtn" id="clearwait">Show all</button>`;
    $("#clearwait").onclick = () => { waitFor = null; renderList() };
  } else $("#count").textContent = q ? `${list.length} of ${all.size} codes match “${q}”` : `${all.size} code${all.size === 1 ? "" : "s"}, latest update first`;
  if (!all.size) { box.innerHTML = `<div class="empty" style="grid-column:1/-1">${SWATCH}<strong>No fabric codes yet</strong>Development starts a code with its construction data under “Add data”. Other departments then add their process data to the same code.</div>`; return }
  if (waitFor && !list.length) { box.innerHTML = `<div class="empty" style="grid-column:1/-1">${SWATCH}<strong>Nothing waiting for ${esc(DEPT(waitFor).label)}</strong>Every code already has ${esc(DEPT(waitFor).label.toLowerCase())} data.</div>`; return }
  if (!list.length) { box.innerHTML = `<div class="empty" style="grid-column:1/-1">${SWATCH}<strong>No fabric matches “${esc(q)}”</strong>Check the code, or add it under “Add data”.</div>`; return }
  box.innerHTML = list.map(f => {
    const img = photosOf(f)[0], dv = f.development || {}, st = dv.status || "", w = weightOf(f);
    const spec = [dv.weave, filled(w) ? `${w} oz` : "", shortComp(dv.composition)].filter(Boolean).join(" · ");
    return `<button class="card" data-code="${esc(f.__id)}">
      <div class="swatch tone-${toneOf(f)}">${img ? `<img src="${imgUrl(img.id)}" alt="" loading="lazy">` : ""}<span class="selv-edge"></span>
        ${st ? `<span class="spill ${statusCls(st)}">${esc(st)}</span>` : ""}</div>
      <div class="card-body">
        <div class="code">${esc(f.code)}</div>
        <div class="sub">${esc([dv.name, dv.buyer].filter(Boolean).join(" · ") || "No development details yet")}</div>
        <div class="specline">${esc(spec || f.dyeing?.shade || "—")}</div>
        ${progHtml(f)}</div></button>`
  }).join("");
}
$("#results").onclick = e => {
  const c = e.target.closest(".card"); if (!c) return;
  if (isPublic()) { pendingCode = c.dataset.code; return showLogin(`Sign in with the team key to see the full spec sheet for ${c.dataset.code}.`) }
  openDetail(c.dataset.code);
};
$("#q").addEventListener("input", renderList);
$("#q").addEventListener("keydown", e => {
  if (e.key !== "Enter") return; const id = norm($("#q").value); if (all.has(id)) return openDetail(id);
  const l = [...all.values()].filter(f => matches(f, $("#q").value.trim())); if (l.length === 1) openDetail(l[0].__id);
});

/* ---------- detail ---------- */
function fmt(v) { return filled(v) ? esc(v) : "—" }
function keyVal(label, v, u) { return `<div class="key"><div class="l">${label}</div><div class="v">${fmt(v)}${filled(v) && u ? `<span class="u">${u}</span>` : ""}</div></div>` }
/* a department's fields as a report-style table: group rows + parameter rows */
function specList(list, data) {
  let rows = "", pend = null, any = false;
  for (const x of list) {
    if (typeof x === "string") { pend = x; continue }
    const [k, l, t, o, p, u] = x; if (!filled(data[k])) continue;
    if (pend) { rows += `<tr class="grp"><td colspan="2">${esc(pend)}</td></tr>`; pend = null }
    rows += `<tr><th scope="row">${esc(l)}${u ? ` <span class="u">(${u})</span>` : ""}</th><td class="${t === "textarea" ? "txt" : ""}">${esc(data[k])}</td></tr>`; any = true;
  }
  return any ? `<div class="tscroll"><table class="dtable kv"><tbody>${rows}</tbody></table></div>` : "";
}
/* finishing steps as one table, one row per process */
function processHtml(ps) {
  if (!ps || !ps.length) return "";
  const main = ["date", "jobNo", "type", "speed", "recipe", "process", "otherName", "step", "code", "enteredBy", "updatedAt", "remarks"];
  return `<div class="t-cap">Process-wise parameters</div><div class="tscroll"><table class="dtable">
    <thead><tr><th>#</th><th>Process</th><th>Date</th><th class="num">Speed<br><span class="u">m/min</span></th><th>Chemical recipe</th><th>Settings</th></tr></thead>
    <tbody>${ps.map((s, i) => {
      const other = procFields(s.process).filter(([k]) => !main.includes(k) && filled(s[k])).map(([k, l, t, o, p, u]) => `${l} ${s[k]}${u ? " " + u : ""}`);
      if (filled(s.remarks)) other.push(`Remarks: ${s.remarks}`);
      return `<tr><td class="num">${i + 1}</td><td class="pname"><span class="pi">${PICON(s.process)}</span>${esc(procName(s))}${filled(s.type) ? `<br><span class="u">${esc(s.type)}</span>` : ""}</td><td class="nw">${fmt(s.date)}</td><td class="num">${fmt(s.speed)}</td><td class="txt">${fmt(s.recipe)}</td><td class="txt">${esc(other.join(" · ")) || "—"}</td></tr>`;
    }).join("")}</tbody></table></div>`;
}
function openDetail(id) { currentCode = id; currentImg = 0; detJob = {}; renderDetail(); show("detail") }
function renderDetail() {
  const box = $("#view-detail"); const f = all.get(currentCode);
  if (!f) { box.innerHTML = `<button class="backlink" id="d-back">← All fabric codes</button><div class="empty">${SWATCH}<strong>This code is not in the directory</strong>It may have been removed from the Google Sheet.</div>`; $("#d-back").onclick = () => show("search"); return }
  const dv = f.development || {}, dy = f.dyeing || {}, fn = f.finishing || {};
  const imgs = photosOf(f); if (currentImg >= imgs.length) currentImg = 0; const cur = imgs[currentImg]; const st = dv.status || "";
  const route = fn.processes || [], tone = toneOf(f);
  const nDone = S.order.filter(d => hasData(f, d)).length;
  const card = (l, v, u) => `<div class="kpi"><div class="k-l">${l}</div><div class="k-v">${fmt(v)}${filled(v) && u ? ` <span class="u">${u}</span>` : ""}</div></div>`;
  // target (Development) vs finished (Finishing)
  box.innerHTML = `
  <button class="backlink" id="d-back">← All fabric codes</button>
  <section class="d-cover">
    <div class="d-cover-text">
      <div class="kicker">Fabric code${dv.buyer ? ` · ${esc(dv.buyer)}` : ""}</div>
      <h2 class="code-xl">${esc(f.code)}</h2>
      <div class="name">${esc(dv.name || "Unnamed fabric")}</div>
      <div class="d-meta">${st ? `<span class="spill ${statusCls(st)}">${esc(st)}</span>` : ""}<span class="k-acc">${nDone} of ${S.order.length} departments entered</span></div>
      <div class="d-actions"><button class="btn amber" id="d-edit">Add data</button></div>
    </div>
    <div class="d-cover-media">
      <div class="gallery-main tone-${tone}">${cur ? `<img id="d-img" src="${imgUrl(cur.id)}" alt="${esc(cur.caption || "Fabric photo")}">` : `<span class="noimg">No photos yet</span>`}<span class="selv-edge"></span></div>
      ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((im, i) => `<button data-i="${i}" aria-current="${i === currentImg}" aria-label="Photo ${i + 1}"><img src="${imgUrl(im.id)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      ${cur ? `<div class="cap">${esc(cur.caption || DEPT(cur.dept)?.label || "")}</div>` : ""}
    </div>
  </section>

  <div class="kicker2">01 · Key specifications</div>
  <h3 class="sec-title">Construction and finish</h3>
  <div class="kpi-row">
    ${card("Weave", dv.weave)}${card("Composition", dv.composition)}${card("Warp × weft count", (dv.warpCount || dv.weftCount) ? `${dv.warpCount || "?"} × ${dv.weftCount || "?"}` : "")}
    ${card("EPI × PPI", (filled(dv.epi) || filled(dv.ppi)) ? `${dv.epi ?? "?"} × ${dv.ppi ?? "?"}` : "")}${card("Shade / color", dy.shade || dv.color)}
    ${card("Finished width", dv.targetWidth, "inch")}${card("Finished weight", dv.targetWeight, "oz/yd²")}
    ${card("After wash shrinkage", (filled(dv.shrinkWarpT) || filled(dv.shrinkWeftT)) ? `${dv.shrinkWarpT ?? "?"} × ${dv.shrinkWeftT ?? "?"}` : "", "% warp × weft")}
    ${card("Elongation · growth · recovery", [dv.elongation, dv.growth, dv.recovery].some(filled) ? [dv.elongation, dv.growth, dv.recovery].map(v => filled(v) ? v : "?").join(" · ") : "", "%")}
    ${card("Finishing process", dv.finishRoute)}${card("Machine name", finMachineOf(f))}
  </div>
  <div class="kicker2">02 · Production</div>
  <h3 class="sec-title">Production route</h3>
  <div class="route-cards">${S.order.map((d, i) => { const ok = hasData(f, d), data = f[d] || {};
    return `${i ? `<span class="rc-arr">${CHEV}</span>` : ""}<div class="kpi rc${ok ? " dark" : ""}"><span class="k-art">${MACH[d]}</span><div class="k-name">${esc(DEPT(d).label)}</div>
      <div class="${ok ? "k-acc" : "k-pend"}">${ok ? (jobsOf(f, d).length > 1 ? `${jobsOf(f, d).length} jobs` : "Entered") : "Pending"}</div>${d === "finishing" && finMachineOf(f) ? `<div class="k-s">Machine: ${esc(finMachineOf(f))}</div>` : ""}<div class="k-s">${ok ? esc([data.enteredBy, data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : ""].filter(Boolean).join(" · ")) : "No data yet"}</div></div>` }).join("")}</div>
  ${route.length ? `<div class="route-row"><span class="rs-k">Finishing route</span>${route.map((r, i) => `${i ? `<span class="arr">${CHEV}</span>` : ""}<span class="r">${PICON(r.process)}${esc(procName(r))}</span>`).join("")}</div>` : ""}

  <div class="kicker2">03 · Department data</div>
  <h3 class="sec-title">Data by department</h3>
  <div class="panels">
    ${S.order.map(d => {
      const jobs = jobsOf(f, d), ok = hasData(f, d);
      const data = jobs.find(j => jk(j.jobNo) === jk(detJob[d])) || jobs[0] || {};
      const body = specList(DEPT(d).fields, data) + (d === "finishing" ? processHtml(data.processes) : "");
      const when = data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "";
      const tabs = jobs.length > 1 || (jobs[0] && jobs[0].jobNo) ? `<div class="jobtabs" role="tablist">${jobs.map((j, i) => `<button type="button" role="tab" class="jtab" data-jd="${d}" data-jn="${esc(j.jobNo)}" aria-selected="${j === data}">${esc(jobLabel(j))}${i === 0 && jobs.length > 1 ? ' <span class="latest">latest</span>' : ""}</button>`).join("")}</div>` : "";
      return `<section class="panel${d === "finishing" ? " wide" : ""}"><div class="panel-h"><span class="ph-art">${MACH[d]}</span><div class="ph-t"><h4>${DEPT(d).label}${jobs.length > 1 ? ` <span class="jcount">${jobs.length} jobs</span>` : ""}</h4>
        <div class="by">${ok ? esc([data.enteredBy, when ? `updated ${when}` : ""].filter(Boolean).join(" · ") || "Entered") : "No data yet"}</div></div>
        <button class="btn small" data-edit="${d}" data-ej="${esc(data.jobNo ?? "")}">${ok ? "Edit" : "Add"}</button></div>${tabs}
        ${ok ? (body || `<div class="none">Saved with no values.</div>`) : `<div class="none">${DEPT(d).label} hasn't entered data for this code yet.</div>`}</section>`
    }).join("")}
  </div>`;
  $("#d-back").onclick = () => { currentCode = null; show("search") };
  $("#d-edit").onclick = () => openEntry(currentCode, dept);
  box.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openEntry(currentCode, b.dataset.edit, hasData(all.get(currentCode), b.dataset.edit) ? b.dataset.ej : undefined));
  box.querySelectorAll(".jtab").forEach(b => b.onclick = () => { detJob[b.dataset.jd] = b.dataset.jn; renderDetail() });
  box.querySelectorAll(".thumbs button").forEach(b => b.onclick = () => { currentImg = +b.dataset.i; renderDetail() });
  const im = $("#d-img"); if (im) im.onclick = () => { const lb = $("#lightbox"); lb.querySelector("img").src = im.src; lb.hidden = false };
}
$("#lightbox").onclick = () => $("#lightbox").hidden = true;

/* ---------- form ---------- */
function fieldHtml(id, def, v) {
  const [k, l, t, opts, ph, u] = def; v = v ?? "";
  const lab = `<label for="${id}">${esc(l)}${u ? ` <span class="u">(${u})</span>` : ""}</label>`;
  if (t === "select") return `<div class="f">${lab}<select id="${id}" data-k="${k}"><option value="">—</option>${opts.map(o => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
  if (t === "multi") { const on = String(v || "").split(/\s*,\s*/).filter(Boolean);
    return `<fieldset class="f wide multi"><legend>${esc(l)}</legend><div class="checks">${opts.map(o => `<label class="chk"><input type="checkbox" data-mk="${k}" value="${esc(o)}" ${on.includes(o) ? "checked" : ""}><span>${esc(o)}</span></label>`).join("")}</div></fieldset>`; }
  if (t === "textarea") return `<div class="f wide">${lab}<textarea id="${id}" data-k="${k}" placeholder="${esc(ph || "")}">${esc(v)}</textarea></div>`;
  if (t === "machine") return `<div class="f">${lab}<input id="${id}" data-k="${k}" list="${id}-dl" value="${esc(v)}" placeholder="Pick or type"><datalist id="${id}-dl">${(opts || []).map(o => `<option value="${esc(o)}">`).join("")}</datalist></div>`;
  const type = t === "num" ? "number" : t === "date" ? "date" : "text";
  return `<div class="f">${lab}<input id="${id}" data-k="${k}" type="${type}" ${t === "num" ? 'step="any" inputmode="decimal"' : ""} value="${esc(v)}" placeholder="${esc(ph || "")}"></div>`;
}
function fieldsHtml(list, data, prefix) {
  return `<div class="fields">${list.map(x => typeof x === "string" ? `<div class="group-h">${esc(x)}</div>` : fieldHtml(`${prefix}-${x[0]}`, x, data[x[0]])).join("")}</div>`;
}
function readFields(root) {
  const o = {};
  root.querySelectorAll("[data-k]").forEach(el => { o[el.dataset.k] = el.type === "number" && el.value !== "" ? Number(el.value) : el.value.trim() });
  root.querySelectorAll("[data-mk]").forEach(el => { const k = el.dataset.mk; if (!(k in o)) o[k] = []; if (el.checked) o[k].push(el.value) });
  Object.keys(o).forEach(k => { if (Array.isArray(o[k])) o[k] = o[k].join(", ") });
  return o;
}
function renderDeptButtons() {
  $("#depts").innerHTML = S.order.map(d => `<button type="button" data-d="${d}" aria-pressed="${d === dept}" ><span class="art">${MACH[d]}</span><span>${DEPT(d).label}</span></button>`).join("");
  $("#depts").querySelectorAll("button").forEach(b => b.onclick = () => { dept = b.dataset.d; renderDeptButtons(); renderFields() });
}
/* which job the form is on: curJob = a saved job's no. ("" = an entry saved before jobs existed), null = a new job */
function renderJobs() {
  const f = all.get(norm($("#f-code").value)), jobs = jobsOf(f, dept);
  const key = norm($("#f-code").value) + "|" + dept;
  if (key !== formKey || curJob === undefined) { if (key !== formKey) jobDraft = null; formKey = key; if (curJob === undefined || curJob === null) curJob = jobs.length ? jobs[0].jobNo : null; }
  if (curJob !== null && !jobs.some(j => jk(j.jobNo) === jk(curJob))) curJob = jobs.length ? jobs[0].jobNo : null;
  const sel = $("#f-job");
  sel.innerHTML = (curJob === null ? `<option value="__new" selected>New job</option>` : "") +
    jobs.map((j, i) => `<option value="${esc(j.jobNo)}" ${curJob !== null && jk(j.jobNo) === jk(curJob) ? "selected" : ""}>${esc(jobLabel(j))}${i === 0 ? " (latest)" : ""}</option>`).join("");
  sel.disabled = !jobs.length;
  $("#copyjob").disabled = !jobs.length;
  const cur = curJob === null ? null : jobs.find(j => jk(j.jobNo) === jk(curJob));
  $("#f-jobno").value = cur ? (cur.jobNo || "") : (jobDraft?.jobNo || "");
  $("#f-jobdate").value = cur ? (cur.jobDate || "") : (jobDraft?.jobDate ?? todayISO());
  $("#jobhint").textContent = cur ? `Editing ${jobLabel(cur)}. For a repeat run, tap + New job.`
    : jobDraft?._from !== undefined && jobDraft?._from !== null ? `New job, copied from ${jobDraft._from ? "Job " + jobDraft._from : "the first entry"}. Change what is different, then save.`
    : jobs.length ? "New job. Enter the job no. and date, then fill in the values." : "First job for this code. Enter the job no. and date.";
  return cur || jobDraft || {};
}
function renderFields() {
  $("#dept-title").textContent = DEPT(dept).label + " details";
  const existing = renderJobs();
  $("#photo-sec").hidden = dept !== "development"; renderPhotoSlots();
  $("#dept-fields").innerHTML = `<p class="hint" style="margin:0 0 10px">${esc(DEPT(dept).note)}</p>` + fieldsHtml(DEPT(dept).fields, existing, `fd-${dept}`);
  const pe = $("#proc-editor");
  if (dept === "finishing") { steps = JSON.parse(JSON.stringify(existing.processes || [])); pe.hidden = false; renderSteps() } else { pe.hidden = true; pe.innerHTML = ""; steps = [] }
  updateCodeHint();
}
function syncSteps() { $("#proc-editor").querySelectorAll(".step").forEach((el, i) => { if (steps[i]) Object.assign(steps[i], readFields(el.querySelector(".fields"))) }) }
function renderSteps() {
  const pe = $("#proc-editor");
  pe.innerHTML = `<div class="section-h" style="margin-bottom:10px">Finishing processes, in running order</div>
    <div class="steps">${steps.length ? steps.map((s, i) => `
      <div class="step"><div class="step-h">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="n">${i + 1}</span><span class="step-ic">${PICON(s.process)}</span>
          <select data-proc="${i}" aria-label="Process for step ${i + 1}">${S.processes.map(p => `<option ${p === s.process ? "selected" : ""}>${p}</option>`).join("")}</select></div>
        <div class="step-tools"><button type="button" data-up="${i}" ${i ? "" : "disabled"} aria-label="Move up">↑</button><button type="button" data-down="${i}" ${i < steps.length - 1 ? "" : "disabled"} aria-label="Move down">↓</button><button type="button" data-rm="${i}">Remove</button></div>
      </div>${fieldsHtml(procFields(s.process), s, `ps-${i}`)}</div>`).join("")
      : `<div class="empty" style="padding:18px">No processes yet. Add the first process this code runs through, e.g. Desize.</div>`}</div>
    <div class="addstep" style="margin-top:12px"><select id="addproc" aria-label="Process to add">${S.processes.map(p => `<option>${p}</option>`).join("")}</select>
      <button type="button" class="btn" id="addstep">+ Add process</button></div>`;
  $("#addstep").onclick = () => { syncSteps(); const p = $("#addproc").value; steps.push({ process: p, machine: S.procMachine[p] || "" }); renderSteps() };
  pe.querySelectorAll("[data-proc]").forEach(sel => sel.onchange = () => { syncSteps(); const s = steps[+sel.dataset.proc]; s.process = sel.value; if (!s.machine || S.finMachines.includes(s.machine)) s.machine = S.procMachine[sel.value] || ""; renderSteps() });
  pe.querySelectorAll("[data-up]").forEach(b => b.onclick = () => { syncSteps(); const i = +b.dataset.up;[steps[i - 1], steps[i]] = [steps[i], steps[i - 1]]; renderSteps() });
  pe.querySelectorAll("[data-down]").forEach(b => b.onclick = () => { syncSteps(); const i = +b.dataset.down;[steps[i + 1], steps[i]] = [steps[i], steps[i + 1]]; renderSteps() });
  pe.querySelectorAll("[data-rm]").forEach(b => b.onclick = () => { syncSteps(); steps.splice(+b.dataset.rm, 1); renderSteps() });
}
function updateCodeHint() {
  const v = $("#f-code").value.trim(); const h = $("#codehint");
  if (!v) { h.textContent = "New codes are created on save."; h.classList.remove("found"); return }
  const f = all.get(norm(v));
  if (f) { h.textContent = `Existing code — ${S.order.filter(d => hasData(f, d)).map(d => DEPT(d).label).join(", ") || "no data yet"}. Saved ${DEPT(dept).label.toLowerCase()} values are loaded below.`; h.classList.add("found") }
  else { h.textContent = "New code — it will be created when you save."; h.classList.remove("found") }
}
let codeTimer;
$("#f-code").addEventListener("input", () => { clearTimeout(codeTimer); codeTimer = setTimeout(() => { curJob = undefined; renderFields() }, 300) });
$("#f-job").onchange = () => { curJob = $("#f-job").value === "__new" ? null : $("#f-job").value; jobDraft = null; renderFields() };
$("#newjob").onclick = () => {
  const last = jobsOf(all.get(norm($("#f-code").value)), dept)[0];
  curJob = null; jobDraft = { jobDate: todayISO() };
  if (dept === "finishing" && last && last.processes) jobDraft.processes = last.processes.map(s => ({ process: s.process, type: s.type || "", machine: s.machine || "" }));
  renderFields(); $("#f-jobno").focus();
};
$("#copyjob").onclick = () => {
  const last = jobsOf(all.get(norm($("#f-code").value)), dept)[0]; if (!last) return;
  const c = JSON.parse(JSON.stringify(last));
  ["jobNo", "jobDate", "updatedAt", "enteredBy", "code", "_row"].forEach(k => delete c[k]);
  (c.processes || []).forEach(s => { ["date", "jobNo", "updatedAt", "enteredBy", "code", "step"].forEach(k => delete s[k]) });
  curJob = null; jobDraft = { ...c, jobDate: todayISO(), _from: last.jobNo || "" };
  renderFields(); $("#f-jobno").focus();
};
function openEntry(code, d, jobNo) {
  if (!S) return toast("The directory hasn't loaded yet");
  dept = d || dept; $("#f-code").value = code ? (all.get(code)?.code || code) : ""; $("#savemsg").textContent = "";
  formKey = ""; jobDraft = null; curJob = jobNo === undefined ? undefined : jobNo;
  if (!$("#f-enteredBy").value) $("#f-enteredBy").value = userName;
  renderDeptButtons(); renderFields(); show("entry");
}
$("#view-after").onclick = () => { const id = norm($("#f-code").value); if (all.has(id)) openDetail(id); else toast("Save this code first") };
/* one photo per kind: the last file picked for that kind (camera or gallery) */
let picked = {};
function pickedFiles() { return KINDS.filter(k => picked[k]).map(k => ({ kind: k, file: picked[k] })) }
function renderPhotoSlots() {
  const f = all.get(norm($("#f-code").value));
  [["fin", KINDS[0]], ["wash", KINDS[1]]].forEach(([id, k]) => {
    const cur = photosOf(f).find(x => x.caption === k), th = $("#ps-thumb-" + id), st = $("#ps-state-" + id);
    if (picked[k]) { th.innerHTML = `<img src="${URL.createObjectURL(picked[k])}" alt="">`; st.innerHTML = `<span class="ps-ready">New photo ready</span>, saves with this entry`; }
    else if (cur) { th.innerHTML = `<img src="${imgUrl(cur.id)}" alt="">`; st.textContent = "Current photo. Pick a new one to replace it."; }
    else { th.innerHTML = ""; st.textContent = "No photo yet"; }
  });
}
function photoHint() { renderPhotoSlots() }
document.querySelectorAll("#photo-sec input[type=file]").forEach(inp => inp.onchange = () => { if (inp.files[0]) picked[inp.dataset.kind] = inp.files[0]; inp.value = ""; renderPhotoSlots() });

$("#entry").addEventListener("submit", async e => {
  e.preventDefault();
  const code = norm($("#f-code").value); if (!code) { $("#f-code").focus(); return }
  const jobNo = $("#f-jobno").value.trim(), jobDate = $("#f-jobdate").value;
  const jobs = jobsOf(all.get(code), dept);
  if (!jobNo && !(curJob === "" && curJob !== null)) { $("#savemsg").textContent = "Enter the job no. for this entry."; $("#f-jobno").focus(); return }
  if (jobs.some(j => jk(j.jobNo) === jk(jobNo)) && (curJob === null || jk(curJob) !== jk(jobNo))) { $("#savemsg").textContent = `Job no. ${jobNo} already exists for ${code}. Pick it from the Job list to edit it.`; $("#f-jobno").focus(); return }
  const values = readFields($("#dept-fields"));
  if (dept === "finishing") { syncSteps(); values.processes = steps.map(s => ({ ...s })) }
  values.enteredBy = $("#f-enteredBy").value.trim();
  const files = dept === "development" ? pickedFiles() : [];
  $("#save").disabled = true; $("#savemsg").textContent = "Saving…";
  try {
    await apiPost({ action: "save", code, dept, values, jobNo, jobDate, origJobNo: curJob === null || curJob === undefined ? null : curJob });
    for (const [i, x] of files.entries()) {
      $("#savemsg").textContent = `Uploading ${x.kind.toLowerCase()} photo (${i + 1} of ${files.length})…`;
      const data = await toBase64Jpeg(x.file);
      await apiPost({ action: "photo", code, dept: "development", kind: x.kind, caption: x.kind, mime: "image/jpeg", data });
    }
    picked = {};
    $("#savemsg").textContent = `Saved ${DEPT(dept).label} data for ${code}${jobNo ? `, job ${jobNo}` : ""}.`; toast(`Saved ${code}`);
    if (values.enteredBy) { userName = values.enteredBy; store.set("dl_name", userName) }
    await load(true);
    curJob = jobNo; jobDraft = null; formKey = code + "|" + dept; renderFields();
  } catch (err) {
    $("#savemsg").textContent = String(err.message) === "wrong_key" ? "Your team key was changed. Reopen the app and sign in again." : "Could not save: " + (err.message || "check your internet connection");
  } finally { $("#save").disabled = false }
});
/* resize to max 1600 px JPEG before upload */
async function toBase64Jpeg(file) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file) });
  const s = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(img.src);
  return c.toDataURL("image/jpeg", 0.85).split(",")[1];
}

/* ---------- boot ---------- */
if (CFG.SHEET_URL) { const a = $("#sheetlink"); a.href = CFG.SHEET_URL; a.hidden = false }
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => { });
(function boot() {
  if (!API || API.startsWith("PASTE")) { setStatus("Setup needed: paste your Apps Script web app URL into config.js.", true); show("search"); return }
  updateAuthUI();
  if (!teamKey) { try { pub = JSON.parse(store.get("dl_pub") || "[]") } catch (e) { pub = [] } show("search"); renderList(); return loadPublic() }
  const cached = store.get("dl_cache");
  if (cached) { try { applyData(JSON.parse(cached)); loaded = true } catch (e) { } }
  show("search"); renderList(); load();
})();
