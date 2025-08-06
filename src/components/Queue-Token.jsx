import React, { useState } from 'react';
import { Plus, User, Phone, Building2, AlertCircle, FileText, UserCheck, Stethoscope, HeartPulse, Bone, Baby, Syringe, ShieldAlert, Sun, Brain } from 'lucide-react';
const TOKENS_KEY = 'hospital_tokens';
const validatePhone = p => /^\d{10}$/.test(p);
const getNextTokenNumber = () => {
  let t = []; try { t = JSON.parse(localStorage.getItem(TOKENS_KEY)) || []; } catch { t = []; }
  return t.length ? t.reduce((m, x) => Math.max(m, parseInt((x.tokenNumber || '').replace(/\D/g, ''))), 0) + 1 : 1;
};
const departments = [
  { value: 'general', label: 'General Medicine', icon: <Stethoscope size={16} className="inline mr-1" />, doctors: [{ id: 'dr1', name: 'Dr. Sarah Johnson', degree: 'MBBS, MD (Internal Medicine)', experience: '15 years' }, { id: 'dr2', name: 'Dr. Michael Chen', degree: 'MBBS, MD (Family Medicine)', experience: '12 years' }, { id: 'dr3', name: 'Dr. Emily Davis', degree: 'MBBS, MD (General Practice)', experience: '10 years' }] },
  { value: 'cardiology', label: 'Cardiology', icon: <HeartPulse size={16} className="inline mr-1" />, doctors: [{ id: 'dr4', name: 'Dr. Robert Wilson', degree: 'MBBS, MD, DM (Cardiology)', experience: '20 years' }, { id: 'dr5', name: 'Dr. Lisa Anderson', degree: 'MBBS, MD, DNB (Cardiology)', experience: '18 years' }, { id: 'dr6', name: 'Dr. James Miller', degree: 'MBBS, MD, FACC', experience: '22 years' }] },
  { value: 'orthopedic', label: 'Orthopedic', icon: <Bone size={16} className="inline mr-1" />, doctors: [{ id: 'dr7', name: 'Dr. David Brown', degree: 'MBBS, MS (Orthopedics)', experience: '16 years' }, { id: 'dr8', name: 'Dr. Jennifer Taylor', degree: 'MBBS, DNB (Orthopedics)', experience: '14 years' }, { id: 'dr9', name: 'Dr. Mark Thompson', degree: 'MBBS, MS, MCh (Orthopedics)', experience: '19 years' }] },
  { value: 'pediatrics', label: 'Pediatrics', icon: <Baby size={16} className="inline mr-1" />, doctors: [{ id: 'dr10', name: 'Dr. Amanda White', degree: 'MBBS, MD (Pediatrics)', experience: '13 years' }, { id: 'dr11', name: 'Dr. Kevin Martinez', degree: 'MBBS, DCH, MD (Pediatrics)', experience: '17 years' }, { id: 'dr12', name: 'Dr. Rachel Green', degree: 'MBBS, MD, IAP Fellowship', experience: '11 years' }] },
  { value: 'gynecology', label: 'Gynecology', icon: <Syringe size={16} className="inline mr-1" />, doctors: [{ id: 'dr13', name: 'Dr. Maria Rodriguez', degree: 'MBBS, MS (Obstetrics & Gynecology)', experience: '18 years' }, { id: 'dr14', name: 'Dr. Susan Clark', degree: 'MBBS, MD, DGO', experience: '21 years' }, { id: 'dr15', name: 'Dr. Patricia Lewis', degree: 'MBBS, MS, FRCOG', experience: '25 years' }] },
  { value: 'emergency', label: 'Emergency', icon: <ShieldAlert size={16} className="inline mr-1" />, doctors: [{ id: 'dr16', name: 'Dr. Thomas Walker', degree: 'MBBS, MD (Emergency Medicine)', experience: '12 years' }, { id: 'dr17', name: 'Dr. Nancy Hall', degree: 'MBBS, DNB (Emergency Medicine)', experience: '9 years' }, { id: 'dr18', name: 'Dr. Christopher Young', degree: 'MBBS, FCEM', experience: '15 years' }] },
  { value: 'dermatology', label: 'Dermatology', icon: <Sun size={16} className="inline mr-1" />, doctors: [{ id: 'dr19', name: 'Dr. Michelle King', degree: 'MBBS, MD (Dermatology)', experience: '14 years' }, { id: 'dr20', name: 'Dr. Daniel Wright', degree: 'MBBS, DVD, MD (Dermatology)', experience: '16 years' }, { id: 'dr21', name: 'Dr. Laura Scott', degree: 'MBBS, MD, FAAD', experience: '13 years' }] },
  { value: 'neurology', label: 'Neurology', icon: <Brain size={16} className="inline mr-1" />, doctors: [{ id: 'dr22', name: 'Dr. Richard Adams', degree: 'MBBS, MD, DM (Neurology)', experience: '20 years' }, { id: 'dr23', name: 'Dr. Karen Baker', degree: 'MBBS, MD, DNB (Neurology)', experience: '17 years' }, { id: 'dr24', name: 'Dr. Steven Turner', degree: 'MBBS, MD, FAAN', experience: '23 years' }] }
];
const priorities = [
  { value: 'normal', label: 'Normal', color: 'text-green-600', bg: 'bg-green-100' },
  { value: 'emergency', label: 'Emergency', color: 'text-red-600', bg: 'bg-red-100' }
];
const TokenGenerator = ({ onTokenGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({ patientName: '', phoneNumber: '', department: '', doctorId: '', reason: '', priority: 'normal' });
  const [errors, setErrors] = useState({});
  const [nextTokenNumber, setNextTokenNumber] = useState(getNextTokenNumber());
  const selectedDepartment = departments.find(d => d.value === formData.department);
  const availableDoctors = selectedDepartment ? selectedDepartment.doctors : [];
  const selectedDoctor = availableDoctors.find(doc => doc.id === formData.doctorId);
  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    else if (!validatePhone(formData.phoneNumber.trim())) newErrors.phoneNumber = 'Enter a valid phone number';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.doctorId) newErrors.doctorId = 'Doctor selection is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1000));
    const tokenNum = getNextTokenNumber();
    const departmentInfo = departments.find(d => d.value === formData.department);
    const doctorInfo = availableDoctors.find(d => d.id === formData.doctorId);
    const newToken = {
      id: `token-${Date.now()}`,
      tokenNumber: `T${tokenNum.toString().padStart(3, '0')}`,
      ...formData,
      departmentLabel: departmentInfo?.label,
      departmentIcon: departmentInfo?.icon,
      doctorName: doctorInfo?.name,
      doctorDegree: doctorInfo?.degree,
      doctorExperience: doctorInfo?.experience,
      status: 'waiting',
      generatedAt: new Date(),
      estimatedTime: (() => { const base = new Date(); base.setMinutes(base.getMinutes() + (formData.priority === 'emergency' ? 5 : 30)); return base.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); })()
    };
    let tokens = []; try { tokens = JSON.parse(localStorage.getItem(TOKENS_KEY)) || []; } catch { tokens = []; }
    tokens.push({ ...newToken });
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    onTokenGenerated?.(newToken);
    setFormData({ patientName: '', phoneNumber: '', department: '', doctorId: '', reason: '', priority: 'normal' });
    setErrors({});
    setNextTokenNumber(getNextTokenNumber());
    setIsGenerating(false);
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => { const d = { ...prev, [field]: value }; if (field === 'department') d.doctorId = ''; return d; });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[var(--accent-color)]">
            <div className="flex items-center mb-6">
              <div className="card-icon card-icon-accent mr-4"><Plus className="card-icon-white" size={24} /></div>
              <h2 className="h3-heading">Patient Information</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--primary-color)]"><User className="inline w-4 h-4 mr-2" />Patient Name *</label>
                  <div className="relative">
                    <input type="text" value={formData.patientName} onChange={e => handleInputChange('patientName', e.target.value)} className={`input-field pl-12 ${errors.patientName ? 'shake-red' : ''}`} placeholder="Enter patient name" required />
                    {errors.patientName && <span className="error-text">{errors.patientName}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--primary-color)]"><Phone className="inline w-4 h-4 mr-2" />Phone Number *</label>
                  <div className="relative">
                    <input type="tel" maxLength={10} pattern="\d{10}" value={formData.phoneNumber} onChange={e => handleInputChange('phoneNumber', e.target.value.replace(/[^\d]/g, '').slice(0,10))} className={`input-field pl-12 ${errors.phoneNumber ? 'shake-red' : ''}`} placeholder="Enter 10 digit phone number" required />
                    {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--primary-color)]"><Building2 className="inline w-4 h-4 mr-2" />Department *</label>
                  <div className="relative">
                    <select value={formData.department} onChange={e => handleInputChange('department', e.target.value)} className={`input-field pl-12 ${errors.department ? 'shake-red' : ''}`} required>
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                    {errors.department && <span className="error-text">{errors.department}</span>}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--primary-color)]"><Stethoscope className="inline w-4 h-4 mr-2" />Select Doctor *</label>
                  <div className="relative">
                    <select value={formData.doctorId} onChange={e => handleInputChange('doctorId', e.target.value)} className={`input-field pl-12 ${errors.doctorId ? 'shake-red' : ''}`} disabled={!formData.department} required>
                      <option value="">{formData.department ? 'Select Doctor' : 'First select department'}</option>
                      {availableDoctors.map(doctor => (<option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.degree}</option>))}
                    </select>
                    {errors.doctorId && <span className="error-text">{errors.doctorId}</span>}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--primary-color)]"><AlertCircle className="inline w-4 h-4 mr-2" />Priority Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    {priorities.map(priority => (
                      <label key={priority.value} className="cursor-pointer">
                        <input type="radio" name="priority" value={priority.value} checked={formData.priority === priority.value} onChange={e => handleInputChange('priority', e.target.value)} className="sr-only" />
                        <div className={`p-3 rounded-lg border-2 transition-all ${formData.priority === priority.value ? `${priority.bg} border-current ${priority.color}` : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                          <div className="text-center">
                            <div className={`font-medium ${formData.priority === priority.value ? priority.color : 'text-gray-700'}`}>{priority.label}</div>
                            <div className="text-xs text-gray-500 mt-1">~{priority.value === 'emergency' ? '5' : '30'} min</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              {selectedDoctor &&
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="card-icon card-icon-primary"><UserCheck className="card-icon-white" size={20} /></div>
                    <div>
                      <h4 className="font-semibold text-[var(--primary-color)]">{selectedDoctor.name}</h4>
                      <p className="text-sm text-gray-600">{selectedDoctor.degree}</p>
                      <p className="text-xs text-gray-500">Experience: {selectedDoctor.experience}</p>
                    </div>
                  </div>
                </div>
              }
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--primary-color)]"><FileText className="inline w-4 h-4 mr-2" />Reason for Visit *</label>
                <div className="relative">
                  <textarea value={formData.reason} onChange={e => handleInputChange('reason', e.target.value)} className={`input-field pl-12 ${errors.reason ? 'shake-red' : ''}`} rows={3} placeholder="Describe the reason for visit" required />
                  {errors.reason && <span className="error-text">{errors.reason}</span>}
                </div>
              </div>
              <button type="submit" disabled={isGenerating} className={`btn btn-primary w-full ${isGenerating ? 'animate-pulse-save' : ''}`}>
                {isGenerating ? (<><div className="loader-spinner mr-2"></div>Generating Token...</>) : (<><Plus size={20} />Generate Token</>)}
              </button>
            </form>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[var(--primary-color)]">
            <h3 className="h4-heading mb-4 flex items-center"><AlertCircle className="mr-2" size={20} />Next Token</h3>
            <div className="text-center">
              <div className="text-4xl font-black text-[var(--primary-color)] mb-2">T{nextTokenNumber.toString().padStart(3, '0')}</div>
              <p className="text-sm text-gray-600">Token Number</p>
            </div>
          </div>
          {formData.department &&
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="h4-heading mb-4 flex items-center"><Stethoscope className="mr-2" size={20} />Available Doctors</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableDoctors.map(doctor => (
                  <div key={doctor.id} className={`p-3 rounded-lg border transition-all cursor-pointer ${formData.doctorId === doctor.id ? 'border-[var(--accent-color)] bg-green-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`} onClick={() => handleInputChange('doctorId', doctor.id)}>
                    <div className="font-medium text-[var(--primary-color)] text-sm">{doctor.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{doctor.degree}</div>
                    <div className="text-xs text-gray-500">Exp: {doctor.experience}</div>
                  </div>
                ))}
              </div>
            </div>
          }
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="h4-heading mb-4 flex items-center"><Building2 className="mr-2" size={20} />Departments</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {departments.slice(0, 8).map(dept => (
                <div key={dept.value} className={`flex items-center gap-2 p-2 rounded transition-all cursor-pointer ${formData.department === dept.value ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => handleInputChange('department', dept.value)}>
                  <span>{dept.icon}</span>
                  <span className="text-xs">{dept.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TokenGenerator;