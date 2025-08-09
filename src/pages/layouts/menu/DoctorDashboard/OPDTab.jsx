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
const VIEW_PATIENT_FIELDS = [{ key: "name", label: "Patient Name", titleKey: true }, { key: "id", label: "Patient ID", subtitleKey: true }, { key: "name", label: "Full Name", initialsKey: true }, { key: "datetime", label: "Appointment" }, { key: "diagnosis", label: "Diagnosis" }, { key: "reason", label: "Reason" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "gender", label: "Gender" }, { key: "bloodGroup", label: "Blood Group" }, { key: "addressTemp", label: "Address" }];

export default function OPDTab({ patients, loading, newPatientId }) {
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

  const opdColumns = [
    { header: "ID", accessor: "id" },
    { header: "Name", accessor: "name", clickable: true, cell: (row) => <button className={`cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)] ${row.id === newPatientId ? "font-bold bg-yellow-100 px-2 py-1 rounded" : ""}`} onClick={() => viewPatientDetails(row)}>{row.name}</button> },
    { header: "Diagnosis", accessor: "diagnosis" },
    { header: "Date & Time", accessor: "datetime" },
    { header: "Actions", cell: (row) => <div className="flex items-center gap-3"><button onClick={() => handleAddRecord(row)} className="edit-btn">Visit Pad</button><TeleConsultFlow phone={row.phone} /><button title="View Medical Record" onClick={() => { let age = ""; if (row.dob) { const dobDate = new Date(row.dob); const today = new Date(); age = today.getFullYear() - dobDate.getFullYear(); const m = today.getMonth() - dobDate.getMonth(); if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) { age--; } } navigate("/doctordashboard/medical-record", { state: { patientName: row.name, email: row.email || "", phone: row.phone || "", gender: row.gender || row.sex || "", temporaryAddress: row.temporaryAddress || row.addressTemp || row.address || "", address: row.address || row.temporaryAddress || row.addressTemp || "", addressTemp: row.addressTemp || row.temporaryAddress || row.address || "", dob: row.dob, age: age } }); }} className="text-blue-600 hover:text-blue-800" style={{ display: "flex", alignItems: "center" }}><FiExternalLink /></button></div> },
  ];

  const openModal = (modalName, data = null) => { setModals((prev) => ({ ...prev, [modalName]: true })); if (modalName === "viewPatient" && data) { setSelectedPatient(data); } };
  const closeModal = (modalName) => { setModals((prev) => ({ ...prev, [modalName]: false })); if (modalName === "viewPatient") { setSelectedPatient(null); } };

  const viewPatientDetails = async (patient) => {
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

  const handleAddRecord = (patient) => { navigate("/doctordashboard/form", { state: { patient } }); };
  const handleCellClick = (row, column) => { if (column.accessor === "name") { viewPatientDetails(row); } };

  return (
    <div className="space-y-4">
      <DynamicTable columns={opdColumns} data={paginatedPatients} onCellClick={handleCellClick} filters={[]} tabs={[]} tabActions={[]} activeTab="" onTabChange={() => {}} />
      <div className="w-full flex justify-end mt-4">
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
      <ReusableModal isOpen={modals.viewPatient} onClose={() => closeModal("viewPatient")} mode="viewProfile" title="Patient Details" viewFields={VIEW_PATIENT_FIELDS} data={selectedPatient || {}} extraContent={
        <div className="space-y-4">
          {personalDetails && <div className="bg-green-50 p-4 rounded-lg"><h4 className="font-semibold text-green-800 mb-2">Health Information</h4><div className="grid grid-cols-2 gap-4 text-sm"><div>Height: {personalDetails.height || "—"} cm</div><div>Weight: {personalDetails.weight || "—"} kg</div><div>Blood Group: {personalDetails.bloodGroup || "Not recorded"}</div><div>Allergies: {personalDetails.allergies || "None"}</div></div></div>}
          {vitals && <div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-semibold text-blue-800 mb-2">Vital Signs</h4><div className="grid grid-cols-2 gap-4 text-sm"><div>BP: {vitals.bloodPressure}</div><div>HR: {vitals.heartRate}</div><div>Temp: {vitals.temperature}</div><div>Sugar: {vitals.bloodSugar}</div></div></div>}
          {family && family.length > 0 && <div className="bg-purple-50 p-4 rounded-lg"><h4 className="font-semibold text-purple-800 mb-2">Family History</h4><div className="space-y-2">{family.map((member, i) => <div key={i} className="text-sm"><strong>{member.name}</strong> ({member.relation}) - {member.diseases?.join(", ") || "No diseases"}</div>)}</div></div>}
        </div>
      } />
    </div>
  );
}