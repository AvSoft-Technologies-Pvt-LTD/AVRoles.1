import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DynamicTable from '../../../../components/microcomponents/DynamicTable'; // Adjust path if needed
import Pagination from '../../../../components/Pagination'; // Adjust path if needed

const doctorName = 'Dr.Sheetal S. Shelke';
const notify = async (name, phone, message, btn = false) =>
  axios.post('https://67e631656530dbd3110f0322.mockapi.io/notify', { name, phone, message, showPayButton: btn, doctorName, createdAt: new Date().toISOString() }).catch(() => toast.error('Notification failed'));

const splitName = (fullName) => {
  const parts = (fullName || '').trim().split(' ');
  return {
    firstName: parts[0] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : ''
  };
};

const TABS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Rejected', value: 'rejected' }
];

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState(() => JSON.parse(localStorage.getItem('appointments')) || []);
  const [tab, setTab] = useState('pending');
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;
  const [loading, setLoading] = useState(true), [rejectId, setRejectId] = useState(null), [rescheduleId, setRescheduleId] = useState(null);
  const [reasons, setReasons] = useState({}), [reschedule, setReschedule] = useState({ date: '', time: '' });
  const navigate = useNavigate();

  // Filter data for current tab
  const tabFiltered = appointments.filter(a => a.status.toLowerCase() === tab);
  // DynamicTable will handle search/filter, so we paginate after filtering
  const [filteredData, setFilteredData] = useState(tabFiltered);
  useEffect(() => {
    setFilteredData(tabFiltered);
    setPage(1); // Reset page on tab change
  }, [appointments, tab]);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const current = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const updateStatus = (id, fn) => setAppointments(prev => {
    const updated = prev.map(a => a.id === id ? (typeof fn === 'function' ? fn(a) : { ...a, ...fn }) : a);
    localStorage.setItem('appointments', JSON.stringify(updated));
    return updated;
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://67e3e1e42ae442db76d2035d.mockapi.io/register/book');
      const merged = res.data.filter(i => i.doctorName === doctorName)
        .map(i => ({
          id: i.id,
          name: i.name || 'Unknown',
          email: i.email,
          phone: i.phone || 'N/A',
          date: i.date,
          time: i.time,
          reason: i.symptoms,
          specialty: i.specialty,
          type: i.consultationType,
          status: 'Pending',
          prescription: '',
          link: '',
          rejectReason: '',
          linkSent: false,
          rescheduleCount: 0
        }))
        .map(a => ({ ...a, ...appointments.find(x => x.id === a.id) }));
      setAppointments(merged);
      localStorage.setItem('appointments', JSON.stringify(merged));
    }
    catch (e) {
      console.error(e);
      toast.error('Failed to fetch appointments');
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleAccept = async id => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;
    try {
      const confirmed = {
        ...appt,
        status: 'Confirmed',
        confirmedAt: new Date().toISOString(),
        doctorName,
        isVisible: false
      };
      const updated = appointments.map(a => a.id === id ? confirmed : a);
      setAppointments(updated);
      localStorage.setItem('appointments', JSON.stringify(updated));
      await axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${id}`, confirmed);
      await notify(
        appt.name,
        appt.phone,
        `✅ Appointment confirmed with ${doctorName} on ${appt.date} at ${appt.time}.`,
        true
      );
      toast.success('Appointment moved to confirmed tab');
      const transferToast = toast.loading('Preparing for OPD list...');
      setTimeout(async () => {
        try {
          const transfer = {
            ...confirmed,
            patientListId: `PL_${id}`,
            transferredFrom: id,
            type: 'OPD',
            consultationStarted: false,
            consultationCompleted: false,
            advice: null,
            prescription: null,
            movedDate: null,
            isVisible: true
          };
          await axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${id}`, transfer);
          const final = appointments.map(a => a.id === id ? transfer : a);
          setAppointments(final);
          localStorage.setItem('appointments', JSON.stringify(final));
          toast.dismiss(transferToast);
          toast.success('Appointment now visible in OPD list');
          const { firstName, middleName, lastName } = splitName(transfer.name);
          const response = await axios.post('https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient', {
            name: transfer.name,
            firstName,
            middleName,
            lastName,
            phone: transfer.phone,
            email: transfer.email,
            doctorName: transfer.doctorName,
            reason: transfer.reason || '',
            diagnosis: transfer.diagnosis || '',
            appointmentDate: transfer.date,
            appointmentTime: transfer.time,
            type: 'OPD',
            isVisible: true,
            consultationStarted: false,
            consultationCompleted: false,
            prescription: '',
            advice: '',
            movedDate: new Date().toISOString()
          });
          const newPatientId = response.data.id;
          const existing = JSON.parse(localStorage.getItem("highlightOPDIds") || "[]");
          const updatedIds = [...new Set([...existing, newPatientId])];
          localStorage.setItem("highlightOPDIds", JSON.stringify(updatedIds));
          navigate('/doctordashboard/patients');
        } catch (e) {
          toast.dismiss(transferToast);
          toast.error('Failed to transfer appointment.');
        }
      }, 1000);
    } catch {
      toast.error('Failed to accept appointment');
    }
  };

  const reschedulingAppointment = rescheduleId
    ? appointments.find(a => a.id === rescheduleId)
    : null;

  const handleReject = async id => {
    const reason = reasons[id] || 'No reason given', a = appointments.find(x => x.id === id); setRejectId(null);
    try {
      updateStatus(id, { status: 'Rejected', rejectReason: reason });
      await axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${id}`, { status: 'Rejected', rejectReason: reason });
      await notify(a.name, a.phone, `:x: Appointment rejected.\nReason: ${reason}`);
      toast.success('Appointment rejected');
    }
    catch (error) { console.error('Error rejecting appointment:', error); toast.error('Failed to reject appointment'); }
  };

  const handleReschedule = async id => {
    const { date, time } = reschedule, a = appointments.find(x => x.id === id);
    if (!date || !time) return;
    if (a.rescheduleCount >= 2) {
      updateStatus(id, { status: 'Rejected', rejectReason: 'Auto-cancelled after 2 reschedules' });
      await axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${id}`, { status: 'Rejected', rejectReason: 'Auto-cancelled after 2 reschedules' });
      await notify(a.name, a.phone, `:x: Appointment automatically cancelled after 2 reschedules.`);
      toast.success('Appointment automatically cancelled after 2 reschedules');
    } else {
      updateStatus(id, { date, time, rescheduleCount: a.rescheduleCount + 1 });
      await axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${id}`, { date, time, rescheduleCount: a.rescheduleCount + 1 });
      await notify(a.name, a.phone, `:calendar: Rescheduled to ${date} at ${time}`);
      setRescheduleId(null); setReschedule({ date: '', time: '' }); toast.success('Appointment rescheduled');
    }
  };

  const handleDeleteRejected = id => {
    updateStatus(id, () => null);
    const filtered = appointments.filter(a => a.id !== id);
    setAppointments(filtered);
    localStorage.setItem('appointments', JSON.stringify(filtered));
    toast.success('Rejected appointment deleted');
  };

  // Table columns config
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Date', accessor: 'date' },
    { header: 'Time', accessor: 'time' },
    ...(tab !== 'rejected' ? [{ header: 'Reason', accessor: 'reason' }] : []),
    {
      header: tab === 'rejected' ? 'Rejection Reason' : 'Type',
      accessor: tab === 'rejected' ? 'rejectReason' : 'type',
      cell: row => tab === 'rejected'
        ? <span className="text-red-600">{row.rejectReason || 'No reason given'}</span>
        : row.type
    },
    {
      header: 'Action',
      accessor: 'action',
      cell: row => tab === 'pending' ? (
        <>
          <button onClick={() => handleAccept(row.id)} className="view-btn m-1">Accept</button>
          <button onClick={() => setRejectId(row.id)} className="delete-btn">Reject</button>
        </>
      ) : tab === 'confirmed' ? (
        <>
          <button onClick={() => setRescheduleId(row.id)} className="edit-btn">Reschedule</button>
          <button onClick={() => setRejectId(row.id)} className="delete-btn ml-2">Reject</button>
        </>
      ) : (
        <button onClick={() => handleDeleteRejected(row.id)} className="delete-btn">Delete</button>
      )
    }
  ];

  // Filters for DynamicTable
  const nameOptions = Array.from(new Set(tabFiltered.map(a => a.name))).map(n => ({ label: n, value: n }));
  const typeOptions = Array.from(new Set(tabFiltered.map(a => a.type))).map(t => ({ label: t, value: t }));
  const filters = [
    // { key: 'name', label: 'Name', options: nameOptions },
    { key: 'type', label: 'Type', options: typeOptions }
  ];

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className='p-6'>
        <h4 className="h4-heading mb-6">Appointments</h4>
        <DynamicTable
          columns={columns}
          data={current}
          filters={filters}
          tabs={TABS}
          activeTab={tab}
          onTabChange={setTab}
          // Optionally, you can add a callback to update filteredData for pagination if DynamicTable supports it
        />
        <div className="w-full flex justify-end mt-4">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
      {(rejectId || rescheduleId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface)] rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">{rejectId ? 'Reject' : 'Reschedule'} Appointment</h2>
            {rejectId ? (
              <>
                <textarea className="input-field" rows={3} placeholder="Reason for rejection" value={reasons[rejectId] || ''} onChange={e => setReasons(p => ({ ...p, [rejectId]: e.target.value }))} />
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setRejectId(null)} className="view-btn">Close</button>
                  <button onClick={() => handleReject(rejectId)} className="delete-btn">Reject</button>
                </div>
              </>
            ) : (
              <>
                {reschedulingAppointment && reschedulingAppointment.rescheduleCount < 2 && <p className="text-yellow-600 mb-4 text-sm">Note: After the second reschedule, the appointment will be automatically rejected.</p>}
                <input type="date" value={reschedule.date} onChange={e => setReschedule({ ...reschedule, date: e.target.value })} className="input-field" />
                <input type="time" value={reschedule.time} onChange={e => setReschedule({ ...reschedule, time: e.target.value })} className="input-field mt-4" />
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setRescheduleId(null)} className="view-btn">Cancel</button>
                  <button onClick={() => handleReschedule(rescheduleId)} className="edit-btn">Reschedule</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;