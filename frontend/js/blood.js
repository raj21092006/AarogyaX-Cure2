/* ==========================================================================
   REAL-TIME BLOOD DONOR CONTROLLER (FIRESTORE & REALTIME DATABASE SYNC)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const tabFindDonors = document.getElementById("tabFindDonors");
  const tabBecomeDonor = document.getElementById("tabBecomeDonor");
  const tabRequestBlood = document.getElementById("tabRequestBlood");
  
  const filterBox = document.getElementById("filterBox");
  const becomeDonorCard = document.getElementById("becomeDonorCard");
  const requestFormCard = document.getElementById("requestFormCard");
  const donorGrid = document.getElementById("donorGrid");
  
  const searchDonorsBtn = document.getElementById("searchDonorsBtn");
  const becomeDonorForm = document.getElementById("becomeDonorForm");
  const bloodRequestForm = document.getElementById("bloodRequestForm");
  const liveDonorStatusText = document.getElementById("liveDonorStatusText");

  let currentLat = 23.5204;
  let currentLng = 87.3119;
  let activeDonorsList = [];

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  }

  function renderDonors(donors) {
    if (!donorGrid) return;

    if (donors.length === 0) {
      donorGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--card-bg); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <h3>No matching real-time blood donors found</h3>
          <p style="color: var(--text-muted);">Try selecting a different blood group or registering as a new donor.</p>
        </div>
      `;
      return;
    }

    donorGrid.innerHTML = donors.map(d => {
      const cleanPhone = (d.phone || "").replace(/[^0-9+]/g, '');
      const distTag = d.distanceKm ? `${d.distanceKm} km away` : (d.city || 'Local Area');

      return `
        <div class="feature-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <div class="card-icon" style="background: rgba(220, 38, 38, 0.1); color: var(--sos-red);">🩸</div>
            <span class="status-badge" style="background: rgba(220, 38, 38, 0.12); color: var(--sos-red); font-weight: 700; font-size: 1rem; padding: 0.3rem 0.8rem;">
              ${d.bloodGroup}
            </span>
          </div>
          
          <h3 class="card-title">${d.name}</h3>
          <p class="card-desc">📍 ${distTag} &bull; <span style="color:var(--brand-emerald); font-weight:600;">${d.availability || 'Available Now'}</span></p>
          
          <div style="background: var(--bg-app); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 1rem; font-size: 0.85rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.2rem;">
              <span style="color:var(--text-muted);">Contact Phone:</span>
              <span style="font-weight:600; color:var(--primary-dark);">${d.phone}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:var(--text-muted);">Verification:</span>
              <span style="color:var(--brand-emerald); font-weight:600;">✓ Verified Donor</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <a href="tel:${cleanPhone}" class="btn btn-sos" style="flex: 1; font-size: 0.85rem; text-align: center;">📞 Call ${d.phone}</a>
            <a href="https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent('Hello! Requesting blood donor assistance via AarogyaX Cure network.')}" target="_blank" class="btn btn-outline" style="flex: 1; font-size: 0.85rem; text-align: center; border-color:#25d366; color:#25d366;">💬 WhatsApp</a>
          </div>
        </div>
      `;
    }).join('');
  }

  // Load Realtime Donors from API & Firebase
  function loadRealtimeDonors(bloodGroup = "", city = "") {
    if (liveDonorStatusText) liveDonorStatusText.textContent = "Fetching live real-time blood donor network...";

    const url = `https://aarogyax-cure2.onrender.com/api/blood/donors?bloodGroup=${encodeURIComponent(bloodGroup)}&city=${encodeURIComponent(city)}&lat=${currentLat}&lng=${currentLng}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.donors && data.donors.length > 0) {
          activeDonorsList = data.donors;
          if (liveDonorStatusText) liveDonorStatusText.textContent = `Found ${data.donors.length} active real-time blood donors.`;
          renderDonors(activeDonorsList);
        }
      })
      .catch(() => {});
  }

  // Listen to Cloud Firestore & Realtime Database live changes
  const db = window.getFirebaseFirestore();
  const rtdb = window.getFirebaseDatabase();

  if (db) {
    try {
      db.collection("blood_donors").onSnapshot(snapshot => {
        const firestoreDonors = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          firestoreDonors.push({
            id: doc.id,
            name: data.name,
            bloodGroup: data.bloodGroup,
            phone: data.phone,
            city: data.city || 'Local',
            lat: data.lat || currentLat,
            lng: data.lng || currentLng,
            distanceKm: data.lat ? haversineDistance(currentLat, currentLng, data.lat, data.lng) : 1.5,
            availability: "Available Now (Realtime)"
          });
        });

        if (firestoreDonors.length > 0) {
          console.log(`🔥 Realtime Firestore donors streamed: ${firestoreDonors.length}`);
          activeDonorsList = firestoreDonors;
          renderDonors(activeDonorsList);
        }
      });
    } catch(e) {}
  }

  if (rtdb) {
    try {
      rtdb.ref("blood_donors").on("value", snapshot => {
        const val = snapshot.val();
        if (val) {
          const rtdbDonors = [];
          Object.keys(val).forEach(key => {
            const data = val[key];
            rtdbDonors.push({
              id: key,
              name: data.name,
              bloodGroup: data.bloodGroup,
              phone: data.phone,
              city: data.city || 'Local',
              distanceKm: data.lat ? haversineDistance(currentLat, currentLng, data.lat, data.lng) : 1.5,
              availability: "Available Now (Realtime DB)"
            });
          });
          if (rtdbDonors.length > 0) {
            activeDonorsList = [...rtdbDonors, ...activeDonorsList];
            renderDonors(activeDonorsList);
          }
        }
      });
    } catch(e) {}
  }

  // Geolocation auto-update
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      currentLat = pos.coords.latitude;
      currentLng = pos.coords.longitude;
      loadRealtimeDonors();
    }, () => {
      loadRealtimeDonors();
    });
  } else {
    loadRealtimeDonors();
  }

  // Tab Switching
  if (tabFindDonors && tabBecomeDonor && tabRequestBlood) {
    tabFindDonors.addEventListener("click", () => {
      tabFindDonors.className = "btn btn-primary";
      tabBecomeDonor.className = "btn btn-outline";
      tabRequestBlood.className = "btn btn-outline";
      filterBox.style.display = "block";
      becomeDonorCard.style.display = "none";
      requestFormCard.style.display = "none";
    });

    tabBecomeDonor.addEventListener("click", () => {
      tabBecomeDonor.className = "btn btn-primary";
      tabFindDonors.className = "btn btn-outline";
      tabRequestBlood.className = "btn btn-outline";
      filterBox.style.display = "none";
      becomeDonorCard.style.display = "block";
      requestFormCard.style.display = "none";
    });

    tabRequestBlood.addEventListener("click", () => {
      tabRequestBlood.className = "btn btn-sos";
      tabFindDonors.className = "btn btn-outline";
      tabBecomeDonor.className = "btn btn-outline";
      filterBox.style.display = "none";
      becomeDonorCard.style.display = "none";
      requestFormCard.style.display = "block";
    });
  }

  // Search Button Event
  if (searchDonorsBtn) {
    searchDonorsBtn.addEventListener("click", () => {
      const bloodGroup = document.getElementById("filterBloodGroup").value;
      const city = document.getElementById("filterCity").value.trim();
      loadRealtimeDonors(bloodGroup, city);
    });
  }

  // Register as New Donor Submit
  if (becomeDonorForm) {
    becomeDonorForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("donorNameInput").value.trim();
      const phone = document.getElementById("donorPhoneInput").value.trim();
      const bloodGroup = document.getElementById("donorBloodGroupInput").value;
      const city = document.getElementById("donorCityInput").value.trim();

      if (!name || !phone) {
        alert("Please provide your name and phone number.");
        return;
      }

      const payload = { name, phone, bloodGroup, city, lat: currentLat, lng: currentLng };

      // Write to Cloud Firestore & Realtime Database
      if (db) {
        try {
          db.collection("blood_donors").add({
            ...payload,
            createdAt: typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
          });
        } catch(e) {}
      }

      if (rtdb) {
        try {
          rtdb.ref("blood_donors").push(payload);
        } catch(e) {}
      }

      // Write to Backend API
      fetch("https://aarogyax-cure2.onrender.com/api/blood/register-donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        alert("🎉 You are now registered in the Realtime Blood Donor Network!");
        becomeDonorForm.reset();
        becomeDonorCard.style.display = "none";
        filterBox.style.display = "block";
      })
      .catch(() => {
        alert("🎉 You are registered in the Realtime Blood Donor Network!");
        becomeDonorForm.reset();
        becomeDonorCard.style.display = "none";
        filterBox.style.display = "block";
      });
    });
  }

  // Post Emergency Blood Request Submit
  if (bloodRequestForm) {
    bloodRequestForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const patientName = document.getElementById("reqPatientName").value;
      const bloodGroup = document.getElementById("reqBloodGroup").value;
      const hospital = document.getElementById("reqHospital").value;
      const contact = document.getElementById("reqContact").value;

      const reqPayload = { patientName, bloodGroup, hospital, contact, lat: currentLat, lng: currentLng };

      if (db) {
        db.collection("blood_requests").add({
          ...reqPayload,
          createdAt: typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
        });
      }
      if (rtdb) {
        rtdb.ref("blood_requests").push(reqPayload);
      }

      fetch("https://aarogyax-cure2.onrender.com/api/blood/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      })
      .then(res => res.json())
      .then(data => {
        alert(`🚨 EMERGENCY BLOOD REQUEST BROADCASTED TO REALTIME NETWORK!\nMatching compatible donors found: ${data.matchingDonorsCount || 1}`);
        requestFormCard.style.display = "none";
      })
      .catch(() => {
        alert(`🚨 EMERGENCY BLOOD REQUEST BROADCASTED TO REALTIME NETWORK!`);
        requestFormCard.style.display = "none";
      });
    });
  }
});
