/* ==========================================================================
   HEALTH RECORDS CONTROLLER (REALTIME FIREBASE SNAPSHOT SYNC)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const addRecordBtn = document.getElementById("addRecordBtn");
  const addRecordCard = document.getElementById("addRecordCard");
  const recordForm = document.getElementById("recordForm");
  const recordsGrid = document.getElementById("recordsGrid");

  const currentUser = window.getCurrentUser ? window.getCurrentUser() : { uid: "guest_user" };
  const userId = currentUser.uid || "guest_user";
  const db = window.getFirebaseFirestore();
  const rtdb = window.getFirebaseDatabase();

  let currentRecords = [];

  function renderRecords(records) {
    if (!recordsGrid) return;
    if (records.length === 0) {
      recordsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--card-bg); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <h3>No health records found</h3>
          <p style="color: var(--text-muted);">Click '+ Add New Health Record' to log prescriptions or lab reports in real-time.</p>
        </div>
      `;
      return;
    }

    recordsGrid.innerHTML = records.map(r => `
      <div class="feature-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div class="card-icon" style="background: rgba(13, 148, 136, 0.1); color: var(--brand-teal);">📄</div>
          <span class="status-badge live" style="font-weight: 700;">
            ${r.category}
          </span>
        </div>
        <h3 class="card-title">${r.title}</h3>
        <p class="card-desc">${r.description}</p>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
          Date: <strong>${r.date}</strong> &bull; Physician: <strong>${r.doctor || 'Dr. Consult'}</strong>
        </div>
        <button class="btn btn-outline" onclick="alert('Viewing encrypted document details for: ${r.title.replace(/'/g, "\\'")}')" style="width: 100%; border-color: var(--brand-emerald); color: var(--brand-emerald);">
          👁️ View Encrypted Document
        </button>
      </div>
    `).join('');
  }

  // 1. Subscribe to Real-Time Firebase Cloud Firestore Snapshot Updates
  if (db) {
    try {
      db.collection("health_records")
        .where("userId", "==", userId)
        .onSnapshot(snapshot => {
          const liveRecords = [];
          snapshot.forEach(doc => {
            liveRecords.push({ id: doc.id, ...doc.data() });
          });
          // Sort newest first
          liveRecords.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
          currentRecords = liveRecords;
          renderRecords(currentRecords);
        }, err => {
          console.warn("Firestore records stream notice:", err.message);
          subscribeRealtimeDbFallback();
        });
    } catch(e) {
      subscribeRealtimeDbFallback();
    }
  } else {
    subscribeRealtimeDbFallback();
  }

  function subscribeRealtimeDbFallback() {
    if (rtdb) {
      try {
        rtdb.ref("health_records/" + userId).on("value", snapshot => {
          const val = snapshot.val();
          const list = [];
          if (val) {
            Object.keys(val).forEach(key => {
              list.push({ id: key, ...val[key] });
            });
          }
          list.sort((a, b) => new Date(b.date) - new Date(a.date));
          currentRecords = list;
          renderRecords(currentRecords);
        });
      } catch(e) {}
    }
  }

  if (addRecordBtn && addRecordCard) {
    addRecordBtn.addEventListener("click", () => {
      addRecordCard.style.display = addRecordCard.style.display === "none" ? "block" : "none";
    });
  }

  if (recordForm) {
    recordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("recTitle").value.trim();
      const category = document.getElementById("recCategory").value;
      const description = document.getElementById("recDesc").value.trim();

      const newRec = {
        userId: userId,
        title,
        category,
        date: new Date().toISOString().split("T")[0],
        description: description || "No notes provided.",
        doctor: "Dr. Consult",
        fileUrl: "#",
        createdAt: typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
      };

      // Realtime write to Cloud Firestore & Realtime DB
      if (db) {
        db.collection("health_records").add(newRec).then(() => {
          alert("🎉 Health Record saved live to Firebase Realtime Database!");
        }).catch(err => {
          console.error("Firestore write error:", err);
        });
      }

      if (rtdb) {
        rtdb.ref("health_records/" + userId).push(newRec);
      }

      // Optimistic UI insert
      currentRecords.unshift(newRec);
      renderRecords(currentRecords);

      recordForm.reset();
      addRecordCard.style.display = "none";
    });
  }
});
