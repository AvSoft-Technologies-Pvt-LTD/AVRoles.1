import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import DocsReader from "../../../../components/DocsReader";
import {
  ArrowLeft,
  FileText,
  Pill,
  TestTube,
  CreditCard,
  Activity,
  Heart,
  Thermometer,
  CheckCircle,
  AlertTriangle,
  Printer,
  Stethoscope,
  Upload,
  FileCheck,
  X,
} from "lucide-react";

const MedicalRecordDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRecord = location.state?.selectedRecord;

  const [state, setState] = useState({
    detailsActiveTab: "medical-records",
    billingActiveTab: "pharmacy",
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    knownCaseFiles: [],
    vitalsFiles: [],
    dischargeSummaryFiles: [],
    prescriptionFiles: [],
    labTestFiles: [],
    pharmacyBillingFiles: [],
    labBillingFiles: [],
    hospitalBillingFiles: []
  });

  // Mock data for existing records
  const mockData = {
    medicalDetails: {
      chiefComplaint:
        "High fever with chills, body ache, and headache for 3 days",
      pastHistory:
        "No significant past medical or surgical history. No known allergies.",
      diagnosis: "Dengue Fever (Confirmed by NS1 Antigen and IgM positive)",
      treatmentGiven:
        "IV fluids, Paracetamol for fever, complete bed rest, platelet monitoring",
      doctorsNotes:
        "Patient responded well to treatment. Platelet count stabilized.",
      initialAssessment: "Patient appears weak, febrile, and dehydrated.",
      systematicExamination: "Mild hepatomegaly, no signs of rash or bleeding.",
      investigations:
        "CBC, Dengue NS1 Antigen, Dengue IgM/IgG, Platelet Count.",
      treatmentAdvice:
        "Maintain hydration, avoid NSAIDs, and monitor platelet count daily.",
      dischargeSummary:
        "Patient admitted with dengue fever, treated with supportive care. Patient is stable and ready for discharge.",
    },
    prescriptionsData: [
      {
        id: 1,
        date: "02/07/2025",
        doctorName: "Dr. Rajesh Kumar",
        medicines: "Paracetamol 500mg - 1 tablet TID for 5 days",
        instructions: "Take after meals. Maintain adequate fluid intake.",
      },
      {
        id: 2,
        date: "03/07/2025",
        doctorName: "Dr. Rajesh Kumar",
        medicines: "Doxycycline 100mg - 1 capsule BID for 7 days",
        instructions: "Take with plenty of water. Avoid dairy products.",
      },
    ],
    labTestsData: [
      {
        id: 1,
        date: "01/07/2025",
        testName: "Complete Blood Count (CBC)",
        result: "WBC: 12,000, RBC: 4.2, Platelets: 85,000",
        normalRange:
          "WBC: 4,000-11,000, RBC: 4.5-5.5, Platelets: 150,000-450,000",
        status: "Abnormal",
      },
      {
        id: 2,
        date: "01/07/2025",
        testName: "Dengue NS1 Antigen",
        result: "Positive",
        normalRange: "Negative",
        status: "Abnormal",
      },
    ],
    billingData: {
      pharmacy: [
        {
          id: 1,
          medicineName: "Paracetamol 500mg",
          quantity: 15,
          unitPrice: 2.5,
          totalPrice: 37.5,
          date: "02/07/2025",
        },
      ],
      labs: [
        {
          id: 1,
          testName: "Complete Blood Count (CBC)",
          cost: 350.0,
          date: "01/07/2025",
          paymentStatus: "Paid",
        },
      ],
      hospital: [
        {
          id: 1,
          billType: "Room Charges (5 days)",
          amount: 2500.0,
          paymentMode: "Insurance",
          status: "Paid",
          billDate: "06/07/2025",
        },
      ],
    },
  };

  const updateState = (updates) =>
    setState((prev) => ({ ...prev, ...updates }));

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "NA";

  const handleSecondOpinion = () => {
    const recordToPass = {
      ...selectedRecord,
      medicalDetails: mockData.medicalDetails, // Include medicalDetails
      prescriptionsData: mockData.prescriptionsData,
      labTestsData: mockData.labTestsData,
    };

    navigate("/patientdashboard/second-opinion", { state: { selectedRecord: recordToPass } });
  };

  const handleBack = () => {
    navigate("/patientdashboard/medical-records");
  };

  const printLabTest = (labTest) => {
    const printContents = `
      <div>
        <h3>Lab Test Report</h3>
        <p><strong>Date:</strong> ${labTest.date}</p>
        <p><strong>Test Name:</strong> ${labTest.testName}</p>
        <p><strong>Result:</strong> ${labTest.result}</p>
        <p><strong>Normal Range:</strong> ${labTest.normalRange}</p>
        <p><strong>Status:</strong> ${labTest.status}</p>
      </div>
    `;
    const WinPrint = window.open("", "", "width=900,height=650");
    WinPrint.document.write(`
      <html>
        <head><title>Lab Test Print</title></head>
        <body>${printContents}</body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.print();
    WinPrint.close();
  };

  const handleFileUpload = (event, section) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      alert('Some files were not uploaded. Only .jpg, .png, .pdf, .docx, and .txt files are allowed.');
    }

    setUploadedFiles(prev => ({
      ...prev,
      [section]: [...prev[section], ...validFiles]
    }));
  };

  const handleRemoveFile = (section, fileIndex) => {
    setUploadedFiles(prev => ({
      ...prev,
      [section]: prev[section].filter((_, index) => index !== fileIndex)
    }));
  };

  const renderUploadSection = (sectionKey, title) => {
    if (!selectedRecord?.isNewlyAdded) return null;

    const files = uploadedFiles[sectionKey] || [];
   return (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <h4 className="font-semibold text-blue-800 mb-2">{title}</h4>
    
<div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
  <DocsReader />
</div>



    {files.length > 0 && (
      <div className="mt-2 space-y-1">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white rounded-lg border border-blue-200 p-2"
          >
            <span className="text-sm font-medium text-blue-800 truncate">{file.name}</span>
            <button
              onClick={() => handleRemoveFile(sectionKey, index)}
              className="text-red-600 hover:text-red-800"
              title="Remove"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

  };

  const renderTabContent = () => {
    // If it's a newly added record, show DocsReader for all tabs
    if (selectedRecord?.isNewlyAdded) {
      switch (state.detailsActiveTab) {
        case "medical-records":
          return (
            <div>
                {renderUploadSection("vitalsFiles", "Upload Vital Signs Records")}
              {renderUploadSection("knownCaseFiles", "Upload Medical Information")}
            
              {selectedRecord.type === "IPD" && renderUploadSection("dischargeSummaryFiles", "Upload Discharge Summary")}
            </div>
          );
        case "prescriptions":
          return renderUploadSection("prescriptionFiles", "Upload Prescription");
        case "lab-tests":
          return renderUploadSection("labTestFiles", "Upload Lab Test Report");
        case "billing":
          const uploadInfo = getBillingUploadSection();
          return renderUploadSection(uploadInfo.key, uploadInfo.title);
        default:
          return null;
      }
    }

    // For existing records, show the normal content
    const tabContentMap = {
      "medical-records": (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-[var(--primary-color)]" />
              <h3 className="h3-heading">Medical Information</h3>
            </div>
            <button className="view-btn">View Original</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                label: "Chief Complaint",
                value: mockData.medicalDetails.chiefComplaint,
              },
              {
                label: "Past History",
                value: mockData.medicalDetails.pastHistory,
              },
              {
                label: "Initial Assessment",
                value: mockData.medicalDetails.initialAssessment,
              },
              {
                label: "Systematic/Local Examination",
                value: mockData.medicalDetails.systematicExamination,
              },
              {
                label: "Investigations",
                value: mockData.medicalDetails.investigations,
              },
              {
                label: "Treatment / Advice",
                value: mockData.medicalDetails.treatmentAdvice,
              },
              {
                label: "Treatment Given",
                value: mockData.medicalDetails.treatmentGiven,
              },
              {
                label: "Final Diagnosis",
                value: mockData.medicalDetails.diagnosis,
              },
              {
                label: "Doctor's Notes",
                value: mockData.medicalDetails.doctorsNotes,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="font-bold text-sm text-gray-600 mb-2">
                  {item.label}
                </div>
                <div className="text-gray-800 text-sm">{item.value}</div>
              </div>
            ))}
          </div>

          {selectedRecord?.type === "IPD" && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-6">
                <FileCheck size={24} className="text-green-600" />
                <h3 className="h3-heading">Discharge Summary</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100">
                <div className="font-bold text-sm text-gray-600 mb-2">
                  Summary
                </div>
                <div className="text-gray-800 text-sm">
                  {mockData.medicalDetails.dischargeSummary}
                </div>
              </div>
            </div>
          )}
        </div>
      ),
      prescriptions: (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Pill size={20} className="text-purple-600" />
            <h4 className="h4-heading">Prescribed Medications</h4>
          </div>
          <DynamicTable
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Doctor Name", accessor: "doctorName" },
              { header: "Medicines", accessor: "medicines" },
              { header: "Instructions", accessor: "instructions" },
            ]}
            data={mockData.prescriptionsData}
          />
        </div>
      ),
      "lab-tests": (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <TestTube size={24} className="text-orange-600" />
            <h4 className="h4-heading">Test Results History</h4>
          </div>
          <DynamicTable
            columns={[
              { header: "Date", accessor: "date" },
              { header: "Test Name", accessor: "testName" },
              { header: "Result", accessor: "result" },
              { header: "Normal Range", accessor: "normalRange" },
              {
                header: "Status",
                accessor: "status",
                cell: (row) => (
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      row.status === "Normal"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {row.status === "Normal" ? (
                      <CheckCircle size={12} className="inline mr-1" />
                    ) : (
                      <AlertTriangle size={12} className="inline mr-1" />
                    )}
                    {row.status}
                  </span>
                ),
              },
              {
                header: "Print",
                accessor: "print",
                cell: (row) => (
                  <button
                    className="edit-btn flex items-center gap-1"
                    onClick={() => printLabTest(row)}
                  >
                    <Printer size={14} /> Print
                  </button>
                ),
              },
            ]}
            data={mockData.labTestsData}
          />
        </div>
      ),
      billing: (
        <div className="space-y-6">
          <DynamicTable
            columns={(() => {
              const columnMaps = {
                pharmacy: [
                  { header: "Medicine Name", accessor: "medicineName" },
                  { header: "Quantity", accessor: "quantity" },
                  { header: "Unit Price (₹)", accessor: "unitPrice" },
                  { header: "Total Price (₹)", accessor: "totalPrice" },
                  { header: "Date", accessor: "date" },
                ],
                labs: [
                  { header: "Test Name", accessor: "testName" },
                  { header: "Cost (₹)", accessor: "cost" },
                  { header: "Date", accessor: "date" },
                  {
                    header: "Payment Status",
                    accessor: "paymentStatus",
                    cell: (row) => (
                      <span
                        className={`text-sm font-semibold px-2 py-1 rounded-full ${
                          row.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {row.paymentStatus}
                      </span>
                    ),
                  },
                ],
                hospital: [
                  { header: "Bill Type", accessor: "billType" },
                  { header: "Amount (₹)", accessor: "amount" },
                  { header: "Payment Mode", accessor: "paymentMode" },
                  {
                    header: "Status",
                    accessor: "status",
                    cell: (row) => (
                      <span
                        className={`text-sm font-semibold px-2 py-1 rounded-full ${
                          row.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    ),
                  },
                  { header: "Bill Date", accessor: "billDate" },
                ],
              };
              return columnMaps[state.billingActiveTab];
            })()}
            data={mockData.billingData[state.billingActiveTab]}
            tabs={[
              { value: "pharmacy", label: "Pharmacy" },
              { value: "labs", label: "Labs" },
              { value: "hospital", label: "Hospital Bills" },
            ]}
            activeTab={state.billingActiveTab}
            onTabChange={(tab) => updateState({ billingActiveTab: tab })}
            filters={[
              {
                key: "paymentStatus",
                label: "Payment Status",
                options: [
                  { value: "Paid", label: "Paid" },
                  { value: "Unpaid", label: "Unpaid" },
                ],
              },
            ]}
          />
        </div>
      ),
    };

    return tabContentMap[state.detailsActiveTab] || null;
  };

  const getBillingUploadSection = () => {
    switch (state.billingActiveTab) {
      case "pharmacy": return { key: "pharmacyBillingFiles", title: "Upload Pharmacy Bills" };
      case "labs": return { key: "labBillingFiles", title: "Upload Lab Bills" };
      case "hospital": return { key: "hospitalBillingFiles", title: "Upload Hospital Bills" };
      default: return { key: "pharmacyBillingFiles", title: "Upload Pharmacy Bills" };
    }
  };

  if (!selectedRecord) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          No record selected. Please go back and select a record.
        </div>
      </div>
    );
  }

  const detailsTabs = [
    { id: "medical-records", label: "Medical Records", icon: FileText },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "lab-tests", label: "Lab/Scan", icon: TestTube },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 hover:text-[var(--accent-color)] transition-colors text-gray-600"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Medical Records</span>
      </button>

      {/* New Record Indicator */}
      {selectedRecord?.isNewlyAdded && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-800">
            <Upload size={20} />
            <span className="font-medium">New Hospital Record</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            This is a newly added hospital record. You can upload files in the relevant sections below.
          </p>
        </div>
      )}

      {/* Patient Header */}
      <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="relative h-20 w-20 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold uppercase shadow-inner ring-4 ring-white ring-offset-2 text-[#01B07A]">
              {getInitials(selectedRecord.patientName)}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4">
              {selectedRecord.patientName}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm">
              <div className="space-y-1">
                <div>Age: {selectedRecord.age}</div>
                <div>Gender: {selectedRecord.sex}</div>
              </div>
              <div className="space-y-1">
                <div>Hospital: {selectedRecord.hospitalName}</div>
                <div>
                  Visit Date:{" "}
                  {selectedRecord.dateOfVisit ||
                    selectedRecord.dateOfAdmission ||
                    selectedRecord.dateOfConsultation}
                </div>
              </div>
              <div className="space-y-1">
                <div>Diagnosis: {selectedRecord.diagnosis}</div>
                 <div>K/C/O: {selectedRecord["K/C/O"] ?? "--"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Summary - Only show for non-newly added records */}
      {!selectedRecord?.isNewlyAdded && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-green-600" />
              <h3 className="h3-heading">Vitals Summary</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              {
                key: "bloodPressure",
                icon: Heart,
                color: "red",
                label: "Blood Pressure",
              },
              {
                key: "heartRate",
                icon: Activity,
                color: "blue",
                label: "Heart Rate",
              },
              {
                key: "temperature",
                icon: Thermometer,
                color: "orange",
                label: "Temperature",
              },
              { key: "spO2", icon: null, color: "emerald", label: "SpO2" },
              {
                key: "respiratoryRate",
                icon: null,
                color: "violet",
                label: "Respiratory Rate",
              },
              { key: "height", icon: null, color: "cyan", label: "Height" },
              { key: "weight", icon: null, color: "amber", label: "Weight" },
            ].map(({ key, icon: Icon, color, label }) => (
              <div
                key={key}
                className={`bg-${color}-50 border-l-4 border-${color}-500 p-3 rounded-lg shadow-md`}
              >
                <div className="flex items-center gap-1 mb-1">
                  {Icon && <Icon size={16} className={`text-${color}-500`} />}
                  <span className={`text-xs font-medium text-${color}-700`}>
                    {label}
                  </span>
                </div>
                <div className={`text-base font-semibold text-${color}-800`}>
                  {selectedRecord?.vitals?.[key] ?? "--"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-gray-200 mb-6">
        {detailsTabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => updateState({ detailsActiveTab: tab.id })}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors duration-300 ${
                state.detailsActiveTab === tab.id
                  ? "border-b-2 text-[var(--primary-color)] border-[var(--primary-color)]"
                  : "text-gray-500 hover:text-[var(--accent-color)]"
              }`}
            >
              <IconComponent size={18} />
              {tab.label}
            </button>
          );
        })}
        {selectedRecord?.type === "OPD" && !selectedRecord?.isNewlyAdded && (
          <div className="flex-1 flex justify-end">
            <button
              onClick={handleSecondOpinion}
              className="btn btn-primary text-white px-4 py-3 text-xs flex items-center gap-2  hover:opacity-90 transition-opacity"
            >
              <Stethoscope size={18} />
              Get Second Opinion
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="animate-slide-fade-in">{renderTabContent()}</div>
    </div>
  );
};

export default MedicalRecordDetails;