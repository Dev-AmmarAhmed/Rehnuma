import { auth, db } from "./app.js";
import { doc, getDoc, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("screen-member-dash").innerHTML = `
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
    <div id="mem-tab-home">
    <div class="rules-box">
      <strong>🌟 Welcome to Rehnuma Society</strong>
      <p style="font-size:12px;color:var(--subtext);margin-top:4px;">Under management MDBTW Association • 100% Interest-Free Society.</p>
      <div id="home-summary" style="margin-top:10px;font-size:13px;font-weight:600;">Loading account summary...</div>
    </div>
  </div>

  <div id="mem-tab-deposit" class="hidden">
    <h4 style="text-align:left;margin-bottom:6px;">Deposit Passbook</h4>
    <table class="data-table">
      <thead><tr><th>Month</th><th>Installment</th><th>Deposit</th></tr></thead>
      <tbody id="deposit-tbody"></tbody>
    </table>
  </div>

  <div id="mem-tab-loan" class="hidden">
    <h4 style="text-align:left;margin-bottom:10px;">Apply for Interest-Free Loan</h4>
    <div class="form-group"><label>Loan Amount Required (₹)</label><input type="number" id="loan-amount" placeholder="e.g. 10000"></div>
    <div class="form-group"><label>Duration (Months)</label><input type="number" id="loan-months" placeholder="e.g. 10"></div>
    <div class="form-group"><label>Purpose / Reason</label><input type="text" id="loan-reason" placeholder="Medical, Education, Business, etc."></div>
    <button id="btn-apply-loan" class="btn btn-primary">Submit Loan Application</button>
  </div>

  <div id="mem-tab-recovery" class="hidden">
    <h4 style="text-align:left;margin-bottom:8px;">Loan Recovery Status</h4>
    <div id="recovery-list"></div>
  </div>

  <div class="bottom-nav">
    <button id="nav-home" class="nav-item

cat << 'EOF' >> www/member.js
const tabs = ["home", "deposit", "loan", "recovery"];
function switchMemTab(active) {
  tabs.forEach(t => {
    document.getElementById(`mem-tab-${t}`).classList.toggle("hidden", t !== active);
    document.getElementById(`nav-${t}`).classList.toggle("active", t === active);
  });
  if (active === "deposit" || active === "home") loadMemberDeposits();
  if (active === "recovery") loadRecoveryDetails();
}

tabs.forEach(t => {
  document.getElementById(`nav-${t}`).onclick = () => switchMemTab(t);
});

async function loadMemberProfile() {
  const u = auth.currentUser; if (!u) return;
  const mId = "M-" + u.uid.substring(0, 6).toUpperCase();
  document.getElementById("mem-disp-id").textContent = `M ID: ${mId}`;
  const snap = await getDoc(doc(db, "members", u.uid));
  if (snap.exists()) {
    document.getElementById("mem-disp-name").textContent = snap.data().name || "Member";
  }
  loadMemberDeposits();
}

async function loadMemberDeposits() {
  const u = auth.currentUser; if (!u) return;
  const tbody = document.getElementById("deposit-tbody");
  tbody.innerHTML = `<tr><td colspan="3">Loading...</td></tr>`;
  try {
    const q = query(collection(db, `members/${u.uid}/deposits`), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    let cumulative = 0;
    let rows = "";
    snap.forEach(d => {
      const item = d.data();
      const inst = Number(item.installment || 1000);
      cumulative += inst;
      rows += `<tr><td><strong>${item.month}</strong></td><td>₹${inst}</td><td style="color:var(--primary);font-weight:700;">₹${cumulative}</td></tr>`;
    });
    tbody.innerHTML = rows || `<tr><td colspan="3" style="text-align:center;color:var(--subtext);">No deposits yet. Click Pay ₹1000 above.</td></tr>`;
    document.getElementById("home-summary").innerHTML = `Total Saved Deposit: <span style="color:var(--primary);">₹${cumulative}</span> (${snap.size} Installments)`;
  } catch (e) { tbody.innerHTML = `<tr><td colspan="3">${e.message}</td></tr>`; }
}
document.getElementById("btn-pay-1000").onclick = async () => {
  const u = auth.currentUser; if (!u) return;
  const monthStr = new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
  const btn = document.getElementById("btn-pay-1000");
  btn.disabled = true; btn.textContent = "Processing ₹1000...";
  try {
    await addDoc(collection(db, `members/${u.uid}/deposits`), {
      month: monthStr,
      installment: 1000,
      createdAt: serverTimestamp()
    });
    alert(`✅ ₹1000 Monthly Installment recorded for ${monthStr}!`);
    switchMemTab("deposit");
  } catch (e) { alert("Payment Error: " + e.message); }
  finally { btn.disabled = false; btn.textContent = "💳 Monthly installment pay ₹1000"; }
};

document.getElementById("btn-apply-loan").onclick = async () => {
  const u = auth.currentUser; if (!u) return;
  const total = Number(document.getElementById("loan-amount").value);
  const mos = Number(document.getElementById("loan-months").value);
  const reason = document.getElementById("loan-reason").value.trim();
  if (!total || !mos || !reason) return alert("Please fill all loan form fields.");
  const emi = Math.ceil(total / mos);
  try {
    await addDoc(collection(db, `members/${u.uid}/loans`), {
      totalAmount: total,
      monthlyEmi: emi,
      monthsLeft: mos,
      reason: reason,
      status: "active",
      createdAt: serverTimestamp()
    });
    alert("✅ Interest-Free Loan Application Submitted!");
    document.getElementById("loan-amount").value = "";
    document.getElementById("loan-months").value = "";
    document.getElementById("loan-reason").value = "";
    switchMemTab("recovery");
  } catch (e) { alert(e.message); }
};

async function loadRecoveryDetails() {
  const box = document.getElementById("recovery-list");
  box.innerHTML = `<p style="font-size:13px;color:var(--subtext);">Loading active loans & recovery...</p>`;
  try {
    const mSnap = await getDocs(collection(db, "members"));
    let html = "";
    for (const mDoc of mSnap.docs) {
      const mData = mDoc.data();
      const lSnap = await getDocs(collection(db, `members/${mDoc.id}/loans`));
      lSnap.forEach(lDoc => {
        const l = lDoc.data();
        html += `<div class="list-item">
          <div style="text-align:left;">
            <strong>${mData.name || "Member"}</strong>
            <div style="font-size:12px;color:var(--subtext);">Total Loan: ₹${l.totalAmount} • Kisht: ₹${l.monthlyEmi}/mo</div>
          </div>
          <span class="status-badge badge-pending">${l.monthsLeft} Mos Left</span>
        </div>`;
      });
    }
    box.innerHTML = html || `<p style="font-size:13px;color:var(--subtext);">No active loan recovery records found.</p>`;
  } catch (e) { box.innerHTML = `<p class="error-msg">${e.message}</p>`; }
}

const memObs = new MutationObserver(() => {
  if (!document.getElementById("screen-member-dash").classList.contains("hidden")) loadMemberProfile();
});
memObs.observe(document.getElementById("screen-member-dash"), { attributes: true, attributeFilter: ["class"] });
