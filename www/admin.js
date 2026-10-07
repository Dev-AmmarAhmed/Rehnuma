import { db, rtdb } from "./app.js";
import { collection, getDocs, doc, updateDoc, collectionGroup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


  <div class="pro-header">
    <div class="icon-btn" onclick="document.getElementById(\admin-drawer).classList.add(\open); document.getElementById(\admin-drawer-bg).style.display=\block;">☰</div>
    <div class="pro-title"><h1>REHNUMA SOCIETY</h1><p>Administrator Dashboard Pro</p></div>
    <div class="icon-btn" onclick="window.lockAppNow()">🔒</div>
  </div>
  <div id="admin-drawer-bg" class="drawer-bg" onclick="document.getElementById(\admin-drawer).classList.remove(\open); this.style.display=\none;"></div>
  <div id="admin-drawer" class="drawer">
    <div class="drawer-header"><h2 style="margin:0;color:#fff;font-size:16px;">⚙️ Admin Controls</h2><div class="icon-btn" onclick="document.getElementById(\admin-drawer).classList.remove(\open); document.getElementById(\admin-drawer-bg).style.display=\none;">✕</div></div>
    <div class="drawer-item" onclick="document.getElementById(\adm-tab-home).click(); document.getElementById(\admin-drawer-bg).click();">🏠 All Current Loans</div>
    <div class="drawer-item" onclick="document.getElementById(\adm-tab-members).click(); document.getElementById(\admin-drawer-bg).click();">👥 Registered Members</div>
    <div class="drawer-item" style="color:#ef4444; margin-top:auto;" onclick="window.logoutUser()">🚪 Secure Logout</div>
  </div>
  
  <div class="pro-card" style="margin-top:-20px;">
    <div class="tab-bar" style="border-bottom:1px solid rgba(255,255,255,0.1);">
      <button id="adm-tab-home" class="tab-btn active" style="background:var(--primary);color:#fff;border:none;">1. Home (Loans)</button>
      <button id="adm-tab-members" class="tab-btn" style="background:rgba(255,255,255,0.05);color:#fff;border:none;">2. Members</button>
    </div>
    <div id="adm-view-home"><p style="font-size:13px;color:#94a3b8;">Loading current loans...</p></div>
  <div id="adm-view-members" class="hidden"><p style="font-size:13px;color:#94a3b8;">Loading members...</p></div>
  <div id="adm-member-detail" class="hidden"></div>
  <button onclick="window.logoutUser()" class="btn btn-danger" style="margin-top:16px;">Logout Admin</button>`;

const viewHome = document.getElementById("adm-view-home");
const viewMem = document.getElementById("adm-view-members");
const viewDet = document.getElementById("adm-member-detail");

document.getElementById("adm-tab-home").onclick = () => {
  document.getElementById("adm-tab-home").classList.add("active");
  document.getElementById("adm-tab-members").classList.remove("active");
  viewHome.classList.remove("hidden"); viewMem.classList.add("hidden"); viewDet.classList.add("hidden");
  loadAllCurrentLoans();
};

document.getElementById("adm-tab-members").onclick = () => {
  document.getElementById("adm-tab-members").classList.add("active");
  document.getElementById("adm-tab-home").classList.remove("active");
  viewMem.classList.remove("hidden"); viewHome.classList.add("hidden"); viewDet.classList.add("hidden");
  loadAllMembers();
};
let membersCache = {};

export async function loadAllCurrentLoans() {
  viewHome.innerHTML = `<p style="font-size:13px;color:#94a3b8;">Fetching active loans...</p>`;
  try {
    const mSnap = await getDocs(collection(db, "members"));
    membersCache = {};
    mSnap.forEach(d => { membersCache[d.id] = { uid: d.id, ...d.data() }; });

    let html = `<h4 style="margin-bottom:10px;text-align:left;">All Current Loans</h4>`;
    let count = 0;

    for (const uid of Object.keys(membersCache)) {
      const lSnap = await getDocs(collection(db, `members/${uid}/loans`));
      lSnap.forEach(lDoc => {
        const l = lDoc.data();
        count++;
        html += `<div class="list-item">
          <div style="text-align:left;">
            <strong>${membersCache[uid].name || "Member"}</strong>
            <div style="font-size:12px;color:#94a3b8;">EMI: ₹${l.monthlyEmi || 0}/mo • Left: ${l.monthsLeft || 0} mos</div>
          </div>
          <span class="status-badge badge-pending">₹${l.totalAmount || 0}</span>
        </div>`;
      });
    }
    viewHome.innerHTML = count ? html : `<p style="font-size:13px;color:#94a3b8;">No current loans found.</p>`;
  } catch (e) { viewHome.innerHTML = `<p class="error-msg">${e.message}</p>`; }
}

export async function loadAllMembers() {
  viewMem.innerHTML = `<p style="font-size:13px;color:#94a3b8;">Loading member profiles...</p>`;
  try {
    const snap = await getDocs(collection(db, "members"));
    let html = `<h4 style="margin-bottom:10px;text-align:left;">Registered Members</h4>`;
    snap.forEach(d => {
      const m = d.data();
      membersCache[d.id] = { uid: d.id, ...m };
      const st = (m.status || "pending").toUpperCase();
      html += `<div class="list-item" onclick="window.openMemberProfile('${d.id}')">
        <div style="text-align:left;">
          <strong>${m.name || "Unnamed"}</strong>
          <div style="font-size:12px;color:#94a3b8;">${m.phone || m.email || ""}</div>
        </div>
        <span class="status-badge ${st==='REJECTED'?'badge-rejected':'badge-pending'}">${st}</span>
      </div>`;
    });
    viewMem.innerHTML = html;
  } catch (e) { viewMem.innerHTML = `<p class="error-msg">${e.message}</p>`; }
}
window.openMemberProfile = async (uid) => {
  const m = membersCache[uid];
  if (!m) return;
  viewMem.classList.add("hidden");
  viewDet.classList.remove("hidden");

  viewDet.innerHTML = `
    <button id="back-to-mem" class="btn btn-outline" style="margin-bottom:12px;padding:8px;">← Back to Members</button>
    <h4 style="margin-bottom:10px;">${m.name} (${(m.status||'pending').toUpperCase()})</h4>
    <div class="tab-bar">
      <button id="sub-info-btn" class="tab-btn active">a) Info</button>
      <button id="sub-doc-btn" class="tab-btn">b) Documents</button>
    </div>
    <div id="sub-info-view" class="info-grid">
      <div class="info-row"><span>Full Name:</span><strong>${m.name || "-"}</strong></div>
      <div class="info-row"><span>DOB:</span><strong>${m.dob || "-"}</strong></div>
      <div class="info-row"><span>Phone:</span><strong>${m.phone || "-"}</strong></div>
      <div class="info-row"><span>Email:</span><strong>${m.email || "-"}</strong></div>
      <div class="info-row"><span>Address:</span><strong>${m.address || "-"}</strong></div>
      <div class="info-row"><span>Aadhar No:</span><strong>${m.aadharNo || "-"}</strong></div>
      <div class="info-row"><span>PAN No:</span><strong>${m.panNo || "-"}</strong></div>
      <div class="info-row"><span>Monthly Income:</span><strong>₹${m.income || 0}</strong></div>
    </div>
    <div id="sub-doc-view" class="hidden">
      <div id="doc-imgs-box"><p style="font-size:13px;color:#94a3b8;">Loading documents from RTDB...</p></div>
      <div class="btn-row" style="margin-top:14px;">
        <button id="btn-adm-accept" class="btn btn-primary">✓ Accept Member</button>
        <button id="btn-adm-reject" class="btn btn-danger">✕ Reject</button>
      </div>
    </div>`;

  document.getElementById("back-to-mem").onclick = () => {
    viewDet.classList.add("hidden"); viewMem.classList.remove("hidden");
  };
  document.getElementById("sub-info-btn").onclick = () => {
    document.getElementById("sub-info-btn").classList.add("active");
    document.getElementById("sub-doc-btn").classList.remove("active");
    document.getElementById("sub-info-view").classList.remove("hidden");
    document.getElementById("sub-doc-view").classList.add("hidden");
  };
  document.getElementById("sub-doc-btn").onclick = async () => {
    document.getElementById("sub-doc-btn").classList.add("active");
    document.getElementById("sub-info-btn").classList.remove("active");
    document.getElementById("sub-doc-view").classList.remove("hidden");
    document.getElementById("sub-info-view").classList.add("hidden");
    const box = document.getElementById("doc-imgs-box");
    try {
      const snap = await get(ref(rtdb, `member_documents/${uid}`));
      const d = snap.val() || {};
      box.innerHTML = `
        <div class="doc-card"><label>1. Aadhar Card Photo</label><img src="${d.aadharImg || ''}"></div>
        <div class="doc-card"><label>2. PAN Card Photo</label><img src="${d.panImg || ''}"></div>
        <div class="doc-card"><label>3. Address Proof Photo</label><img src="${d.addressImg || ''}"></div>`;
    } catch (e) { box.innerHTML = `<p class="error-msg">Error loading images.</p>`; }
  };

  const setStatus = async (newSt) => {
    await updateDoc(doc(db, "members", uid), { status: newSt });
    alert(`Member status updated to: ${newSt.toUpperCase()}`);
    viewDet.classList.add("hidden"); viewMem.classList.remove("hidden");
    loadAllMembers();
  };
  document.getElementById("btn-adm-accept").onclick = () => setStatus("accepted");
  document.getElementById("btn-adm-reject").onclick = () => setStatus("rejected");
};

// Auto-load loans when Admin Dashboard opens
const obs = new MutationObserver(() => {
  if (!document.getElementById("screen-admin-dash").classList.contains("hidden")) loadAllCurrentLoans();
});
obs.observe(document.getElementById("screen-admin-dash"), { attributes: true, attributeFilter: ["class"] });
