/* ==========================================================================
   DIGITAL HEALTH CARD CONTROLLER (REALTIME FIREBASE USER PROFILE ENGINE)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  let user = window.getCurrentUser ? window.getCurrentUser() : null;

  function renderHealthCard(userObj) {
    if (!userObj) return;

    const cardName = document.getElementById("cardName");
    const cardBlood = document.getElementById("cardBlood");
    const cardEmergencyContactsList = document.getElementById("cardEmergencyContactsList");
    const cardAllergies = document.getElementById("cardAllergies");
    const qrCodeImg = document.getElementById("qrCodeImg");

    if (cardName) cardName.textContent = userObj.name || "Patient";
    if (cardBlood) cardBlood.textContent = userObj.bloodGroup || "B+";
    if (cardAllergies) cardAllergies.textContent = userObj.allergies || "None reported";

    const contacts = userObj.emergencyContacts || [];
    if (cardEmergencyContactsList) {
      if (contacts.length === 0) {
        cardEmergencyContactsList.innerHTML = `<span style="color:var(--text-muted);">No contacts configured</span>`;
      } else {
        cardEmergencyContactsList.innerHTML = contacts.slice(0, 5).map((c, idx) => `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span><strong>${idx + 1}. ${c.name}</strong> (${c.relation || 'Contact'}):</span>
            <span style="color:var(--brand-emerald); font-weight:600;">${c.phone}</span>
          </div>
        `).join('');
      }
    }

    if (qrCodeImg) {
      const contactsStr = contacts.slice(0, 5).map(c => `${c.name}:${c.phone}`).join(', ');
      const qrData = encodeURIComponent(`AarogyaX Card: ${userObj.name} | Blood: ${userObj.bloodGroup} | Emergency Contacts: ${contactsStr}`);
      qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${qrData}`;
    }
  }

  renderHealthCard(user);

  // Live Firebase Realtime Database & Firestore snapshot sync
  const db = window.getFirebaseFirestore();
  const rtdb = window.getFirebaseDatabase();

  if (user && user.uid && user.uid !== "guest_user") {
    if (db) {
      db.collection("users").doc(user.uid).onSnapshot(doc => {
        if (doc.exists) {
          user = { ...user, ...doc.data() };
          renderHealthCard(user);
        }
      }, () => {});
    }

    if (rtdb) {
      rtdb.ref("users/" + user.uid).on("value", snapshot => {
        const val = snapshot.val();
        if (val) {
          user = { ...user, ...val };
          renderHealthCard(user);
        }
      });
    }
  }
});
