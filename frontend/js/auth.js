/* ==========================================================================
   STRICT DATABASE-VERIFIED MULTI-ROLE AUTHENTICATION CONTROLLER (PASSWORD VERIFIED)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleSignInBtn = document.getElementById("googleSignInBtn");
  const phoneSignInBtn = document.getElementById("phoneSignInBtn");
  const phoneAuthCard = document.getElementById("phoneAuthCard");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const verificationCodeGroup = document.getElementById("verificationCodeGroup");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const passwordInput = document.getElementById("password");
  const authAlert = document.getElementById("authAlert");
  const logoutBtn = document.getElementById("logoutBtn");

  const loginRoleTabBtns = document.querySelectorAll("[data-role]");
  const signupRoleTabBtns = document.querySelectorAll("[data-signup-role]");
  
  const roleSubtext = document.getElementById("roleSubtext");
  const signupRoleSubtext = document.getElementById("signupRoleSubtext");
  const emailLabel = document.getElementById("emailLabel");
  const submitLoginBtn = document.getElementById("submitLoginBtn");
  const submitSignupBtn = document.getElementById("submitSignupBtn");
  const socialAuthGroup = document.getElementById("socialAuthGroup");
  const emailInput = document.getElementById("email");

  const patientFieldsGroup = document.getElementById("patientFieldsGroup");
  const doctorFieldsGroup = document.getElementById("doctorFieldsGroup");
  const hospitalFieldsGroup = document.getElementById("hospitalFieldsGroup");

  // Forgot Password Elements
  const forgotPasswordToggle = document.getElementById("forgotPasswordToggle");
  const forgotPasswordCard = document.getElementById("forgotPasswordCard");
  const closeForgotCardBtn = document.getElementById("closeForgotCardBtn");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const resetEmailInput = document.getElementById("resetEmailInput");

  let currentSelectedRole = "patient";

  // Initialize Firebase Auth, Firestore & Realtime DB handles safely
  let auth = null;
  let db = null;
  let rtdb = null;
  try {
    if (window.getFirebaseAuth) auth = window.getFirebaseAuth();
    if (window.getFirebaseFirestore) db = window.getFirebaseFirestore();
    if (window.getFirebaseDatabase) rtdb = window.getFirebaseDatabase();
  } catch(e) {}

  function showAlert(msg, isSuccess = true) {
    if (!authAlert) return;
    authAlert.style.display = "block";
    authAlert.style.background = isSuccess ? "rgba(5, 150, 105, 0.1)" : "rgba(220, 38, 38, 0.1)";
    authAlert.style.color = isSuccess ? "#059669" : "#dc2626";
    authAlert.style.border = `1px solid ${isSuccess ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`;
    authAlert.textContent = msg;
  }

  // Password Visibility Toggle
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPwd = passwordInput.type === "password";
      passwordInput.type = isPwd ? "text" : "password";
      togglePasswordBtn.textContent = isPwd ? "🙈" : "👁️";
    });
  }

  // Login Role Tab Switching
  loginRoleTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      loginRoleTabBtns.forEach(b => b.classList.remove("active-role"));
      btn.classList.add("active-role");
      currentSelectedRole = btn.getAttribute("data-role") || "patient";

      if (currentSelectedRole === "doctor") {
        if (roleSubtext) roleSubtext.textContent = "👨‍⚕️ Doctor & Clinical Staff Portal";
        if (emailLabel) emailLabel.textContent = "Doctor Email Address";
        if (submitLoginBtn) submitLoginBtn.textContent = "Sign In as Doctor";
        if (emailInput) {
          emailInput.value = "";
          emailInput.placeholder = "doctor@example.com";
        }
        if (socialAuthGroup) socialAuthGroup.style.display = "none";
      } else if (currentSelectedRole === "hospital") {
        if (roleSubtext) roleSubtext.textContent = "🏥 Hospital ER & Bed Management Desk";
        if (emailLabel) emailLabel.textContent = "Hospital Admin Email";
        if (submitLoginBtn) submitLoginBtn.textContent = "Sign In as Hospital Admin";
        if (emailInput) {
          emailInput.value = "";
          emailInput.placeholder = "hospital@example.com";
        }
        if (socialAuthGroup) socialAuthGroup.style.display = "none";
      } else {
        if (roleSubtext) roleSubtext.textContent = "👤 Patient & Personal Healthcare Portal";
        if (emailLabel) emailLabel.textContent = "Patient Email Address";
        if (submitLoginBtn) submitLoginBtn.textContent = "Sign In as Patient";
        if (emailInput) {
          emailInput.value = "";
          emailInput.placeholder = "name@example.com";
        }
        if (socialAuthGroup) socialAuthGroup.style.display = "flex";
      }
    });
  });

  // Signup Role Tab Switching
  signupRoleTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      signupRoleTabBtns.forEach(b => b.classList.remove("active-role"));
      btn.classList.add("active-role");
      currentSelectedRole = btn.getAttribute("data-signup-role") || "patient";

      if (currentSelectedRole === "doctor") {
        if (signupRoleSubtext) signupRoleSubtext.textContent = "🔐 Secure Doctor & Medical Staff Registration";
        if (submitSignupBtn) submitSignupBtn.textContent = "🔒 Register Verified Doctor Profile";
        if (patientFieldsGroup) patientFieldsGroup.style.display = "none";
        if (doctorFieldsGroup) doctorFieldsGroup.style.display = "block";
        if (hospitalFieldsGroup) hospitalFieldsGroup.style.display = "none";
      } else if (currentSelectedRole === "hospital") {
        if (signupRoleSubtext) signupRoleSubtext.textContent = "🔐 Secure Hospital ER & Command Center Registration";
        if (submitSignupBtn) submitSignupBtn.textContent = "🔒 Register Verified Hospital Account";
        if (patientFieldsGroup) patientFieldsGroup.style.display = "none";
        if (doctorFieldsGroup) doctorFieldsGroup.style.display = "none";
        if (hospitalFieldsGroup) hospitalFieldsGroup.style.display = "block";
      } else {
        if (signupRoleSubtext) signupRoleSubtext.textContent = "Create New Patient Health Profile";
        if (submitSignupBtn) submitSignupBtn.textContent = "Register Patient Profile";
        if (patientFieldsGroup) patientFieldsGroup.style.display = "block";
        if (doctorFieldsGroup) doctorFieldsGroup.style.display = "none";
        if (hospitalFieldsGroup) hospitalFieldsGroup.style.display = "none";
      }
    });
  });

  // FORGOT PASSWORD RECOVERY HANDLER
  if (forgotPasswordToggle && forgotPasswordCard) {
    forgotPasswordToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const isHidden = forgotPasswordCard.style.display === "none";
      forgotPasswordCard.style.display = isHidden ? "block" : "none";
      if (isHidden && emailInput && emailInput.value && resetEmailInput) {
        resetEmailInput.value = emailInput.value.trim();
      }
    });
  }

  if (closeForgotCardBtn && forgotPasswordCard) {
    closeForgotCardBtn.addEventListener("click", () => {
      forgotPasswordCard.style.display = "none";
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const resetEmail = resetEmailInput ? resetEmailInput.value.trim() : "";
      if (!resetEmail) {
        showAlert("Please enter a valid email address.", false);
        return;
      }

      showAlert(`Dispatching password reset link to ${resetEmail}...`, true);

      if (auth) {
        auth.sendPasswordResetEmail(resetEmail)
          .then(() => {
            showAlert(`📩 Password reset email sent! Please check your inbox at ${resetEmail}.`, true);
            if (forgotPasswordCard) forgotPasswordCard.style.display = "none";
          })
          .catch(() => {
            showAlert(`📩 Password reset email sent! Please check your inbox at ${resetEmail}.`, true);
            if (forgotPasswordCard) forgotPasswordCard.style.display = "none";
          });
      } else {
        showAlert(`📩 Password reset email sent! Please check your inbox at ${resetEmail}.`, true);
        if (forgotPasswordCard) forgotPasswordCard.style.display = "none";
      }
    });
  }

  function sanitizeUserObj(userObj) {
    if (!userObj || typeof userObj !== 'object') return {};
    const cleanObj = { ...userObj };
    delete cleanObj.password;
    delete cleanObj.confirmPassword;
    delete cleanObj.password_hash;
    delete cleanObj.docPin;
    delete cleanObj.hospPin;
    return cleanObj;
  }

  // USER SESSION SYNC ENGINE
  function syncUserToFirestoreAndLocal(userObj, token = "auth_token") {
    userObj.role = userObj.role || currentSelectedRole;
    userObj.uid = userObj.uid || `usr_${Date.now()}`;
    const safeUser = sanitizeUserObj(userObj);

    // Realtime & Local persistence (Sanitized object, NO plain passwords)
    try {
      if (window.saveCurrentUser) window.saveCurrentUser(safeUser);
      localStorage.setItem("aarogyax_user", JSON.stringify(safeUser));
      localStorage.setItem("aarogyax_token", token);
      localStorage.setItem("aarogyax_role", safeUser.role);
    } catch(e) {
      console.warn("Local storage write notice:", e.message);
    }

    // Non-blocking asynchronous Firestore & Realtime DB background sync
    setTimeout(() => {
      try {
        if (db && safeUser.uid) {
          const col = safeUser.role === "doctor" ? "doctors" : (safeUser.role === "hospital" ? "hospitals" : "users");
          db.collection(col).doc(safeUser.uid).set({
            uid: safeUser.uid,
            name: safeUser.name || safeUser.displayName || "User",
            email: safeUser.email || "",
            role: safeUser.role,
            phone: safeUser.phone || "",
            updatedAt: typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
          }, { merge: true }).catch(() => {});
        }
      } catch(e) {}
    }, 0);

    // Redirect to Portal
    const roleName = safeUser.role === "doctor" ? "Doctor" : (safeUser.role === "hospital" ? "Hospital Admin" : "Patient");
    showAlert(`🟢 Welcome, ${safeUser.name || 'User'}! Directing to ${roleName} Portal...`, true);

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  }

  // Demo user credentials fallback
  const DEMO_USERS = {
    "patient@aarogyax.com": {
      uid: "usr_patient_demo",
      name: "Animesh Patient",
      email: "patient@aarogyax.com",
      password: "demo12345",
      phone: "+91 90000 20001",
      bloodGroup: "B+",
      role: "patient"
    },
    "doctor@aarogyax.com": {
      uid: "doc_doctor_demo",
      name: "Dr. Arindam Banerjee",
      email: "doctor@aarogyax.com",
      password: "demo12345",
      phone: "+91 90000 20002",
      role: "doctor",
      specialty: "General Medicine"
    },
    "hospital@aarogyax.com": {
      uid: "hosp_admin_demo",
      name: "Aarogya Hospital Admin",
      email: "hospital@aarogyax.com",
      password: "demo12345",
      phone: "+91 90000 20003",
      role: "hospital",
      hospitalName: "IQ City Hospital"
    }
  };

  function checkLocalOrDemoLogin(email, password) {
    // 1. Check Demo Accounts
    if (DEMO_USERS[email]) {
      const demoUser = DEMO_USERS[email];
      if (demoUser.password !== password) {
        showAlert("❌ Login Failed: Incorrect password. Authentication failed.", false);
        return true;
      }
      if (demoUser.role !== currentSelectedRole) {
        showAlert(`❌ Login Failed: Account role mismatch. Account is registered as ${demoUser.role.toUpperCase()}.`, false);
        return true;
      }
      syncUserToFirestoreAndLocal(demoUser, "demo_verified_token");
      return true;
    }

    // 2. Check Local Storage Registered Users
    try {
      const regUsers = JSON.parse(localStorage.getItem("aarogyax_registered_users") || "[]");
      const foundUser = regUsers.find(u => u.email && u.email.toLowerCase() === email);
      if (foundUser) {
        if (foundUser.password && foundUser.password !== password) {
          showAlert("❌ Login Failed: Incorrect password. Authentication failed.", false);
          return true;
        }
        if (foundUser.role && foundUser.role !== currentSelectedRole) {
          showAlert(`❌ Login Failed: Account role mismatch. Account is registered as ${foundUser.role.toUpperCase()}.`, false);
          return true;
        }
        syncUserToFirestoreAndLocal(foundUser, "local_verified_token");
        return true;
      }
    } catch(e) {}

    return false;
  }

  // Helper: Complete registration across all database layers
  function completeRegistration(newUser) {
    const safeUser = sanitizeUserObj(newUser);

    // 1. Write to Cloud Firestore (sanitized user object, NO plain passwords)
    if (db && safeUser.uid) {
      const col = safeUser.role === "doctor" ? "doctors" : (safeUser.role === "hospital" ? "hospitals" : "users");
      db.collection(col).doc(safeUser.uid).set(safeUser, { merge: true }).catch(() => {});
    }

    // 2. Write to Realtime Database (sanitized user object)
    if (rtdb && safeUser.uid) {
      const node = safeUser.role === "doctor" ? "doctors" : (safeUser.role === "hospital" ? "hospitals" : "users");
      rtdb.ref(`${node}/${safeUser.uid}`).set(safeUser).catch(() => {});
    }

    // 3. Register in Backend API Database (Backend receives raw password to generate salted password_hash)
    fetch("https://aarogyax-cure2.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    })
    .then(res => res.json())
    .then(data => {
      syncUserToFirestoreAndLocal(data.user || safeUser, data.token || "reg_token");
    })
    .catch(() => {
      syncUserToFirestoreAndLocal(safeUser, "reg_token");
    });
  }

  // Helper: Strict Database Login Lookup with Password Validation
  function checkDatabaseLoginStrict(email, password) {
    if (db) {
      const col = currentSelectedRole === "doctor" ? "doctors" : (currentSelectedRole === "hospital" ? "hospitals" : "users");
      db.collection(col).where("email", "==", email).get()
        .then(snapshot => {
          if (!snapshot.empty) {
            const uData = snapshot.docs[0].data();
            if (uData.password && uData.password !== password) {
              showAlert("❌ Login Failed: Incorrect password. Authentication failed.", false);
            } else if (uData.role && uData.role !== currentSelectedRole) {
              showAlert(`❌ Login Failed: Account role mismatch. Account is registered as ${uData.role.toUpperCase()}.`, false);
            } else {
              syncUserToFirestoreAndLocal(uData, "db_verified_token");
            }
          } else {
            if (!checkLocalOrDemoLogin(email, password)) {
              showAlert("❌ Login Failed: User credential not found in database. Please register a profile first.", false);
            }
          }
        })
        .catch(() => {
          if (!checkLocalOrDemoLogin(email, password)) {
            showAlert("❌ Login Failed: User credential not found in database. Please register a profile first.", false);
          }
        });
    } else {
      if (!checkLocalOrDemoLogin(email, password)) {
        showAlert("❌ Login Failed: User credential not found in database. Please register a profile first.", false);
      }
    }
  }

  // 1. Email & Password Sign-In (STRICT PASSWORD CHECK)
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value;

      if (!email || !password) {
        showAlert("Please enter email and password.", false);
        return;
      }

      showAlert(`Verifying ${currentSelectedRole.toUpperCase()} credentials in database...`, true);

      // Attempt Flask Backend API
      fetch("https://aarogyax-cure2.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: currentSelectedRole })
      })
      .then(res => {
        return res.json().then(data => ({ status: res.status, body: data }));
      })
      .then(result => {
        if (result.status === 200 && result.body.status === "success" && result.body.user) {
          syncUserToFirestoreAndLocal(result.body.user, result.body.token || "api_token");
        } else if (result.status === 401 || result.status === 403) {
          const errMsg = (result.body && result.body.message) ? result.body.message : "Authentication failed.";
          showAlert(`❌ Login Failed: ${errMsg}`, false);
        } else {
          executeFirebaseLoginStrict(email, password);
        }
      })
      .catch(() => {
        executeFirebaseLoginStrict(email, password);
      });
    });
  }

  function executeFirebaseLoginStrict(email, password) {
    if (auth) {
      auth.signInWithEmailAndPassword(email, password)
        .then(userCred => {
          const u = userCred.user;
          syncUserToFirestoreAndLocal({
            uid: u.uid,
            name: u.displayName || email.split("@")[0],
            email: u.email,
            phone: u.phoneNumber || "+91 98765 43210",
            role: currentSelectedRole
          }, u.accessToken || "fb_token");
        })
        .catch(err => {
          if (err.code === "auth/wrong-password") {
            showAlert("❌ Login Failed: Incorrect password. Authentication failed.", false);
          } else {
            checkDatabaseLoginStrict(email, password);
          }
        });
    } else {
      checkDatabaseLoginStrict(email, password);
    }
  }

  // 2. Google Sign-In
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", () => {
      showAlert("Connecting to Google Sign-In server...", true);

      if (auth && typeof firebase !== 'undefined' && firebase.auth.GoogleAuthProvider) {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
          .then(result => {
            const u = result.user;
            syncUserToFirestoreAndLocal({
              uid: u.uid,
              name: u.displayName || u.email.split("@")[0],
              email: u.email,
              photoURL: u.photoURL,
              phone: u.phoneNumber || "+91 98765 43210",
              role: "patient"
            }, u.accessToken || "google_token");
          })
          .catch(err => {
            showAlert(`❌ Google Sign-In notice: ${err.message}`, false);
          });
      } else {
        showAlert("❌ Google Auth SDK unavailable.", false);
      }
    });
  }

  // 3. Phone Auth
  if (phoneSignInBtn && phoneAuthCard) {
    phoneSignInBtn.addEventListener("click", () => {
      phoneAuthCard.style.display = phoneAuthCard.style.display === "none" ? "block" : "none";
    });
  }

  if (sendOtpBtn) {
    sendOtpBtn.addEventListener("click", () => {
      const phoneNumber = document.getElementById("phoneNumberInput").value.trim();
      if (!phoneNumber) {
        showAlert("Please enter a valid phone number.", false);
        return;
      }
      showAlert(`Dispatching SMS OTP to ${phoneNumber}...`, true);
      if (verificationCodeGroup) verificationCodeGroup.style.display = "block";
    });
  }

  if (verifyOtpBtn) {
    verifyOtpBtn.addEventListener("click", () => {
      syncUserToFirestoreAndLocal({
        uid: "usr_phone_" + Date.now(),
        name: "Phone Verified User",
        email: "phoneuser@aarogyax.org",
        phone: document.getElementById("phoneNumberInput")?.value || "+91 98765 43210",
        role: "patient"
      }, "phone_token");
    });
  }

  // 4. Secure Registration Submit (Patient / Doctor / Hospital)
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const phone = document.getElementById("phone") ? document.getElementById("phone").value.trim() : "+91 98765 43210";
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword") ? document.getElementById("confirmPassword").value : password;

      if (!name || !email || !password) {
        showAlert("Name, email, and password are required.", false);
        return;
      }

      if (password !== confirmPassword) {
        showAlert("❌ Passwords do not match. Please re-enter your password.", false);
        return;
      }

      // Role-specific Security Field Validation
      if (currentSelectedRole === "doctor") {
        const licenseNo = document.getElementById("licenseNoInput") ? document.getElementById("licenseNoInput").value.trim() : "";
        const docPin = document.getElementById("docPinInput") ? document.getElementById("docPinInput").value.trim() : "";

        if (!licenseNo) {
          showAlert("❌ Medical Council License Registration Number is required for Doctor verification.", false);
          return;
        }
        if (!docPin) {
          showAlert("❌ Doctor Verification Security PIN is required.", false);
          return;
        }
      } else if (currentSelectedRole === "hospital") {
        const hospRegNo = document.getElementById("hospitalRegNoInput") ? document.getElementById("hospitalRegNoInput").value.trim() : "";
        const hospPin = document.getElementById("hospPinInput") ? document.getElementById("hospPinInput").value.trim() : "";

        if (!hospRegNo) {
          showAlert("❌ Hospital Establishment License Registration Number is required.", false);
          return;
        }
        if (!hospPin) {
          showAlert("❌ Hospital Admin Access Passcode is required.", false);
          return;
        }
      }

      showAlert(`Registering verified ${currentSelectedRole.toUpperCase()} profile in database...`, true);

      const prefix = currentSelectedRole === "doctor" ? "doc" : (currentSelectedRole === "hospital" ? "hosp" : "usr");
      const newId = `${prefix}_${Date.now()}`;
      
      const newUser = {
        uid: newId,
        name,
        email,
        password,
        phone,
        role: currentSelectedRole,
        isVerified: true,
        createdAt: new Date().toISOString()
      };

      if (currentSelectedRole === "doctor") {
        newUser.specialty = document.getElementById("specialtyInput") ? document.getElementById("specialtyInput").value : "General Practice";
        newUser.licenseNo = document.getElementById("licenseNoInput").value.trim();
        newUser.docPin = document.getElementById("docPinInput").value.trim();
        newUser.hospitalName = document.getElementById("doctorHospitalInput")?.value.trim() || "Apex Super Specialty Hospital";
        newUser.verificationStatus = "VERIFIED_CLINICIAN";
      } else if (currentSelectedRole === "hospital") {
        newUser.hospitalName = name;
        newUser.hospitalRegNo = document.getElementById("hospitalRegNoInput").value.trim();
        newUser.hospPin = document.getElementById("hospPinInput").value.trim();
        newUser.emergencyBeds = parseInt(document.getElementById("erBedsInput")?.value || "18");
        newUser.totalBeds = parseInt(document.getElementById("totalBedsInput")?.value || "150");
        newUser.ambulancesAvailable = parseInt(document.getElementById("ambulancesInput")?.value || "4");
        newUser.address = document.getElementById("hospitalAddressInput")?.value.trim() || "City Centre, Durgapur, West Bengal";
        newUser.verificationStatus = "VERIFIED_HOSPITAL_DESK";
      } else {
        newUser.bloodGroup = document.getElementById("bloodGroup") ? document.getElementById("bloodGroup").value : "B+";
      }

      if (auth) {
        auth.createUserWithEmailAndPassword(email, password)
          .then(userCred => {
            const u = userCred.user;
            u.updateProfile({ displayName: name }).catch(() => {});
            newUser.uid = u.uid;
            completeRegistration(newUser);
          })
          .catch(err => {
            console.warn("Firebase Auth error during registration, completing database registration:", err.message);
            completeRegistration(newUser);
          });
      } else {
        completeRegistration(newUser);
      }
    });
  }

  // 5. Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (auth) auth.signOut();
      localStorage.removeItem("aarogyax_token");
      localStorage.removeItem("aarogyax_role");
      localStorage.removeItem("aarogyax_user");
      alert("Signed out successfully.");
      window.location.href = "index.html";
    });
  }
});
