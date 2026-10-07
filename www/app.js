const screens = ["screen-login", "screen-admin-dash", "screen-member-dash"];
function showScreen(id) {
  screens.forEach(s => document.getElementById(s)?.classList.toggle("hidden", s !== id));
}

document.getElementById("btn-login").onclick = () => {
  const u = document.getElementById("login-user").value.trim();
  const p = document.getElementById("login-password").value.trim();
  const err = document.getElementById("login-error");
  err.classList.add("hidden");

  if (u === "adminnn123" && p === "123") {
    showScreen("screen-admin-dash");
  } else if (u === "admin123" && p === "123") {
    showScreen("screen-member-dash");
  } else {
    err.textContent = "Invalid username or password! Use adminnn123/123 or admin123/123";
    err.classList.remove("hidden");
  }
};

window.switchTab = (tab) => {
  ["home", "members", "loan", "recovery"].forEach(t => {
    document.getElementById("nav-" + t)?.classList.remove("active");
    document.getElementById("adm-view-" + t)?.classList.add("hidden");
  });
  document.getElementById("nav-" + tab)?.classList.add("active");
  document.getElementById("adm-view-" + tab)?.classList.remove("hidden");
};
