const token = localStorage.getItem("token");
if (!token) location.href = "/";

const user = JSON.parse(localStorage.getItem("user") || "{}");
document.getElementById("uname").textContent = user.username || "user";

let filter = "all";
const inputEl = document.getElementById("title");

async function api(path, opts = {}) {
  opts.headers = Object.assign(
    { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    opts.headers || {}
  );
  const res = await fetch("/api" + path, opts);
  if (res.status === 401) { logout(); return null; }
  if (res.status === 204) return null;
  return res.json();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function loadTasks() {
  let q = "?completed=false";
  if (filter === "completed") q = "?completed=true";

  const tasks = await api("/tasks/" + q);
  if (!tasks) return;

  const box = document.getElementById("tasks");

  if (!tasks.length) {
    const label = filter === "completed"
      ? "No completed tasks yet."
      : "No tasks yet — add one on the left ✏️";
    box.innerHTML = `<div class="empty">${label}</div>`;
    return;
  }

  box.innerHTML = tasks.map(t => `
    <div class="task ${t.completed ? "done" : ""}">
      <button class="check-btn"
              onclick="toggleTask(${t.id}, ${!t.completed})"
              title="${t.completed ? "Mark as active" : "Mark as complete"}">
        ✓
      </button>
      <div class="body">
        <div class="title">${escapeHtml(t.title)}</div>
        ${t.description ? `<div class="desc">${escapeHtml(t.description)}</div>` : ""}
      </div>
      <button class="delete-btn" onclick="deleteTask(${t.id})" title="Delete">🗑️</button>
    </div>
  `).join("");
}
async function addTask() {
  const title = inputEl.value.trim();
  if (!title) { inputEl.focus(); return; }

  await api("/tasks/", { method: "POST", body: JSON.stringify({ title }) });
  inputEl.value = "";
  inputEl.focus();

  if (filter !== "all") setFilter("all");
  else loadTasks();
}

async function toggleTask(id, completed) {
  await api("/tasks/" + id, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });
  loadTasks();
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  await api("/tasks/" + id, { method: "DELETE" });
  loadTasks();
}

function setFilter(f) {
  filter = f;
  document.querySelectorAll(".filter button").forEach(b =>
    b.classList.toggle("active", b.dataset.f === f)
  );
  loadTasks();
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  location.href = "/";
}

// Enter key adds the task
inputEl.addEventListener("keydown", e => {
  if (e.key === "Enter") addTask();
});

// Initial load
loadTasks();