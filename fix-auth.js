const fs = require('fs');

// 1. Hide Login Screen on Boot to fix flashing
let html = fs.readFileSync('www/index.html', 'utf8');
html = html.replace('<div id="screen-loading" class="card hidden"', '<div id="screen-loading" class="card"');
html = html.replace('<div id="screen-login" class="card"', '<div id="screen-login" class="card hidden"');
fs.writeFileSync('www/index.html', html);

// 2. Google Debugger & Persistence
let appJs = fs.readFileSync('www/app.js', 'utf8');
appJs = appJs.replace(/document\.getElementById\("btn-google"\)\.onclick = async \(\) => \{[\s\S]*?\}\s*\};\n/, 
`document.getElementById("btn-google").onclick = async () => {
  const err = document.getElementById("login-error"); err.classList.add("hidden");
  try {
    const GoogleAuth = window.Capacitor?.Plugins?.GoogleAuth;
    await GoogleAuth.initialize({ clientId: "409507107740-rfe62bavasn54neat2vic0mjop81p2ks.apps.googleusercontent.com", scopes: ["profile", "email"], grantOfflineAccess: false });
    const gUser = await GoogleAuth.signIn();
    const idToken = gUser?.authentication?.idToken || gUser?.idToken;
    await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  } catch (e) {
    err.innerHTML = "<b>Google Fail:</b> " + (e.message || "Unknown Error") + "<br><b>Code:</b> " + (e.code || e.type || "N/A");
    err.classList.remove("hidden");
    alert("GOOGLE AUTH ERROR:\\n" + JSON.stringify(e));
  }
};
`);
fs.writeFileSync('www/app.js', appJs);
