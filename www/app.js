const screens = ["screen-loading", "screen-login", "screen-admin-dash", "screen-member-dash"];
function showScreen(id) {
  screens.forEach(s => document.getElementById(s)?.classList.toggle("hidden", s !== id));
}

window.switchTab = (role, tab) => {
  ["home", "members", "loan", "recovery"].forEach(t => {
    document.getElementById(`nav-${role}-${t}`).classList.remove("active");
    document.getElementById(`${role}-view-${t}`).classList.add("hidden");
  });
  document.getElementById(`nav-${role}-${tab}`).classList.add("active");
  document.getElementById(`${role}-view-${tab}`).classList.remove("hidden");
};

document.getElementById("btn-simple-login").onclick = () => {
  const user = document.getElementById("login-user").value.trim();
  const pass = document.getElementById("login-password").value.trim();
  const err = document.getElementById("login-error");
  err.classList.add("hidden");

  if (user === "adminnn123" && pass === "123") {
    localStorage.setItem("rehnuma_session", "admin");
    showScreen("screen-admin-dash");
  } else if (user === "admin123" && pass === "123") {
    localStorage.setItem("rehnuma_session", "member");
    showScreen("screen-member-dash");
  } else {
    err.textContent = "Galat credentials! Admin: adminnn123 / 123 | Member: admin123 / 123";
    err.classList.remove("hidden");
  }
};

window.simpleLogout = () => {
  localStorage.removeItem("rehnuma_session");
  showScreen("screen-login");
};

// Check existing session
window.onload = () => {
  const session = localStorage.getItem("rehnuma_session");
  if (session === "admin") showScreen("screen-admin-dash");
  else if (session === "member") showScreen("screen-member-dash");
  else showScreen("screen-login");
};
