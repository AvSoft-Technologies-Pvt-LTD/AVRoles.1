import React, { useState, useEffect,useRef  } from 'react';
import { FaHeartbeat,FaTrashAlt,FaChevronLeft,FaEdit ,FaEraser, FaNotesMedical, FaCheckCircle, FaTimesCircle,FaChevronDown, FaChevronUp, FaFlask, FaPills, FaPrint,  FaPlus,  FaRegSave, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { useNavigate,useLocation } from 'react-router-dom'
import {  Printer, X,  Save, CheckSquare, Square } from 'lucide-react';
import logo from '../../../../assets/AV.png';
import prescription from '../../../../assets/Prescription.png';
import { ToastContainer, toast } from 'react-toastify';
const defaultMedicine = { drugName: '', form: '', strength: '', dosage: 1, dosageUnit: 'Tablet', frequency: '', intake: 'Before Food', duration: 1 };
const frequencyOptions = ['once a day', 'twice a day', 'three times a day', 'every 6 hours', 'every 8 hours'];
const intakeOptions = ['Before Food', 'After Food'];
const getStyledPrescriptionHTML = (doctor, patient, signature, logoUrl, formContent) => {return `<div style="width:800px;font-family:Arial,sans-serif;padding:40px;box-sizing:border-box;border:2px solid #0e1630;background:#fff;"><div style="display:flex;justify-content:space-between;align-items:center;"><div><h1 style="margin:0;font-size:24px;border-bottom:3px solid #01D48C;color:#0e1630;">${doctor.name}</h1><p style="margin:2px 0;font-size:14px;color:#0e1630;">${doctor.qualifications}</p><p style="margin:2px 0;font-size:14px;color:#0e1630;">${doctor.specialization}</p></div><img src="${logoUrl}" alt="Logo" style="height:100px;" /></div><div style="margin-top:10px;padding:16px 24px;border-radius:8px;background:linear-gradient(to right,#f9f9f9,#f1f1f1);"><div style="display:flex;justify-content:space-between;font-size:16px;color:#0e1630;"><div><p><strong style="border-bottom:1px solid #01D48C;">Name:</strong> ${patient?.name || 'N/A'}</p><p><strong style="border-bottom:1px solid #01D48C;">Age:</strong> ${patient?.age || 'N/A'}</p><p><strong style="border-bottom:1px solid #01D48C;">Birth:</strong> ${patient?.dob || 'DD/MM/YYYY'}</p><p><strong style="border-bottom:1px solid #01D48C;">Gender:</strong> ${patient?.gender || 'N/A'}</p></div><div><p><strong style="border-bottom:1px solid #01D48C;">Weight:</strong> ${patient?.weight || 'N/A'} Kg</p><p><strong style="border-bottom:1px solid #01D48C;">Height:</strong> ${patient?.height || 'N/A'}</p><p><strong style="border-bottom:1px solid #01D48C;">Address:</strong> ${patient?.address || 'N/A'}</p><p><strong style="border-bottom:1px solid #01D48C;">Contact:</strong> ${patient?.phone || 'N/A'}</p></div></div></div><div style="position:relative;margin:20px 0;"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:url(${prescription}) center/contain no-repeat;opacity:0.3;height:600px;width:300px;z-index:0;pointer-events:none;"></div><div style="position:relative;z-index:1;">${formContent || '<p>No content available.</p>'}</div></div><div style="margin-top:40px;width:100%;height:100px;background:linear-gradient(to right,#f9f9f9,#f1f1f1);border-top:3px solid #0e1630;display:flex;align-items:center;justify-content:space-between;padding:0 40px;box-sizing:border-box;box-shadow:0 -2px 6px rgba(0,0,0,0.05);"><div style="display:flex;align-items:center;"><img src="${logoUrl}" alt="Clinic Logo" style="width:80px;height:80px;object-fit:contain;border-radius:8px;margin-right:20px;" /><div style="color:#1696c9;font-size:14px;line-height:1.5;"><div style="display:flex;align-items:center;margin-bottom:4px;color:#0e1630;font-size:16px;"><svg style="width:16px;height:16px;margin-right:6px;" fill="#01D48C" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg> Dharwad, Karnataka, 580001</div><div style="display:flex;align-items:center;color:#0e1630;font-size:16px;"><svg style="width:16px;height:16px;margin-right:6px;" fill="#01D48C" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.72 11.72 0 0 0 3.68.59 1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1C9.61 21 3 14.39 3 6.5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.28.2 2.53.59 3.68a1 1 0 0 1-.24 1.01l-2.23 2.1z"/></svg> +12-345 678 9012</div></div></div><div style="text-align:right;">${signature ? `<img src="${signature}" alt="Signature" style="height:48px;margin-bottom:2px;" />` : '<div style="height:48px;"></div>'}<div style="width:160px;margin-left:auto;font-size:16px;color:#444;padding-top:4px;border-top:2px solid #0e1630;">Doctor's Signature</div></div></div></div>`;};
const style = `body{font-family:Arial,sans-serif;margin:40px;color:#333;}table{border-collapse:collapse;width:100%;margin-top:20px;}th,td{border:1px solid #ddd;padding:10px;text-align:left;}th{background:#f8f9fa;font-weight:bold;}td{background:#fff;}h2{margin-bottom:10px;}`;
const getVitalsTemplate = (d) => `<h4 style="color:#16a085;">Vitals Report</h4><table><thead><tr><th>Heart Rate</th><th>Temperature</th><th>Blood Sugar</th><th>Blood Pressure</th><th>Height</th><th>Weight</th></tr></thead><tbody><tr><td>${d.heartRate || '-'}</td><td>${d.temperature || '-'}</td><td>${d.bloodSugar || '-'}</td><td>${d.bloodPressure || '-'}</td><td>${d.height || '-'}</td><td>${d.weight || '-'}</td></tr></tbody></table>`;
const getClinicalNotesTemplate = (d) => `<h4 style="color:#2980b9;">Clinical Notes</h4><table><thead><tr><th>Chief Complaint</th><th>History</th><th>Assessment</th><th>Plan</th></tr></thead><tbody><tr><td>${d.chiefComplaint || '-'}</td><td>${d.history || '-'}</td><td>${d.assessment || '-'}</td><td>${d.plan || '-'}</td></tr></tbody></table>`;
const getLabResultsTemplate = (d) => `<h4 style="color:#8e44ad;">Lab Results</h4><table><thead><tr><th>Test Name</th><th>Code</th><th>Instructions</th></tr></thead><tbody>${(d.selectedTests || []).map((t) => `<tr><td>${t.name || '-'}</td><td>${t.code || '-'}</td><td>${t.instructions || '-'}</td></tr>`).join('')}</tbody></table>`;
const getRealTimePrescriptionTemplate = (prescriptions = []) => `<h4 style="color:#2980b9;">Prescription</h4><table><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Intake</th><th>Duration</th></tr></thead><tbody>${prescriptions.map((m) => `<tr><td>${m.drugName || '-'}</td><td>${m.dosage || '-'}</td><td>${m.frequency || '-'}</td><td>${m.intake || '-'}</td><td>${m.duration || '-'} day(s)</td></tr>`).join('')}</tbody></table>`;
const API_URL = 'https://6808fb0f942707d722e09f1d.mockapi.io/health-summary';
const LAB_TESTS_API = 'https://mocki.io/v1/7bf93caf-60d0-4bdd-96a2-79fbe26e59fb';
const vitalRanges = { heartRate: { min: 60, max: 100, label: 'bpm', placeholder: 'e.g. 72' }, temperature: { min: 36.1, max: 37.2, label: '°C', placeholder: 'e.g. 36.8' }, bloodSugar: { min: 70, max: 140, label: 'mg/dL', placeholder: 'e.g. 90' }, bloodPressure: { min: 90, max: 120, label: 'mmHg', placeholder: 'e.g. 120/80' }, height: { min: 100, max: 220, label: 'cm', placeholder: 'e.g. 170' }, weight: { min: 30, max: 200, label: 'kg', placeholder: 'e.g. 65' } };

const VitalsForm = ({ id, onRemove, isSelected, onSelect, onSave, data, onPrint = {} }) => {
  const [formData, setFormData] = useState({ heartRate: '', temperature: '', bloodSugar: '', bloodPressure: '', height: '', weight: '', ...data });
  const [warnings, setWarnings] = useState({}), [loading, setLoading] = useState(false), [apiId, setApiId] = useState(null);
  useEffect(() => { setFormData(p => ({ ...p, ...data })); axios.get(`${API_URL}?email=demo@demo.com`).then(r => r.data.length && setApiId(r.data[0].id)) }, [data]);
  const validate = (f, v) => { const r = vitalRanges[f]; if (!r) return ''; if (f === 'bloodPressure') { const [s, d] = v.split('/').map(Number); if (!s || !d) return 'Enter as systolic/diastolic'; if (s < 90 || s > 120 || d < 60 || d > 80) return 'Out of range (90-120/60-80)'; return ''; } if (v === '') return ''; const n = +v; if (isNaN(n)) return 'Enter a number'; if (n < r.min || n > r.max) return `Out of range (${r.min}-${r.max} ${r.label})`; return ''; };
  const save = async () => { setLoading(true); const p = { ...formData, email: "demo@demo.com" }; try { apiId ? (await axios.put(`${API_URL}/${apiId}`, p), toast.success('Prescription Upadated successfully!')) : (await axios.post(API_URL, p).then(r => setApiId(r.data.id)), toast.success(' Prescription saved successfully!')); onSave(id, formData) } catch { toast.error('Failed to update prescription') } setLoading(false); };
  return <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden" id={`print-form-${id}`}>
    <div className="sub-heading px-4 py-2 flex justify-between items-center">
      <div className="flex items-center gap-3"><FaHeartbeat className="text-xl" /><h3 style={{ color: "white" }}>Vital Signs</h3></div>
      <div className="flex items-center gap-3">
        <button onClick={onSelect}>{isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button>
        <button onClick={save} disabled={loading}><Save size={20} /></button>
        <button onClick={() => onPrint(id)}><Printer size={20} /></button>
        <button onClick={onRemove}><X size={20} /></button>
      </div>
    </div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      {Object.keys(vitalRanges).map(f => <div key={f}>
        <label className="block text-sm font-medium text-gray-700 mb-2">{f.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}</label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input name={f} value={formData[f]} onChange={e => {
            let v = e.target.value;
            if (f !== 'bloodPressure') v = v.replace(/[^0-9.]/g, '');
            setFormData(p => ({ ...p, [f]: v })); setWarnings(p => ({ ...p, [f]: validate(f, v) }));
          }} placeholder={vitalRanges[f].placeholder} className="input-field pr-12" />
          {formData[f] && <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none', fontSize: '0.95em' }}>{vitalRanges[f].label}</span>}
        </div>
        {warnings[f] && <span className="flex items-center text-xs text-yellow-700 bg-yellow-100 rounded px-2 py-1 mt-1 gap-1"><FaExclamationTriangle className="text-yellow-500" />{warnings[f]}</span>}
      </div>)}
    </div>
  </div>
}

const ClinicalNotesForm = ({ id, onRemove, isSelected, onSelect, onSave, data, onPrint }) => {
  const [formData, setFormData] = useState(data || { chiefComplaint: '', history: '', assessment: '', plan: '' });
  useEffect(() => setFormData(data || { chiefComplaint: '', history: '', assessment: '', plan: '' }), [data]);
  const handle = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  return <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden" id={`print-form-${id}`}>
    <div className="sub-heading px-4 py-2 flex justify-between items-center">
      <div className="flex items-center gap-3"><FaNotesMedical className="text-xl" /><h3>Clinical Notes</h3></div>
      <div className="flex items-center gap-3">
        <button onClick={onSelect}>{isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button>
        <button onClick={() => onSave(id, formData)}><Save size={20} /></button>
        <button onClick={() => onPrint(id)}><Printer size={20} /></button>
        <button onClick={onRemove}><X size={20} /></button>
      </div>
    </div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {["chiefComplaint", "history", "assessment", "plan"].map(f => <div key={f}>
        <label className="block text-sm text-gray-700 mb-2">{f.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}</label>
        <textarea name={f} value={formData[f]} onChange={handle} className="input-field max-h-[50px]"></textarea>
      </div>)}
    </div>
  </div>
}
const LabResultsForm = ({ id, onRemove, isSelected, onSelect, data = {}, onSave, onPrint }) => {
  const [labTests, setLabTests] = useState([]), [selectedTests, setSelectedTests] = useState(data.selectedTests || []), [search, setSearch] = useState(""), [results, setResults] = useState([]), [highlightedTest, setHighlightedTest] = useState(null);
  useEffect(() => { axios.get(LAB_TESTS_API).then(res => setLabTests(res.data)).catch(() => setLabTests([])); }, []);
  useEffect(() => {
    const filtered = labTests.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase()));
    setResults(filtered); setHighlightedTest(filtered.find(t => t.name.toLowerCase() === search.toLowerCase() || t.code.toLowerCase() === search.toLowerCase()) || null);
  }, [search, labTests]);
  const handleSelectTest = t => { setHighlightedTest(t); setSearch(t.name); };
  const handleAddTest = () => {
    if (highlightedTest && !selectedTests.find(t => t.code === highlightedTest.code)) {
      const updated = [...selectedTests, highlightedTest];
      setSelectedTests(updated); onSave?.(id, { ...data, selectedTests: updated });
    }
    setSearch(""); setHighlightedTest(null);
  };
  const removeTest = code => { const updated = selectedTests.filter(t => t.code !== code); setSelectedTests(updated); onSave?.(id, { ...data, selectedTests: updated }); };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200" id={`print-form-${id}`}>
      <div className="sub-heading px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-3"><FaFlask className="text-xl" /><h3>Lab Tests</h3></div>
        <div className="flex items-center gap-3">
          <button onClick={onSelect}>{isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button>
          <button onClick={() => onPrint(id)}><Printer size={20} /></button>
          <button onClick={onRemove}><X size={20} /></button>
        </div>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Lab Test</label>
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setHighlightedTest(null); }} placeholder="Type test name or code..." className="input-field" />
            {search && (results.length > 0 ? (
              <div className="border rounded bg-white mt-1 max-h-40 overflow-auto">
                {results.map(test => (
                  <div key={test.code} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelectTest(test)}>
                    <span className="font-semibold">{test.code}</span> - {test.name}
                  </div>
                ))}
              </div>
            ) : <div className="px-3 py-2 text-gray-400 border rounded bg-white mt-1">No match</div>)}
          </div>
          {highlightedTest && (
            <div className="flex-1 border rounded p-4 bg-gray-50 min-w-[220px]">
              <div className="font-semibold">{highlightedTest.name} <span className="text-xs text-gray-500">({highlightedTest.code})</span></div>
              <div className="text-sm text-gray-700 mt-2">{highlightedTest.instructions}</div>
              <button className="btn btn-primary mt-4" onClick={handleAddTest} disabled={selectedTests.some(t => t.code === highlightedTest.code)}>Add</button>
            </div>
          )}
        </div>
        <div className="mt-6">
          {selectedTests.map(test => (
            <div key={test.code} className="mb-2 p-2 border rounded flex justify-between items-center bg-gray-50">
              <div>
                <span className="font-semibold">{test.name}</span> <span className="text-xs text-gray-500">({test.code})</span>
                <div className="text-xs text-gray-700">{test.instructions}</div>
              </div>
              <button onClick={() => removeTest(test.code)} className="ml-2 text-red-500"><FaTrashAlt /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
const PrescriptionForm = ({ id, onRemove, isSelected, onSelect, onSave, data = {}, onPrint }) => {
  const [prescriptions, setPrescriptions] = useState(data.prescriptions || [{ ...defaultMedicine }]), [drugSuggestions, setDrugSuggestions] = useState([]), [activeInputIndex, setActiveInputIndex] = useState(null), [doctor] = useState({ name: 'Dr. Priya Sharma', specialization: 'Cardiologist', regNo: 'MH123456', qualifications: 'MBBS, MD' }), [patient] = useState({ name: 'Vaishnavi Wagh', age: 28, gender: 'Female', contact: '9876543210' }), [isSaved, setIsSaved] = useState(false), [prescriptionId, setPrescriptionId] = useState(data.id || null), [isEdit, setIsEdit] = useState(true);
  const handleChange = (i, field, val) => setPrescriptions(prev => prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p))), addPrescription = () => setPrescriptions(prev => [...prev, { ...defaultMedicine }]), removePrescription = i => setPrescriptions(prev => prev.filter((_, idx) => idx !== i));
  const handleSave = async () => { try { const res = await axios.post('https://684ac997165d05c5d35a5118.mockapi.io/digitalprescription', { doctor, patient, prescriptions, date: new Date().toLocaleDateString() }); setIsSaved(true); setPrescriptionId(res.data.id); setIsEdit(false); onSave(id, { prescriptions }); toast.success('Prescription saved Successfully!'); } catch (err) { toast.error('Error saving prescription:', err); } };
  const handleUpdate = async () => { try { await axios.put(`https://684ac997165d05c5d35a5118.mockapi.io/digitalprescription/${prescriptionId}`, { doctor, patient, prescriptions, date: new Date().toLocaleDateString() }); setIsEdit(false); onSave(id, { prescriptions }); toast.success('Prescription updated Successfully!'); } catch (err) { toast.error('Error updating prescription:', err); } };
  const fetchDrugSuggestions = async q => { if (q.length < 2) return setDrugSuggestions([]); try { const res = await axios.get('https://mocki.io/v1/efc542df-dc4c-4b06-9e5b-32567facef11'); setDrugSuggestions(res.data.filter(drug => drug.name.toLowerCase().includes(q.toLowerCase()))); } catch (err) { console.error('Error fetching drugs:', err); } };
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden" id={`print-form-${id}`}>
      <div className="sub-heading px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-3"><FaPills className="text-xl" /><h3>Prescription</h3></div>
        <div className="flex items-center gap-3">
          <button onClick={onSelect} aria-label="Toggle Select">{isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button>
          <button onClick={() => onPrint(id)}><Printer size={20} /></button>
          <button onClick={onRemove}><X size={20} /></button>
        </div>
      </div>
      <div className="p-6">
        <div className="rounded-lg p-6 mb-8 bg-white text-black">
          <table className="w-full border border-gray-300 text-sm">
            <thead><tr className="bg-gray-100"><th className="px-3 py-2">Medicine</th><th className="px-3 py-2">Dosage</th><th className="px-3 py-2">Frequency</th><th className="px-3 py-2">Intake</th><th className="px-3 py-2">Duration</th><th className="px-3 py-2">Actions</th></tr></thead>
            <tbody>
              {prescriptions.map((med, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2 relative">
                    <input type="text" className="border-gray-300 shadow-sm rounded p-2" placeholder="Search Drug..." value={med.drugName} onChange={e => { handleChange(i, 'drugName', e.target.value); fetchDrugSuggestions(e.target.value); setActiveInputIndex(i); }} onFocus={() => setActiveInputIndex(i)} onBlur={() => setTimeout(() => setDrugSuggestions([]), 200)} disabled={!isEdit} />
                    {activeInputIndex === i && drugSuggestions.length > 0 && (
                      <ul className="absolute bg-white border z-10 rounded w-full shadow max-h-48 overflow-y-auto mt-1 text-sm">
                        {drugSuggestions.map(drug => (
                          <li key={drug.id} onClick={() => { handleChange(i, 'drugName', drug.name); handleChange(i, 'form', drug.form || ''); handleChange(i, 'strength', drug.strength || ''); setDrugSuggestions([]); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">{drug.name} ({drug.strength}, {drug.form})</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-3 py-2"><input type="number" className="border-gray-300 shadow-sm rounded p-2 w-20" placeholder="Dosage" min="1" value={med.dosage} onChange={e => handleChange(i, 'dosage', e.target.value)} disabled={!isEdit} /></td>
                  <td className="px-3 py-2"><select className="border-gray-300 shadow-sm border rounded p-2" value={med.frequency} onChange={e => handleChange(i, 'frequency', e.target.value)} disabled={!isEdit}><option value="">Frequency</option>{frequencyOptions.map(opt => <option key={opt}>{opt}</option>)}</select></td>
                  <td className="px-3 py-2"><select className="border-gray-300 shadow-sm rounded p-2 w-30" value={med.intake} onChange={e => handleChange(i, 'intake', e.target.value)} disabled={!isEdit}>{intakeOptions.map(opt => <option key={opt}>{opt}</option>)}</select></td>
                  <td className="px-3 py-2"><input type="number" className="border-gray-300 shadow-sm rounded p-2 w-20" placeholder="Duration" min="1" value={med.duration} onChange={e => handleChange(i, 'duration', e.target.value)} disabled={!isEdit} /></td>
                  <td className="px-3 py-2"><button onClick={() => removePrescription(i)} className="text-red-600 hover:text-red-800" disabled={!isEdit}><FaTrashAlt /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isEdit && <button onClick={addPrescription} className="edit-btn">+ Add Medicine</button>}
        <div className="flex gap-4 mt-4 justify-end">
          {!isSaved ? <button onClick={handleSave} className="btn btn-primary flex items-center gap-2"><FaRegSave />Save</button> : isEdit ? <>
            <button onClick={handleUpdate} className="btn btn-secondary flex items-center gap-2"><FaCheckCircle />Update</button>
            <button onClick={() => setIsEdit(false)} className="delete-btn flex items-center gap-2"><FaTimesCircle />Cancel</button>
          </> : <button onClick={() => setIsEdit(true)} className="edit-btn flex items-center gap-2"><FaEdit />Edit</button>}
        </div>
      </div>
    </div>
  );
};
function FormsPage() {
  const initialForms = ['vitals', 'clinical-notes', 'lab-tests', 'medications'].map(id => ({ id, type: id, data: {} }));
const [formVisibility, setFormVisibility] = useState(Object.fromEntries(initialForms.map(f => [f.id, false])));
const [forms, setForms] = useState(initialForms);
const [selectedForms, setSelectedForms] = useState(new Set(initialForms.map(f => f.id)));
const [doctorSignature, setDoctorSignature] = useState(null);
const signaturePadRef = useRef();
const location = useLocation(), navigate = useNavigate();
const patient = location.state?.patient || {};
useEffect(() => {
  const storedSignature = localStorage.getItem('doctorSignature');
  if (storedSignature) setDoctorSignature(storedSignature);
}, []);
const handleSignatureUpload = e => {
  const file = e.target.files[0];
  if (file) {const reader = new FileReader();
    reader.onload = ({ target }) => {
      setDoctorSignature(target.result);
      localStorage.setItem('doctorSignature', target.result);
    };
    reader.readAsDataURL(file);
  }};
const handleClearSignature = () => { signaturePadRef.current.clear(); setDoctorSignature(null); };
const handleSaveDrawnSignature = () => {
  if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) return toast("Please draw your signature first.");
  const dataURL = signaturePadRef.current.getCanvas().toDataURL('image/png');
  setDoctorSignature(dataURL);
  localStorage.setItem('doctorSignature', dataURL);
};
const toggleFormVisibility = (id) =>
setFormVisibility((prev) => ({ ...prev, [id]: !prev[id] }));

  const removeForm = (id) => {
    const updatedForms = forms.filter((f) => f.id !== id);
    setForms(updatedForms);
    setSelectedForms((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };
  const toggleFormSelection = (id) =>
    setSelectedForms((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  const selectAllForms = () =>
    setSelectedForms(
      selectedForms.size === forms.length ? new Set() : new Set(forms.map((f) => f.id))
    );
const handlePrintForm = (id) => {
  const form = forms.find((f) => f.id === id);
  if (!form) return;
  const doctor = {
    name: 'Dr.Sheetal S. Shelke',specialization: 'Neurologist',regNo: 'MH123456',qualifications: 'MBBS, MD',};
     let formContent = '';
     switch (form.type) {
       case 'vitals':
         formContent = getVitalsTemplate(form.data);break;
       case 'clinical-notes':
         formContent = getClinicalNotesTemplate(form.data);break;
       case 'lab-tests':
         formContent = getLabResultsTemplate(form.data);break;
       case 'medications':
         formContent = getRealTimePrescriptionTemplate(form.data.prescriptions || []);break;
       default:
         formContent = '<p>No content available for this form.</p>';
  }
  const header = getStyledPrescriptionHTML(doctor, patient, doctorSignature, logo,formContent);
     const win = window.open('', '', 'width=900,height=700');
     win.document.write(`
       <html>
       <head><title>Print Form</title> <style>body { font-family: Arial, sans-serif; }${style}</style></head><body>${header}</body>
       </html>`);
     win.document.close();
     win.focus();
   };
  const handleSaveForm = (id, data) => {
    const updatedForms = forms.map((f) => (f.id === id ? { ...f, data } : f));
    setForms(updatedForms);
    localStorage.setItem('medicalForms', JSON.stringify(updatedForms));
    toast.success('Form saved Successfully!');
  };
const printSelected = () => {
  if (selectedForms.size === 0) return toast.error('Please select at least one form to print.');
  const doctor = {
    name: 'Dr.Sheetal S. Shelke',specialization: 'Neurologist',regNo: 'MH123456',qualifications: 'MBBS, MD',
  };
 const formsHtml = Array.from(selectedForms)
    .map((id) => {
      const form = forms.find((f) => f.id === id);
      if (!form || !form.data) return '';
      switch (form.type) {
        case 'vitals':
          return getVitalsTemplate(form.data);
        case 'clinical-notes':
          return getClinicalNotesTemplate(form.data);
        case 'lab-tests':
          return getLabResultsTemplate(form.data);
        case 'medications':
          return getRealTimePrescriptionTemplate(form.data.prescriptions || []);
        default:
          return '';
      }})
    .join('<div class="page-break"></div>');
   const header = getStyledPrescriptionHTML(doctor, patient, doctorSignature, logo,formsHtml);
   const win = window.open('', '', 'width=900,height=700');
   win.document.write(`
    <html>
      <head><title>Print</title><style>body { font-family: Arial, sans-serif; }.page-break { page-break-after: always; }${style}</style></head><body>${header}</body>
    </html>
  `);
  win.document.close();
  win.focus();
};
const renderForm = (form) => {
    const commonProps = {
      id: form.id,onRemove: () => removeForm(form.id),isSelected: selectedForms.has(form.id),onSelect: () => toggleFormSelection(form.id),onSave: handleSaveForm,data: form.data,onPrint: handlePrintForm,
    };
    return (
      <div key={form.id} className="border-b border-gray-200 py-2">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleFormVisibility(form.id)}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold uppercase">{form.type}</h3> {formVisibility[form.id] ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </div>
        {formVisibility[form.id] && (
          <div>
            {form.type === 'vitals' && <VitalsForm {...commonProps} />}
            {form.type === 'clinical-notes' && <ClinicalNotesForm {...commonProps} />}
            {form.type === 'lab-tests' && <LabResultsForm {...commonProps} />}
            {form.type === 'medications' && <PrescriptionForm {...commonProps} />}
          </div>
        )}
      </div>
    );
};
return (
  <div className="min-h-screen">
     <ToastContainer />
  <header className="py-6 px-6 mb-2">
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[var(--primary-color)] font-medium mb-4"><FaChevronLeft className="w-5 h-5" /> Back to Patient List</button>
    </div>
    <div className="max-w-6xl mx-auto bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--primary-color)] text-white text-lg font-bold">{patient?.name?.split(' ').map(n => n[0]).join('') || 'N/A'}</div>
        <div><h2 className="text-lg font-semibold">{patient?.name || 'N/A'}</h2>
        <p className="text-sm text-gray-500">{patient?.email || 'N/A'}</p></div></div>
      <div className="flex items-center gap-8 text-sm text-gray-700">
        <p><strong>Contact:</strong> {patient?.phone || 'N/A'}</p><p><strong>Diagnosis:</strong> {patient?.diagnosis || 'N/A'}</p>
      </div>
    </div>
  </header>
  <div className="max-w-6xl mx-auto px-6">
    {forms.length > 0 && <>
      <div className="space-y-6 mb-8">{forms.map(renderForm)}</div>
      <div className="flex flex-wrap items-start gap-8 p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-2">
            <label className="paragraph font-semibold">Upload Digital Signature:</label>
            <input type="file" accept="image/*" onChange={handleSignatureUpload} className="input-field peer" />
          </div>
          {doctorSignature && (
            <div className="flex items-center">
              <p className="paragraph font-semibold">Preview:</p>
              <img src={doctorSignature} alt="Doctor's Signature" className="rounded border border-gray-300" style={{ width: '120px' }} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="paragraph font-semibold">Or Draw Signature:</label>
          <SignatureCanvas penColor="black" canvasProps={{ width: 300, height: 80, className: 'border rounded shadow' }} ref={signaturePadRef} />
          <div className="flex items-center gap-4 mt-2">
            <button type="button" onClick={handleSaveDrawnSignature} className="view-btn"><FaRegSave /></button>
            <button type="button" onClick={handleClearSignature} className="edit-btn"><FaEraser /></button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
        <div className="flex justify-between items-center p-4">
          <label onClick={selectAllForms} className="flex items-center gap-2 cursor-pointer select-none">
            {selectedForms.size === forms.length && forms.length > 0
              ? <CheckSquare className="w-5 h-5 text-[var(--primary-color)]" />
              : <Square className="w-5 h-5 text-[var(--primary-color)]" />}
            <span className="font-medium text-[var(--primary-color)]">Select All ({forms.length} forms)</span>
          </label>
          <div className="flex gap-3">
            <button className={`btn ${selectedForms.size === 0 ? 'btn-disabled' : 'edit-btn'} px-6 py-2`} onClick={printSelected} disabled={selectedForms.size === 0}>
              <FaPrint /> Print Selected ({selectedForms.size})
            </button>
          </div>
        </div>
      </div>
    </>}
  </div>
</div>
  );
}
export default FormsPage;