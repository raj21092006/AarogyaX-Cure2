/* ==========================================================================
   MEDICINE REMINDERS CONTROLLER (REALTIME FIREBASE SNAPSHOT ENGINE)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const addMedBtn = document.getElementById("addMedBtn");
  const addMedCard = document.getElementById("addMedCard");
  const medForm = document.getElementById("medForm");
  const remindersGrid = document.getElementById("remindersGrid");

  const currentUser = window.getCurrentUser ? window.getCurrentUser() : { uid: "guest_user" };
  const userId = currentUser.uid || "guest_user";
  const db = window.getFirebaseFirestore();
  const rtdb = window.getFirebaseDatabase();

  let currentReminders = [];

  // Request Web Notifications permission
  if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }

  function renderReminders(list) {
    if (!remindersGrid) return;
    if (list.length === 0) {
      remindersGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--card-bg); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">
          <h3>No medicine reminders scheduled</h3>
          <p style="color: var(--text-muted);">Click '+ Add New Reminder' to schedule your daily dosage in real-time.</p>
        </div>
      `;
      return;
    }

    remindersGrid.innerHTML = list.map(r => `
      <div class="feature-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
          <div class="card-icon" style="background: rgba(13, 148, 136, 0.1); color: var(--brand-teal);">💊</div>
          <span class="status-badge ${r.status === 'Taken' ? 'live' : 'demo'}">
            ${r.status === 'Taken' ? '✓ Taken' : '⏰ Scheduled'}
          </span>
        </div>
        <h3 class="card-title">${r.medicine} (${r.dosage})</h3>
        <p class="card-desc">Scheduled Time: <strong>${r.time}</strong> &bull; Frequency: ${r.frequency}</p>
        <button class="btn ${r.status === 'Taken' ? 'btn-outline' : 'btn-primary'}" onclick="toggleTaken('${r.id}')" style="width: 100%;">
          ${r.status === 'Taken' ? 'Mark as Pending' : '✓ Mark as Taken'}
        </button>
      </div>
    `).join('');
  }

  // Realtime Firebase Cloud Firestore Stream Listener
  if (db) {
    try {
      db.collection("medicine_reminders")
        .where("userId", "==", userId)
        .onSnapshot(snapshot => {
          const liveReminders = [];
          snapshot.forEach(doc => {
            liveReminders.push({ id: doc.id, ...doc.data() });
          });
          currentReminders = liveReminders;
          renderReminders(currentReminders);
        }, () => {
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
        rtdb.ref("medicine_reminders/" + userId).on("value", snapshot => {
          const val = snapshot.val();
          const list = [];
          if (val) {
            Object.keys(val).forEach(key => {
              list.push({ id: key, ...val[key] });
            });
          }
          currentReminders = list;
          renderReminders(currentReminders);
        });
      } catch(e) {}
    }
  }

  window.toggleTaken = function(id) {
    const item = currentReminders.find(r => r.id === id);
    if (item) {
      const newStatus = item.status === 'Taken' ? 'Pending' : 'Taken';
      item.status = newStatus;

      if (db && item.id && !item.id.startsWith("rem_local_")) {
        db.collection("medicine_reminders").doc(item.id).update({ status: newStatus }).catch(() => {});
      }
      if (rtdb) {
        rtdb.ref(`medicine_reminders/${userId}/${item.id}`).update({ status: newStatus }).catch(() => {});
      }

      renderReminders(currentReminders);

      if (newStatus === 'Taken' && "Notification" in window && Notification.permission === "granted") {
        new Notification("Medication Tracked!", {
          body: `Great job! You logged ${item.medicine} (${item.dosage}) as taken in real-time.`,
          icon: "https://img.icons8.com/emoji/96/pill-emoji.png"
        });
      }
    }
  };

  if (addMedBtn && addMedCard) {
    addMedBtn.addEventListener("click", () => {
      addMedCard.style.display = addMedCard.style.display === "none" ? "block" : "none";
    });
  }

  if (medForm) {
    medForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const medicine = document.getElementById("medName").value.trim();
      const dosage = document.getElementById("medDosage").value.trim();
      const time = document.getElementById("medTime").value;
      const frequency = document.getElementById("medFreq").value;

      const newRem = {
        userId: userId,
        medicine,
        dosage,
        time,
        frequency,
        status: "Pending",
        createdAt: typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
      };

      if (db) {
        db.collection("medicine_reminders").add(newRem).then(() => {
          alert("⏰ Medicine reminder scheduled in Firebase Realtime Database!");
        });
      }
      if (rtdb) {
        rtdb.ref("medicine_reminders/" + userId).push(newRem);
      }

      currentReminders.unshift({ id: `rem_local_${Date.now()}`, ...newRem });
      renderReminders(currentReminders);
      
      medForm.reset();
      addMedCard.style.display = "none";
    });
  }
});
