// import React from 'react';
// import { FileText } from 'lucide-react';
// import { useNavigate } from "react-router-dom";

// const MedicalRecordsTab = ({
//   patientName, patientEmail,
//   knownCaseRecords, setKnownCaseRecords,
//   extractedKnownCase, setExtractedKnownCase
// }) => {
//   const navigate = useNavigate();

//   const knownCaseFields = [
//     { name: "chiefComplaint", label: "Chief Complaint" },
//     { name: "pastHistory", label: "Past History" },
//     { name: "initialAssessment", label: "Initial Assessment" },
//     { name: "systematicExamination", label: "Systematic/Local Examination" },
//     { name: "investigations", label: "Investigations" },
//     { name: "treatmentAdvice", label: "Treatment / Advice" },
//     { name: "treatmentGiven", label: "Treatment Given" },
//     { name: "diagnosis", label: "Final Diagnosis" },
//     { name: "doctorsNotes", label: "Doctor's Notes" },
//   ];

//   const renderRecord = (rec) => (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {knownCaseFields.slice(0, 4).map(f => (
//         <div key={f.name} className="bg-white p-3 rounded">
//           <div className="font-bold">{f.label}</div>
//           <div>{rec[f.name] || '—'}</div>
//         </div>
//       ))}
//       {knownCaseFields.slice(4).map(f => (
//         <div key={f.name} className="bg-white p-3 rounded">
//           <div className="font-bold">{f.label}</div>
//           <div>{rec[f.name] || '—'}</div>
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div className="space-y-6">
//       <div className="bg-white rounded-xl shadow-lg border p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h4 className="text-blue-800 font-semibold flex items-center gap-2 mb-0">
//             <FileText size={24} /> Initial Assessment
//           </h4>
//           <button
//             className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-full hover:bg-[var(--accent-color)]"
//             onClick={() => (window.location.href = '/doctordashboard/MedicalRecordsTemplate')}
//           >
//             + Add Manually
//           </button>
//         </div>

//         {extractedKnownCase.length > 0 && (
//           <div className="mb-6">
//             <h5 className="font-semibold text-[var(--primary-color)] mb-3">Extracted Data:</h5>
//             <div className="space-y-6">{extractedKnownCase.map((rec, idx) => (
//               <div key={idx} className="bg-gray-50 rounded-xl border p-6">{renderRecord(rec)}</div>
//             ))}</div>
//           </div>
//         )}

//         {knownCaseRecords.length > 0 && (
//           <div className="mb-6">
//             <h5 className="font-semibold text-[var(--primary-color)] mb-3">Manually Added Records:</h5>
//             <div className="space-y-6">{knownCaseRecords.map((rec, idx) => (
//               <div key={idx} className="bg-white rounded-xl shadow-lg border p-6">{renderRecord(rec)}</div>
//             ))}</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MedicalRecordsTab;



import React from 'react';
import { FileText } from 'lucide-react';
import { useNavigate, useLocation } from "react-router-dom";

const MedicalRecordsTab = ({
  patientName, patientEmail, patientData,
  knownCaseRecords, setKnownCaseRecords,
  extractedKnownCase, setExtractedKnownCase
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const knownCaseFields = [
    { key: 'chiefComplaint', label: 'Chief Complaint' },
    { key: 'historyOfPresentIllness', label: 'History of Present Illness' },
    { key: 'pastMedicalHistory', label: 'Past Medical History' },
    { key: 'medicationHistory', label: 'Medication History' },
    { key: 'familyHistory', label: 'Family History' },
    { key: 'socialHistory', label: 'Social History' },
    { key: 'reviewOfSystems', label: 'Review of Systems' },
    { key: 'physicalExamination', label: 'Physical Examination' },
    { key: 'vitalSigns', label: 'Vital Signs' },
    { key: 'laboratoryResults', label: 'Laboratory Results' },
    { key: 'imagingStudies', label: 'Imaging Studies' },
    { key: 'assessment', label: 'Assessment' },
    { key: 'plan', label: 'Plan' }
  ];

  const handleInputChange = (field, value) => {
    setExtractedKnownCase(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const newRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      ...extractedKnownCase
    };
    setKnownCaseRecords(prev => [...prev, newRecord]);
    
    // Clear the form
    const clearedForm = {};
    knownCaseFields.forEach(field => {
      clearedForm[field.key] = '';
    });
    setExtractedKnownCase(clearedForm);
  };

  const handleAddManually = () => {
  // Get all patient data from current location state and props
  const currentState = location.state || {};
  const completePatientData = {
    ...currentState,
    ...patientData,
    patientName: patientName || currentState.patientName,
    email: patientEmail || patientData?.email || currentState.email || '',
    phone: patientData?.phone || currentState.phone || '', // <-- Add phone here
    name: patientName || currentState.patientName || currentState.name,
  };

  navigate('/doctordashboard/MedicalRecordsTemplate', {
    state: completePatientData
  });
};
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
  {/* Left side: Heading */}
  <div>
    <h4 className="text-blue-800 font-semibold flex items-center gap-2 mb-0">
      <FileText size={24} /> Initial Assessment
    </h4>
  </div>

  {/* Right side: Button */}
  <div>
    <button
      className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] text-white rounded-full hover:bg-[var(--accent-color)]"
      onClick={handleAddManually}
    >
      + Add 
    </button>
  </div>
</div>


      {/* Form Fields */}
    
      {/* Previous Records */}
      {knownCaseRecords.length > 0 && (
        <div className="mt-8">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Previous Records</h5>
          <div className="space-y-4">
            {knownCaseRecords.map((record) => (
              <div key={record.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Date: {record.date}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {knownCaseFields.map((field) => (
                    record[field.key] && (
                      <div key={field.key}>
                        <strong className="text-sm text-gray-700">{field.label}:</strong>
                        <p className="text-sm text-gray-600 mt-1">{record[field.key]}</p>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsTab;











