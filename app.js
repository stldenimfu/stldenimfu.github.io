const POCKET=`<svg class="pocket" viewBox="0 0 100 110" aria-hidden="true"><path d="M8 6h84v66L50 104 8 72z" fill="rgba(0,0,0,.14)"/><path d="M12 10h76v60L50 99 12 70z" fill="none" stroke="var(--thread)" stroke-width="2" stroke-dasharray="5 3"/><path d="M16 14h68v54L50 94 16 68z" fill="none" stroke="var(--thread)" stroke-width="2" stroke-dasharray="5 3" opacity=".8"/><path d="M22 40q28-18 56 0" fill="none" stroke="var(--thread)" stroke-width="2" stroke-dasharray="5 3"/><path d="M22 50q28-18 56 0" fill="none" stroke="var(--thread)" stroke-width="2" stroke-dasharray="5 3" opacity=".8"/></svg>`;
const SWATCH=`<svg class="swatch" viewBox="0 0 120 90" aria-hidden="true"><defs><pattern id="tw" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--denim)"/><rect width="2" height="6" fill="rgba(255,255,255,.12)"/></pattern></defs><path d="M10 14h92l8 8v58H18l-8-8z" fill="url(#tw)"/><path d="M102 14l8 8h-8z" fill="var(--denim-deep)"/><rect x="10" y="66" width="92" height="6" fill="#f4f1ea"/><path d="M10 69h92" stroke="var(--selvedge)" stroke-width="2" stroke-dasharray="7 3"/><path d="M16 20h80v42H16z" fill="none" stroke="var(--thread)" stroke-width="1.6" stroke-dasharray="4 3"/></svg>`;
/* STL Fabric Directory - standalone client. Data lives in Google Sheets via the Apps Script web app in config.js. */
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
let currentCode = null, currentImg = 0, dept = "development", steps = [], loaded = false, busy = false;
let teamKey = store.get("dl_key") || "", userName = store.get("dl_name") || "";

/* ---------- schema helpers ---------- */
const DEPT = d => S.depts[d];
const defs = d => DEPT(d).fields.filter(x => Array.isArray(x));
const procFields = p => [...S.procCommon, ...(S.procExtra[p] || []), ["remarks", "Remarks", "textarea"]];
const procName = s => s.process === "Other" && s.otherName ? s.otherName : s.process;
const hasData = (f, d) => !!(f && f[d] && (defs(d).some(([k]) => filled(f[d][k])) || (d === "finishing" && (f[d].processes || []).length)));

/* ---------- UI basics ---------- */
function setStatus(t, err) { const s = $("#status"); s.textContent = t; s.classList.toggle("err", !!err) }
function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2600) }
function show(view) {
  ["login", "search", "detail", "entry"].forEach(v => $("#view-" + v).hidden = v !== view);
  $("#tab-search").setAttribute("aria-selected", view !== "entry");
  $("#tab-entry").setAttribute("aria-selected", view === "entry");
  document.querySelector("nav.tabs").hidden = view === "login";
  window.scrollTo(0, 0);
}
$("#tab-search").onclick = () => { currentCode = null; show("search") };
$("#tab-entry").onclick = () => openEntry(currentCode, dept);

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
  (j.fabrics || []).forEach(f => all.set(norm(f.code), { ...f, __id: norm(f.code) }));
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
    if (String(e.message) === "wrong_key") { store.set("dl_key", ""); teamKey = ""; busy = false; return showLogin("That team key is not correct.") }
    setStatus(loaded ? "Couldn't refresh. Showing the last saved copy; check your internet connection." : "Couldn't reach the directory. Check your internet connection and tap Refresh.", true);
  } finally { busy = false }
  renderList();
  if (currentCode && !$("#view-detail").hidden) renderDetail();
  if (!$("#view-entry").hidden) updateCodeHint();
}
$("#refresh").onclick = () => load();
document.addEventListener("visibilitychange", () => { if (!document.hidden && teamKey) load(true) });

/* ---------- login ---------- */
function showLogin(msg) {
  $("#l-name").value = userName; $("#l-msg").textContent = msg || ""; setStatus(""); show("login");
}
$("#login").addEventListener("submit", async e => {
  e.preventDefault();
  teamKey = $("#l-key").value.trim(); userName = $("#l-name").value.trim();
  $("#l-msg").textContent = "Checking…";
  try { const j = await apiGet("all"); store.set("dl_key", teamKey); store.set("dl_name", userName); applyData(j); loaded = true; setStatus(""); renderList(); show("search") }
  catch (err) { $("#l-msg").textContent = String(err.message) === "wrong_key" ? "That team key is not correct." : "Couldn't reach the directory. Check your internet connection." }
});

/* ---------- search ---------- */
function matches(f, q) {
  if (!q) return true;
  const hay = [f.code, f.development?.name, f.development?.buyer, f.dyeing?.shade, f.development?.weave, ...(f.finishing?.processes || []).map(procName)].join(" ").toLowerCase();
  return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
}
function chipsHtml(f) { return `<div class="chips">${S.order.map(d => `<span class="chip ${hasData(f, d) ? "on" : ""}">${DEPT(d).label.slice(0, 3)}</span>`).join("")}</div>` }
function renderList() {
  const box = $("#results");
  if (!S) { box.innerHTML = ""; $("#count").textContent = "Loading…"; return }
  const q = $("#q").value.trim();
  const list = [...all.values()].filter(f => matches(f, q)).sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  $("#count").textContent = `${list.length} of ${all.size} fabric code${all.size === 1 ? "" : "s"}`;
  if (!all.size) { box.innerHTML = `<div class="empty" style="grid-column:1/-1">${SWATCH}<strong>The directory is empty</strong>Development starts a code with its construction data under “Add / update data”. Other departments then add their process data to the same code.</div>`; return }
  if (!list.length) { box.innerHTML = `<div class="empty" style="grid-column:1/-1">${SWATCH}<strong>No fabric matches “${esc(q)}”</strong>Check the code, or add it under “Add / update data”.</div>`; return }
  box.innerHTML = list.map(f => {
    const img = f.images?.[0];
    return `<button class="card" data-code="${esc(f.__id)}"><div class="thumb ${img ? "" : "denim"}">${img ? `<img src="${imgUrl(img.id)}" alt="" loading="lazy">` : POCKET}</div>
      <div class="body"><div class="code">${esc(f.code)}</div>
      <div class="sub">${esc([f.development?.name, f.development?.buyer, f.dyeing?.shade].filter(Boolean).join(" · ") || "No development details yet")}</div>
      ${chipsHtml(f)}</div></button>`
  }).join("");
}
$("#results").onclick = e => { const c = e.target.closest(".card"); if (c) openDetail(c.dataset.code) };
$("#q").addEventListener("input", renderList);
$("#q").addEventListener("keydown", e => {
  if (e.key !== "Enter") return; const id = norm($("#q").value); if (all.has(id)) return openDetail(id);
  const l = [...all.values()].filter(f => matches(f, $("#q").value.trim())); if (l.length === 1) openDetail(l[0].__id);
});

/* ---------- detail ---------- */
function fmt(v) { return filled(v) ? esc(v) : "—" }
function keyVal(label, v, u) { return `<div class="key"><div class="l">${label}</div><div class="v">${fmt(v)}${filled(v) && u ? `<span class="u">${u}</span>` : ""}</div></div>` }
function specList(list, data) {
  let html = "", buf = "", head = null;
  const flush = () => { if (buf) { html += (head ? `<div class="subh">${esc(head)}</div>` : "") + `<dl class="specs">${buf}</dl>`; buf = "" } };
  for (const x of list) {
    if (typeof x === "string") { flush(); head = x; continue }
    const [k, l, t, o, p, u] = x; if (!filled(data[k])) continue;
    buf += `<div class="${t === "textarea" ? "wide" : ""}"><dt>${esc(l)}${u ? ` (${u})` : ""}</dt><dd>${esc(data[k])}</dd></div>`;
  }
  flush(); return html;
}
function processHtml(ps) {
  if (!ps || !ps.length) return "";
  return `<div class="subh">Process route</div><div class="route">${ps.map((s, i) => `${i ? '<span class="arr">→</span>' : ""}<span class="r">${esc(procName(s))}</span>`).join("")}</div>` +
    ps.map((s, i) => {
      const head = [s.machine, filled(s.speed) ? s.speed + " m/min" : "", filled(s.temp) ? s.temp + " °C" : ""].filter(Boolean).join(" · ");
      const rest = procFields(s.process).filter(([k]) => !["machine", "speed", "temp"].includes(k));
      return `<div class="pstep"><div class="pstep-h"><b>${i + 1} · ${esc(procName(s))}</b><span>${esc(head)}</span></div>${specList(rest, s)}</div>`
    }).join("");
}
function openDetail(id) { currentCode = id; currentImg = 0; renderDetail(); show("detail") }
function renderDetail() {
  const box = $("#view-detail"); const f = all.get(currentCode);
  if (!f) { box.innerHTML = `<button class="btn back" id="d-back">← All fabrics</button><div class="empty"><strong>This code is not in the directory</strong>It may have been removed from the Google Sheet.</div>`; $("#d-back").onclick = () => show("search"); return }
  const dv = f.development || {}, dy = f.dyeing || {}, wv = f.weaving || {}, fn = f.finishing || {};
  const imgs = f.images || []; if (currentImg >= imgs.length) currentImg = 0; const cur = imgs[currentImg]; const st = dv.status || "";
  box.innerHTML = `
  <button class="btn back" id="d-back">← All fabrics</button>
  <article class="sheet"><div class="selvedge"></div>
    <div class="sheet-head">
      <div><div class="code">${esc(f.code)}</div>
        <div class="name">${esc(dv.name || "Unnamed fabric")}${dv.buyer ? ` · <span style="color:var(--muted)">${esc(dv.buyer)}</span>` : ""}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">${st ? `<span class="pill ${/Approved|Bulk/.test(st) ? "approved" : ""}">${esc(st)}</span>` : ""}${chipsHtml(f)}</div>
      </div>
      <div class="head-actions"><button class="btn primary" id="d-edit">Add / update data</button></div>
    </div>
    <div class="keys">
      ${keyVal("Finished weight", filled(fn.finishedWeight) ? fn.finishedWeight : dv.targetWeight, "oz/yd²")}
      ${keyVal("Finished width", filled(fn.finishedWidth) ? fn.finishedWidth : dv.targetWidth, "inch")}
      ${keyVal("Composition", dv.composition)}
      ${keyVal("Weave", dv.weave)}
      ${keyVal("Warp × weft", (dv.warpCount || dv.weftCount) ? `${dv.warpCount || "?"} × ${dv.weftCount || "?"}` : "")}
      ${keyVal("EPI × PPI", (filled(dv.epi) || filled(dv.ppi)) ? `${dv.epi ?? "?"} × ${dv.ppi ?? "?"}` : "")}
      ${keyVal("Shade", dy.shade)}
      ${keyVal("Stretch", fn.stretch, "%")}
    </div>
    <div class="sheet-main">
      <div>
        <div class="gallery-main">${cur ? `<img id="d-img" src="${imgUrl(cur.id)}" alt="${esc(cur.caption || "Fabric photo")}">` : `<div class="noimg">${SWATCH}No photos yet.<br>Any department can add them from “Add / update data”.</div>`}</div>
        <div class="cap">${cur ? esc([DEPT(cur.dept)?.label || cur.dept, cur.caption].filter(Boolean).join(" — ")) : ""}</div>
        ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((im, i) => `<button data-i="${i}" aria-current="${i === currentImg}" aria-label="Photo ${i + 1}"><img src="${imgUrl(im.id)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      </div>
      <div class="panels">
        ${S.order.map(d => {
          const data = f[d] || {}; const ok = hasData(f, d);
          const body = specList(DEPT(d).fields, data) + (d === "finishing" ? processHtml(data.processes) : "");
          const when = data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : "";
          return `<section class="panel"><div class="panel-h"><h3>${DEPT(d).label}</h3>
            <span class="by">${ok ? esc([data.enteredBy, when].filter(Boolean).join(" · ")) : ""}
            <button class="linkbtn" data-edit="${d}">${ok ? "Edit" : "Add"}</button></span></div>
            ${ok ? body : `<div class="none">No ${DEPT(d).label.toLowerCase()} data entered yet.</div>`}</section>`
        }).join("")}
      </div>
    </div>
  </article>`;
  $("#d-back").onclick = () => { currentCode = null; show("search") };
  $("#d-edit").onclick = () => openEntry(currentCode, dept);
  box.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => openEntry(currentCode, b.dataset.edit));
  box.querySelectorAll(".thumbs button").forEach(b => b.onclick = () => { currentImg = +b.dataset.i; renderDetail() });
  const im = $("#d-img"); if (im) im.onclick = () => { const lb = $("#lightbox"); lb.querySelector("img").src = im.src; lb.hidden = false };
}
$("#lightbox").onclick = () => $("#lightbox").hidden = true;

/* ---------- form ---------- */
function fieldHtml(id, def, v) {
  const [k, l, t, opts, ph, u] = def; v = v ?? "";
  const lab = `<label for="${id}">${esc(l)}${u ? ` <span class="u">(${u})</span>` : ""}</label>`;
  if (t === "select") return `<div class="f">${lab}<select id="${id}" data-k="${k}"><option value="">—</option>${opts.map(o => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
  if (t === "textarea") return `<div class="f wide">${lab}<textarea id="${id}" data-k="${k}" placeholder="${esc(ph || "")}">${esc(v)}</textarea></div>`;
  if (t === "machine") return `<div class="f">${lab}<input id="${id}" data-k="${k}" list="${id}-dl" value="${esc(v)}" placeholder="Pick or type"><datalist id="${id}-dl">${(opts || []).map(o => `<option value="${esc(o)}">`).join("")}</datalist></div>`;
  const type = t === "num" ? "number" : t === "date" ? "date" : "text";
  return `<div class="f">${lab}<input id="${id}" data-k="${k}" type="${type}" ${t === "num" ? 'step="any" inputmode="decimal"' : ""} value="${esc(v)}" placeholder="${esc(ph || "")}"></div>`;
}
function fieldsHtml(list, data, prefix) {
  return `<div class="fields">${list.map(x => typeof x === "string" ? `<div class="group-h">${esc(x)}</div>` : fieldHtml(`${prefix}-${x[0]}`, x, data[x[0]])).join("")}</div>`;
}
function readFields(root) { const o = {}; root.querySelectorAll("[data-k]").forEach(el => { o[el.dataset.k] = el.type === "number" && el.value !== "" ? Number(el.value) : el.value.trim() }); return o }
function renderDeptButtons() {
  $("#depts").innerHTML = S.order.map(d => `<button type="button" data-d="${d}" aria-pressed="${d === dept}">${DEPT(d).label}</button>`).join("");
  $("#depts").querySelectorAll("button").forEach(b => b.onclick = () => { dept = b.dataset.d; renderDeptButtons(); renderFields() });
}
function renderFields() {
  $("#dept-title").textContent = DEPT(dept).label + " details";
  const existing = all.get(norm($("#f-code").value))?.[dept] || {};
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
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="n">${i + 1}</span>
          <select data-proc="${i}" aria-label="Process for step ${i + 1}">${S.processes.map(p => `<option ${p === s.process ? "selected" : ""}>${p}</option>`).join("")}</select></div>
        <div class="step-tools"><button type="button" data-up="${i}" ${i ? "" : "disabled"} aria-label="Move up">↑</button><button type="button" data-down="${i}" ${i < steps.length - 1 ? "" : "disabled"} aria-label="Move down">↓</button><button type="button" data-rm="${i}">Remove</button></div>
      </div>${fieldsHtml(procFields(s.process), s, `ps-${i}`)}</div>`).join("")
      : `<div class="empty" style="padding:18px">No processes yet. Add the first process this code runs through, e.g. Desize.</div>`}</div>
    <div class="addstep" style="margin-top:12px"><select id="addproc" aria-label="Process to add">${S.processes.map(p => `<option>${p}</option>`).join("")}</select>
      <button type="button" class="btn" id="addstep">+ Add process</button></div>`;
  $("#addstep").onclick = () => { syncSteps(); const p = $("#addproc").value; steps.push({ process: p, machine: S.procMachine[p] || "" }); renderSteps() };
  pe.querySelectorAll("[data-proc]").forEach(sel => sel.onchange = () => { syncSteps(); const s = steps[+sel.dataset.proc]; s.process = sel.value; if (!s.machine || S.finMachines.includes(s.machine)) s.machine = S.procMachine[sel.value] || s.machine; renderSteps() });
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
$("#f-code").addEventListener("input", () => { clearTimeout(codeTimer); codeTimer = setTimeout(renderFields, 300) });
function openEntry(code, d) {
  if (!S) return toast("The directory hasn't loaded yet");
  dept = d || dept; $("#f-code").value = code ? (all.get(code)?.code || code) : ""; $("#savemsg").textContent = "";
  if (!$("#f-enteredBy").value) $("#f-enteredBy").value = userName;
  renderDeptButtons(); renderFields(); show("entry");
}
$("#view-after").onclick = () => { const id = norm($("#f-code").value); if (all.has(id)) openDetail(id); else toast("Save this code first") };
function pickedFiles() { return [...$("#f-camera").files, ...$("#f-photo").files] }
function photoHint() { const n = pickedFiles().length; $("#photohint").textContent = n ? `${n} photo${n > 1 ? "s" : ""} ready to upload with this save.` : "No photos selected. Photos are tagged with the department you have selected." }
$("#f-camera").onchange = photoHint; $("#f-photo").onchange = photoHint;

$("#entry").addEventListener("submit", async e => {
  e.preventDefault();
  const code = norm($("#f-code").value); if (!code) { $("#f-code").focus(); return }
  const values = readFields($("#dept-fields"));
  if (dept === "finishing") { syncSteps(); values.processes = steps.map(s => ({ ...s })) }
  values.enteredBy = $("#f-enteredBy").value.trim();
  const files = pickedFiles();
  $("#save").disabled = true; $("#savemsg").textContent = "Saving…";
  try {
    await apiPost({ action: "save", code, dept, values });
    for (const [i, file] of files.entries()) {
      $("#savemsg").textContent = `Uploading photo ${i + 1} of ${files.length}…`;
      const data = await toBase64Jpeg(file);
      await apiPost({ action: "photo", code, dept, caption: $("#f-caption").value.trim(), mime: "image/jpeg", data });
    }
    $("#f-camera").value = ""; $("#f-photo").value = ""; $("#f-caption").value = ""; photoHint();
    $("#savemsg").textContent = `Saved ${DEPT(dept).label} data for ${code}.`; toast(`Saved ${code}`);
    if (values.enteredBy) { userName = values.enteredBy; store.set("dl_name", userName) }
    await load(true);
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
  const cached = store.get("dl_cache");
  if (cached) { try { applyData(JSON.parse(cached)); loaded = true } catch (e) { } }
  if (!teamKey) return showLogin();
  show("search"); renderList(); load();
})();
