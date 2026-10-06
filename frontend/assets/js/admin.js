const API = (location.port === "5500" || location.protocol === "file:") ? "http://localhost:5000/api" : "/api";
const token =
  localStorage.getItem("dw_token") || sessionStorage.getItem("dw_token");
if (!token) location.replace("login.html");

const $ = (s) => document.querySelector(s);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const when = (d) =>
  new Date(d).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
const device = (ua = "") => {
  const b = /Edg/.test(ua)
    ? "Edge"
    : /Chrome/.test(ua)
      ? "Chrome"
      : /Firefox/.test(ua)
        ? "Firefox"
        : /Safari/.test(ua)
          ? "Safari"
          : "Browser";
  const o = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac/.test(ua)
          ? "Mac"
          : "";
  return o ? `${b} · ${o}` : b;
};

async function api(path) {
  const res = await fetch(API + path, {
    headers: { Authorization: "Bearer " + token },
  });
  if (res.status === 401) return location.replace("login.html");
  if (res.status === 403) {
    alert("This page is for admins only.");
    return location.replace("index.html");
  }
  if (!res.ok) throw new Error("Server error");
  return res.json();
}

const state = { users: [], logins: [], messages: [] };

// ---------- Tabs ----------
const titles = {
  dashboard: "Dashboard",
  users: "Users",
  logins: "Login records",
  messages: "Messages",
};
document.querySelectorAll("[data-tab]").forEach((btn) =>
  btn.addEventListener("click", () => {
    document
      .querySelectorAll("[data-tab]")
      .forEach((b) => b.classList.toggle("active", b === btn));
    document
      .querySelectorAll(".tab")
      .forEach((t) =>
        t.classList.toggle("active", t.id === "tab-" + btn.dataset.tab),
      );
    $("#page-title").textContent = titles[btn.dataset.tab];
  }),
);
$("#logout").addEventListener("click", () => {
  ["dw_token", "dw_user"].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
  location.href = "index.html";
});

// ---------- Tables ----------
const usersTable = (rows) =>
  rows.length
    ? `<thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Role</th><th>Joined</th></tr></thead><tbody>` +
      rows
        .map(
          (u) =>
            `<tr><td>${u.id}</td><td><b>${esc(u.first_name)} ${esc(u.last_name)}</b></td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td><td>${esc(u.city_name || "—")}</td><td><span class="badge ${u.role === "admin" ? "admin" : "user"}">${esc(u.role)}</span></td><td>${when(u.created_at)}</td></tr>`,
        )
        .join("") +
      "</tbody>"
    : `<tbody><tr><td class="empty">No users found.</td></tr></tbody>`;

const loginsTable = (rows) =>
  rows.length
    ? `<thead><tr><th>Who</th><th>Used</th><th>Result</th><th>IP</th><th>Device</th><th>Time</th></tr></thead><tbody>` +
      rows
        .map(
          (l) =>
            `<tr><td><b>${l.first_name ? esc(l.first_name + " " + l.last_name) : "Unknown"}</b></td><td>${esc(l.identifier)}</td><td><span class="badge ${l.success ? "ok" : "fail"}">${l.success ? "Success" : "Failed"}</span></td><td>${esc(l.ip_address || "—")}</td><td>${esc(device(l.user_agent))}</td><td>${when(l.created_at)}</td></tr>`,
        )
        .join("") +
      "</tbody>"
    : `<tbody><tr><td class="empty">No login records yet.</td></tr></tbody>`;

const matches = (obj, q) =>
  Object.values(obj).join(" ").toLowerCase().includes(q.toLowerCase());

function drawUsers(q = "") {
  const rows = state.users.filter((u) => matches(u, q));
  $("#users-table").innerHTML = usersTable(rows);
  $("#users-count").textContent = rows.length;
}
function drawLogins(q = "") {
  const rows = state.logins.filter((l) => matches(l, q));
  $("#logins-table").innerHTML = loginsTable(rows);
  $("#logins-count").textContent = rows.length;
}
function drawMessages(q = "") {
  const rows = state.messages.filter((m) => matches(m, q));
  $("#messages-count").textContent = rows.length;
  $("#msgs").innerHTML = rows.length ? rows.map((m) => `
    <article class="msg" data-id="${m.id}">
      <div class="msg-head">
        <h3>${esc(m.subject)} <span class="badge ${m.reply ? "ok" : "user"}">${m.reply ? "Replied" : "New"}</span></h3>
        <time>${when(m.created_at)}</time>
      </div>
      <p>${esc(m.message)}</p>
      <small>${esc(m.name)} · ${esc(m.email)}${m.phone ? " · " + esc(m.phone) : ""}</small>
      ${m.reply ? `<div class="reply-box"><b>Your reply · ${when(m.replied_at)}</b><p>${esc(m.reply)}</p></div>` : ""}
      <div class="reply-actions"><button class="btn btn-ghost reply-toggle">${m.reply ? "Reply again" : "Reply"}</button></div>
      <div class="reply-form" hidden>
        <textarea placeholder="Write your reply…"></textarea>
        <button class="btn btn-primary reply-send">Send reply</button>
        <span class="reply-status"></span>
      </div>
    </article>`).join("") : `<div class="panel empty">No messages yet.</div>`;
}

$("#msgs").addEventListener("click", async (e) => {
  const card = e.target.closest(".msg");
  if (!card) return;
  const form = card.querySelector(".reply-form");

  if (e.target.classList.contains("reply-toggle")) { form.hidden = !form.hidden; return; }

  if (e.target.classList.contains("reply-send")) {
    const text = form.querySelector("textarea").value.trim();
    const status = form.querySelector(".reply-status");
    if (!text) { status.textContent = "Write a reply first."; return; }
    e.target.disabled = true; status.textContent = "Sending…";
    try {
      const res = await fetch(API + "/admin/messages/" + card.dataset.id + "/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ reply: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not send reply.");
      state.messages = await api("/admin/messages");
      drawMessages($("#messages-search").value);
      alert(data.message);
    } catch (err) {
      status.textContent = err.message;
      e.target.disabled = false;
    }
  }
});
$("#users-search").addEventListener("input", (e) => drawUsers(e.target.value));
$("#logins-search").addEventListener("input", (e) =>
  drawLogins(e.target.value),
);
$("#messages-search").addEventListener("input", (e) =>
  drawMessages(e.target.value),
);

// ---------- Dashboard ----------
function drawDashboard(s) {
  const cards = [
    ["Total users", s.users, ""],
    ["New today", s.newToday, "green"],
    ["Logins today", s.loginsToday, "gold"],
    ["Failed today", s.failedToday, "red"],
    ["Messages", s.messages, ""],
  ];
  $("#stats").innerHTML = cards
    .map(
      ([l, n, c]) =>
        `<div class="stat ${c}"><div class="n">${n}</div><div class="l">${l}</div></div>`,
    )
    .join("");

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key =
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0");
    const hit = s.days.find((x) => x.d === key) || { ok: 0, fail: 0 };
    days.push({
      label: d.toLocaleDateString("en-GB", { weekday: "short" }),
      ...hit,
    });
  }
  const max = Math.max(1, ...days.map((d) => d.ok + d.fail));
  $("#bars").innerHTML = days
    .map(
      (d) =>
        `<div class="bar-col" title="${d.ok} success, ${d.fail} failed"><div class="bar-stack"><i class="fail" style="height:${(d.fail / max) * 100}%"></i><i class="ok" style="height:${(d.ok / max) * 100}%"></i></div><span>${d.label}</span></div>`,
    )
    .join("");

  $("#new-users").innerHTML =
    state.users
      .slice(0, 5)
      .map(
        (u) =>
          `<li><span class="avatar">${esc(u.first_name.charAt(0).toUpperCase())}</span><div><b>${esc(u.first_name)} ${esc(u.last_name)}</b><small>${esc(u.email)}</small></div></li>`,
      )
      .join("") || "<li class='empty'>No users yet.</li>";
  $("#recent-logins").innerHTML = loginsTable(state.logins.slice(0, 6));
}

// ---------- Start ----------
(async () => {
  try {
    const me = JSON.parse(
      localStorage.getItem("dw_user") ||
        sessionStorage.getItem("dw_user") ||
        "{}",
    );
    $("#me-name").textContent = me.firstName || "Admin";
    $("#me-avatar").textContent = (me.firstName || "A").charAt(0).toUpperCase();

    const [stats, users, logins, messages] = await Promise.all([
      api("/admin/stats"),
      api("/admin/users"),
      api("/admin/logins"),
      api("/admin/messages"),
    ]);
    Object.assign(state, { users, logins, messages });
    drawDashboard(stats);
    drawUsers();
    drawLogins();
    drawMessages();
  } catch (e) {
    const a = $("#alert");
    a.hidden = false;
    a.textContent =
      "Could not load admin data. Is the backend running (npm run dev)?";
  }
})();
