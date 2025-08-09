import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiExternalLink } from "react-icons/fi";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import Pagination from "../../../../components/Pagination";
import ReusableModal from "../../../../components/microcomponents/Modal";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import axios from "axios";

const API = { HD: "https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails", FD: "https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData", HS: "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary" };
const VIEW_VIRTUAL_PATIENT_FIELDS = [{ key: "name", label: "Patient Name", titleKey: true }, { key: "id", label: "Patient ID", subtitleKey: true }, { key: "name", label: "Full Name", initialsKey: true }, { key: "consultationType", label: "Consultation Type" }, { key: "scheduledDateTime", label: "Scheduled Date & Time" }, { key: "consultationStatus", label: "Status" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "duration", label: "Duration (minutes)" }, { key: "notes", label: "Notes" }];

export default function VirtualTab({ patients, loading, newPatientId }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [family, setFamily] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modals, setModals] = useState({ viewPatient: false });
  const pageSize = 6;
  const totalPages = Math.ceil(patients.length / pageSize);
  const paginatedPatients = patients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const virtualColumns = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name", clickable: true, cell: (row) => <button className={`cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)] ${row.id === newPatientId ? "font-bold bg-yellow-100 px-2 py-1 rounded" : ""}`} onClick={() => viewVirtualPatientDetails(row)}>{row.name}</button> },
    { header: "Consultation Type", cell: (row) => <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{row.consultationType || "Video Call"}</span> },
    { header: "Scheduled", accessor: "scheduledDateTime" },
    { header: "Status", cell: (row) => <span className={`status-badge ${row.consultationStatus === "Scheduled" ? "status-admitted" : row.consultationStatus === "In Progress" ? "status-pending" : row.consultationStatus === "Completed" ? "status-discharged" : "status-pending"}`}>{row.consultationStatus || "Scheduled"}</span> },
    { header: "Duration", cell: (row) => `${row.duration || 30} min` },
    { header: "Actions", cell: (row) => <div className="flex items-center gap-3"><button onClick={() => handleStartConsultation(row)} className="view-btn">Start Call</button><TeleConsultFlow phone={row.phone} /><button title="View Patient Records" onClick={() => { let age = ""; if (row.dob) { const dobDate = new Date(row.dob); const today = new Date(); age = today.getFullYear() - dobDate.getFullYear(); const m = today.getMonth() - dobDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) { age--; } } navigate("/doctordashboard/medical-record", { state: { patientName: row.name, email: row.email || "", phone: row.phone || "", gender: row.gender || row.sex || "", temporaryAddress: row.temporaryAddress || row.addressTemp || row.address || "", address: row.address || row.temporaryAddress || row.addressTemp || "", addressTemp: row.addressTemp || row.temporaryAddress || row.address || "", dob: row.dob, age: age, consultationType: row.consultationType || "Virtual" } }); }} className="text-blue-600 hover:text-blue-800" style={{ display: "flex", alignItems: "center" }}><FiExternalLink /></button></div> },
  ];

  const virtualFilters = [
    { key: "consultationStatus", label: "Status", options: [{ value: "Scheduled", label: "Scheduled" }, { value: "In Progress", label: "In Progress" }, { value: "Completed", label: "Completed" }, { value: "Cancelled", label: "Cancelled" }] },
    { key: "consultationType", label: "Type", options: [{ value: "Video Call", label: "Video Call" }, { value: "Voice Call", label: "Voice Call" }, { value: "Chat", label: "Chat" }] },
  ];

  const openModal = (modalName, data = null) => { setModals((prev) => ({ ...prev, [modalName]: true })); if (modalName === "viewPatient" && data) { setSelectedPatient(data); } };
  const closeModal = (modalName) => { setModals((prev) => ({ ...prev, [modalName]: false })); if (modalName === "viewPatient") { setSelectedPatient(null); } };

  const handleStartConsultation = (patient) => { toast.info(`Starting ${patient.consultationType?.toLowerCase() || "video call"} with ${patient.name}...`); };

  const viewVirtualPatientDetails = async (patient) => {
    openModal("viewPatient", patient);
    try {
      const { data: personalData } = await axios.get(API.HD);
      const p = personalData.find((p) => (p.email || "").trim().toLowerCase() === (patient.email || "").trim().toLowerCase());
      if (p) { setPersonalDetails({ height: p.height, weight: p.weight, bloodGroup: p.bloodGroup, surgeries: p.surgeries, allergies: p.allergies, isSmoker: p.isSmoker, isAlcoholic: p.isAlcoholic }); }
      const { data: familyData } = await axios.get(API.FD);
      setFamily(familyData.filter((f) => (f.email || "").trim().toLowerCase() === (patient.email || "").trim().toLowerCase()));
      const { data: vitalsData } = await axios.get(API.HS);
      const v = vitalsData.find((v) => (v.email || "").trim().toLowerCase() === (patient.email || "").trim().toLowerCase());
      setVitals(v ? { bloodPressure: v.bloodPressure || "Not recorded", heartRate: v.heartRate || "Not recorded", temperature: v.temperature || "Not recorded", bloodSugar: v.bloodSugar || "Not recorded" } : null);
    } catch (error) { console.error("Error fetching patient details:", error); }
  };

  const handleCellClick = (row, column) => { if (column.accessor === "name") { viewVirtualPatientDetails(row); } };

  return (
    <div className="space-y-4">
      <DynamicTable columns={virtualColumns} data={paginatedPatients} onCellClick={handleCellClick} filters={virtualFilters} tabs={[]} tabActions={[]} activeTab="" onTabChange={() => {}} />
      <div className="w-full flex justify-end mt-4">
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
      <ReusableModal isOpen={modals.viewPatient} onClose={() => closeModal("viewPatient")} mode="viewProfile" title="Virtual Patient Details" viewFields={VIEW_VIRTUAL_PATIENT_FIELDS} data={selectedPatient || {}} extraContent={
        <div className="space-y-4">
          {personalDetails && <div className="bg-green-50 p-4 rounded-lg"><h4 className="font-semibold text-green-800 mb-2">Health Information</h4><div className="grid grid-cols-2 gap-4 text-sm"><div>Height: {personalDetails.height || "—"} cm</div><div>Weight: {personalDetails.weight || "—"} kg</div><div>Blood Group: {personalDetails.bloodGroup || "Not recorded"}</div><div>Allergies: {personalDetails.allergies || "None"}</div></div></div>}
          {vitals && <div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-semibold text-blue-800 mb-2">Latest Vital Signs</h4><div className="grid grid-cols-2 gap-4 text-sm"><div>BP: {vitals.bloodPressure}</div><div>HR: {vitals.heartRate}</div><div>Temp: {vitals.temperature}</div><div>Sugar: {vitals.bloodSugar}</div></div></div>}
          {family && family.length > 0 && <div className="bg-purple-50 p-4 rounded-lg"><h4 className="font-semibold text-purple-800 mb-2">Family History</h4><div className="space-y-2">{family.map((member, i) => <div key={i} className="text-sm"><strong>{member.name}</strong> ({member.relation}) - {member.diseases?.join(", ") || "No diseases"}</div>)}</div></div>}
        </div>
      } />
    </div>
  );
}