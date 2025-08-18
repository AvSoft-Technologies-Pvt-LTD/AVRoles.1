import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import Pagination from "../../../../components/Pagination";
import ReusableModal from "../../../../components/microcomponents/Modal";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import axios from "axios";

const API = {
  HD: "https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails",
  FD: "https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData",
  HS: "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary",
};

const VIEW_PATIENT_FIELDS = [
  { key: "name", label: "Patient Name", titleKey: true },
  { key: "id", label: "Patient ID", subtitleKey: true },
  { key: "name", label: "Full Name", initialsKey: true },
  { key: "datetime", label: "Appointment" },
  { key: "diagnosis", label: "Diagnosis" },
  { key: "reason", label: "Reason" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "gender", label: "Gender" },
  { key: "bloodGroup", label: "Blood Group" },
  { key: "addressTemp", label: "Address" },
];
const formatName = (firstName, middleName, lastName, name) => {
  // If name is already provided and clean, use it
  if (name && !/\d/.test(name)) return name;

  // Clean firstName, middleName, lastName
  const clean = (str) => str?.replace(/\d+/g, "").trim() || "";
  const fn = clean(firstName);
  const mn = clean(middleName);
  const ln = clean(lastName);

  // Return formatted name (no hardcoded fallback)
  return [fn, mn, ln].filter(Boolean).join(" ");
};

export default function OPDTab({ patients, loading, newPatientId }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [family, setFamily] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [highlightedIds, setHighlightedIds] = useState([]);
  const [modals, setModals] = useState({
    viewPatient: false,
  });

  const pageSize = 6;
  const totalPages = Math.ceil(patients.length / pageSize);
  const paginatedPatients = patients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    const storedHighlightedIds = JSON.parse(
      localStorage.getItem("highlightOPDIds") || "[]"
    );
    setHighlightedIds(storedHighlightedIds);
  }, []);

  const handlePatientClick = (patientId) => {
    setHighlightedIds((prev) => {
      const updated = prev.filter((id) => id !== patientId);
      localStorage.setItem("highlightOPDIds", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRowClick = (row) => {
    handlePatientClick(row.id);
  };

  const handleNameClick = (row) => {
    viewPatientDetails(row);
  };

  const opdColumns = [
  { header: "ID", accessor: "id" },
  {
    header: "Name",
    accessor: "name",
    cell: (row) => (
      <button
        className={`cursor-pointer ${
          row.id === newPatientId || highlightedIds.includes(row.id)
            ? "text-green-600 font-bold"
            : "text-[var(--primary-color)] font-bold hover:text-[var(--accent-color)]"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          handleNameClick(row);
        }}
      >
        {row.name || `${row.firstName || ""} ${row.lastName || ""}`.trim()}
      </button>
    ),
  },
  { header: "Diagnosis", accessor: "diagnosis" },
  { header: "Date & Time", accessor: "datetime" },
  {
    header: "Actions",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddRecord(row);
          }}
          className="edit-btn"
        >
          Visit Pad
        </button>
        <TeleConsultFlow phone={row.phone} />
        <button
          title="View Medical Record"
          onClick={(e) => {
            e.stopPropagation();
            let age = "";
            if (row.dob) {
              const dobDate = new Date(row.dob);
              const today = new Date();
              age = today.getFullYear() - dobDate.getFullYear();
              const m = today.getMonth() - dobDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
                age--;
              }
            }
            navigate("/doctordashboard/medical-record", {
              state: {
                patientName: row.name || `${row.firstName || ""} ${row.lastName || ""}`.trim(),
                patientId: row.id,
                email: row.email || "",
                phone: row.phone || "",
                gender: row.gender || row.sex || "",
                dob: row.dob || "",
                diagnosis: row.diagnosis || "",
                datetime: row.datetime || "",
                temporaryAddress:
                  row.temporaryAddress ||
                  row.addressTemp ||
                  row.address ||
                  "",
                address:
                  row.address ||
                  row.temporaryAddress ||
                  row.addressTemp ||
                  "",
                addressTemp:
                  row.addressTemp ||
                  row.temporaryAddress ||
                  row.address ||
                  "",
                age: age,
                patientData: {
                  id: row.id,
                  name: row.name || `${row.firstName || ""} ${row.lastName || ""}`.trim(),
                  email: row.email || "",
                  phone: row.phone || "",
                  gender: row.gender || row.sex || "",
                  dob: row.dob || "",
                  diagnosis: row.diagnosis || "",
                  datetime: row.datetime || "",
                  age: age,
                  bloodGroup: row.bloodGroup || "",
                  reason: row.reason || "",
                  address: row.address || row.temporaryAddress || row.addressTemp || "",
                },
              },
            });
          }}
          className="text-blue-600 hover:text-blue-800"
          style={{ display: "flex", alignItems: "center" }}
        >
          <FiExternalLink />
        </button>
      </div>
    ),
  },
];
  const openModal = (modalName, data = null) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
    if (modalName === "viewPatient" && data) {
      setSelectedPatient({ ...data, name: formatName(data.firstName) }); // Format name before setting
    }
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    if (modalName === "viewPatient") {
      setSelectedPatient(null);
    }
  };

  const viewPatientDetails = async (patient) => {
    openModal("viewPatient", patient);
    try {
      const { data: personalData } = await axios.get(API.HD);
      const p = personalData.find(
        (p) =>
          (p.email || "").trim().toLowerCase() ===
          (patient.email || "").trim().toLowerCase()
      );
      if (p) {
        setPersonalDetails({
          height: p.height,
          weight: p.weight,
          bloodGroup: p.bloodGroup,
          surgeries: p.surgeries,
          allergies: p.allergies,
          isSmoker: p.isSmoker,
          isAlcoholic: p.isAlcoholic,
        });
      }
      const { data: familyData } = await axios.get(API.FD);
      setFamily(
        familyData.filter(
          (f) =>
            (f.email || "").trim().toLowerCase() ===
            (patient.email || "").trim().toLowerCase()
        )
      );
      const { data: vitalsData } = await axios.get(API.HS);
      const v = vitalsData.find(
        (v) =>
          (v.email || "").trim().toLowerCase() ===
          (patient.email || "").trim().toLowerCase()
      );
      setVitals(
        v
          ? {
              bloodPressure: v.bloodPressure || "Not recorded",
              heartRate: v.heartRate || "Not recorded",
              temperature: v.temperature || "Not recorded",
              bloodSugar: v.bloodSugar || "Not recorded",
            }
          : null
      );
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const handleAddRecord = (patient) => {
    navigate("/doctordashboard/form", { state: { patient } });
  };

  return (
    <div className="space-y-4">
      <DynamicTable
        columns={opdColumns}
        data={paginatedPatients}
        onRowClick={handleRowClick}
        filters={[]}
        tabs={[]}
        tabActions={[]}
        activeTab=""
        onTabChange={() => {}}
        rowClassName={(row) =>
          row.id === newPatientId || highlightedIds.includes(row.id)
            ? "bg-green-100 animate-pulse"
            : ""
        }
      />
      <div className="w-full flex justify-end mt-4">
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <ReusableModal
        isOpen={modals.viewPatient}
        onClose={() => closeModal("viewPatient")}
        mode="viewProfile"
        title="Patient Details"
        viewFields={VIEW_PATIENT_FIELDS.map(field =>
          field.key === "name" ? { ...field, label: "Formatted Name" } : field
        )}
        data={selectedPatient || {}}
        extraContent={
          <div className="space-y-4">
            {personalDetails && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  Health Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Height: {personalDetails.height || "—"} cm</div>
                  <div>Weight: {personalDetails.weight || "—"} kg</div>
                  <div>
                    Blood Group: {personalDetails.bloodGroup || "Not recorded"}
                  </div>
                  <div>Allergies: {personalDetails.allergies || "None"}</div>
                </div>
              </div>
            )}
            {vitals && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Vital Signs
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>BP: {vitals.bloodPressure}</div>
                  <div>HR: {vitals.heartRate}</div>
                  <div>Temp: {vitals.temperature}</div>
                  <div>Sugar: {vitals.bloodSugar}</div>
                </div>
              </div>
            )}
            {family && family.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">
                  Family History
                </h4>
                <div className="space-y-2">
                  {family.map((member, i) => (
                    <div key={i} className="text-sm">
                      <strong>{formatName(member.firstName)}</strong> ({member.relation}) -{" "}
                      {member.diseases?.join(", ") || "No diseases"}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
