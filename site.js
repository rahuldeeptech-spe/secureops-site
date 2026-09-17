const BANDS = {
  "web-vapt-basic": { title: "Basic Web App VAPT", band: "₹25,000–75,000", mid: 50000 },
  "web-vapt-full": { title: "Full Web App VAPT + report", band: "₹75,000–2,00,000", mid: 120000 },
  "network-vapt": { title: "Network VAPT (SME)", band: "₹50,000–1,50,000", mid: 90000 },
  "android": { title: "Android App Security Review", band: "₹40,000–1,00,000", mid: 70000 },
  "cloud": { title: "Cloud Config Review", band: "₹50,000–1,50,000", mid: 90000 },
  "hardening": { title: "Hardening / Config Audit", band: "₹30,000–1,00,000", mid: 60000 },
  "training": { title: "Security Training (half-day)", band: "₹25,000–75,000", mid: 40000 },
  "osint": { title: "Public OSINT / brand-impersonation brief", band: "₹25,000–1,00,000", mid: 50000 }
};

const contact = {
  public_url: "",
  x_handle: "",
  instagram: ""
};

function inr(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function payload() {
  const fd = new FormData(document.getElementById("leadForm"));
  const service = fd.get("service_key");
  const band = BANDS[service] || BANDS["web-vapt-basic"];
  return {
    company: (fd.get("company") || "").trim(),
    contact_name: (fd.get("contact_name") || "").trim(),
    email: (fd.get("email") || "").trim(),
    whatsapp: (fd.get("whatsapp") || "").trim(),
    service_key: service,
    service: band.title,
    band: band.band,
    amount: band.mid,
    scope: (fd.get("scope") || "").trim(),
    notes: (fd.get("notes") || "").trim(),
    owns_assets: fd.get("owns_assets") === "on",
    source: fd.get("source") || "landing",
    created: new Date().toISOString()
  };
}

function renderDocket() {
  const p = payload();
  const el = document.getElementById("docket");
  if (!el) return;
  el.innerHTML =
    "COMPANY  " + (p.company || "—") + "<br>" +
    "ASSET    " + (p.scope || "—") + "<br>" +
    "SERVICE  " + (p.service || "—") + "<br>" +
    "BAND     " + (p.band || "—") + "<br>" +
    "MID      " + inr(p.amount || 0) + "<br>" +
    "ADVANCE  " + inr((p.amount || 0) / 2) + " (50%)<br>" +
    "OWNED    " + (p.owns_assets ? "YES — client warrant" : "NO — blocked") + "<br>" +
    "STATUS   waiting for signed AUTH + RoE";
}

function showMsg(text, ok) {
  const el = document.getElementById("formMsg");
  el.textContent = text;
  el.className = ok ? "ok" : "bad";
}

function downloadLead(p) {
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "secureops-lead.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

async function submitLead(ev) {
  ev.preventDefault();
  const p = payload();
  if (!p.company || !p.scope || !p.email) {
    showMsg("Company, owned URL/IP, and email are required.", false);
    return;
  }
  if (!p.owns_assets) {
    showMsg("Blocked: tick the ownership box. We do not test third-party systems.", false);
    return;
  }
  downloadLead(p);
  let posted = false;
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p)
    });
    if (res.ok) posted = true;
  } catch (_) {
    posted = false;
  }
  if (posted) {
    showMsg("Challan saved on the desk. JSON also downloaded. DM that file on X / LinkedIn / Instagram — do not post it publicly.", true);
  } else {
    showMsg("JSON downloaded. DM that file on the same social app. Phone and email are not on this page.", true);
  }
}

function applyContact(c) {
  Object.assign(contact, c || {});
  const x = document.getElementById("pubX");
  const ig = document.getElementById("pubIg");
  if (x) x.textContent = c.x_handle ? "@" + c.x_handle.replace(/^@/, "") : "this account";
  if (ig) ig.textContent = c.instagram ? "@" + c.instagram.replace(/^@/, "") : "this account";
}

async function boot() {
  document.getElementById("leadForm").addEventListener("input", renderDocket);
  document.getElementById("leadForm").addEventListener("submit", submitLead);
  renderDocket();
  try {
    const bands = await fetch("/api/bands").then((r) => (r.ok ? r.json() : null));
    if (bands) {
      for (const [k, v] of Object.entries(bands)) {
        BANDS[k] = { title: v.title, band: "₹" + v.band.replace(/-/g, "–"), mid: v.mid };
      }
    }
  } catch (_) {}
  try {
    const c = await fetch("/api/contact").then((r) => (r.ok ? r.json() : null));
    if (c) applyContact(c);
    else {
      const raw = await fetch("contact.json").then((r) => (r.ok ? r.json() : null));
      if (raw) applyContact(raw);
    }
  } catch (_) {
    try {
      const raw = await fetch("contact.json").then((r) => (r.ok ? r.json() : null));
      if (raw) applyContact(raw);
    } catch (__) {}
  }
}

document.addEventListener("DOMContentLoaded", boot);
