
/* =========================
   PATIENT SYSTEM
========================= */

let patients = JSON.parse(localStorage.getItem("patients")) || [];
const patientForm = document.getElementById("patientForm");

function renderPatients() {
  const table = document.getElementById("patientTableBody");
  if (!table) return;

  table.innerHTML = "";

  patients.forEach((p) => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.age}</td>
        <td>${p.condition}</td>
        <td><span class="status active">Active</span></td>
      </tr>
    `;
  });
}

if (patientForm) {
  patientForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("patientName").value.trim();
    const ageVal = document.getElementById("patientAge").value.trim();
    const condition = document.getElementById("patientCondition").value.trim();

    if (!name) {
      alert("Please provide a patient name.");
      return;
    }

    const age = ageVal ? parseInt(ageVal, 10) : '';

    const newPatient = { name, age, condition };

    patients.push(newPatient);
    localStorage.setItem("patients", JSON.stringify(patients));

    renderPatients();
    patientForm.reset();

    alert("Patient saved successfully!");
  });

  renderPatients();
}

/* =========================
   APPOINTMENT SYSTEM
========================= */

let appointments = JSON.parse(localStorage.getItem("appointments")) || [];

const appointmentForm = document.getElementById("appointmentForm");

function renderAppointments() {
  const table = document.getElementById("appointmentTableBody");
  if (!table) return;

  table.innerHTML = "";

  appointments.forEach((a) => {
    table.innerHTML += `
      <tr>
        <td>${a.patient}</td>
        <td>${a.doctor}</td>
        <td>${a.date}</td>
        <td>${a.time}</td>
      </tr>
    `;
  });
}

if (appointmentForm) {
  appointmentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const patientName = document.getElementById("appointmentPatient").value.trim();
    const doctorName = document.getElementById("appointmentDoctor").value.trim();
    const dateVal = document.getElementById("appointmentDate").value;
    const timeVal = document.getElementById("appointmentTime").value;

    if (!patientName || !doctorName) {
      alert("Please provide both patient and doctor names.");
      return;
    }

    const newAppointment = {
      patient: patientName,
      doctor: doctorName,
      date: dateVal,
      time: timeVal
    };

    appointments.push(newAppointment);
    localStorage.setItem("appointments", JSON.stringify(appointments));

    renderAppointments();
    appointmentForm.reset();

    alert("Appointment booked successfully!");
  });

  renderAppointments();
}

/* =========================
   DOCTOR DASHBOARD
========================= */

let doctorPatients =
  JSON.parse(localStorage.getItem("doctorPatients")) || [];

function renderDoctorPatients() {
  const table = document.getElementById("doctorPatientTable");
  if (!table) return;

  table.innerHTML = "";

  doctorPatients.forEach((p) => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.condition}</td>
        <td><span class="status active">Under Care</span></td>
      </tr>
    `;
  });
}

let doctorAppointments =
  JSON.parse(localStorage.getItem("doctorAppointments")) || [];

function renderDoctorAppointments() {
  const table = document.getElementById("doctorAppointments");
  if (!table) return;

  table.innerHTML = "";

  doctorAppointments.forEach((a) => {
    table.innerHTML += `
      <tr>
        <td>${a.patient}</td>
        <td>${a.date}</td>
        <td>${a.time}</td>
      </tr>
    `;
  });
}

/* =========================
   PRESCRIPTIONS
========================= */

let prescriptions =
  JSON.parse(localStorage.getItem("prescriptions")) || [];

const prescriptionForm = document.getElementById("prescriptionForm");

if (prescriptionForm) {

  prescriptionForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const newPrescription = {
      patient: document.getElementById("prescriptionPatient").value.trim(),
      medicine: document.getElementById("medicine").value.trim(),
      instructions: document.getElementById("instructions").value.trim()
    };

    prescriptions.push(newPrescription);
    localStorage.setItem("prescriptions", JSON.stringify(prescriptions));

    alert("Prescription saved successfully!");

    prescriptionForm.reset();
  });

}

/* =========================
   PHARMACY SYSTEM
========================= */

let medicines = JSON.parse(localStorage.getItem("medicines")) || [];

const medicineForm = document.getElementById("medicineForm");
function renderMedicines() {
  const table = document.getElementById("medicineTable");
  if (!table) return;

  table.innerHTML = "";

  medicines.forEach((m) => {
    table.innerHTML += `
      <tr>
        <td>${m.name}</td>
        <td>${m.stock}</td>
      </tr>
    `;
  });
}

if (medicineForm) {
  medicineForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("medicineName").value.trim();
    const stockVal = document.getElementById("medicineStock").value.trim();

    if (!name) {
      alert("Please provide a medicine name.");
      return;
    }

    const stock = stockVal ? parseInt(stockVal, 10) : 0;

    const newMedicine = { name, stock };

    medicines.push(newMedicine);
    localStorage.setItem("medicines", JSON.stringify(medicines));

    renderMedicines();
    medicineForm.reset();

    alert("Medicine added successfully!");
  });

  renderMedicines();
}

/* =========================
   INIT LOAD
========================= */

renderPatients();
renderAppointments();
renderDoctorPatients();
renderDoctorAppointments();
renderMedicines();

console.log("🏥 MediFlow Hospital System Loaded Successfully");