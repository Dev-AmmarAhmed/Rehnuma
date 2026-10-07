document.getElementById("app-lock-screen").innerHTML = `
  <div class="container"><div class="card" style="text-align:center;">
    <div class="brand-header"><h1>🔒 App Locked</h1><p>Rehnuma Society Security</p></div>
    <div class="form-group"><label style="text-align:center;">Enter 6-Digit Security PIN</label>
      <input type="password" id="unlock-pin-input" class="pin-input" maxlength="6" inputmode="numeric" placeholder="••••••">
    </div>
    <p id="lock-error" class="error-msg hidden"></p>
    <button id="btn-unlock-pin" class="btn btn-primary">Unlock with PIN</button>
    <button id="btn-unlock-bio" class="btn btn-outline">👆 Use Fingerprint / Biometric</button>
    <button id="btn-lock-logout" class="btn btn-outline" style="margin-top:14px;font-size:12px;">Logout</button>
  </div></div>`;

document.getElementById("screen-login").innerHTML = `
  <div class="form-group"><label>Email Address</label><input type="email" id="login-email" placeholder="member@example.com"></div>
  <div class="form-group"><label>Password</label><input type="password" id="login-password" placeholder="Enter password"></div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px;">
    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
      <input type="checkbox" id="toggle-pw" style="width:15px;height:15px;"> Show Password
    </label>
    <a href="#" id="btn-forgot-pw" style="color:var(--primary);text-decoration:none;font-weight:700;">Forgot Password?</a>
  </div>
  <p id="login-error" class="error-msg hidden"></p>
  <button id="btn-login" class="btn btn-primary">Sign In / Register</button>
  <div class="divider">— OR —</div>
  <button id="btn-google" class="btn btn-outline">🌐 Login with Google</button>`;
document.getElementById("screen-pending").innerHTML = `
  <div class="status-box"><span class="status-badge badge-pending">STATUS: PENDING</span>
  <h3>Registration Request Submitted</h3>
  <p style="color:var(--subtext);font-size:14px;margin-top:8px;">Registration request submitted. Please wait and Contact Admin.</p>
  <button onclick="window.logoutUser()" class="btn btn-outline" style="margin-top:20px;">Logout</button></div>`;

document.getElementById("screen-rejected").innerHTML = `
  <div class="status-box"><span class="status-badge badge-rejected">STATUS: REJECTED</span>
  <h3>Request Rejected</h3>
  <p style="color:var(--subtext);font-size:14px;margin-top:8px;">Request Rejected. Contact Admin.</p>
  <button onclick="window.logoutUser()" class="btn btn-outline" style="margin-top:20px;">Logout</button></div>`;

document.getElementById("screen-setup").innerHTML = `
  <h3 style="color:var(--primary);margin-bottom:6px;">Account Accepted! 🎉</h3>
  <div class="form-group"><label>Set Strong Password</label><input type="password" id="setup-password" placeholder="Min 8 chars">
  <div class="rule-hint">1 Capital, 1 Small, 1 Number, 1 Special (@/$_&-?!;')</div></div>
  <div class="form-group"><label>Create 6-Digit PIN</label><input type="password" id="setup-pin" class="pin-input" maxlength="6" inputmode="numeric" placeholder="••••••"></div>
  <div class="form-group" style="display:flex;align-items:center;gap:10px;"><input type="checkbox" id="setup-bio" checked style="width:18px;height:18px;"><label for="setup-bio" style="margin:0;">Enable Fingerprint</label></div>
  <p id="setup-error" class="error-msg hidden"></p>
  <button id="btn-complete-setup" class="btn btn-primary">Activate Account</button>`;
