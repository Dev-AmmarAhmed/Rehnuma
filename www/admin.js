import { db, rtdb } from "./app.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.getElementById("screen-admin-dash").innerHTML = `
  <div class="pro-header">
    <div class="pro-title"><h1>REHNUMA SOCIETY</h1><p>Admin Dashboard</p></div>
    <div class="icon-btn" onclick="window.logoutUser()">🚪</div>
  </div>
  
  <div class="pro-card main-content" style="margin-top:-20px; border-radius:16px 16px 0 0; min-height:80vh;">
    <!-- HOME TAB (BLANK) -->
    <div id="adm-view-home">
      <h3 style="color:#fff; text-align:center; margin-top:40px;">Home</h3>
      <p style="color:#94a3b8; text-align:center; font-size:13px;">Dashboard Overview</p>
    </div>
    
    <!-- MEMBERS TAB -->
    <div id="adm-view-members" class="hidden">
      <h3 style="color:#fff; margin-bottom:15px;">Registered Members</h3>
      <div id="members-list"><p style="font-size:13px;color:#94a3b8;">Loading members...</p></div>
    </div>
    
    <!-- LOAN TAB -->
    <div id="adm-view-loan" class="hidden">
      <h3 style="color:#fff; text-align:center; margin-top:40px;">Loan Management</h3>
    </div>
    
    <!-- RECOVERY TAB -->
    <div id="adm-view-recovery" class="hidden">
      <h3 style="color:#fff; text-align:center; margin-top:40px;">Loan Recovery</h3>
    </div>
  </div>

  <!-- BOTTOM NAVIGATION -->
  <div class="bottom-nav">
    <div class="nav-item active" id="nav-home" onclick="window.switchAdmNav(\home)">
      <span class="nav-icon">🏠</span><span>Home</span>
    </div>
    <div class="nav-item" id="nav-members" onclick="window.switchAdmNav(\members)">
      <span class="nav-icon">👥</span><span>Members</span>
    </div>
    <div class="nav-item" id="nav-loan" onclick="window.switchAdmNav(\loan)">
      <span class="nav-icon">💸</span><span>Loan</span>
    </div>
    <div class="nav-item" id="nav-recovery" onclick="window.switchAdmNav(\recovery)">
      <span class="nav-icon">🔄</span><span>Recovery</span>
    </div>
  </div>
`;

window.switchAdmNav = (tab) => {
  ["home", "members", "loan", "recovery"].forEach(t => {
    document.getElementById("nav-" + t).classList.remove("active");
    document.getElementById("adm-view-" + t).classList.add("hidden");
  });
  document.getElementById("nav-" + tab).classList.add("active");
  document.getElementById("adm-view-" + tab).classList.remove("hidden");
  
  if(tab === "members") loadAllMembers();
};

async function loadAllMembers() {
  const box = document.getElementById("members-list");
  box.innerHTML = `<p style="font-size:13px;color:#94a3b8;">Loading...</p>`;
  try {
    const snap = await getDocs(collection(db, "members"));
    let html = "";
    snap.forEach(d => {
      const m = d.data();
      const st = (m.status || "pending").toUpperCase();
      html += `<div class="list-item" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;margin-bottom:10px;">
        <div style="text-align:left;">
          <strong>${m.name || "Unnamed"}</strong>
          <div style="font-size:12px;color:#94a3b8;">${m.phone || m.email || ""}</div>
        </div>
        <span class="status-badge ${st===\REJECTED ? \badge-rejected : \badge-pending}">${st}</span>
      </div>`;
    });
    box.innerHTML = html || `<p style="font-size:13px;color:#94a3b8;">No members found.</p>`;
  } catch (e) { box.innerHTML = `<p class="error-msg">${e.message}</p>`; }
}
