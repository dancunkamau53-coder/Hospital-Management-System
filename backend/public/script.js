const AUTH_API = "http://localhost:5000/api/auth";
const PATIENT_API_PUBLIC = "http://localhost:5000/api/patients/public";
const PATIENT_API = "http://localhost:5000/api/patients";
const DOCTOR_API = "http://localhost:5000/api/doctors/public/all";
const DOCTOR_API_PROTECTED = "http://localhost:5000/api/doctors";
const APPOINTMENT_API_PUBLIC = {
  getAll: "http://localhost:5000/api/appointments/public/all",
  create: "http://localhost:5000/api/appointments/public/create"
};
const APPOINTMENT_API = {
  getAll: "http://localhost:5000/api/appointments",
  create: "http://localhost:5000/api/appointments"
};
const PRESCRIPTION_API = "http://localhost:5000/api/prescriptions";
const PHARMACY_API = "http://localhost:5000/api/pharmacy";
const TOKEN_KEY = "hms_token";
const USER_KEY = "hms_user";

const authFormsWrapper = document.getElementById("authForms");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authStatus = document.getElementById("authStatus");
const registerRoleField = document.getElementById("registerRole");
const doctorSpecialtyGroup = document.getElementById("doctorSpecialtyGroup");
const patientAgeGroup = document.getElementById("patientAgeGroup");
const patientGenderGroup = document.getElementById("patientGenderGroup");

const doctorSection = document.getElementById("doctorSection");
const doctorForm = document.getElementById("doctorForm");
const doctorTableBody = document.getElementById("doctorTableBody");
const appointmentForm = document.getElementById("appointmentForm");
const patientForm = document.getElementById("patientForm");
const prescriptionSection = document.getElementById("prescriptionSection");
const prescriptionForm = document.getElementById("prescriptionForm");
const prescriptionDoctorGroup = document.getElementById("prescriptionDoctorGroup");
const prescriptionDoctorSelect = document.getElementById("prescriptionDoctor");
const prescriptionTableBody = document.getElementById("prescriptionTableBody");
const medicationForm = document.getElementById("medicationForm");
const dispenseForm = document.getElementById("dispenseForm");
const medicationTableBody = document.getElementById("medicationTableBody");
const dispensationTableBody = document.getElementById("dispensationTableBody");
const dispenseMedicationSelect = document.getElementById("dispenseMedication");
const dispensePrescriptionSelect = document.getElementById("dispensePrescription");
const pharmacySection = document.getElementById("pharmacySection");

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isAuthenticated() {
  return Boolean(getToken());
}

function updateAuthStatus() {
  const user = getUser();

  if (user) {
    authStatus.innerHTML = `
      <p>Logged in as <strong>${user.fullName}</strong> (${user.role})</p>
      <button id="logoutButton" class="btn-submit">Logout</button>
    `;

    authFormsWrapper.classList.add("hidden");
    doctorSection.classList.toggle("hidden", user.role !== "ADMIN");
    prescriptionSection.classList.toggle(
      "hidden",
      !["ADMIN", "DOCTOR", "PHARMACIST"].includes(user.role)
    );
    pharmacySection.classList.toggle(
      "hidden",
      !["ADMIN", "PHARMACIST"].includes(user.role)
    );
    prescriptionDoctorGroup.classList.toggle("hidden", user.role !== "ADMIN");

    document.getElementById("logoutButton").addEventListener("click", () => {
      clearSession();
      updateAuthStatus();
      loadPatients();
      loadPatientOptions();
      loadDoctorOptions();
      loadDoctors();
      loadAppointments();
      loadPrescriptions();
      loadMedications();
      loadDispensations();
    });
    return;
  }

  authStatus.innerHTML = `
    <p>Not logged in. Please login or register.</p>
  `;
  authFormsWrapper.classList.remove("hidden");
  doctorSection.classList.add("hidden");
  prescriptionSection.classList.add("hidden");
  pharmacySection.classList.add("hidden");
}

function getAuthHeaders() {
  const token = getToken();
  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}

async function authFetch(url, options = {}) {
  const headers = {
    ...options.headers,
    ...getAuthHeaders()
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearSession();
    updateAuthStatus();
    throw new Error("Session expired. Please log in again.");
  }

  return response;
}

async function fetchWithAuth(url, options = {}) {
  if (isAuthenticated()) {
    return authFetch(url, options);
  }
  return fetch(url, options);
}

async function fetchJson(url, options = {}) {
  const response = await fetchWithAuth(url, options);
  return response.json();
}

registerRoleField.addEventListener("change", () => {
  const role = registerRoleField.value;

  doctorSpecialtyGroup.classList.toggle("hidden", role !== "DOCTOR");
  patientAgeGroup.classList.toggle("hidden", role !== "PATIENT");
  patientGenderGroup.classList.toggle("hidden", role !== "PATIENT");
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loginData = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value
  };

  try {
    const response = await fetch(`${AUTH_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setSession(data.token, data.user);
    updateAuthStatus();
    alert("Login successful");
    loadPatients();
    loadPatientOptions();
    loadDoctorOptions();
    loadDoctors();
    loadAppointments();
    loadPrescriptions();
    loadMedications();
    loadDispensations();
  } catch (error) {
    console.log(error);
    alert("Login failed: " + error.message);
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const registerData = {
    fullName: document.getElementById("registerName").value,
    email: document.getElementById("registerEmail").value,
    password: document.getElementById("registerPassword").value,
    role: document.getElementById("registerRole").value
  };

  const specialty = document.getElementById("registerSpecialty").value;
  const age = document.getElementById("registerAge").value;
  const gender = document.getElementById("registerGender").value;

  if (registerData.role === "DOCTOR") {
    registerData.specialty = specialty;
  }

  if (registerData.role === "PATIENT") {
    registerData.age = age;
    registerData.gender = gender;
  }

  try {
    const response = await fetch(`${AUTH_API}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registerData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert("Registration successful. Please log in.");
    registerForm.reset();
    registerRoleField.dispatchEvent(new Event("change"));
  } catch (error) {
    console.log(error);
    alert("Registration failed: " + error.message);
  }
});

async function loadPatients() {
  try {
    const patientUrl = isAuthenticated() ? PATIENT_API : `${PATIENT_API_PUBLIC}/all`;
    const response = await fetchWithAuth(patientUrl);
    const patients = await response.json();

    const table = document.getElementById("patientTableBody");
    table.innerHTML = "";

    if (!Array.isArray(patients) || patients.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="4" class="loading">No patients found</td>
        </tr>
      `;
      return;
    }

    patients.forEach((patient) => {
      table.innerHTML += `
        <tr>
          <td>${patient.fullName}</td>
          <td>${patient.age}</td>
          <td>${patient.gender}</td>
          <td>
            <span class="status active">Active</span>
          </td>
        </tr>
      `;
    });
  } catch (error) {
    console.log(error);
    const table = document.getElementById("patientTableBody");
    table.innerHTML = `
      <tr>
        <td colspan="4" class="loading">Error loading patients. Make sure the backend server is running on http://localhost:5000</td>
      </tr>
    `;
  }
}

async function loadPatientOptions() {
  try {
    const patientUrl = isAuthenticated() ? PATIENT_API : `${PATIENT_API_PUBLIC}/all`;
    const response = await fetchWithAuth(patientUrl);
    const patients = await response.json();

    const appointmentSelect = document.getElementById("appointmentPatient");
    const prescriptionSelect = document.getElementById("prescriptionPatient");
    const dispenseSelect = document.getElementById("dispensePatient");

    appointmentSelect.innerHTML = "";
    if (prescriptionSelect) prescriptionSelect.innerHTML = "";
    if (dispenseSelect) dispenseSelect.innerHTML = "";

    if (!Array.isArray(patients) || patients.length === 0) {
      appointmentSelect.innerHTML = `<option value="">No patients available</option>`;
      appointmentSelect.disabled = true;
      if (prescriptionSelect) {
        prescriptionSelect.innerHTML = `<option value="">No patients available</option>`;
        prescriptionSelect.disabled = true;
      }
      if (dispenseSelect) {
        dispenseSelect.innerHTML = `<option value="">No patients available</option>`;
        dispenseSelect.disabled = true;
      }
      return;
    }

    appointmentSelect.disabled = false;
    appointmentSelect.innerHTML = `<option value="">Select patient</option>`;
    if (prescriptionSelect) {
      prescriptionSelect.disabled = false;
      prescriptionSelect.innerHTML = `<option value="">Select patient</option>`;
    }
    if (dispenseSelect) {
      dispenseSelect.disabled = false;
      dispenseSelect.innerHTML = `<option value="">Select patient</option>`;
    }

    patients.forEach((patient) => {
      const patientOption = `<option value="${patient.id}">${patient.fullName} (${patient.age})</option>`;
      appointmentSelect.innerHTML += patientOption;
      if (prescriptionSelect) prescriptionSelect.innerHTML += patientOption;
      if (dispenseSelect) dispenseSelect.innerHTML += patientOption;
    });
  } catch (error) {
    console.log(error);
    const appointmentSelect = document.getElementById("appointmentPatient");
    appointmentSelect.innerHTML = `<option value="">Unable to load patients</option>`;
    appointmentSelect.disabled = true;
    const prescriptionSelect = document.getElementById("prescriptionPatient");
    if (prescriptionSelect) {
      prescriptionSelect.innerHTML = `<option value="">Unable to load patients</option>`;
      prescriptionSelect.disabled = true;
    }
    const dispenseSelect = document.getElementById("dispensePatient");
    if (dispenseSelect) {
      dispenseSelect.innerHTML = `<option value="">Unable to load patients</option>`;
      dispenseSelect.disabled = true;
    }
  }
}

async function loadDoctorOptions() {
  try {
    const response = await fetch(DOCTOR_API);
    const doctors = await response.json();

    const appointmentSelect = document.getElementById("appointmentDoctor");
    const prescriptionSelect = document.getElementById("prescriptionDoctor");
    appointmentSelect.innerHTML = `<option value="">Auto assign default doctor</option>`;
    if (prescriptionSelect) {
      prescriptionSelect.innerHTML = `<option value="">Select doctor</option>`;
    }

    if (!Array.isArray(doctors) || doctors.length === 0) {
      appointmentSelect.innerHTML += `<option value="">No doctors available</option>`;
      if (prescriptionSelect) {
        prescriptionSelect.innerHTML += `<option value="">No doctors available</option>`;
      }
      return;
    }

    doctors.forEach((doctor) => {
      const doctorOption = `<option value="${doctor.id}">${doctor.fullName} - ${doctor.specialty}</option>`;
      appointmentSelect.innerHTML += doctorOption;
      if (prescriptionSelect) prescriptionSelect.innerHTML += doctorOption;
    });
  } catch (error) {
    console.log(error);
    const appointmentSelect = document.getElementById("appointmentDoctor");
    appointmentSelect.innerHTML = `<option value="">Auto assign default doctor</option>`;
    const prescriptionSelect = document.getElementById("prescriptionDoctor");
    if (prescriptionSelect) {
      prescriptionSelect.innerHTML = `<option value="">Select doctor</option>`;
    }
  }
}

async function loadDoctors() {
  try {
    const response = await fetch(DOCTOR_API);
    const doctors = await response.json();

    doctorTableBody.innerHTML = "";

    if (!Array.isArray(doctors) || doctors.length === 0) {
      doctorTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="loading">No doctors found</td>
        </tr>
      `;
      return;
    }

    doctors.forEach((doctor) => {
      doctorTableBody.innerHTML += `
        <tr>
          <td>${doctor.fullName}</td>
          <td>${doctor.specialty || "General"}</td>
          <td>${doctor.phone || "—"}</td>
          <td>${doctor.email || "—"}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.log(error);
    doctorTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="loading">Error loading doctors.</td>
      </tr>
    `;
  }
}

async function loadAppointments() {
  try {
    const appointmentUrl = isAuthenticated() ? APPOINTMENT_API.getAll : APPOINTMENT_API_PUBLIC.getAll;
    const currentUser = getUser();
    const canManage = currentUser && ["ADMIN", "DOCTOR"].includes(currentUser.role);

    const response = await fetchWithAuth(appointmentUrl);
    const appointments = await response.json();

    const table = document.getElementById("appointmentTableBody");
    table.innerHTML = "";

    if (!Array.isArray(appointments) || appointments.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="6" class="loading">No appointments found</td>
        </tr>
      `;
      return;
    }

    appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.date).toLocaleString();
      const doctorName = appointment.doctor?.fullName || "Unassigned";
      const patientName = appointment.patient?.fullName || "Unknown";

      let actionButtons = "";
      if (canManage) {
        if (appointment.status !== "CONFIRMED") {
          actionButtons += `<button class="action-btn confirm" onclick="updateAppointmentStatus(${appointment.id}, 'CONFIRMED')">Confirm</button>`;
        }
        if (appointment.status !== "CANCELLED") {
          actionButtons += `<button class="action-btn cancel" onclick="updateAppointmentStatus(${appointment.id}, 'CANCELLED')">Cancel</button>`;
        }
        if (currentUser.role === "ADMIN") {
          actionButtons += `<button class="action-btn delete" onclick="deleteAppointment(${appointment.id})">Delete</button>`;
        }
      }

      table.innerHTML += `
        <tr>
          <td>${appointmentDate}</td>
          <td>${patientName}</td>
          <td>${doctorName}</td>
          <td>${appointment.reason}</td>
          <td>
            <span class="status ${appointment.status === "CONFIRMED" ? "active" : appointment.status === "CANCELLED" ? "inactive" : "active"}">
              ${appointment.status}
            </span>
          </td>
          <td>${actionButtons}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.log(error);
    const table = document.getElementById("appointmentTableBody");
    table.innerHTML = `
      <tr>
        <td colspan="6" class="loading">Error loading appointments. Make sure the backend server is running on http://localhost:5000</td>
      </tr>
    `;
  }
}

async function updateAppointmentStatus(id, status) {
  try {
    const response = await fetchWithAuth(`${APPOINTMENT_API.create}/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert("Appointment status updated");
    loadAppointments();
  } catch (error) {
    console.log(error);
    alert("Error updating appointment status: " + error.message);
  }
}

async function deleteAppointment(id) {
  try {
    const response = await fetchWithAuth(`${APPOINTMENT_API.create}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert("Appointment deleted successfully");
    loadAppointments();
  } catch (error) {
    console.log(error);
    alert("Error deleting appointment: " + error.message);
  }
}

async function loadPrescriptions() {
  try {
    const response = await fetchWithAuth(PRESCRIPTION_API);
    const prescriptions = await response.json();

    prescriptionTableBody.innerHTML = "";

    if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
      prescriptionTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="loading">No prescriptions found</td>
        </tr>
      `;
      return;
    }

    prescriptions.forEach((prescription) => {
      const doctorName = prescription.doctor?.fullName || "Unknown";
      const patientName = prescription.patient?.fullName || "Unknown";

      prescriptionTableBody.innerHTML += `
        <tr>
          <td>${patientName}</td>
          <td>${doctorName}</td>
          <td>${prescription.medication}</td>
          <td>${prescription.dosage}</td>
          <td>${prescription.instructions}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.log(error);
    prescriptionTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">Error loading prescriptions.</td>
      </tr>
    `;
  }
}

async function loadMedications() {
  try {
    const response = await fetchWithAuth(`${PHARMACY_API}/medications`);
    const medications = await response.json();

    medicationTableBody.innerHTML = "";
    dispenseMedicationSelect.innerHTML = `<option value="">Select medication</option>`;

    if (!Array.isArray(medications) || medications.length === 0) {
      medicationTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="loading">No medications found</td>
        </tr>
      `;
      dispenseMedicationSelect.innerHTML = `<option value="">No medications available</option>`;
      return;
    }

    medications.forEach((medication) => {
      medicationTableBody.innerHTML += `
        <tr>
          <td>${medication.name}</td>
          <td>${medication.category || "General"}</td>
          <td>${medication.stock}</td>
          <td>${new Date(medication.expiryDate).toLocaleDateString()}</td>
          <td>$${medication.unitPrice.toFixed(2)}</td>
        </tr>
      `;
      dispenseMedicationSelect.innerHTML += `
        <option value="${medication.id}">${medication.name} (${medication.stock} in stock)</option>
      `;
    });
  } catch (error) {
    console.log(error);
    medicationTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">Error loading medications. Make sure you're logged in.</td>
      </tr>
    `;
    dispenseMedicationSelect.innerHTML = `<option value="">Unable to load medications</option>`;
  }
}

async function loadDispensations() {
  try {
    const response = await fetchWithAuth(`${PHARMACY_API}/dispensations`);
    const dispensations = await response.json();

    dispensationTableBody.innerHTML = "";

    if (!Array.isArray(dispensations) || dispensations.length === 0) {
      dispensationTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="loading">No dispensations found</td>
        </tr>
      `;
      return;
    }

    dispensations.forEach((item) => {
      dispensationTableBody.innerHTML += `
        <tr>
          <td>${item.patient?.fullName || "Unknown"}</td>
          <td>${item.medication?.name || "Unknown"}</td>
          <td>${item.quantity}</td>
          <td>$${item.totalPrice.toFixed(2)}</td>
          <td>${new Date(item.dispensedAt).toLocaleString()}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.log(error);
    dispensationTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">Error loading dispensations.</td>
      </tr>
    `;
  }
}

doctorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const doctorData = {
    fullName: document.getElementById("doctorName").value,
    specialty: document.getElementById("doctorSpecialty").value,
    phone: document.getElementById("doctorPhone").value,
    email: document.getElementById("doctorEmail").value
  };

  try {
    const response = await fetchWithAuth(DOCTOR_API_PROTECTED, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(doctorData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert("Doctor created successfully");
    doctorForm.reset();
    loadDoctors();
    loadDoctorOptions();
  } catch (error) {
    console.log(error);
    alert("Error creating doctor: " + error.message);
  }
});

patientForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const patientData = {
    fullName: document.getElementById("patientName").value,
    age: document.getElementById("patientAge").value,
    gender: document.getElementById("patientCondition").value,
    phone: "",
    address: ""
  };

  try {
    const createUrl = isAuthenticated() ? PATIENT_API : `${PATIENT_API_PUBLIC}/create`;
    const response = await fetchWithAuth(createUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(patientData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert("Patient added successfully");
    patientForm.reset();
    await loadPatients();
    await loadPatientOptions();
  } catch (error) {
    console.log(error);
    alert("Error adding patient: " + error.message);
  }
});

appointmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const appointmentData = {
    date: document.getElementById("appointmentDate").value,
    reason: document.getElementById("appointmentReason").value
  };

  const patientId = document.getElementById("appointmentPatient").value;
  const doctorId = document.getElementById("appointmentDoctor").value;

  if (patientId) appointmentData.patientId = patientId;
  if (doctorId) appointmentData.doctorId = doctorId;

  try {
    const appointmentCreateUrl = isAuthenticated() ? APPOINTMENT_API.create : APPOINTMENT_API_PUBLIC.create;
    const response = await fetchWithAuth(appointmentCreateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appointmentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert("Appointment created successfully");
    appointmentForm.reset();
    loadAppointments();
  } catch (error) {
    console.log(error);
    alert("Error creating appointment: " + error.message);
  }
});

prescriptionForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const prescriptionData = {
    patientId: document.getElementById("prescriptionPatient").value,
    medication: document.getElementById("prescriptionMedication").value,
    dosage: document.getElementById("prescriptionDosage").value,
    instructions: document.getElementById("prescriptionInstructions").value
  };

  const doctorId = prescriptionDoctorSelect?.value;
  if (doctorId) prescriptionData.doctorId = doctorId;

  try {
    const response = await fetchWithAuth(PRESCRIPTION_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(prescriptionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert("Prescription created successfully");
    prescriptionForm.reset();
    loadPrescriptions();
    loadPrescriptionOptions();
  } catch (error) {
    console.log(error);
    alert("Error creating prescription: " + error.message);
  }
});

medicationForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const medicationData = {
    name: document.getElementById("medicationName").value,
    category: document.getElementById("medicationCategory").value,
    description: document.getElementById("medicationDescription").value,
    stock: document.getElementById("medicationStock").value,
    unitPrice: document.getElementById("medicationUnitPrice").value,
    batchNumber: document.getElementById("medicationBatchNumber").value,
    supplier: document.getElementById("medicationSupplier").value,
    expiryDate: document.getElementById("medicationExpiryDate").value,
    reorderLevel: document.getElementById("medicationReorderLevel").value
  };

  try {
    const response = await fetchWithAuth(`${PHARMACY_API}/medications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(medicationData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert("Medication added successfully");
    medicationForm.reset();
    loadMedications();
    loadDispensations();
  } catch (error) {
    console.log(error);
    alert("Error adding medication: " + error.message);
  }
});

async function loadPrescriptionOptions() {
  try {
    const response = await fetchWithAuth(PRESCRIPTION_API);
    const prescriptions = await response.json();

    if (!dispensePrescriptionSelect) return;

    dispensePrescriptionSelect.innerHTML = `<option value="">No prescription</option>`;
    if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
      return;
    }

    prescriptions.forEach((prescription) => {
      dispensePrescriptionSelect.innerHTML += `
        <option value="${prescription.id}">${prescription.medication} for ${prescription.patient?.fullName || 'Patient'}</option>
      `;
    });
  } catch (error) {
    console.log(error);
    if (dispensePrescriptionSelect) {
      dispensePrescriptionSelect.innerHTML = `<option value="">Unable to load prescriptions</option>`;
    }
  }
}

async function loadMedicationOptions() {
  try {
    const response = await fetchWithAuth(`${PHARMACY_API}/medications`);
    const medications = await response.json();

    dispenseMedicationSelect.innerHTML = `<option value="">Select medication</option>`;
    if (!Array.isArray(medications) || medications.length === 0) {
      dispenseMedicationSelect.innerHTML = `<option value="">No medications available</option>`;
      return;
    }

    medications.forEach((medication) => {
      dispenseMedicationSelect.innerHTML += `
        <option value="${medication.id}">${medication.name} (${medication.stock} in stock)</option>
      `;
    });
  } catch (error) {
    console.log(error);
    dispenseMedicationSelect.innerHTML = `<option value="">Unable to load medications</option>`;
  }
}

dispenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dispenseData = {
    medicationId: document.getElementById("dispenseMedication").value,
    patientId: document.getElementById("dispensePatient").value,
    quantity: document.getElementById("dispenseQuantity").value,
    notes: document.getElementById("dispenseNotes").value
  };

  const prescriptionId = dispensePrescriptionSelect?.value;
  if (prescriptionId) {
    dispenseData.prescriptionId = prescriptionId;
  }

  const currentUser = getUser();
  if (currentUser) {
    dispenseData.pharmacistId = currentUser.id;
  }

  try {
    const response = await fetchWithAuth(`${PHARMACY_API}/dispense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dispenseData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    alert("Medication dispensed successfully");
    dispenseForm.reset();
    loadMedications();
    loadDispensations();
  } catch (error) {
    console.log(error);
    alert("Error dispensing medication: " + error.message);
  }
});

async function loadMedications() {
  try {
    const response = await fetchWithAuth(`${PHARMACY_API}/medications`);
    const medications = await response.json();

    medicationTableBody.innerHTML = "";
    dispenseMedicationSelect.innerHTML = `<option value="">Select medication</option>`;

    if (!Array.isArray(medications) || medications.length === 0) {
      medicationTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="loading">No medications found</td>
        </tr>
      `;
      dispenseMedicationSelect.innerHTML = `<option value="">No medications available</option>`;
      return;
    }

    medications.forEach((medication) => {
      medicationTableBody.innerHTML += `
        <tr>
          <td>${medication.name}</td>
          <td>${medication.category || "General"}</td>
          <td>${medication.stock}</td>
          <td>${new Date(medication.expiryDate).toLocaleDateString()}</td>
          <td>$${parseFloat(medication.unitPrice).toFixed(2)}</td>
        </tr>
      `;
      dispenseMedicationSelect.innerHTML += `
        <option value="${medication.id}">${medication.name} (${medication.stock} in stock)</option>
      `;
    });
  } catch (error) {
    console.log(error);
    medicationTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">Error loading medications. Make sure you're logged in.</td>
      </tr>
    `;
    dispenseMedicationSelect.innerHTML = `<option value="">Unable to load medications</option>`;
  }
}

async function loadDispensations() {
  try {
    const response = await fetchWithAuth(`${PHARMACY_API}/dispensations`);
    const dispensations = await response.json();

    dispensationTableBody.innerHTML = "";

    if (!Array.isArray(dispensations) || dispensations.length === 0) {
      dispensationTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="loading">No dispensations found</td>
        </tr>
      `;
      return;
    }

    dispensations.forEach((item) => {
      dispensationTableBody.innerHTML += `
        <tr>
          <td>${item.patient?.fullName || "Unknown"}</td>
          <td>${item.medication?.name || "Unknown"}</td>
          <td>${item.quantity}</td>
          <td>$${parseFloat(item.totalPrice).toFixed(2)}</td>
          <td>${new Date(item.dispensedAt).toLocaleString()}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.log(error);
    dispensationTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">Error loading dispensations.</td>
      </tr>
    `;
  }
}

loadPatients();
loadPatientOptions();
loadDoctorOptions();
loadDoctors();
loadAppointments();
loadPrescriptions();
loadMedications();
loadDispensations();
updateAuthStatus();
