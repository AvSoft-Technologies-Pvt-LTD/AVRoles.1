import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import {
  Search,
  Plus,
  CheckCircle,
  EyeOff,
  Heart,
  Activity,
  Thermometer,
} from "lucide-react";

const MedicalRecords = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user); // Fetch user from Redux store

  const [state, setState] = useState({
    activeTab: "OPD",
    showAddModal: false,
    hiddenIds: [],
  });

  // Load initial data from localStorage or use default sample data
  const defaultMedicalData = {
    OPD: [
      {
        id: 1,
        hospitalName: "SDM Hospital",
        type: "OPD",
        diagnosis: "Fever",
        "K/C/O": "Diabetic",
        dateOfVisit: "2025-07-01",
        status: "Treated",
        patientName: `${user?.firstName || "Guest"} ${user?.lastName || ""}`.trim(),
        age: user?.age ? `${user.age} years` : "N/A",
        sex: user?.gender || "Not specified",
        phone: user?.phone || "Not provided",
        address: user?.address || "Not provided",
        isVerified: true,
        isNewlyAdded: false,
        vitals: {
          bloodPressure: "120/80 mmHg",
          heartRate: "72 bpm",
          temperature: "98.6°F",
          spO2: "98%",
          respiratoryRate: "16 b/m",
          height: "5'8\"",
          weight: "70 kg",
        },
      },
      {
        id: 2,
        hospitalName: "CityCare Hospital",
        type: "OPD",
        diagnosis: "Cough",
        "K/C/O": "Diabetic",
        dateOfVisit: "2025-07-02",
        status: "Active",
        patientName: `${user?.firstName || "Guest"} ${user?.lastName || ""}`.trim(),
        age: user?.age ? `${user.age} years` : "N/A",
        sex: user?.gender || "Not specified",
        phone: user?.phone || "Not provided",
        address: user?.address || "Not provided",
        isVerified: false,
        isNewlyAdded: false,
        vitals: {
          bloodPressure: "110/70 mmHg",
          heartRate: "68 bpm",
          temperature: "99.2°F",
          spO2: "97%",
          respiratoryRate: "18 b/m",
          height: "5'4\"",
          weight: "60 kg",
        },
      },
    ],
    IPD: [
      {
        id: 3,
        hospitalName: "Apollo Hospital",
        type: "IPD",
        diagnosis: "Appendicitis",
        "K/C/O": "Diabetic",
        dateOfAdmission: "2025-06-25",
        dateOfDischarge: "2025-06-30",
        status: "Discharged",
        patientName: `${user?.firstName || "Guest"} ${user?.lastName || ""}`.trim(),
        age: user?.age ? `${user.age} years` : "N/A",
        sex: user?.gender || "Not specified",
        phone: user?.phone || "Not provided",
        address: user?.address || "Not provided",
        isVerified: true,
        hasDischargeSummary: true,
        isNewlyAdded: false,
        vitals: {
          bloodPressure: "130/85 mmHg",
          heartRate: "78 bpm",
          temperature: "98.4°F",
          spO2: "99%",
          respiratoryRate: "14 b/m",
          height: "6'0\"",
          weight: "80 kg",
        },
      },
    ],
    Virtual: [
      {
        id: 4,
        hospitalName: "Apollo Telemedicine",
        type: "Virtual",
        diagnosis: "Headache",
        "K/C/O": "Diabetic",
        dateOfConsultation: "2025-07-05",
        status: "Consulted",
        patientName: `${user?.firstName || "Guest"} ${user?.lastName || ""}`.trim(),
        age: user?.age ? `${user.age} years` : "N/A",
        sex: user?.gender || "Not specified",
        phone: user?.phone || "Not provided",
        address: user?.address || "Not provided",
        isVerified: false,
        isNewlyAdded: false,
        vitals: {
          bloodPressure: "115/75 mmHg",
          heartRate: "70 bpm",
          temperature: "98.7°F",
          spO2: "98%",
          respiratoryRate: "16 b/m",
          height: "5'6\"",
          weight: "65 kg",
        },
      },
    ],
  };

  const getInitialMedicalData = () => {
    try {
      const stored = localStorage.getItem("medicalData");
      if (stored) return JSON.parse(stored);
    } catch {}
    return defaultMedicalData;
  };

  const [medicalData, setMedicalData] = useState(getInitialMedicalData());

  const statusTypes = [
    "Active",
    "Treated",
    "Recovered",
    "Discharged",
    "Consulted",
  ];
  const medicalConditions = [
    { label: "Diabetic Disease", value: "Diabetic" },
    { label: "BP (Blood Pressure)", value: "BP" },
    { label: "Heart Disease", value: "Heart" },
    { label: "Asthma Disease", value: "Asthma" },
  ];

  const updateState = (updates) =>
    setState((prev) => ({ ...prev, ...updates }));

  const handleViewDetails = (record) => {
    // Navigate to details page and pass record data via state
    navigate("/patientdashboard/medical-record-details", {
      state: { selectedRecord: record },
    });
  };

  const handleHideRecord = (id) => {
    updateState({ hiddenIds: [...state.hiddenIds, id] });
  };

  const handleUnhideRecord = (id) => {
    updateState({
      hiddenIds: state.hiddenIds.filter((hiddenId) => hiddenId !== id),
    });
  };

  const handleAddRecord = (formData) => {
    // Ensure type is set for the new record and tab
    const recordType = formData.type || state.activeTab;
    const newRecord = {
      id: Date.now(), // Generate unique ID
      ...formData,
      type: recordType,
      patientName: `${user?.firstName || "Guest"} ${user?.lastName || ""}`.trim(),
      age: user?.age ? `${user.age} years` : "N/A",
      sex: user?.gender || "Not specified",
      phone: user?.phone || "Not provided",
      address: user?.address || "Not provided",
      isVerified: formData.uploadedBy === "Doctor",
      hasDischargeSummary: recordType === "IPD",
      isNewlyAdded: true, // Mark as newly added
      vitals: {
        bloodPressure: "N/A",
        heartRate: "N/A", 
        temperature: "N/A",
        spO2: "N/A",
        respiratoryRate: "N/A",
        height: "N/A",
        weight: "N/A",
      },
    };

    // Add to appropriate tab based on type, show new record at the bottom
    setMedicalData(prev => {
      const updated = {
        ...prev,
        [recordType]: [
          ...(Array.isArray(prev[recordType]) ? prev[recordType] : []),
          newRecord
        ]
      };
      // Save to localStorage
      try {
        localStorage.setItem("medicalData", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    updateState({ showAddModal: false });
    // Do NOT redirect here. Only show in table.
  };

  const createColumns = (type) => {
    // Replace 'diagnosis' with 'chiefComplaint' in all record types
    const baseFields = {
      OPD: ["hospitalName", "type", "chiefComplaint", "dateOfVisit", "status"],
      IPD: [
        "hospitalName",
        "type",
        "chiefComplaint",
        "dateOfAdmission",
        "dateOfDischarge",
        "status",
      ],
      Virtual: [
        "hospitalName",
        "type",
        "chiefComplaint",
        "dateOfConsultation",
        "status",
      ],
    };

    const fieldLabels = {
      hospitalName: "Hospital",
      type: "Type",
      chiefComplaint: "Chief Complaint",
      dateOfVisit: "Date of Visit",
      dateOfAdmission: "Date of Admission",
      dateOfDischarge: "Date of Discharge",
      dateOfConsultation: "Date of Consultation",
      status: "Status",
    };

    const typeColors = { OPD: "purple", IPD: "blue", Virtual: "indigo" };

    return [
      ...baseFields[type].map((key) => ({
        header: fieldLabels[key],
        accessor: key,
        cell: (row) => {
          const hiddenClass = row.isHidden ? "blur-sm opacity-30" : "";
          if (key === "hospitalName") {
            return (
              <div className={`flex items-center gap-2 ${hiddenClass}`}>
                {(row.isVerified || row.hasDischargeSummary) && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
                <button
                  type="button"
                  className="text-[var(--primary-color)] underline hover:text-[var(--accent-color)] font-semibold"
                  onClick={() => handleViewDetails(row)}
                >
                  {row.hospitalName}
                </button>
              </div>
            );
          }
          if (key === "type") {
            return (
              <span
                className={`text-sm font-semibold px-2 py-1 rounded-full bg-${
                  typeColors[row.type]
                }-100 text-${typeColors[row.type]}-800 ${hiddenClass}`}
              >
                {row.type}
              </span>
            );
          }
          if (key === "status") {
            return (
              <span className={`text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800 ${hiddenClass}`}>
                {row.status}
              </span>
            );
          }
          return (
            <span className={hiddenClass}>
              {row[key]}
            </span>
          );
        },
      })),
     {
  header: "Actions",
  accessor: "actions",
  cell: (row) => (
    <div className="flex gap-2">
      <button
        onClick={() =>
          row.isHidden
            ? handleUnhideRecord(row.id)
            : handleHideRecord(row.id)
        }
        className={`transition-colors ${
          row.isHidden
            ? "text-green-500 hover:text-green-700"
            : "text-gray-500 hover:text-red-500"
        }`}
        title={row.isHidden ? "Unhide Record" : "Hide Record"}
        type="button"
      >
        <EyeOff size={16} />
      </button>
    </div>
  ),
},
    ];
  };

  const getCurrentTabData = () =>
    medicalData[state.activeTab].map((record) => {
      // If chiefComplaint is missing, use diagnosis value
      const chiefComplaint = record.chiefComplaint || record.diagnosis || "";
      return {
        ...record,
        chiefComplaint,
        isHidden: state.hiddenIds.includes(record.id),
      };
    });

  const getFormFields = (recordType) => [
    { name: "hospitalName", label: "Hospital Name", type: "text" },
    { name: "chiefComplaint", label: "Chief Complaint", type: "text" },
    {
      name: "conditions",
      label: "Medical Conditions",
      type: "multiselect",
      options: medicalConditions,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusTypes.map((s) => ({ label: s, value: s })),
    },
    ...({
      OPD: [{ name: "dateOfVisit", label: "Date of Visit", type: "date" }],
      IPD: [
        { name: "dateOfAdmission", label: "Date of Admission", type: "date" },
        { name: "dateOfDischarge", label: "Date of Discharge", type: "date" },
      ],
      Virtual: [
        {
          name: "dateOfConsultation",
          label: "Date of Consultation",
          type: "date",
        },
      ],
    }[recordType] || []),
  ];

  const tabs = Object.keys(medicalData).map((key) => ({
    label: key,
    value: key,
  }));

  const filters = [
    {
      key: "hospitalName",
      label: "Hospital",
      options: Object.values(medicalData).flatMap((records) =>
        records.map((record) => ({
          value: record.hospitalName,
          label: record.hospitalName,
        }))
      ),
    },
    {
      key: "status",
      label: "Status",
      options: statusTypes.map((status) => ({ value: status, label: status })),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Search size={24} className="text-[var(--primary-color)]" />
          <h2 className="h2-heading">Medical Records History</h2>
        </div>
        <button
          onClick={() => updateState({ showAddModal: true })}
          className="btn btn-primary"
        >
          <Plus size={18} /> Add Record
        </button>
      </div>

      <DynamicTable
        columns={createColumns(state.activeTab)}
        data={getCurrentTabData()}
        filters={filters}
        tabs={tabs}
        activeTab={state.activeTab}
        onTabChange={(tab) => updateState({ activeTab: tab })}
      />

      {/* Add Record Modal */}
      <ReusableModal
        isOpen={state.showAddModal}
        onClose={() => updateState({ showAddModal: false })}
        mode="add"
        title="Add Medical Record"
        fields={getFormFields(state.activeTab)}
        data={{}}
        onSave={handleAddRecord}
      />
    </div>
  );
};

export default MedicalRecords;