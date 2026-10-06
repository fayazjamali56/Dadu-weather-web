const API = (location.port === "5500" || location.protocol === "file:") ? "http://localhost:5000/api" : "/api";

async function postJSON(path, body) {
  try {
    const res = await fetch(API + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: res.ok, data: await res.json().catch(() => ({})) };
  } catch {
    return { ok: false, data: { message: "Cannot reach the server. Start the backend (npm run dev) and try again." } };
  }
}

const formValues = (form) => Object.fromEntries(new FormData(form).entries());

function clearErrors(form) {
  form.querySelectorAll(".form-error").forEach((e) => (e.textContent = ""));
  setStatus(form, "", "");
}
function showErrors(form, errors = {}) {
  for (const k in errors) { const el = form.querySelector("#err-" + k); if (el) el.textContent = errors[k]; }
}
function setStatus(form, msg, type) {
  const el = form.closest(".form-card-body").querySelector("[data-form-status]");
  el.textContent = msg; el.className = "form-status" + (type ? " " + type : "");
}

function handleSubmit(form, path, { check, onSuccess, successMsg }) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors(form);
    const body = formValues(form);
    const local = check ? check(body) : {};
    if (Object.keys(local).length) return showErrors(form, local);

    const btn = form.querySelector("button[type=submit]"); btn.disabled = true;
    const { ok, data } = await postJSON(path, body);
    btn.disabled = false;

    if (!ok) { showErrors(form, data.errors); return setStatus(form, data.message || "Something went wrong.", "error"); }
    setStatus(form, successMsg || data.message, "success");
    onSuccess && onSuccess(data, form, body);
  });
}

function initRegisterForm(form) {
  handleSubmit(form, "/auth/register", {
    check: (b) => {
      const e = {};
      if (!b.firstName.trim()) e.firstName = "Enter your first name.";
      if (!b.lastName.trim()) e.lastName = "Enter your last name.";
      if (!b.email.trim()) e.email = "Enter your email.";
      if (!b.phone.trim()) e.phone = "Enter your phone number.";
      if (b.password.length < 8) e.password = "Use at least 8 characters.";
      if (b.password !== b.confirmPassword) e.confirmPassword = "Passwords do not match.";
      if (!b.city) e.city = "Select your location.";
      return e;
    },
    successMsg: "Account created. Taking you to login…",
    onSuccess: () => setTimeout(() => (location.href = "login.html"), 1200),
  });
}

function initLoginForm(form) {
  handleSubmit(form, "/auth/login", {
    check: (b) => {
      const e = {};
      if (!b.identifier.trim()) e.identifier = "Enter your email or phone.";
      if (!b.password) e.password = "Enter your password.";
      return e;
    },
    successMsg: "Logged in. Taking you home…",
    onSuccess: (data, form, body) => {
      const store = body.remember ? localStorage : sessionStorage;
      store.setItem("dw_token", data.token);
      store.setItem("dw_user", JSON.stringify(data.user));
      setTimeout(() => (location.href = "index.html"), 900);
    },
  });
}

function initContactForm(form) {
  handleSubmit(form, "/contact", {
    check: (b) => {
      const e = {};
      if (!b.name.trim()) e.name = "Enter your name.";
      if (!b.email.trim()) e.email = "Enter your email.";
      if (!b.subject.trim()) e.subject = "Enter a subject.";
      if (!b.message.trim()) e.message = "Write a message.";
      return e;
    },
    onSuccess: (d, form) => form.reset(),
  });
}