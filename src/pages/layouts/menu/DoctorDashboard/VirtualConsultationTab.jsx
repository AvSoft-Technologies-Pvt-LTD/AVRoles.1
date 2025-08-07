

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiExternalLink, FiVideo } from "react-icons/fi";
import axios from "axios";
import TeleConsultFlow from "../../../../components/microcomponents/Call";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";

const API_URL = "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient";
const DEFAULT_DOCTOR_NAME = "Dr.Sheetal S. Shelke";

export default function VirtualConsultationTab({ 
  onViewPatientDetails, 
  searchTerm = "" 
}) {
  const navigate = useNavigate();
  const [virtualPatients, setVirtualPatients] = useState([]);
  const [filteredVirtual, setFilteredVirtual] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientVideos, setPatientVideos] = useState({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedPatientVideo, setSelectedPatientVideo] = useState(null);

  useEffect(() => {
    const fetchVirtualPatients = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL);
        const virtualData = response.data
          .filter((p) => 
            (p.type || "").toLowerCase() === "virtual" || 
            p.consultationType === "virtual" ||
            (p.doctorName === DEFAULT_DOCTOR_NAME && p.type !== "ipd")
          )
          .map((p) => ({
            id: p.id,
            name: [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" "),
            diagnosis: p.diagnosis || "General Consultation",
            reason: p.reason || "Virtual Consultation",
            datetime: `${p.appointmentDate || new Date().toISOString().slice(0, 10)} ${p.appointmentTime || "00:00"}`,
            bloodGroup: p.bloodGroup || "",
            family: p.family || [],
            vitals: p.vitals || {},
            height: p.height,
            weight: p.weight,
            email: p.email,
            phone: p.phone,
            gender: p.gender || p.sex || '',
            dob: p.dob || '',
            temporaryAddress: p.temporaryAddress || p.addressTemp || p.address || '',
            address: p.address || p.temporaryAddress || p.addressTemp || '',
            addressTemp: p.addressTemp || p.temporaryAddress || p.address || '',
            type: "virtual",
            consultationType: "virtual"
          }))
          .reverse();
        
        setVirtualPatients(virtualData);
        setFilteredVirtual(virtualData);
      } catch (error) {
        console.error("Error fetching virtual consultations:", error);
        setVirtualPatients([]);
        setFilteredVirtual([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVirtualPatients();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVirtual(virtualPatients);
    } else {
      const filtered = virtualPatients.filter((patient) =>
        (patient.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.diagnosis || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVirtual(filtered);
    }
  }, [searchTerm, virtualPatients]);

  const handleViewMedicalRecord = (row) => {
    let age = '';
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
        patientName: row.name,
        email: row.email || '',
        phone: row.phone || '',
        gender: row.gender || row.sex || '',
        temporaryAddress: row.temporaryAddress || row.addressTemp || row.address || '',
        address: row.address || row.temporaryAddress || row.addressTemp || '',
        addressTemp: row.addressTemp || row.temporaryAddress || row.address || '',
        dob: row.dob,
        age: age,
        consultationType: "virtual"
      }
    });
  };

  const handleViewVideo = (row) => {
    const videoBlob = patientVideos[row.id];
    if (videoBlob) {
      setSelectedPatientVideo({ ...row, videoBlob });
      setShowVideoModal(true);
    }
  };

  const handleVideoRecorded = (patientId, videoBlob) => {
    setPatientVideos(prev => ({
      ...prev,
      [patientId]: videoBlob
    }));
  };

  const handleCellClick = (row, column) => {
    if (column.accessor === 'name') {
      onViewPatientDetails(row);
    }
  };

  const columns = [
    {
      header: "ID",
      accessor: "id"
    },
    {
      header: "Name",
      accessor: "name",
      clickable: true
    },
    {
      header: "Diagnosis",
      accessor: "diagnosis"
    },
    {
      header: "Date & Time",
      accessor: "datetime"
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <TeleConsultFlow 
            phone={row.phone} 
            patientName={row.name}
            onVideoRecorded={(videoBlob) => handleVideoRecorded(row.id, videoBlob)}
          />
          {patientVideos[row.id] && (
            <button
              title="View Recorded Video"
              onClick={() => handleViewVideo(row)}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <FiVideo className="w-4 h-4" />
            </button>
          )}
          <button
            title="View Medical Record"
            onClick={() => handleViewMedicalRecord(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <FiExternalLink className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const filters = [
    {
      key: "diagnosis",
      label: "Diagnosis",
      options: [...new Set(virtualPatients.map(p => p.diagnosis))].map(diagnosis => ({
        value: diagnosis,
        label: diagnosis
      }))
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading virtual consultations...</span>
      </div>
    );
  }

  if (filteredVirtual.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {searchTerm ? "No virtual consultations found matching your search." : "No virtual consultations available."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DynamicTable
        columns={columns}
        data={filteredVirtual}
        onCellClick={handleCellClick}
        filters={filters}
      />

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative bg-white p-6 rounded-xl w-[90%] max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Consultation Recording - {selectedPatientVideo?.name}
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>Patient:</strong> {selectedPatientVideo?.name}</p>
                <p><strong>Date & Time:</strong> {selectedPatientVideo?.datetime}</p>
                <p><strong>Diagnosis:</strong> {selectedPatientVideo?.diagnosis}</p>
              </div>
              
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-96 object-contain"
                  src={selectedPatientVideo?.videoBlob ? URL.createObjectURL(selectedPatientVideo.videoBlob) : undefined}
                >
                  <p className="text-center text-gray-500 p-8">
                    Unable to load video recording.
                  </p>
                </video>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    if (selectedPatientVideo?.videoBlob) {
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(selectedPatientVideo.videoBlob);
                      a.download = `consult_${selectedPatientVideo.name}_${Date.now()}.webm`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      toast.success("Video download started");
                    }
                  }}
                >
                  Download Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}