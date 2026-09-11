function switchTab(which) {
  document.getElementById("login-form").classList.toggle("hidden", which !== "login");
  document.getElementById("signup-form").classList.toggle("hidden", which !== "signup");
  document.getElementById("tab-login").classList.toggle("active", which === "login");
  document.getElementById("tab-signup").classList.toggle("active", which === "signup");
  setMsg("");
}

function setMsg(text, type = "") {
  const el = document.getElementById("msg");
  el.textContent = text;
  el.className = "msg " + type;
}

async function signup(e) {
  e.preventDefault();
  const f = e.target;
  const body = {
    username: f.username.value,
    email: f.email.value,
    password: f.password.value,
  };
  const res = await fetch("/api/users/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return setMsg(data.detail || "Signup failed", "error");
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
  setMsg("Account created! Redirecting…", "ok");
  setTimeout(() => (location.href = "/dashboard"), 700);
}

async function login(e) {
  e.preventDefault();
  const f = e.target;
  const body = new URLSearchParams({
    username: f.username.value,
    password: f.password.value,
  });
  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (!res.ok) return setMsg(data.detail || "Login failed", "error");
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
  setMsg("Welcome back! Redirecting…", "ok");
  setTimeout(() => (location.href = "/dashboard"), 500);
}