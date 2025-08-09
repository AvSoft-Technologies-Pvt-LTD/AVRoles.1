import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import OPDTab from "./OPDTab";
import IPDTab from "./IPDTab";
import VirtualTab from "./VirtualTab";
import ReusableModal from "../../../../components/microcomponents/Modal";
import axios from "axios";

const DEFAULT_DOCTOR_NAME = "Dr.Sheetal S. Shelke";
const OPT = { GENDER: ["Female", "Male", "Other"], BLOOD: ["A+", "B+", "O+", "AB+"], OCC: ["Doctor", "Engineer", "Teacher", "Student", "Retired"], DEPT: ["General Medicine", "Surgery", "Cardiology", "Orthopedics", "Pediatrics", "Gynecology"], INS: ["None", "CGHS", "ESIC", "Private Insurance", "Other"], STATUS: ["Admitted", "Discharged"], SURGERY: ["No", "Yes"] };
const API = { FORM: "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient", HD: "https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails", FD: "https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData", HS: "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary" };
const WARD_TYPES = ["General", "Semi-Private", "Private", "Deluxe", "ICU", "ICCU", "Special Wards"];
const WARD_NUMBERS = ["A", "B", "C", "D", "E"];
const BED_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const PATIENT_BASIC_FIELDS = [
  { name: "firstName", label: "First Name", type: "text", required: true },
  { name: "middleName", label: "Middle Name", type: "text" },
  { name: "lastName", label: "Last Name", type: "text", required: true },
  { name: "phone", label: "Phone Number", type: "text", required: true },
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "gender", label: "Gender", type: "select", required: true, options: OPT.GENDER.map(g => ({ value: g, label: g })) },
  { name: "dob", label: "Date of Birth", type: "date", required: true },
  { name: "bloodGroup", label: "Blood Group", type: "select", options: OPT.BLOOD.map(b => ({ value: b, label: b })) },
  { name: "occupation", label: "Occupation", type: "select", required: true, options: OPT.OCC.map(o => ({ value: o, label: o })) },
  { name: "addressPerm", label: "Permanent Address", type: "textarea", required: true },
  { name: "sameAsPermAddress", label: "Temporary address same as permanent", type: "checkbox" },
  { name: "addressTemp", label: "Temporary Address", type: "textarea", required: true },
  { name: "password", label: "Create Password", type: "password", required: true },
  { name: "confirmPassword", label: "Confirm Password", type: "password", required: true }
];


const APPOINTMENT_FIELDS = [{ name: "date", label: "Appointment Date", type: "date", required: true }, { name: "time", label: "Appointment Time", type: "time", required: true }, { name: "diagnosis", label: "Diagnosis", type: "text", required: true }, { name: "reason", label: "Reason for Visit", type: "select", required: true, options: [{ value: "Consultation", label: "Consultation" }, { value: "Follow-up", label: "Follow-up" }, { value: "Test", label: "Test" }, { value: "Other", label: "Other" }] }];

const IPD_DETAILS_FIELDS = [{ name: "admissionDate", label: "Admission Date", type: "date", required: true }, { name: "admissionTime", label: "Admission Time", type: "time", required: true }, { name: "status", label: "Status", type: "select", required: true, options: OPT.STATUS.map(s => ({ value: s, label: s })) }, { name: "wardType", label: "Ward Type", type: "select", required: true, options: WARD_TYPES.map(w => ({ value: w, label: w })) }, { name: "wardNumber", label: "Ward Number", type: "select", required: true, options: WARD_NUMBERS.map(w => ({ value: w, label: w })) }, { name: "bedNumber", label: "Bed Number", type: "select", required: true, options: BED_NUMBERS.map(b => ({ value: b, label: b })) }, { name: "department", label: "Department", type: "select", required: true, options: OPT.DEPT.map(d => ({ value: d, label: d })) }, { name: "insuranceType", label: "Insurance Type", type: "select", required: true, options: OPT.INS.map(i => ({ value: i, label: i })) },  { name: "surgeryRequired", label: "Surgery Required", type: "select", options: OPT.SURGERY.map(s => ({ value: s, label: s })) }, { name: "dischargeDate", label: "Discharge Date", type: "date" }, { name: "diagnosis", label: "Diagnosis", type: "text" }, { name: "reasonForAdmission", label: "Reason For Admission", type: "textarea", colSpan: 2 }];

const CONSULTATION_FIELDS = [{ name: "firstName", label: "First Name", type: "text", required: true }, { name: "lastName", label: "Last Name", type: "text", required: true }, { name: "email", label: "Email Address", type: "email", required: true }, { name: "phone", label: "Phone Number", type: "text", required: true }, { name: "consultationType", label: "Consultation Type", type: "select", required: true, options: [{ value: "Video Call", label: "Video Call" }, { value: "Voice Call", label: "Voice Call" }, { value: "Chat", label: "Chat" }] }, { name: "scheduledDate", label: "Scheduled Date", type: "date", required: true }, { name: "scheduledTime", label: "Scheduled Time", type: "time", required: true }, { name: "duration", label: "Duration (minutes)", type: "number", required: true }, { name: "notes", label: "Consultation Notes", type: "textarea", colSpan: 2 }];

function getCurrentDate() { return new Date().toISOString().slice(0, 10); }
function getCurrentTime() { return new Date().toTimeString().slice(0, 5); }
function to24Hour(t) {
  if (!t.includes("AM") && !t.includes("PM")) return t;
  let [time, mod] = t.trim().split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mod === "PM" && h !== 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function PatientList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("OPD");
  const [patients, setPatients] = useState([]);
  const [ipdPatients, setIpdPatients] = useState([]);
  const [virtualPatients, setVirtualPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPatientId, setNewPatientId] = useState(null);
  const [modals, setModals] = useState({ addPatient: false, appointment: false, ipdDetails: false, scheduleConsultation: false });
  const [patientFormData, setPatientFormData] = useState({});
  const [appointmentFormData, setAppointmentFormData] = useState({ date: getCurrentDate(), time: getCurrentTime() });
  const [ipdFormData, setIpdFormData] = useState({ admissionDate: getCurrentDate(), admissionTime: getCurrentTime() });
  const [consultationFormData, setConsultationFormData] = useState({ scheduledDate: getCurrentDate(), scheduledTime: getCurrentTime(), duration: 30 });
  const [patientIdInput, setPatientIdInput] = useState("");
  const tabs = [{ label: "OPD", value: "OPD" }, { label: "IPD", value: "IPD" }, { label: "Virtual", value: "Virtual" }];

  useEffect(() => { fetchAllPatients(); }, []);

  const fetchAllPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API.FORM);
      const allPatients = res.data.map(p => ({ ...p, name: p.name || [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ") })).reverse();
      const opdData = allPatients.filter(p => (!p.type || p.type.toLowerCase() === "opd") && p.doctorName === DEFAULT_DOCTOR_NAME);
      const ipdData = allPatients.filter(p => p.type?.toLowerCase() === "ipd");
      const virtualData = allPatients.filter(p => p.type?.toLowerCase() === "virtual" || p.consultationType);
      setPatients(opdData.map(p => ({ ...p, datetime: `${p.appointmentDate} ${p.appointmentTime}`, temporaryAddress: p.temporaryAddress || p.addressTemp || p.address || "", address: p.address || p.temporaryAddress || p.addressTemp || "", addressTemp: p.addressTemp || p.temporaryAddress || p.address || "" })));
      setIpdPatients(ipdData.map(p => ({ ...p, wardNo: p.wardNumber, bedNo: p.bedNumber, temporaryAddress: p.temporaryAddress || p.addressTemp || p.address || "", address: p.address || p.temporaryAddress || p.addressTemp || "", addressTemp: p.addressTemp || p.temporaryAddress || p.address || "" })));
      setVirtualPatients(virtualData.map(p => ({ ...p, scheduledDateTime: p.scheduledDateTime || `${p.scheduledDate} ${p.scheduledTime}`, consultationStatus: p.consultationStatus || "Scheduled", duration: p.duration || 30, temporaryAddress: p.temporaryAddress || p.addressTemp || p.address || "", address: p.address || p.temporaryAddress || p.addressTemp || "", addressTemp: p.addressTemp || p.temporaryAddress || p.address || "" })));
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabValue) => { setActiveTab(tabValue); setNewPatientId(null); };
  const openModal = (modalName) => { setModals(prev => ({ ...prev, [modalName]: true })); };
  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    if (modalName === "addPatient") { setPatientFormData({}); setPatientIdInput(""); }
    if (modalName === "appointment") { setAppointmentFormData({ date: getCurrentDate(), time: getCurrentTime() }); }
    if (modalName === "ipdDetails") { setIpdFormData({ admissionDate: getCurrentDate(), admissionTime: getCurrentTime() }); }
    if (modalName === "scheduleConsultation") { setConsultationFormData({ scheduledDate: getCurrentDate(), scheduledTime: getCurrentTime(), duration: 30 }); }
  };

  const handleFetchPatientDetails = async () => {
    if (!patientIdInput.trim()) { toast.error("Please enter a Patient ID"); return; }
    try {
      const data = await (await fetch(API.FORM)).json();
      const found = data.find(p => (p.id || "").toString() === patientIdInput.trim());
      if (found) {
        setPatientFormData({ ...found, name: `${found.firstName || ""} ${found.middleName || ""} ${found.lastName || ""}`.trim(), addressPerm: found.permanentAddress || "", addressTemp: found.temporaryAddress || "" });
        toast.success(`${found.type || "Patient"} details loaded!`);
      } else { toast.info("No patient found with this ID."); }
    } catch { toast.error("Failed to fetch patient"); }
  };

const handlePatientFormChange = (formData) => {
  // If the checkbox is checked, copy permanent address to temporary address
  if (formData.sameAsPermAddress) {
    formData.addressTemp = formData.addressPerm;
  }
  setPatientFormData(formData);
};  const handleIPDFormChange = (formData) => { if (formData.sameAsPermAddress && formData.addressPerm) { formData.addressTemp = formData.addressPerm; } setIpdFormData(formData); };

  const handleSavePatient = async (formData) => {
    try {
      setPatientFormData(formData);
      closeModal("addPatient");
      if (activeTab === "OPD") { openModal("appointment"); toast.success("Patient details saved! Please schedule appointment."); }
      else if (activeTab === "IPD") { openModal("ipdDetails"); toast.success("Patient details saved! Please fill IPD details."); }
    } catch (error) { toast.error("Failed to save patient details"); }
  };

  const handleScheduleAppointment = async (formData) => {
    try {
      const payload = { ...patientFormData, name: [patientFormData.firstName, patientFormData.middleName, patientFormData.lastName].filter(Boolean).join(" "), permanentAddress: patientFormData.addressPerm, temporaryAddress: patientFormData.addressTemp, appointmentDate: formData.date, appointmentTime: formData.time, diagnosis: formData.diagnosis, reason: formData.reason, doctorName: DEFAULT_DOCTOR_NAME, type: "OPD" };
      const response = await axios.post(API.FORM, payload);
      toast.success("Appointment scheduled successfully!");
      closeModal("appointment");
      setNewPatientId(response.data.id);
      fetchAllPatients();
    } catch (error) { console.error("Error scheduling appointment:", error); toast.error("Failed to schedule appointment."); }
  };

  const handleSaveIPD = async (formData) => {
    try {
      const patientData = { ...patientFormData, ...formData, type: "ipd", name: `${patientFormData.firstName || ""} ${patientFormData.middleName || ""} ${patientFormData.lastName || ""}`.trim(), permanentAddress: formData.addressPerm || patientFormData.addressPerm, temporaryAddress: formData.addressTemp || patientFormData.addressTemp, admissionTime: to24Hour(formData.admissionTime), wardNo: formData.wardNumber, bedNo: formData.bedNumber, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const response = await axios.post(API.FORM, patientData);
      toast.success("Patient added to IPD successfully!");
      closeModal("ipdDetails");
      setNewPatientId(response.data.id);
      fetchAllPatients();
      setPatientFormData({});
      setIpdFormData({ admissionDate: getCurrentDate(), admissionTime: getCurrentTime() });
    } catch (error) { toast.error("Failed to save patient"); }
  };

  const handleScheduleConsultation = async (formData) => {
    try {
      const payload = { ...formData, name: `${formData.firstName} ${formData.lastName}`.trim(), type: "virtual", scheduledDateTime: `${formData.scheduledDate} ${formData.scheduledTime}`, consultationStatus: "Scheduled", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const response = await axios.post(API.FORM, payload);
      toast.success("Virtual consultation scheduled successfully!");
      closeModal("scheduleConsultation");
      setNewPatientId(response.data.id);
      fetchAllPatients();
    } catch (error) { console.error("Error scheduling consultation:", error); toast.error("Failed to schedule consultation."); }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "OPD": return <OPDTab patients={patients} loading={loading} newPatientId={newPatientId} />;
      case "IPD": return <IPDTab patients={ipdPatients} loading={loading} newPatientId={newPatientId} />;
      case "Virtual": return <VirtualTab patients={virtualPatients} loading={loading} newPatientId={newPatientId} />;
      default: return <OPDTab patients={patients} loading={loading} newPatientId={newPatientId} />;
    }
  };

  const getAddButtonLabel = () => {
    switch (activeTab) {
      case "IPD": return "Add Patient";
      case "Virtual": return "Schedule Consultation";
      default: return "Add Patient";
    }
  };

  const handleAddButtonClick = () => {
    if (activeTab === "Virtual") { openModal("scheduleConsultation"); }
    else { openModal("addPatient"); }
  };

  return (
    <div className="p-4">
      <div className="mb-4"><h2 className="text-xl font-semibold">Patients</h2></div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          {tabs.map(tab => (
            <button key={tab.value} onClick={() => handleTabChange(tab.value)} className={`relative cursor-pointer flex items-center gap-1 px-4 py-2 font-medium transition-colors duration-300 ${activeTab === tab.value ? "text-[var(--primary-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[var(--primary-color)]" : "text-gray-500 hover:text-[var(--accent-color)] before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-[var(--accent-color)] before:transition-all before:duration-300 hover:before:w-full"}`}>{tab.label}</button>
          ))}
        </div>
        <button onClick={handleAddButtonClick} className="btn btn-primary whitespace-nowrap px-4 py-2 text-xs flex items-center gap-2">{getAddButtonLabel()}</button>
      </div>
      {renderActiveTab()}
     <ReusableModal
  isOpen={modals.addPatient}
  onClose={() => closeModal("addPatient")}
  mode="add"
  title={`Add ${activeTab} Patient`}
  fields={PATIENT_BASIC_FIELDS}
  data={patientFormData}
  onSave={handleSavePatient}
  onChange={handlePatientFormChange}
  saveLabel="Next"
  cancelLabel="Cancel"
  size="lg"
extraContentPosition="top"
extraContent={
  activeTab === "IPD" && (
    <div className="mb-3">
      {/* Search Section */}
      <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-blue-800 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Existing Patient
          </h4>
          <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
            Optional
          </span>
        </div>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={patientIdInput}
            onChange={(e) => setPatientIdInput(e.target.value)}
            className="flex-1 px-2 py-1.5 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs placeholder-blue-400"
            placeholder="Patient ID"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleFetchPatientDetails();
              }
            }}
          />
          <button
            onClick={handleFetchPatientDetails}
            disabled={!patientIdInput.trim()}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-xs font-medium flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </div>
  )
}
/>
      <ReusableModal isOpen={modals.appointment} onClose={() => closeModal("appointment")} mode="add" title="Schedule Appointment" fields={APPOINTMENT_FIELDS} data={appointmentFormData} onSave={handleScheduleAppointment} onChange={setAppointmentFormData} saveLabel="Schedule" cancelLabel="Back" size="md" extraContent={
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Patient Information</h4>
          <p className="text-sm text-blue-700">{patientFormData.firstName} {patientFormData.middleName} {patientFormData.lastName}</p>
          <p className="text-xs text-blue-600">{patientFormData.email}</p>
        </div>
      } />
      <ReusableModal isOpen={modals.ipdDetails} onClose={() => closeModal("ipdDetails")} mode="add" title="IPD Details" fields={IPD_DETAILS_FIELDS} data={ipdFormData} onSave={handleSaveIPD} onChange={handleIPDFormChange} saveLabel="Save" cancelLabel="Back" size="lg" />
      <ReusableModal isOpen={modals.scheduleConsultation} onClose={() => closeModal("scheduleConsultation")} mode="add" title="Schedule Virtual Consultation" fields={CONSULTATION_FIELDS} data={consultationFormData} onSave={handleScheduleConsultation} onChange={setConsultationFormData} saveLabel="Schedule" cancelLabel="Cancel" size="lg" extraContent={
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-semibold text-green-800 mb-2">Virtual Consultation Info</h4>
          <p className="text-sm text-green-700">This will create a virtual consultation appointment. The patient will receive notification with joining details.</p>
        </div>
      } />
    </div>
  );
}