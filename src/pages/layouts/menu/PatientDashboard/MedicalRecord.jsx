

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const PatientMedicalRecords = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user); // Fetch user from Redux store

  const [state, setState] = useState({
    activeTab: "OPD",
    showAddModal: false,
    hiddenIds: [],
  });

  // State for medical records
  const [medicalData, setMedicalData] = useState({
    OPD: [],
    IPD: [],
    Virtual: []
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Load hidden records from localStorage on component mount
  useEffect(() => {
    const savedHiddenIds = localStorage.getItem('patientHiddenRecords');
    if (savedHiddenIds) {
      try {
        const hiddenIds = JSON.parse(savedHiddenIds);
        setState(prev => ({ ...prev, hiddenIds }));
      } catch (error) {
        console.error('Error loading hidden records:', error);
      }
    }
  }, []);

  // Save hidden records to localStorage whenever hiddenIds changes
  useEffect(() => {
    localStorage.setItem('patientHiddenRecords', JSON.stringify(state.hiddenIds));
  }, [state.hiddenIds]);

  // Fetch medical records filtered by user's phone number using patientPhone field
  useEffect(() => {
    const fetchPatientRecords = async () => {
      setLoading(true);
      setFetchError(null);
      
      // Check if user has phone number
      if (!user?.phone) {
        setFetchError("Phone number not found. Please update your profile.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "https://6895d385039a1a2b28907a16.mockapi.io/pt-mr/patient-mrec"
        );
        
        // Filter records by comparing user's phone with patientPhone field
        const userPhone = user.phone;
        const filteredRecords = response.data.filter(record => {
          // Compare with patientPhone field (primary) and fallback to phone/phoneNumber
          return record.patientPhone === userPhone || 
                 record.phone === userPhone || 
                 record.phoneNumber === userPhone;
        });
        
        // Separate records by type
        const opd = [];
        const ipd = [];
        const virtual = [];
        
        filteredRecords.forEach((rec) => {
          if (rec.type === "OPD") opd.push(rec);
          else if (rec.type === "IPD") ipd.push(rec);
          else if (rec.type === "Virtual") virtual.push(rec);
        });
        
        setMedicalData({ OPD: opd, IPD: ipd, Virtual: virtual });
        
        // If no records found for this phone number
        if (filteredRecords.length === 0) {
          setFetchError(`No medical records found for phone number: ${userPhone}`);
        }
      } catch (err) {
        console.error("Error fetching medical records:", err);
        setFetchError("Failed to fetch medical records. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientRecords();
  }, [user?.phone]);

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

  const handleHideRecord = async (id) => {
    const newHiddenIds = [...state.hiddenIds, id];
    updateState({ hiddenIds: newHiddenIds });
    
    // Update the record in the API to mark it as hidden by patient
    try {
      await axios.put(
        `https://6895d385039a1a2b28907a16.mockapi.io/pt-mr/patient-mrec/${id}`,
        { hiddenByPatient: true }
      );
    } catch (error) {
      console.error('Error updating record hide status:', error);
    }
  };

  const handleUnhideRecord = async (id) => {
    const newHiddenIds = state.hiddenIds.filter((hiddenId) => hiddenId !== id);
    updateState({ hiddenIds: newHiddenIds });
    
    // Update the record in the API to mark it as not hidden by patient
    try {
      await axios.put(
        `https://6895d385039a1a2b28907a16.mockapi.io/pt-mr/patient-mrec/${id}`,
        { hiddenByPatient: false }
      );
    } catch (error) {
      console.error('Error updating record unhide status:', error);
    }
  };

  const handleAddRecord = async (formData) => {
    // Ensure type is set for the new record and tab
    const recordType = formData.type || state.activeTab;
    const newRecord = {
      id: Date.now(), // Generate unique ID
      ...formData,
      type: recordType,
      patientName: `${user?.firstName || "Guest"} ${user?.lastName || ""}`.trim(),
      age: user?.age ? `${user.age} years` : "N/A",
      sex: user?.gender || "Not specified",
      patientPhone: user?.phone || "Not provided", // Primary phone field
      phone: user?.phone || "Not provided", // Backup phone field
      phoneNumber: user?.phone || "Not provided", // Alternative phone field
      phoneConsent: formData.phoneConsent || false,
      address: user?.address || "Not provided",
      isVerified: formData.uploadedBy === "Doctor",
      hasDischargeSummary: recordType === "IPD",
      isNewlyAdded: true, // Mark as newly added
      createdBy: "patient", // Mark as created by patient
      hiddenByPatient: false, // Initialize as not hidden
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

    try {
      // Post to API to save the record
      const response = await axios.post(
        "https://6895d385039a1a2b28907a16.mockapi.io/pt-mr/patient-mrec",
        newRecord
      );
      
      // Update local state with the response data
      setMedicalData(prev => {
        const updated = {
          ...prev,
          [recordType]: [
            ...(Array.isArray(prev[recordType]) ? prev[recordType] : []),
            response.data
          ]
        };
        return updated;
      });

      updateState({ showAddModal: false });
    } catch (error) {
      console.error("Error adding record:", error);
      // Fallback to local storage if API fails
      setMedicalData(prev => {
        const updated = {
          ...prev,
          [recordType]: [
            ...(Array.isArray(prev[recordType]) ? prev[recordType] : []),
            newRecord
          ]
        };
        return updated;
      });
      updateState({ showAddModal: false });
    }
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
                {/* Only show one green checkmark: isVerified/hasDischargeSummary takes priority, else phoneConsent+doctor */}
                {(row.isVerified || row.hasDischargeSummary) ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (row.phoneConsent && row.createdBy === "doctor") ? (
                  <CheckCircle 
                    size={16} 
                    className="text-green-600" 
                    title="Phone consent given by doctor" 
                  />
                ) : null}
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
   
  ];

  const tabs = Object.keys(medicalData).map((key) => ({
    label: key,
    value: key,
  }));

  // Filter options based on current user's records only
  const filters = [
    {
      key: "hospitalName",
      label: "Hospital",
      options: [...new Set(Object.values(medicalData).flatMap((records) =>
        records.map((record) => record.hospitalName)
      ))].map(hospital => ({
        value: hospital,
        label: hospital,
      })),
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
          <div>
            <h2 className="h4-heading">Medical Records History</h2>
          </div>
        </div>
        <button
          onClick={() => updateState({ showAddModal: true })}
          className="btn btn-primary"
          disabled={!user?.phone}
          title={!user?.phone ? "Please update your phone number in profile" : "Add Record"}
        >
          <Plus size={18} />
          Add Record
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading medical records...</div>
      ) : fetchError ? (
        <div className="text-center text-red-600 ">
          
        </div>
      ) : null}

      {/* Always show tabs and Add Record button, even if no data */}
      <DynamicTable
        columns={createColumns(state.activeTab)}
        data={getCurrentTabData()}
        filters={filters}
        tabs={tabs}
        activeTab={state.activeTab}
        onTabChange={(tab) => updateState({ activeTab: tab })}
      />

      {/* Show empty state if no records for current tab and not loading or error */}
      {!loading && !fetchError && getCurrentTabData().length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
              <p className="text-sm">
                You have no medical records in this category. Click "Add Record" to create one.
              </p>
            </div>
          </div>
        </div>
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

export default PatientMedicalRecords;