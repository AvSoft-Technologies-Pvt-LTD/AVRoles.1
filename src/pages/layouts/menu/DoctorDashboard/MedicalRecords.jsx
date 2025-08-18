


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
  
  // Get patient data passed from OPD component
  const patientDataFromOPD = location.state?.patientData || location.state || {};
  const patientNameFromOPD = location.state?.patientName || patientDataFromOPD?.name || "";
  const patientEmailFromOPD = location.state?.email || patientDataFromOPD?.email || "";
  const patientPhoneFromOPD = location.state?.phone || patientDataFromOPD?.phone || "";
  const patientGenderFromOPD = location.state?.gender || patientDataFromOPD?.gender || "";
  const patientDobFromOPD = location.state?.dob || patientDataFromOPD?.dob || "";
  const patientAgeFromOPD = location.state?.age || patientDataFromOPD?.age || "";
  const patientDiagnosisFromOPD = location.state?.diagnosis || patientDataFromOPD?.diagnosis || "";

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

  // State for patient details from /addpatient API
  const [patientDetailsMap, setPatientDetailsMap] = useState({});

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

        // Fetch patient details for all records
        await fetchPatientDetailsForRecords(response.data);
      } catch (err) {
        setFetchError("Failed to fetch medical records.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllRecords();
  }, []);

  // Fetch patient details from /addpatient API for all records
  const fetchPatientDetailsForRecords = async (records) => {
    const patientMap = {};
    
    for (const record of records) {
      try {
        // Try to fetch by phone first, then by email, then by patientId
        const phone = record.phone || record.phoneNumber || record.Phone;
        const email = record.email || record.patientEmail || record.Email;
        const patientId = record.patientId || record.id;
        let patientDetails = null;
        
        // Try fetching by phone
        if (phone) {
          try {
            const phoneResponse = await axios.get(
              `https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient?phone=${encodeURIComponent(phone)}`
            );
            if (Array.isArray(phoneResponse.data) && phoneResponse.data.length > 0) {
              patientDetails = phoneResponse.data[0];
            } else if (phoneResponse.data) {
              patientDetails = phoneResponse.data;
            }
          } catch (e) {
            console.log("Phone lookup failed for:", phone);
          }
        }

        // If phone lookup failed, try email
        if (!patientDetails && email) {
          try {
            const emailResponse = await axios.get(
              `https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient?email=${encodeURIComponent(email)}`
            );
            if (Array.isArray(emailResponse.data) && emailResponse.data.length > 0) {
              patientDetails = emailResponse.data[0];
            } else if (emailResponse.data) {
              patientDetails = emailResponse.data;
            }
          } catch (e) {
            console.log("Email lookup failed for:", email);
          }
        }

        // If email lookup failed, try patientId
        if (!patientDetails && patientId) {
          try {
            const idResponse = await axios.get(
              `https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient?id=${patientId}`
            );
            if (Array.isArray(idResponse.data) && idResponse.data.length > 0) {
              patientDetails = idResponse.data[0];
            } else if (idResponse.data) {
              patientDetails = idResponse.data;
            }
          } catch (e) {
            console.log("ID lookup failed for:", patientId);
          }
        }

        if (patientDetails) {
          patientMap[record.id] = patientDetails;
        }
      } catch (error) {
        console.error("Error fetching patient details for record:", record.id, error);
      }
    }

    setPatientDetailsMap(patientMap);
  };

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
    // Get patient details from the map
    const patientDetails = patientDetailsMap[record.id];
    
    // Priority: OPD data > patient details from API > record data
    const patientName = patientNameFromOPD || 
      (patientDetails 
      ? `${patientDetails.firstName || ''} ${patientDetails.lastName || ''}`.trim()
      : record.patientName || record.name || '');
    
    const email = patientEmailFromOPD || patientDetails?.email || record.email || record.patientEmail || record.Email || '';
    const phone = patientPhoneFromOPD || patientDetails?.phone || record.phone || record.phoneNumber || record.Phone || '';
    const gender = patientGenderFromOPD || patientDetails?.gender || record.gender || record.sex || '';
    const dob = patientDobFromOPD || patientDetails?.dob || record.dob || '';
    const diagnosis = patientDiagnosisFromOPD || patientDetails?.diagnosis || record.diagnosis || record.chiefComplaint || '';

    // Extract first name and last name - prioritize patientDetails
    let firstName, lastName;
    if (patientNameFromOPD) {
      const nameParts = patientNameFromOPD.split(" ");
      firstName = nameParts[0] || "Guest";
      lastName = nameParts.slice(1).join(" ") || "";
    } else if (patientDetails) {
      firstName = patientDetails.firstName || "Guest";
      lastName = patientDetails.lastName || "";
    } else if (record.firstName && record.lastName) {
      firstName = record.firstName;
      lastName = record.lastName;
    } else if (patientName) {
      const nameParts = patientName.split(" ");
      firstName = nameParts[0] || "Guest";
      lastName = nameParts.slice(1).join(" ") || "";
    } else {
      firstName = "Guest";
      lastName = "";
    }

    const patientData = {
      ...record,
      patientName,
      email,
      phone,
      gender,
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
      lastName,
      // Include patient details from /addpatient API
      patientDetails,
      // Include OPD patient data
      opdPatientData: patientDataFromOPD,
      dob,
      diagnosis
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
        phone,
        gender,
        dob,
        diagnosis,
        patientName, // Ensure patientName is passed
        patientDetails, // Pass the full patient details
        // Ensure phone number is always passed for consistent patient lookup
        patientPhone: phone,
        // Pass additional identifiers for robust patient matching
        patientEmail: email,
        patientId: record.id || record.patientId || '',
        // Pass the record type for context
        recordType: record.type || state.activeTab,
        // Pass OPD patient data
        opdPatientData: patientDataFromOPD
      },
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

  const handleAddRecord = async (formData) => {
    // Ensure type is set for the new record and tab
    const recordType = formData.type || state.activeTab;
    
    // Extract first and last names from user data
    const userFirstName = user?.firstName || "Guest";
    const userLastName = user?.lastName || "";
    const fullPatientName = `${userFirstName} ${userLastName}`.trim();
    
    const newRecord = {
      id: Date.now(), // Generate unique ID
      ...formData,
      type: recordType,
      patientName: fullPatientName,
      firstName: userFirstName, // Store separately for easier access
      lastName: userLastName, // Store separately for easier access
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
      hospitalName: formData.hospitalName || "AV Hospital", // Default to AV Hospital if not specified
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

      // Try to fetch patient details for the new record
      try {
        const phone = newRecord.phone || newRecord.phoneNumber;
        const email = newRecord.email;
        
        let patientDetails = null;
        
        if (phone) {
          try {
            const phoneResponse = await axios.get(
              `https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient?phone=${encodeURIComponent(phone)}`
            );
            if (Array.isArray(phoneResponse.data) && phoneResponse.data.length > 0) {
              patientDetails = phoneResponse.data[0];
            }
          } catch (e) {
            console.log("Phone lookup failed for new record");
          }
        }

        if (!patientDetails && email) {
          try {
            const emailResponse = await axios.get(
              `https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient?email=${encodeURIComponent(email)}`
            );
            if (Array.isArray(emailResponse.data) && emailResponse.data.length > 0) {
              patientDetails = emailResponse.data[0];
            }
          } catch (e) {
            console.log("Email lookup failed for new record");
          }
        }

        if (patientDetails) {
          setPatientDetailsMap(prev => ({
            ...prev,
            [response.data.id]: patientDetails
          }));
        }
      } catch (error) {
        console.error("Error fetching patient details for new record:", error);
      }

      updateState({ showAddModal: false });
      
      // Navigate to the newly created record's details page
      const phone = newRecord.phone || newRecord.phoneNumber;
      const email = newRecord.email;
      
      // Navigate to details page with the new record data
      navigate("/doctordashboard/medical-record-details", {
        state: {
          selectedRecord: {
            ...response.data,
            isVerified: true,
            hasDischargeSummary: recordType === "IPD",
            phoneConsent: formData.phoneConsent || false,
            createdBy: "doctor"
          },
          firstName: userFirstName,
          lastName: userLastName,
          email: email,
          phone: phone,
          patientDetails: null, // Will be fetched in MedicalRecordDetails
          // Ensure phone number is always passed for consistent patient lookup
          patientPhone: phone,
          // Pass additional identifiers for robust patient matching
          patientEmail: email,
          patientId: response.data.id,
          // Pass the record type for context
          recordType: recordType,
          // Mark as newly created
          isNewlyCreated: true
        },
      });
      
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
      
      // Navigate to details page even if API fails
      const phone = newRecord.phone || newRecord.phoneNumber;
      const email = newRecord.email;
      
      navigate("/doctordashboard/medical-record-details", {
        state: {
          selectedRecord: {
            ...newRecord,
            isVerified: true,
            hasDischargeSummary: recordType === "IPD",
            phoneConsent: formData.phoneConsent || false,
            createdBy: "doctor"
          },
          firstName: userFirstName,
          lastName: userLastName,
          email: email,
          phone: phone,
          patientDetails: null,
          patientPhone: phone,
          patientEmail: email,
          patientId: newRecord.id,
          recordType: recordType,
          isNewlyCreated: true
        },
      });
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
          if (key === "hospitalName") {
            return (
              <div className="flex items-center gap-2">
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
                }-100 text-${typeColors[row.type]}-800`}
              >
                {row.type}
              </span>
            );
          }
          if (key === "status") {
            return (
              <span className="text-sm font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                {row.status}
              </span>
            );
          }
          return (
            <span>
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
      // First filter out records hidden by patient - doctor should not see these at all
      .filter((record) => !record.hiddenByPatient)
      // Show all records that are not hidden by patient (regardless of verification status)
      .map((record) => {
        const chiefComplaint = record.chiefComplaint || record.diagnosis || "";
        const patientDetails = patientDetailsMap[record.id];
        
        return {
          ...record,
          chiefComplaint,
          // Add patient name from /addpatient API if available
          displayPatientName: patientDetails 
            ? `${patientDetails.firstName || ''} ${patientDetails.lastName || ''}`.trim()
            : record.patientName || record.name || 'Unknown Patient'
        };
      });
  };

  const getFormFields = (recordType) => [
    {
      name: "hospitalName",
      label: "Hospital Name",
      type: "select",
      options: [
        { label: "AV Hospital", value: "AV Hospital" },
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
      label: "Register Phone Number",
      type: "te",
      hasInlineCheckbox: true,
      inlineCheckbox: {
        name: "phoneConsent",
        label: "sync with patient number"
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
        records
          .filter(record => !record.hiddenByPatient) // Only show hospitals from visible records
          .map((record) => record.hospitalName)
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

  // If we have OPD patient data but no selected record, create a mock record for display
  if (!selectedRecord && patientNameFromOPD) {
    selectedRecord = {
      patientName: patientNameFromOPD,
      name: patientNameFromOPD,
      email: patientEmailFromOPD,
      phone: patientPhoneFromOPD,
      gender: patientGenderFromOPD,
      sex: patientGenderFromOPD,
      dob: patientDobFromOPD,
      age: patientAgeFromOPD,
      diagnosis: patientDiagnosisFromOPD,
      hospitalName: "AV Hospital",
      type: "OPD"
    };
  }

  // Get patient details for the selected record
  const selectedPatientDetails = selectedRecord ? patientDetailsMap[selectedRecord.id] : null;

  // Calculate age from dob (prefer selectedPatientDetails.dob, fallback to selectedRecord.dob)
  let calculatedAge = null;
  let dob = patientDobFromOPD || selectedPatientDetails?.dob || selectedRecord?.dob;
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
    // Filter out records hidden by patient from all calculations
    const visibleToDoctor = allRecords.filter(record => !record.hiddenByPatient);
    const verifiedRecords = visibleToDoctor.filter(record =>
      record.isVerified === true ||
      record.hasDischargeSummary === true ||
      record.phoneConsent === true ||
      record.createdBy === "doctor"
    );
    const visibleRecords = visibleToDoctor; // Show all visible records to doctor
    const totalRecords = visibleToDoctor.length; // Use visible records as total for doctor

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
                  patientNameFromOPD || (selectedPatientDetails 
                    ? `${selectedPatientDetails.firstName || ''} ${selectedPatientDetails.lastName || ''}`.trim()
                    : selectedRecord.patientName || selectedRecord.name || "")
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">
                {patientNameFromOPD || (selectedPatientDetails 
                  ? `${selectedPatientDetails.firstName || ''} ${selectedPatientDetails.lastName || ''}`.trim()
                  : selectedRecord.patientName || selectedRecord.name || "--")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm">
                <div className="space-y-1">
                  <div>Age: {patientAgeFromOPD || selectedRecord.age || calculatedAge || selectedPatientDetails?.age || "--"}</div>
                  <div>Gender: {patientGenderFromOPD || selectedRecord.gender || selectedRecord.sex || selectedPatientDetails?.gender || selectedPatientDetails?.sex || "--"}</div>
                </div>
                <div className="space-y-1">
                  <div>Hospital: {selectedRecord.hospitalName || "AV Hospital"}</div>
                  <div>
                    Visit Date: {
                      (() => {
                        const type = selectedPatientDetails?.type || selectedRecord.type;
                        if (type === "OPD") {
                          return selectedPatientDetails?.appointmentDate || selectedRecord.appointmentDate || selectedRecord.dateOfVisit || "--";
                        } else if (type === "IPD") {
                          return selectedPatientDetails?.admissionDate || selectedRecord.admissionDate || selectedRecord.dateOfAdmission || "--";
                        } else {
                          return selectedPatientDetails?.dateOfConsultation || selectedRecord.dateOfConsultation || selectedRecord.dateOfVisit || selectedRecord.dateOfAdmission || "--";
                        }
                      })()
                    }
                  </div>
                  {/* Display Ward Type for IPD records */}
                  {(selectedPatientDetails?.type === "IPD" || selectedRecord.type === "IPD") && (
                    <div>Ward Type: {selectedRecord.wardType || "--"}</div>
                  )}
                </div>
                <div className="space-y-1">
                  <div>Diagnosis: {patientDiagnosisFromOPD || selectedRecord.diagnosis || selectedRecord.chiefComplaint || "--"}</div>
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
              <h3 className="text-lg font-semibold mb-2">No Accessible Medical Records</h3>
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