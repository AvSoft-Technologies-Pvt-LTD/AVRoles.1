import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import Pagination from "../../../../components/Pagination";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import PaymentGatewayPage from "../../../../components/microcomponents/PaymentGatway";

const AppointmentList = ({ displayType, showOnlyTable = false, isOverview = false  }) => {
  const navigate = useNavigate();
  const initialType = displayType || localStorage.getItem("appointmentTab") || "doctor";
  const [state, setState] = useState({
    t: initialType,
    l: [],
    d: [],
    selectedAppointment: null,
    showPaymentGateway: false,
  });
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  useEffect(() => {
    localStorage.setItem("appointmentTab", state.t);
  }, [state.t]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labResponse, doctorResponse] = await Promise.all([
          axios.get("https://680b3642d5075a76d98a3658.mockapi.io/Lab/payment"),
          axios.get("https://67e3e1e42ae442db76d2035d.mockapi.io/register/book"),
        ]);
        const email = localStorage.getItem("email")?.trim().toLowerCase();
        const userId = localStorage.getItem("userId")?.trim();
        const filteredDoctorAppointments = doctorResponse.data
          .filter(
            (appointment) =>
              appointment.email?.trim().toLowerCase() === email ||
              appointment.userId?.trim() === userId
          )
          .reverse();
        setState((prev) => ({
          ...prev,
          l: labResponse.data.reverse(),
          d: filteredDoctorAppointments,
        }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [displayType]);

  const handleTabChange = (tab) => {
    setState((prev) => ({ ...prev, t: tab }));
    setPage(1);
  };

  const handlePayClick = async (appointment) => {
    setState((prev) => ({
      ...prev,
      selectedAppointment: appointment,
      showPaymentGateway: true,
    }));
  };
const handlePaymentSuccess = async (paymentDetails) => {    try {      const updatedAppointments = state.d.map((appointment) =>        appointment.id === state.selectedAppointment.id          ? { ...appointment, status: "Paid" }          : appointment      );      setState((prev) => ({        ...prev,        d: updatedAppointments,        showPaymentGateway: false,      }));      await axios.put(        `https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${state.selectedAppointment.id}`,        { status: "Paid" }      );    } catch (error) {      console.error("Error updating appointment status:", error);    }  };


const handlePaymentFailure = (error) => {
  console.error("Payment Failure:", error);
  alert(`Payment failed: ${error.reason}. Please try again or use a different payment method.`);
  setState((prev) => ({ ...prev, showPaymentGateway: false }));
};

 const getStatusBadge = (status, appointment) => {
  if (status === "Paid") {
    return (
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
        Paid
      </span>
    );
  } else if (status === "Confirmed") {
    return (
      <div className="flex items-center space-x-2">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Confirmed
        </span>
        {!showOnlyTable && !isOverview && (
          <button
            onClick={() => handlePayClick(appointment)}
            className="group relative inline-flex items-center justify-center gap-2 px-4 py-1 border border-green-500 text-green-500 rounded-full font-semibold bg-transparent overflow-hidden transition-colors duration-300 ease-in-out hover:bg-green-500 hover:text-white"
          >
            Pay
          </button>
        )}
      </div>
    );
  } else if (status?.toLowerCase() === "rejected") {
    return (
      <div className="flex items-center space-x-4 paragraph mt-1">
        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
          Rejected
        </span>
        <div>
          <strong>Reason:</strong> {appointment.rejectReason}
        </div>
      </div>
    );
  } else {
    return (
      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
        Waiting for Confirmation
      </span>
    );
  }
};


  const doctorColumns = [
    { header: "Doctor", accessor: "doctorName" },
    { header: "Speciality", accessor: "specialty" },
    { header: "Date", accessor: "date" },
    { header: "Time", accessor: "time" },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => getStatusBadge(row.status, row),
    },
  ];

  const labColumns = [
    { header: "ID", accessor: "bookingId" },
    { header: "Test", accessor: "testTitle" },
    { header: "Lab", accessor: "labName" },
    {
      header: "Status",
      accessor: "status",
      cell: (appointment) => (
        <span
          className={`px-2 py-1 rounded-full paragraph ${getStatusClass(
            appointment.status
          )}`}
        >
          {appointment.status || "Pending"}
        </span>
      ),
    },
    {
      header: "Action",
      cell: (appointment) => (
        <button
          onClick={() =>
            navigate(
              `/patientdashboard/track-appointment/${appointment.bookingId}`
            )
          }
          className="group relative inline-flex items-center justify-center gap-2 px-6 py-2 border border-[var(--accent-color)] text-[var(--accent-color)] rounded-full font-semibold bg-transparent overflow-hidden transition-colors duration-300 ease-in-out hover:bg-[var(--accent-color)] hover:text-white"
        >
          <FiMapPin className="text-lg transition-transform duration-300 ease-in-out group-hover:scale-110" />
          <span className="tracking-wide transition-all duration-300 ease-in-out">
            Track
          </span>
        </button>
      ),
    },
  ];

  const getStatusClass = (status) => {
    const statusClasses = {
      "Appointment Confirmed": "bg-blue-100 text-blue-800",
      "Technician On the Way": "bg-yellow-100 text-yellow-800",
      "Sample Collected": "bg-purple-100 text-purple-800",
      "Test Processing": "bg-orange-100 text-orange-800",
      "Report Ready": "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-600",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  const tabs = displayType === "doctor" ? [] : [
    { label: "Doctor Appointments", value: "doctor" },
    { label: "Lab Appointments", value: "lab" },
  ];

  const tabActions = displayType === "doctor" ? [] : [
    {
      label: state.t === "lab" ? "Book Appointment" : "Book Appointment",
      onClick: () =>
        navigate(
          state.t === "lab"
            ? "/patientdashboard/lab-tests"
            : "/patientdashboard/book-appointment"
        ),
      className:
        "group relative inline-flex items-center px-6 py-2 view-btn",
      icon: <FiCalendar className="text-lg mr-2" />,
    },
  ];

  const totalDoctorPages = Math.ceil(state.d.length / rowsPerPage);
  const totalLabPages = Math.ceil(state.l.length / rowsPerPage);
  const totalPages = state.t === "doctor" ? totalDoctorPages : totalLabPages;
  const currentDoctorAppointments = state.d.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const currentLabAppointments = state.l.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div className="p-4">
      {state.showPaymentGateway ? (
        <PaymentGatewayPage
          amount={state.selectedAppointment.fees}
          bookingId={state.selectedAppointment.id}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
        />
      ) : (
        <>
          <DynamicTable
            columns={state.t === "doctor" ? doctorColumns : labColumns}
            data={state.t === "doctor" ? currentDoctorAppointments : currentLabAppointments}
            tabs={tabs}
            tabActions={tabActions}
            activeTab={state.t}
            onTabChange={handleTabChange}
          />
          {!showOnlyTable && (
            <div className="w-full flex justify-end mt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentList;