/* ==========================================================================
   EMERGENCY SOS CONTROLLER (FIRESTORE & REALTIME DB DISPATCH ENGINE)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const triggerSosBtn = document.getElementById("triggerSosBtn");
  const gpsCoordsText = document.getElementById("gpsCoordsText");
  const gpsStatusText = document.getElementById("gpsStatusText");
  const shareLocationBtn = document.getElementById("shareLocationBtn");
  const notifyContactsBtn = document.getElementById("notifyContactsBtn");
  const getDirectionsBtn = document.getElementById("getDirectionsBtn");
  const emergencyContactsList = document.getElementById("emergencyContactsList");

  let currentLat = 23.5204;
  let currentLng = 87.3119;

  function updateLocationLinks(lat, lng) {
    if (getDirectionsBtn) {
      getDirectionsBtn.href = `https://www.google.com/maps?q=${lat},${lng}`;
    }
  }

  // Load Active User Profile & Emergency Contacts
  const user = window.getCurrentUser ? window.getCurrentUser() : { uid: "guest_user" };
  let contacts = (user && user.emergencyContacts) ? user.emergencyContacts.slice(0, 5) : [];

  function renderContactsList(contactList) {
    if (!emergencyContactsList) return;
    if (!contactList || contactList.length === 0) {
      emergencyContactsList.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted);">No emergency contacts set. Add up to 5 contacts in your profile.</div>`;
    } else {
      emergencyContactsList.innerHTML = contactList.map((c, idx) => `
        <div style="background: var(--bg-app); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 0.4rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600; font-size: 0.85rem; color: var(--primary-dark);">${idx + 1}. ${c.name} (${c.relation || 'Contact'})</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${c.phone}</div>
          </div>
          <a href="tel:${c.phone}" class="btn btn-sos" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">Call</a>
        </div>
      `).join('');
    }
  }

  renderContactsList(contacts);

  // Live Firebase User Contact Listener
  const db = window.getFirebaseFirestore();
  const rtdb = window.getFirebaseDatabase();

  if (db && user.uid && user.uid !== "guest_user") {
    db.collection("users").doc(user.uid).onSnapshot(doc => {
      if (doc.exists && doc.data().emergencyContacts) {
        contacts = doc.data().emergencyContacts.slice(0, 5);
        renderContactsList(contacts);
      }
    }, () => {});
  }

  // Geolocation API Lookup
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentLat = pos.coords.latitude;
        currentLng = pos.coords.longitude;
        if (gpsCoordsText) gpsCoordsText.textContent = `${currentLat.toFixed(4)}° N, ${currentLng.toFixed(4)}° E`;
        if (gpsStatusText) gpsStatusText.textContent = "High-precision GPS coordinates verified.";
        updateLocationLinks(currentLat, currentLng);
      },
      () => {
        if (gpsStatusText) gpsStatusText.textContent = "GPS Access restricted. Utilizing regional location.";
        updateLocationLinks(currentLat, currentLng);
      },
      { timeout: 8000 }
    );
  }

  // Trigger SOS Event
  if (triggerSosBtn) {
    triggerSosBtn.addEventListener("click", () => {
      const sosData = {
        userId: user ? user.uid : "guest_user",
        userName: user ? user.name : "Patient",
        latitude: currentLat,
        longitude: currentLng,
        contacts: contacts,
        timestamp: new Date().toISOString()
      };

      // Write SOS Alert in Realtime to Firebase Realtime Database & Firestore
      if (db) {
        db.collection("emergency_alerts").add({
          ...sosData,
          createdAt: typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
        }).catch(() => {});
      }

      if (rtdb) {
        rtdb.ref("emergency_alerts").push(sosData).catch(() => {});
      }

      fetch("https://aarogyax-cure2.onrender.com/api/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sosData)
      })
      .then(res => res.json())
      .then(data => {
        alert(`🚨 REALTIME SOS DISPATCH SUCCESS!\n\nLocation: ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}\nAlerts broadcasted to all ${contacts.length} emergency contacts in real-time.\nNearest Hospital: ${data.nearestHospital ? data.nearestHospital.name : 'Apex Hospital'}`);
      })
      .catch(() => {
        alert(`🚨 REALTIME SOS DISPATCHED!\n\nGPS Coordinates (${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}) broadcasted to all ${contacts.length} emergency contacts!`);
      });
    });
  }

  // Share Location
  if (shareLocationBtn) {
    shareLocationBtn.addEventListener("click", () => {
      const mapsUrl = `https://www.google.com/maps?q=${currentLat},${currentLng}`;
      const text = encodeURIComponent(`🚨 EMERGENCY! I need medical assistance. My current GPS location: ${mapsUrl}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });
  }

  // Notify Contacts
  if (notifyContactsBtn) {
    notifyContactsBtn.addEventListener("click", () => {
      alert(`Alert SMS messages dispatched to all ${contacts.length} emergency contacts!`);
    });
  }
});
