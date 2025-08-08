

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
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
  const location = useLocation();
  const user = useSelector((state) => state.auth.user); // Fetch user from Redux store

  const [state, setState] = useState({
    activeTab: "OPD",
    showAddModal: false,
    hiddenIds: [],
  });

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  // Helper function to get initials from name
  

  // State for medical records
  const [medicalData, setMedicalData] = useState({ OPD: [], IPD: [], Virtual: [] });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch all medical records from API using axios
  useEffect(() => {
    const fetchAllRecords = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await axios.get("https://6895d385039a1a2b28907a16.mockapi.io/pt-mr/patient-mrec");
        // API returns an array of records, each with type: OPD, IPD, or Virtual
        const opd = [];
        const ipd = [];
        const virtual = [];
        response.data.forEach((rec) => {
          if (rec.type === "OPD") opd.push(rec);
          else if (rec.type === "IPD") ipd.push(rec);
          else if (rec.type === "Virtual") virtual.push(rec);
        });
        setMedicalData({ OPD: opd, IPD: ipd, Virtual: virtual });
      } catch (err) {
        setFetchError("Failed to fetch medical records.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllRecords();
  }, []);

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
    // Always pass patientName for robust downstream display
    let patientName = record.patientName;
    if (!patientName || patientName.trim().length === 0 || patientName.trim().toLowerCase() === 'guest') {
      // Try to construct from name fields if available
      if (record.name && record.name.trim().length > 0 && record.name.trim().toLowerCase() !== 'guest') {
        patientName = record.name.trim();
      } else if (record.firstName || record.lastName) {
        patientName = `${record.firstName || ''} ${record.lastName || ''}`.trim();
      } else {
        patientName = '';
      }
    }
    // Pass email for patient lookup in details page
    const patientData = {
      ...record,
      patientName,
      email: record.email || (user && user.email) || '',
      currentDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      currentTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
    navigate("/doctordashboard/medical-record-details", {
      state: { selectedRecord: patientData },
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
      phone: formData.phoneNumber || user?.phone || "Not provided",
      phoneConsent: formData.phoneConsent || false,
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
                {row.phoneConsent && (
                  <CheckCircle size={16} className="text-green-600" title="Phone consent given" />
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
    ];
  };

  // Filter records for the current tab, and add chiefComplaint fallback
  const getCurrentTabData = () =>
    (medicalData[state.activeTab] || []).map((record) => {
      const chiefComplaint = record.chiefComplaint || record.diagnosis || "";
      return {
        ...record,
        chiefComplaint,
        isHidden: state.hiddenIds.includes(record.id),
      };
    });

  const getFormFields = (recordType) => [
    { 
      name: "hospitalName", 
      label: "Hospital Name", 
      type: "select", 
      options: [
        { label: "AIIMS Delhi", value: "AIIMS Delhi" },
        { label: "Fortis Hospital, Gurgaon", value: "Fortis Hospital, Gurgaon" },
        { label: "Apollo Hospital, Chennai", value: "Apollo Hospital, Chennai" },
        { label: "Medanta – The Medicity, Gurgaon", value: "Medanta – The Medicity, Gurgaon" },
        { label: "Max Super Speciality Hospital, Delhi", value: "Max Super Speciality Hospital, Delhi" },
        { label: "Narayana Health, Bangalore", value: "Narayana Health, Bangalore" },
        { label: "Kokilaben Dhirubhai Ambani Hospital, Mumbai", value: "Kokilaben Dhirubhai Ambani Hospital, Mumbai" },
        { label: "Lilavati Hospital, Mumbai", value: "Lilavati Hospital, Mumbai" },
        { label: "Sir Ganga Ram Hospital, Delhi", value: "Sir Ganga Ram Hospital, Delhi" },
        { label: "Christian Medical College, Vellore", value: "Christian Medical College, Vellore" },
        { label: "Manipal Hospital, Bangalore", value: "Manipal Hospital, Bangalore" },
        { label: "Jaslok Hospital, Mumbai", value: "Jaslok Hospital, Mumbai" },
        { label: "BLK Super Speciality Hospital, Delhi", value: "BLK Super Speciality Hospital, Delhi" },
        { label: "Care Hospitals, Hyderabad", value: "Care Hospitals, Hyderabad" },
        { label: "Amrita Hospital, Kochi", value: "Amrita Hospital, Kochi" },
        { label: "Ruby Hall Clinic, Pune", value: "Ruby Hall Clinic, Pune" },
        { label: "Columbia Asia Hospital, Bangalore", value: "Columbia Asia Hospital, Bangalore" },
        { label: "Hinduja Hospital, Mumbai", value: "Hinduja Hospital, Mumbai" },
        { label: "D.Y. Patil Hospital, Navi Mumbai", value: "D.Y. Patil Hospital, Navi Mumbai" },
        { label: "Tata Memorial Hospital, Mumbai", value: "Tata Memorial Hospital, Mumbai" },
        { label: "Apollo Gleneagles Hospital, Kolkata", value: "Apollo Gleneagles Hospital, Kolkata" },
        { label: "Wockhardt Hospitals, Mumbai", value: "Wockhardt Hospitals, Mumbai" },
        { label: "SevenHills Hospital, Mumbai", value: "SevenHills Hospital, Mumbai" },
        { label: "KIMS Hospital, Hyderabad", value: "KIMS Hospital, Hyderabad" },
        { label: "Global Hospitals, Chennai", value: "Global Hospitals, Chennai" },
        { label: "Yashoda Hospitals, Hyderabad", value: "Yashoda Hospitals, Hyderabad" },
        { label: "Sunshine Hospital, Hyderabad", value: "Sunshine Hospital, Hyderabad" },
        { label: "BM Birla Heart Research Centre, Kolkata", value: "BM Birla Heart Research Centre, Kolkata" },
        { label: "Religare SRL Diagnostics, Mumbai", value: "Religare SRL Diagnostics, Mumbai" },
        { label: "Sankara Nethralaya, Chennai", value: "Sankara Nethralaya, Chennai" },
      ],
    },
  
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
    { 
      name: "phoneNumber", 
      label: "Phone Number", 
      type: "number",
      hasInlineCheckbox: true,
      inlineCheckbox: {
        name: "phoneConsent",
        
      }
    },
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


  // Always use selected record from navigation state if present, else fallback to first record in tab, else fallback default
  let selectedRecord;
  if (location.state) {
    if (location.state.selectedRecord) {
      selectedRecord = location.state.selectedRecord;
    } else {
      selectedRecord = location.state;
    }
  } else {
    const currentData = getCurrentTabData();
    if (currentData.length > 0) {
      selectedRecord = currentData[0];
    } else {
      selectedRecord = null;
    }
  }

  // Calculate age from dob if dob is present
  let calculatedAge = selectedRecord && selectedRecord.age;
  if (selectedRecord && selectedRecord.dob) {
    const dobDate = new Date(selectedRecord.dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    calculatedAge = age + ' years';
  }

  // Tab actions for the Add Record button
  const tabActions = [
    {
      label: (
        <div className="flex items-center gap-2">
          <Plus size={18} />
          Add Record
        </div>
      ),
      onClick: () => updateState({ showAddModal: true }),
      className: "btn btn-primary"
    }
  ];

  // Patient info card logic
  // Accept patientInfo as prop if passed (for future extensibility)
  const patientInfo = (typeof window !== 'undefined' && window.patientInfo) || null;

  return (
    <div className="p-6 space-y-6">
      {/* Patient Info Card */}
      {(() => {
        const patient = patientInfo || selectedRecord;
        if (!patient) return <div className="text-white">Patient not found.</div>;
        // Prefer patientName, then name, then '--'
        let displayName = '--';
        if (patient.patientName && patient.patientName.trim().length > 0 && patient.patientName.trim().toLowerCase() !== 'guest') {
          displayName = patient.patientName.trim();
        } else if (patient.name && patient.name.trim().length > 0 && patient.name.trim().toLowerCase() !== 'guest') {
          displayName = patient.name.trim();
        }
        // Calculate age from dob if present
        let calculatedAge = patient.age;
        if (patient.dob) {
          const dobDate = new Date(patient.dob);
          const today = new Date();
          let age = today.getFullYear() - dobDate.getFullYear();
          const m = today.getMonth() - dobDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
            age--;
          }
          calculatedAge = age + ' years';
        }
        // Show green tick if phone matches API patient
        const isSynced = !!(patientInfo && selectedRecord && patientInfo.phone && selectedRecord.phone && String(patientInfo.phone).trim() === String(selectedRecord.phone).trim());
        return (
          <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-6 text-white">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="relative h-20 w-20 shrink-0">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold uppercase shadow-inner ring-4 ring-white ring-offset-2 text-[#01B07A]">
                  {getInitials(displayName)}
                  {isSynced && (
                    <CheckCircle size={22} className="absolute -bottom-2 -right-2 text-green-500 bg-white rounded-full border-2 border-white" title="Synced with patient database" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">{displayName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm">
                  <div className="space-y-1">
                    <div>Age: {calculatedAge || '--'}</div>
                    <div>Gender: {patient.gender || patient.sex || '--'}</div>
                  </div>
                  <div className="space-y-1">
                    <div>Phone: {patient.phone || '--'}</div>
                    <div>Diagnosis: {patient.diagnosis || patient.chiefComplaint || '--'}</div>
                  </div>
                  <div className="space-y-1">
                    <div>Visit Date: {patient.dateOfVisit || patient.dateOfConsultation || patient.dateOfAdmission || '--'}</div>
                    <div>Blood Group: {patient.bloodType || patient.bloodGroup || '--'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex items-center gap-3 mb-6">
        <Search size={24} className="text-[var(--primary-color)]" />
        <h2 className="h4-heading">Medical Records History</h2>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading medical records...</div>
      ) : fetchError ? (
        <div className="text-center text-red-600 py-8">{fetchError}</div>
      ) : (
        <DynamicTable
          columns={createColumns(state.activeTab)}
          data={getCurrentTabData()}
          filters={filters}
          tabs={tabs}
          tabActions={tabActions}
          activeTab={state.activeTab}
          onTabChange={(tab) => updateState({ activeTab: tab })}
        />
      )}

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