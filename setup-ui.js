const fs = require('fs');
let css = fs.readFileSync('www/style.css', 'utf8');
if (!css.includes('PRO DASHBOARD')) {
  css += `
  /* PRO DASHBOARD STYLES */
  :root { --bg-pro: #0b1120; --card-pro: #151f32; --header-grad: linear-gradient(135deg, #022c22, #065f46, #047857); }
  body { background: var(--bg-pro); padding-bottom: 70px; }
  .pro-header { background: var(--header-grad); padding: 16px 20px 35px; border-bottom-left-radius: 24px; border-bottom-right-radius: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
  .pro-title { text-align: center; }
  .pro-title h1 { margin:0; font-size:17px; color:#fff; font-weight:800; letter-spacing:0.5px; }
  .pro-title p { margin:2px 0 0; font-size:10px; color:#fde047; font-weight:700; text-transform:uppercase; }
  .icon-btn { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; width:38px; height:38px; border-radius:12px; display:flex; justify-content:center; align-items:center; font-size:20px; cursor:pointer; }
  .pro-card { background: var(--card-pro); border-radius: 16px; padding: 20px; margin: -20px 16px 16px; position: relative; box-shadow: 0 8px 24px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); color: #fff; }
  .drawer-bg { position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:999; display:none; }
  .drawer { position:fixed; top:0; left:-300px; bottom:0; width:280px; background:var(--bg-pro); z-index:1000; transition:0.3s ease; border-right:1px solid #1e293b; display:flex; flex-direction:column; }
  .drawer.open { left:0; }
  .drawer-header { padding:24px 20px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; }
  .drawer-item { padding:18px 20px; color:#f8fafc; font-size:14px; font-weight:600; display:flex; align-items:center; gap:14px; border-bottom:1px solid rgba(255,255,255,0.03); cursor:pointer; }
  .drawer-item:hover { background:rgba(255,255,255,0.05); }
  `;
  fs.writeFileSync('www/style.css', css);
}

let memJs = fs.readFileSync('www/member.js', 'utf8');
memJs = memJs.replace(/document\.getElementById\("screen-member-dash"\)\.innerHTML = `[\s\S]*?<div id="mem-tab-home">/, 
`document.getElementById("screen-member-dash").innerHTML = \`
  <div class="pro-header">
    <div class="icon-btn" onclick="document.getElementById('side-drawer').classList.add('open'); document.getElementById('drawer-bg').style.display='block';">☰</div>
    <div class="pro-title"><h1>REHNUMA SOCIETY</h1><p>Administrator Dashboard Pro</p></div>
    <div class="icon-btn" onclick="window.lockAppNow()">🔒</div>
  </div>
  <div id="drawer-bg" class="drawer-bg" onclick="document.getElementById('side-drawer').classList.remove('open'); this.style.display='none';"></div>
  <div id="side-drawer" class="drawer">
    <div class="drawer-header"><h2 style="margin:0;color:#fff;font-size:16px;">⚙️ Control & Settings</h2><div class="icon-btn" onclick="document.getElementById('side-drawer').classList.remove('open'); document.getElementById('drawer-bg').style.display='none';">✕</div></div>
    <div class="drawer-item" onclick="switchMemTab('home'); document.getElementById('drawer-bg').click();">🏠 Dashboard Home</div>
    <div class="drawer-item" onclick="switchMemTab('deposit'); document.getElementById('drawer-bg').click();">📒 Deposit Passbook</div>
    <div class="drawer-item" onclick="switchMemTab('loan'); document.getElementById('drawer-bg').click();">📝 Apply for Loan</div>
    <div class="drawer-item" onclick="switchMemTab('recovery'); document.getElementById('drawer-bg').click();">🔄 Loan Recovery</div>
    <div class="drawer-item" style="color:#ef4444; margin-top:auto;" onclick="window.logoutUser()">🚪 Secure Logout</div>
  </div>
  <div class="pro-card">
    <button id="btn-pay-1000" class="pay-hero-btn" style="margin-bottom:20px;">💳 Pay Monthly Installment</button>
    <div id="mem-tab-home">`);
fs.writeFileSync('www/member.js', memJs);
