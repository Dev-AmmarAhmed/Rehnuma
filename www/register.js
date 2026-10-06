import { auth, db, rtdb, showScreen } from "./app.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

document.getElementById("screen-register").innerHTML = `
  <h3 style="margin-bottom:10px;">Member Registration</h3>
  <div class="step-indicator">
    <div id="dot-1" class="step-dot active"></div><div id="dot-2" class="step-dot"></div>
    <div id="dot-3" class="step-dot"></div><div id="dot-4" class="step-dot"></div><div id="dot-5" class="step-dot"></div>
  </div>
  <div id="reg-step-1">
    <div class="form-group"><label>Full Name</label><input type="text" id="reg-name"></div>
    <div class="form-group"><label>Date of Birth</label><input type="date" id="reg-dob"></div>
    <div class="form-group"><label>Phone Number</label><input type="tel" id="reg-phone" maxlength="10"></div>
    <div class="form-group"><label>Email</label><input type="email" id="reg-email"></div>
    <div class="form-group"><label>Residential Address</label><textarea id="reg-address" rows="2"></textarea></div>
    <button id="next-1" class="btn btn-primary">Next: Aadhar →</button>
  </div>
  <div id="reg-step-2" class="hidden">
    <div class="form-group"><label>Aadhar Number</label><input type="text" id="reg-aadhar" maxlength="14" placeholder="[Aadhaar Redacted]"></div>
    <div class="form-group"><label>Aadhar Photo</label><input type="file" id="file-aadhar" accept="image/*"><img id="prev-aadhar" class="img-preview hidden"></div>
    <div class="btn-row"><button id="back-2" class="btn btn-outline">← Back</button><button id="next-2" class="btn btn-primary">Next: PAN →</button></div>
  </div>
  <div id="reg-step-3" class="hidden"></div>
  <div id="reg-step-4" class="hidden"></div>
  <div id="reg-step-5" class="hidden"></div>
  <p id="reg-error" class="error-msg hidden"></p>
  <button onclick="window.logoutUser()" class="btn btn-outline" style="margin-top:14px;font-size:12px;">Logout</button>`;
document.getElementById("reg-step-3").innerHTML = `
  <div class="form-group"><label>PAN Number</label><input type="text" id="reg-pan" maxlength="10" style="text-transform:uppercase;"></div>
  <div class="form-group"><label>PAN Photo</label><input type="file" id="file-pan" accept="image/*"><img id="prev-pan" class="img-preview hidden"></div>
  <div class="btn-row"><button id="back-3" class="btn btn-outline">← Back</button><button id="next-3" class="btn btn-primary">Next: Income →</button></div>`;

document.getElementById("reg-step-4").innerHTML = `
  <div class="form-group"><label>Monthly Income (₹)</label><input type="number" id="reg-income"></div>
  <div class="form-group"><label>Address Proof Photo</label><input type="file" id="file-address" accept="image/*"><img id="prev-address" class="img-preview hidden"></div>
  <div class="btn-row"><button id="back-4" class="btn btn-outline">← Back</button><button id="next-4" class="btn btn-primary">Next: Rules →</button></div>`;

document.getElementById("reg-step-5").innerHTML = `
  <div class="rules-box"><strong>📜 Society Rules:</strong><ol style="margin-left:18px;margin-top:6px;">
    <li>₹1000 Monthly Installment</li><li>No Interest (100% Interest-Free)</li></ol></div>
  <div class="form-group" style="display:flex;align-items:center;gap:10px;">
    <input type="checkbox" id="reg-agree" style="width:18px;height:18px;"><label for="reg-agree" style="margin:0;">I Agree to Society Rules</label></div>
  <div class="btn-row"><button id="back-5" class="btn btn-outline">← Back</button><button id="btn-submit-reg" class="btn btn-primary">I Agree & Submit</button></div>`;
const imgs = { aadharImg: "", panImg: "", addressImg: "" };
const showErr = (m) => { const e = document.getElementById("reg-error"); e.textContent = m; e.classList.remove("hidden"); };
const setStep = (s) => {
  document.getElementById("reg-error").classList.add("hidden");
  for (let i = 1; i <= 5; i++) {
    document.getElementById(`reg-step-${i}`).classList.toggle("hidden", i !== s);
    document.getElementById(`dot-${i}`).classList.toggle("active", i <= s);
  }
};

function bindImg(inId, prevId, key) {
  document.getElementById(inId).onchange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas");
        const sc = Math.min(1, 850 / im.width);
        c.width = im.width * sc; c.height = im.height * sc;
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        imgs[key] = c.toDataURL("image/jpeg", 0.65);
        const p = document.getElementById(prevId); p.src = imgs[key]; p.classList.remove("hidden");
      };
      im.src = ev.target.result;
    };
    r.readAsDataURL(f);
  };
}
bindImg("file-aadhar", "prev-aadhar", "aadharImg");
bindImg("file-pan", "prev-pan", "panImg");
bindImg("file-address", "prev-address", "addressImg");

document.getElementById("next-1").onclick = () => {
  if (!document.getElementById("reg-name").value || !document.getElementById("reg-phone").value) return showErr("Fill all Step 1 fields.");
  setStep(2);
};
document.getElementById("back-2").onclick = () => setStep(1);
document.getElementById("next-2").onclick = () => {
  if (!document.getElementById("reg-aadhar").value || !imgs.aadharImg) return showErr("Add Aadhar No & Photo.");
  setStep(3);
};
document.getElementById("back-3").onclick = () => setStep(2);
document.getElementById("next-3").onclick = () => {
  if (!document.getElementById("reg-pan").value || !imgs.panImg) return showErr("Add PAN No & Photo.");
  setStep(4);
};
document.getElementById("back-4").onclick = () => setStep(3);
document.getElementById("next-4").onclick = () => {
  if (!document.getElementById("reg-income").value || !imgs.addressImg) return showErr("Add Income & Address Photo.");
  setStep(5);
};
document.getElementById("back-5").onclick = () => setStep(4);

document.getElementById("btn-submit-reg").onclick = async () => {
  if (!document.getElementById("reg-agree").checked) return showErr("Agree to Society Rules.");
  const u = auth.currentUser; if (!u) return;
  const b = document.getElementById("btn-submit-reg"); b.disabled = true; b.textContent = "Uploading...";
  try {
    await setDoc(doc(db, "members", u.uid), {
      name: document.getElementById("reg-name").value.trim(),
      dob: document.getElementById("reg-dob").value,
      phone: document.getElementById("reg-phone").value.trim(),
      email: document.getElementById("reg-email").value.trim() || u.email || "",
      address: document.getElementById("reg-address").value.trim(),
      aadharNo: document.getElementById("reg-aadhar").value.trim(),
      panNo: document.getElementById("reg-pan").value.trim().toUpperCase(),
      income: Number(document.getElementById("reg-income").value),
      status: "pending", timestamp: serverTimestamp()
    });
    await set(ref(rtdb, `member_documents/${u.uid}`), imgs);
    showScreen("screen-pending");
  } catch (e) { showErr(e.message); }
  finally { b.disabled = false; b.textContent = "I Agree & Submit"; }
};
