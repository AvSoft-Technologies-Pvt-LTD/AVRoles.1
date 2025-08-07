import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCalendar, FiArrowRight, FiMapPin } from "react-icons/fi";
import Pagination from "../../../../components/Pagination";
import DynamicTable from "../../../../components/microcomponents/DynamicTable"; // Adjust path if needed

const AppointmentList = () => {
  const navigate = useNavigate();
  const initialType = localStorage.getItem("appointmentTab") || "doctor";
  const [s, setS] = useState({ t: initialType, l: [], d: [], p: false, i: 0 });
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    localStorage.setItem("appointmentTab", s.t);
  }, [s.t]);

  useEffect(() => {
    const f = async () => {
      try {
        const [l, d] = await Promise.all([
          axios.get("https://680b3642d5075a76d98a3658.mockapi.io/Lab/payment"),
          axios.get("https://67e3e1e42ae442db76d2035d.mockapi.io/register/book"),
        ]);
        const e = localStorage.getItem("email")?.trim().toLowerCase();
        const u = localStorage.getItem("userId")?.trim();
        const f = d.data.filter((a) => a.email?.trim().toLowerCase() === e || a.userId?.trim() === u).reverse();
        setS((prev) => ({ ...prev, l: l.data.reverse(), d: f }));
        const p = Object.values(
          f.filter((a) => !["confirmed", "rejected"].includes(a.status?.toLowerCase()))
            .reduce((a, c) => ((a[`${c.specialty}-${c.location}`] = a[`${c.specialty}-${c.location}`] || []).push(c), a), {})
        );
        if (p.length > 0) setS((prev) => ({ ...prev, p })), setTimeout(() => setS((prev) => ({ ...prev, s: true })), 3000);
      } catch (err) {
        console.error(err);
      }
    };
    f();
  }, []);

  const handleTabChange = (tab) => {
    setS((prev) => ({ ...prev, t: tab }));
    setPage(1);
  };

  const doctorColumns = [
    { header: "Doctor", accessor: "doctorName" },
    { header: "Speciality", accessor: "specialty" },
    { header: "Date", accessor: "date" },
    { header: "Time", accessor: "time" },
    {
      header: "Status",
      accessor: "status",
      cell: (a) =>
        a.status === "Confirmed" ? (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full paragraph">Confirmed</span>
        ) : a.status?.toLowerCase() === "rejected" ? (
          <div className="flex items-center space-x-4 paragraph mt-1">
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">Rejected</span>
            <div>
              <strong>Reason:</strong> {a.rejectReason}
            </div>
          </div>
        ) : (
          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Waiting for Confirmation</span>
        ),
    },
  ];

  const labColumns = [
    { header: "ID", accessor: "bookingId" },
    { header: "Test", accessor: "testTitle" },
    { header: "Lab", accessor: "labName" },
    {
      header: "Status",
      accessor: "status",
      cell: (a) => (
        <span className={`px-2 py-1 rounded-full paragraph ${g(a.status)}`}>{a.status || "Pending"}</span>
      ),
    },
    {
      header: "Action",
      cell: (a) => (
        <button
          onClick={() => navigate(`/patientdashboard/track-appointment/${a.bookingId}`)}
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-2 border border-[var(--accent-color)] text-[var(--accent-color)] rounded-full font-semibold bg-transparent overflow-hidden transition-colors duration-300 ease-in-out hover:bg-[var(--accent-color)] hover:text-white"
        >
          <FiMapPin className="text-lg transition-transform duration-300 ease-in-out group-hover:scale-110" />
          <span className="tracking-wide transition-all duration-300 ease-in-out">Track</span>
        </button>
      ),
    },
  ];

  const g = (s) =>
    ({
      "Appointment Confirmed": "bg-blue-100 text-blue-800",
      "Technician On the Way": "bg-yellow-100 text-yellow-800",
      "Sample Collected": "bg-purple-100 text-purple-800",
      "Test Processing": "bg-orange-100 text-orange-800",
      "Report Ready": "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-600",
    }[s] || "bg-gray-100 text-gray-800");

  const tabs = [
    { label: "Doctor Appointments", value: "doctor" },
    { label: "Lab Appointments", value: "lab" },
  ];

  const tabActions = [
    {
      label: s.t === "lab" ? "Lab Appointment" : "Book Appointment",
      onClick: () => navigate(s.t === "lab" ? "/patientdashboard/lab-tests" : "/patientdashboard/book-appointment"),
      className:
        "group relative inline-flex items-center px-6 py-2 rounded-full bg-[var(--primary-color)] text-white font-medium tracking-wide overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg",
      icon: <FiCalendar className="text-lg mr-2" />,
    },
  ];

  const totalDoctorPages = Math.ceil(s.d.length / rowsPerPage);
  const totalLabPages = Math.ceil(s.l.length / rowsPerPage);
  const totalPages = s.t === "doctor" ? totalDoctorPages : totalLabPages;

  const currentDoctorAppointments = s.d.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const currentLabAppointments = s.l.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div className="pt-6 bg-white p-6 rounded-2xl ">
      <DynamicTable
        columns={s.t === "doctor" ? doctorColumns : labColumns}
        data={s.t === "doctor" ? currentDoctorAppointments : currentLabAppointments}
        tabs={tabs}
        tabActions={tabActions}
        activeTab={s.t}
        onTabChange={handleTabChange}
      />
      <div className="w-full flex justify-end mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default AppointmentList;