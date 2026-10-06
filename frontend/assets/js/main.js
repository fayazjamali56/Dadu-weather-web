document.querySelectorAll("[data-year]").forEach(e => e.textContent = new Date().getFullYear());

const burger = document.querySelector(".hamburger"), menu = document.querySelector(".mobile-menu");
if (burger && menu) burger.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

const citySelect = document.getElementById("city");
if (citySelect && typeof LOCATIONS !== "undefined")
  citySelect.innerHTML = '<option value="">Select your location</option>' +
    LOCATIONS.map(l => `<option value="${l.slug}">${l.name}</option>`).join("");

    // Login hone ke baad: Register/Login hatao, naam + Logout dikhao
(function () {
  const get = (k) => localStorage.getItem(k) || sessionStorage.getItem(k);
  const token = get("dw_token");
  if (!token) return;

  let user = {};
  try { user = JSON.parse(get("dw_user") || "{}"); } catch (_) {}
  const name = user.firstName || "Account";

  // Login/Register page par logged-in user ko home bhej do
  if (/(login|register)\.html$/.test(location.pathname)) {
    location.replace("index.html");
    return;
  }

     // Desktop menu
  const actions = document.querySelector(".nav-actions");
  if (actions) {
    actions.textContent = "";
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = name.charAt(0).toUpperCase();
    avatar.title = (user.firstName || "") + " " + (user.lastName || "");
    const out = document.createElement("button");
    out.className = "btn btn-ghost";
    out.id = "logout-btn";
    out.textContent = "Logout";

    if (user.role === "admin") {
      const adm = document.createElement("a");
      adm.href = "admin.html";
      adm.className = "btn btn-ghost";
      adm.textContent = "Admin";
      actions.append(adm);
    }

    actions.append(avatar, out);
  }

  // Mobile menu
  const menu = document.querySelector(".mobile-menu");
  if (menu) {
    menu.querySelectorAll('a[href="register.html"], a[href="login.html"]').forEach((a) => a.remove());
    const link = document.createElement("a");
    link.href = "#";
    link.id = "logout-link";
    link.textContent = "Logout (" + name + ")";
    menu.appendChild(link);
  }

  // Logout click
  document.querySelectorAll("#logout-btn, #logout-link").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      ["dw_token", "dw_user"].forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
      location.href = "index.html";
    })
  );
})();