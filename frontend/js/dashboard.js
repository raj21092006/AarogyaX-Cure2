/* ==========================================================================
   MULTI-ROLE DASHBOARD CONTROLLER (PATIENT / DOCTOR / HOSPITAL ADMIN)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const user = window.getCurrentUser ? window.getCurrentUser() : null;
  const currentRole = localStorage.getItem("aarogyax_role") || (user ? user.role : "patient") || "patient";

  const greetingEl = document.getElementById("userGreeting");
  const systemStatusBadge = document.getElementById("systemStatusBadge");
  const statusModeText = document.getElementById("statusModeText");

  // Multi-Role Dashboard View Adaptations
  if (currentRole === "doctor") {
    renderDoctorDashboard(user);
  } else if (currentRole === "hospital") {
    renderHospitalDashboard(user);
  } else {
    renderPatientDashboard(user);
  }

  function renderDoctorDashboard(userObj) {
    const mainContainer = document.querySelector(".dashboard-container");
    if (!mainContainer) return;

    mainContainer.innerHTML = `
      <div class="dashboard-header">
        <div>
          <h1>👨‍⚕️ Doctor Clinical Portal</h1>
          <p>Welcome, ${userObj ? userObj.name : 'Dr. S. K. Roy, MD'} &bull; Senior Cardiologist (Apex Hospital)</p>
        </div>
        <span class="status-badge live">
          <span class="pulse-dot"></span> Clinical Desk Active
        </span>
      </div>

      <!-- Doctor Stats Bar -->
      <div class="health-bar">
        <div class="health-stat-item">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <label>Assigned Patients</label>
            <value>12 Active Patients</value>
          </div>
        </div>
        <div class="health-stat-item">
          <div class="stat-icon">🩺</div>
          <div class="stat-info">
            <label>Today's Consultations</label>
            <value>5 Completed / 2 Pending</value>
          </div>
        </div>
        <div class="health-stat-item">
          <div class="stat-icon">🤖</div>
          <div class="stat-info">
            <label>AI Symptom Triage</label>
            <value>1 High Priority Alert</value>
          </div>
        </div>
      </div>

      <!-- Doctor Action Grid -->
      <div class="grid-container">
        <div class="feature-card sos-card">
          <div class="card-icon">🚨</div>
          <h3 class="card-title">Emergency Patient Dispatches</h3>
          <p class="card-desc">Sunita Mukhopadhyay (B+) &bull; Admitted to Apex ER Desk 1.2 km away.</p>
          <a href="emergency.html" class="btn btn-sos">Review Emergency Case</a>
        </div>

        <div class="feature-card">
          <div class="card-icon">📋</div>
          <h3 class="card-title">Patient Medical Records</h3>
          <p class="card-desc">Review uploaded CBC blood reports, prescriptions, and lab diagnostics.</p>
          <a href="records.html" class="btn btn-primary">Review Medical Reports</a>
        </div>

        <div class="feature-card">
          <div class="card-icon">🤖</div>
          <h3 class="card-title">Gemini AI Symptom Summaries</h3>
          <p class="card-desc">Inspect AI-triaged patient symptom queries with automated differential diagnoses.</p>
          <a href="assistant.html" class="btn btn-outline">Launch AI Consultation</a>
        </div>

        <div class="feature-card">
          <div class="card-icon">🩸</div>
          <h3 class="card-title">Blood Bank Requests</h3>
          <p class="card-desc">Approve urgent blood requirement broadcasts for surgery & trauma units.</p>
          <a href="blood.html" class="btn btn-outline">Blood Matching Desk</a>
        </div>
      </div>
    `;
  }

  function renderHospitalDashboard(userObj) {
    const mainContainer = document.querySelector(".dashboard-container");
    if (!mainContainer) return;

    mainContainer.innerHTML = `
      <div class="dashboard-header">
        <div>
          <h1>🏥 Hospital ER & Bed Command Center</h1>
          <p>${userObj ? userObj.name : 'Apex Super Specialty Hospital Administration'}</p>
        </div>
        <span class="status-badge live">
          <span class="pulse-dot"></span> ER Desk Online
        </span>
      </div>

      <!-- Hospital Stats Bar -->
      <div class="health-bar">
        <div class="health-stat-item">
          <div class="stat-icon">🛏️</div>
          <div class="stat-info">
            <label>Available ER Beds</label>
            <value style="color:var(--brand-emerald);">18 / 30 Emergency Beds</value>
          </div>
        </div>
        <div class="health-stat-item">
          <div class="stat-icon">🚑</div>
          <div class="stat-info">
            <label>Ambulance Fleet</label>
            <value>4 Standby / 1 Dispatched</value>
          </div>
        </div>
        <div class="health-stat-item">
          <div class="stat-icon">🩸</div>
          <div class="stat-info">
            <label>Blood Reserve</label>
            <value>42 Units Available</value>
          </div>
        </div>
      </div>

      <!-- Hospital Action Grid -->
      <div class="grid-container">
        <div class="feature-card sos-card">
          <div class="card-icon">🚨</div>
          <h3 class="card-title">Live SOS Inbound Alerts</h3>
          <p class="card-desc">1 Inbound GPS Emergency Dispatch from 23.5204° N, 87.3119° E.</p>
          <a href="emergency.html" class="btn btn-sos">Dispatch Emergency Ambulance</a>
        </div>

        <div class="feature-card">
          <div class="card-icon">🏥</div>
          <h3 class="card-title">Geoapify Map Presence</h3>
          <p class="card-desc">Update emergency room bed availability shown live on regional maps.</p>
          <a href="hospitals.html" class="btn btn-primary">Update ER Bed Status</a>
        </div>

        <div class="feature-card">
          <div class="card-icon">🩸</div>
          <h3 class="card-title">Realtime Blood Network</h3>
          <p class="card-desc">Match hospital patients with compatible local donors in emergency cases.</p>
          <a href="blood.html" class="btn btn-outline">Blood Network Desk</a>
        </div>

        <div class="feature-card">
          <div class="card-icon">💳</div>
          <h3 class="card-title">Digital Health Card Scanner</h3>
          <p class="card-desc">Scan incoming patient QR Codes for emergency allergy and contact retrieval.</p>
          <a href="profile.html" class="btn btn-outline">Open Health Card Scanner</a>
        </div>
      </div>
    `;
  }

  function renderPatientDashboard(userObj) {
    if (userObj) {
      const bloodGroupEl = document.getElementById("dashBloodGroup");
      const emergencyContactEl = document.getElementById("dashEmergencyContact");

      if (greetingEl) greetingEl.textContent = `Hello, ${userObj.name.split(" ")[0]} 👋`;
      if (bloodGroupEl) bloodGroupEl.textContent = userObj.bloodGroup || "B+";
      
      if (emergencyContactEl && userObj.emergencyContacts && userObj.emergencyContacts.length > 0) {
        const primaryContact = userObj.emergencyContacts[0];
        emergencyContactEl.textContent = `${primaryContact.name} (${primaryContact.phone})`;
      }
    }

    // Realtime Pending Medicine Reminder Sync from Firebase Firestore / Realtime DB
    const dashNextMed = document.getElementById("dashNextMed");
    if (dashNextMed) {
      const db = window.getFirebaseFirestore();
      const userId = userObj ? userObj.uid : "guest_user";
      if (db) {
        db.collection("medicine_reminders")
          .where("userId", "==", userId)
          .where("status", "==", "Pending")
          .limit(1)
          .onSnapshot(snapshot => {
            if (!snapshot.empty) {
              const rem = snapshot.docs[0].data();
              dashNextMed.textContent = `${rem.medicine} (${rem.time})`;
            } else {
              dashNextMed.textContent = "All Tracked Today ✓";
            }
          }, () => {
            dashNextMed.textContent = "All Tracked Today ✓";
          });
      } else {
        dashNextMed.textContent = "All Tracked Today ✓";
      }
    }

    // Populate Dashboard "Hospitals Near Me" Widget
    const dashNearbyHospitalsList = document.getElementById("dashNearbyHospitalsList");
    if (dashNearbyHospitalsList) {
      function renderDashHospitals(list) {
        dashNearbyHospitalsList.innerHTML = list.slice(0, 2).map(h => `
          <div style="background: var(--bg-app); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: 0.95rem; color: var(--primary-dark);">🏥 ${h.name}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${h.distanceKm || 1.2} km away &bull; ${h.emergencyBeds || 12} ER Beds</div>
            </div>
            <div style="display: flex; gap: 0.4rem;">
              <a href="tel:${h.phone || '+913432540001'}" class="btn btn-sos" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">Call</a>
              <a href="hospitals.html" class="btn btn-outline" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">Map</a>
            </div>
          </div>
        `).join('');
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            fetch(`https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:${lng},${lat},20000&bias=proximity:${lng},${lat}&limit=4&apiKey=a1e8868dd12f4de698ac61d7190d87e9`)
              .then(res => res.json())
              .then(data => {
                if (data.features && data.features.length > 0) {
                  const liveList = data.features.map((feat, idx) => ({
                    name: feat.properties.name || `Nearby Hospital ${idx+1}`,
                    distanceKm: (feat.properties.distance / 1000).toFixed(1),
                    phone: feat.properties.datasource?.raw?.phone || "+91 343 254000",
                    emergencyBeds: 10 + idx * 4
                  }));
                  renderDashHospitals(liveList);
                }
              })
              .catch(() => {});
          },
          () => {},
          { timeout: 5000 }
        );
      }
    }
  }

  // Check API health status
  fetch("https://aarogyax-cure2.onrender.com/api/health")
    .then(res => res.json())
    .then(data => {
      if (systemStatusBadge && statusModeText && data.status === "healthy") {
        systemStatusBadge.className = "status-badge live";
        statusModeText.textContent = "Live API & Database Connected";
      }
    })
    .catch(() => {});
});
