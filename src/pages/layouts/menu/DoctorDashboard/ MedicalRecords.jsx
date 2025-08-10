



import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import ReusableModal from "../../../../components/microcomponents/Modal";
import {
  ArrowLeft,
  Search,
  Plus,
  CheckCircle,
  EyeOff,
  Heart,
  Activity,
  Thermometer,
} from "lucide-react";

const DrMedicalRecords = () => {
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
  }; // Helper function to get initials from name

  // State for medical records
  const [medicalData, setMedicalData] = useState({
    OPD: [],
    IPD: [],
    Virtual: []
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch all medical records from API using axios
  useEffect(() => {
    const fetchAllRecords = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await axios.get(
          "https://6895d385039a1a2b28907a16.mockapi.io/pt-mr/patient-mrec"
        );
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

        // Initialize hiddenIds from API data
        const hiddenRecords = response.data
          .filter(record => record.hiddenByPatient)
          .map(record => record.id);
        updateState({ hiddenIds: hiddenRecords });
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

  // When navigating to details, always pass the exact values from the API (no formatting)
  // Always pass the correct patientName, email, and phone from the API record
  const handleViewDetails = (record) => {
    // Try all possible field names for name/email/phone
    const patientName = record.patientName || record.name || record.firstName || record.lastName || '';
    const email = record.email || record.patientEmail || record.Email || '';
    const phone = record.phone || record.phoneNumber || record.Phone || '';

    // Extract first name and last name from patientName
    const nameParts = patientName.split(" ");
    const firstName = nameParts[0] || "Guest";
    const lastName = nameParts.slice(1).join(" ") || "Guest";

    const patientData = {
      ...record,
      patientName,
      email,
      phone,
      id: record.id || record.patientId || '',
      currentDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      currentTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      firstName,
      lastName
    };

    navigate("/doctordashboard/medical-record-details", {
      state: {
        selectedRecord: {
          ...patientData,
          isVerified: record.isVerified || false,
          hasDischargeSummary: record.hasDischargeSummary || false,
          phoneConsent: record.phoneConsent || false,
          createdBy: record.createdBy || "patient"
        },
        firstName,
        lastName,
        email,
        phone
      },
    });
  };

  const handleHideRecord = (id) => {
    updateHideStatus(id, true);
  };

  const handleUnhideRecord = (id) => {
    updateHideStatus(id, false);
  };

  // Function to update hide status in API and local state
  const updateHideStatus = async (recordId, isHidden) => {
    try {
      // Update the record in the API
      await axios.put(
        `https://6895d385039a1a2b28907a16.mockapi.io/pt-mr/patient-mrec/${recordId}`,
        { hiddenByPatient: isHidden }
      );

      // Update local state
      setMedicalData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(type => {
          updated[type] = updated[type].map(record =>
            record.id === recordId
              ? { ...record, hiddenByPatient: isHidden }
              : record
          );
        });
        return updated;
      });

      // Update hiddenIds for UI consistency
      if (isHidden) {
        updateState({ hiddenIds: [...state.hiddenIds, recordId] });
      } else {
        updateState({
          hiddenIds: state.hiddenIds.filter((hiddenId) => hiddenId !== recordId),
        });
      }
    } catch (error) {
      console.error("Error updating hide status:", error);
      // Fallback to local state only if API fails
      if (isHidden) {
        updateState({ hiddenIds: [...state.hiddenIds, recordId] });
      } else {
        updateState({
          hiddenIds: state.hiddenIds.filter((hiddenId) => hiddenId !== recordId),
        });
      }
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
      phone: formData.phoneNumber || user?.phone || "Not provided",
      email: formData.email || user?.email || "Not provided",
      phoneConsent: formData.phoneConsent || false,
      address: user?.address || "Not provided",
      isVerified: true, // Always set to true for doctor-created records
      hasDischargeSummary: recordType === "IPD",
      isNewlyAdded: true, // Mark as newly added
      createdBy: "doctor", // Mark as created by doctor
      hiddenByPatient: false, // Initialize as not hidden by patient
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

      // Update local state with the response data (which includes the API-generated ID)
      setMedicalData(prev => {
        const updated = {
          ...prev,
          [recordType]: [
            ...(Array.isArray(prev[recordType]) ? prev[recordType] : []),
            response.data
          ]
        };
        // Save to localStorage as backup
        try {
          localStorage.setItem("medicalData", JSON.stringify(updated));
        } catch (e) {
          console.error("Error saving to localStorage:", e);
        }
        return updated;
      });

      updateState({ showAddModal: false });
      // Show success message
      console.log("Record added successfully with phone consent:", formData.phoneConsent);
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
        try {
          localStorage.setItem("medicalData", JSON.stringify(updated));
        } catch (e) {
          console.error("Error saving to localStorage:", e);
        }
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
                {/* Show green checkmark based on multiple conditions */}
                {(row.isVerified === true ||
                  row.hasDischargeSummary === true ||
                  row.phoneConsent === true ||
                  row.createdBy === "doctor") && (
                  <CheckCircle
                    size={16}
                    className="text-green-600"
                    title={
                      row.isVerified ? "Verified record" :
                      row.hasDischargeSummary ? "Has discharge summary" :
                      row.phoneConsent ? "Phone consent given" :
                      "Doctor created record"
                    }
                  />
                )}
                {/* Show orange eye-off icon if hidden by patient */}
                {row.hiddenByPatient && (
                  <EyeOff
                    size={16}
                    className="text-orange-500"
                    title="Hidden by patient"
                  />
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
  // Show only records that meet the criteria for the green checkmark
  const getCurrentTabData = () => {
    return (medicalData[state.activeTab] || [])
      .filter((record) => {
        return (
          record.isVerified === true ||
          record.hasDischargeSummary === true
        );
      })
      .map((record) => {
        const chiefComplaint = record.chiefComplaint || record.diagnosis || "";
        return {
          ...record,
          chiefComplaint,
          isHidden: state.hiddenIds.includes(record.id),
        };
      });
  };

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
        label: "Consent"
      }
    },
  ];

  const tabs = Object.keys(medicalData).map((key) => ({
    label: key,
    value: key,
  }));

  // Filter options based on records with phone consent only, not hidden by patient, and not created by patient
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
    }
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

  // Patient details fetched from /addpatient API
  const [patientDetails, setPatientDetails] = useState(null);

  useEffect(() => {
    // Try to fetch patient details if selectedRecord has id or email
    const fetchPatientDetails = async () => {
      if (!selectedRecord) return;
      const patientId = selectedRecord.patientId || selectedRecord.id;
      const patientEmail = selectedRecord.email;
      if (!patientId && !patientEmail) return;
      try {
        // Example: /addpatient?id=... or /addpatient?email=...
        let url = "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient";
        if (patientId) {
          url += `?id=${patientId}`;
        } else if (patientEmail) {
          url += `?email=${encodeURIComponent(patientEmail)}`;
        }
        const res = await axios.get(url);
        // If API returns array, take first
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPatientDetails(res.data[0]);
        } else if (res.data) {
          setPatientDetails(res.data);
        }
      } catch (e) {
        setPatientDetails(null);
      }
    };
    fetchPatientDetails();
  }, [selectedRecord]);

  // Calculate age from dob (prefer patientDetails.dob, fallback to selectedRecord.dob)
  let calculatedAge = null;
  let dob = patientDetails?.dob || selectedRecord?.dob;
  if (dob) {
    const dobDate = new Date(dob);
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

  // Get statistics for records with phone consent, not hidden by patient, and not created by patient
  const getConsentStats = () => {
    const allRecords = Object.values(medicalData).flat();
    const verifiedRecords = allRecords.filter(record =>
      record.isVerified === true ||
      record.hasDischargeSummary === true
    );
    const visibleRecords = verifiedRecords; // Show only verified records
    const totalRecords = allRecords.length;

    return {
      withConsent: verifiedRecords.length,
      visible: visibleRecords.length,
      total: totalRecords,
      percentage: totalRecords > 0 ? Math.round((visibleRecords.length / totalRecords) * 100) : 0
    };
  };

  const consentStats = getConsentStats();

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <button
        className="mb-4 inline-flex items-center"
        onClick={() => navigate("/doctordashboard/patients")}
      >
        <ArrowLeft size={20} /> <span className="ms-2 font-medium">Back to Patient List</span>
      </button>

      {/* Patient summary card */}
      {selectedRecord && (
        <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="relative h-20 w-20 shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold uppercase shadow-inner ring-4 ring-white ring-offset-2 text-[#01B07A]">
                {getInitials(
                  selectedRecord.patientName || selectedRecord.name || patientDetails?.name || ""
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">
                {selectedRecord.patientName || selectedRecord.name || patientDetails?.name || "--"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm">
                <div className="space-y-1">
                  <div>Age: {selectedRecord.age || calculatedAge || patientDetails?.age || "--"}</div>
                  <div>Gender: {selectedRecord.gender || selectedRecord.sex || patientDetails?.gender || patientDetails?.sex || "--"}</div>
                </div>
                <div className="space-y-1">
                  <div>Hospital: {selectedRecord.hospitalName || "AV Hospital"}</div>
                  <div>
                    Visit Date: {
                      (() => {
                        const type = patientDetails?.type || selectedRecord.type;
                        if (type === "OPD") {
                          return patientDetails?.appointmentDate || selectedRecord.appointmentDate || selectedRecord.dateOfVisit || "--";
                        } else if (type === "IPD") {
                          return patientDetails?.admissionDate || selectedRecord.admissionDate || selectedRecord.dateOfAdmission || "--";
                        } else {
                          return patientDetails?.dateOfConsultation || selectedRecord.dateOfConsultation || selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || "--";
                        }
                      })()
                    }
                  </div>
                  {/* Display Ward Type for IPD records */}
                  {(patientDetails?.type === "IPD" || selectedRecord.type === "IPD") && (
                    <div>Ward Type: {selectedRecord.wardType || "--"}</div>
                  )}
                </div>
                <div className="space-y-1">
                  <div>Diagnosis: {selectedRecord.diagnosis || selectedRecord.chiefComplaint || "--"}</div>
                  <div>K/C/O: {selectedRecord["K/C/O"] ?? "--"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Search size={24} className="text-[var(--primary-color)]" />
          <div>
            <h2 className="h4-heading">Medical Records History</h2>
          </div>
        </div>
      </div>

      {/* Always show tabs and Add Record button, even if no data */}
      <DynamicTable
        columns={createColumns(state.activeTab)}
        data={getCurrentTabData()}
        filters={filters}
        tabs={tabs}
        tabActions={tabActions}
        activeTab={state.activeTab}
        onTabChange={(tab) => updateState({ activeTab: tab })}
      />

      {/* If loading or error, show message above the table */}
      {loading && (
        <div className="text-center py-8">Loading medical records...</div>
      )}
      {fetchError && (
        <div className="text-center text-red-600 py-8">{fetchError}</div>
      )}
      {getCurrentTabData().length === 0 && !loading && !fetchError && (
        <div className="text-center py-8 text-gray-600">
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No Medical Records</h3>
              <p className="text-sm">
                No medical records found for this patient in the selected category.
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

export default DrMedicalRecords;