import React, { useState, useRef } from 'react';
import { 
  Calendar, User, Phone, MapPin, FileText, Heart, Brain, Baby, 
  Bone, Eye, Stethoscope, Save, Printer as Print, Download, 
  Leaf, FlaskConical, Activity, Users, PenTool, Trash2
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

const specialtyTemplates = {
  // AYUSH Specializations
  'ayurveda': {
    title: 'Ayurveda Assessment',
    icon: Leaf,
    backgroundImage: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg',
    category: 'AYUSH',
    sections: [
      { id: 'prakriti-analysis', label: 'Prakriti (Constitution) Analysis', type: 'checklist', options: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha'] },
      { id: 'vikriti-assessment', label: 'Vikriti (Current Imbalance)', type: 'textarea', required: true },
      { id: 'agni-assessment', label: 'Agni (Digestive Fire) Assessment', type: 'radio', options: ['Sama Agni', 'Vishama Agni', 'Tikshna Agni', 'Manda Agni'] },
      { id: 'ama-assessment', label: 'Ama (Toxins) Assessment', type: 'textarea' },
      { id: 'pulse-diagnosis', label: 'Nadi Pariksha (Pulse Diagnosis)', type: 'textarea' },
      { id: 'lifestyle-assessment', label: 'Dinacharya & Ritucharya Assessment', type: 'textarea' }
    ]
  },
  'homeopathy': {
    title: 'Homeopathy Assessment',
    icon: FlaskConical,
    backgroundImage: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
    category: 'AYUSH',
    sections: [
      { id: 'constitutional-type', label: 'Constitutional Type', type: 'textarea', required: true },
      { id: 'miasmatic-analysis', label: 'Miasmatic Analysis', type: 'checklist', options: ['Psora', 'Sycosis', 'Syphilis', 'Tubercular'] },
      { id: 'mental-generals', label: 'Mental Generals', type: 'textarea', required: true },
      { id: 'physical-generals', label: 'Physical Generals', type: 'textarea' },
      { id: 'modalities', label: 'Modalities (Better/Worse)', type: 'textarea' },
      { id: 'repertorization', label: 'Repertorization Notes', type: 'textarea' }
    ]
  },
  'unani': {
    title: 'Unani Medicine Assessment',
    icon: Activity,
    backgroundImage: 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg',
    category: 'AYUSH',
    sections: [
      { id: 'mizaj-assessment', label: 'Mizaj (Temperament) Assessment', type: 'checklist', options: ['Sanguine', 'Phlegmatic', 'Choleric', 'Melancholic'] },
      { id: 'akhlat-examination', label: 'Akhlat (Humours) Examination', type: 'textarea', required: true },
      { id: 'nabz-examination', label: 'Nabz (Pulse) Examination', type: 'textarea' },
      { id: 'baul-examination', label: 'Baul (Urine) Examination', type: 'textarea' },
      { id: 'lifestyle-factors', label: 'Asbab-e-Sitta (Six Essential Factors)', type: 'textarea' },
      { id: 'treatment-plan', label: 'Ilaj (Treatment) Plan', type: 'textarea' }
    ]
  },
  'siddha': {
    title: 'Siddha Medicine Assessment',
    icon: Users,
    backgroundImage: 'https://images.pexels.com/photos/4386443/pexels-photo-4386443.jpeg',
    category: 'AYUSH',
    sections: [
      { id: 'udal-kattugal', label: 'Udal Kattugal (Body Constitution)', type: 'checklist', options: ['Vatham', 'Pitham', 'Kapham'] },
      { id: 'uyir-thathukkal', label: 'Uyir Thathukkal Assessment', type: 'textarea', required: true },
      { id: 'udal-thathukkal', label: 'Udal Thathukkal (Body Elements)', type: 'textarea' },
      { id: 'envagai-thervugal', label: 'Envagai Thervugal (Eight-fold Examination)', type: 'textarea' },
      { id: 'neerkuri-neikuri', label: 'Neerkuri & Neikuri (Urine Examination)', type: 'textarea' },
      { id: 'seasonal-influence', label: 'Seasonal & Environmental Influence', type: 'textarea' }
    ]
  },
  // Allopathy Specializations
  'general-medicine': {
    title: 'General Medicine Assessment',
    icon: Stethoscope,
    backgroundImage: 'https://images.pexels.com/photos/4386465/pexels-photo-4386465.jpeg',
    category: 'Allopathy',
    sections: [
      { id: 'chief-complaints', label: 'Chief Complaints', type: 'textarea', required: true },
      { id: 'present-illness', label: 'History of Present Illness', type: 'textarea', required: true },
      { id: 'past-medical', label: 'Past Medical History', type: 'checklist', options: ['Hypertension', 'Diabetes', 'Heart Disease', 'Kidney Disease', 'Cancer'] },
      { id: 'family-history', label: 'Family History', type: 'textarea' },
      { id: 'social-history', label: 'Social History', type: 'checklist', options: ['Smoking', 'Alcohol', 'Drug Use', 'Exercise'] },
      { id: 'review-systems', label: 'Review of Systems', type: 'checklist', options: ['Fever', 'Weight Loss', 'Fatigue', 'Chest Pain', 'Shortness of Breath'] }
    ]
  },
  'cardiology': {
    title: 'Cardiology Assessment',
    icon: Heart,
    backgroundImage: 'https://images.pexels.com/photos/4386468/pexels-photo-4386468.jpeg',
    category: 'Allopathy',
    sections: [
      { id: 'cardiac-complaints', label: 'Cardiac Complaints', type: 'checklist', options: ['Chest Pain', 'Palpitations', 'Shortness of Breath', 'Syncope', 'Edema'] },
      { id: 'cardiac-history', label: 'Cardiac History', type: 'textarea', required: true },
      { id: 'risk-factors', label: 'Cardiovascular Risk Factors', type: 'checklist', options: ['Hypertension', 'Diabetes', 'High Cholesterol', 'Smoking', 'Family History'] },
      { id: 'medications', label: 'Current Cardiac Medications', type: 'textarea' },
      { id: 'functional-status', label: 'Functional Status (NYHA Class)', type: 'radio', options: ['Class I', 'Class II', 'Class III', 'Class IV'] },
      { id: 'ecg-findings', label: 'ECG Findings', type: 'textarea' }
    ]
  },
  'pediatrics': {
    title: 'Pediatrics Assessment',
    icon: Baby,
    backgroundImage: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg',
    category: 'Allopathy',
    sections: [
      { id: 'birth-history', label: 'Birth History', type: 'textarea', required: true },
      { id: 'developmental', label: 'Developmental Milestones', type: 'checklist', options: ['Motor Skills', 'Language', 'Social Skills', 'Cognitive'] },
      { id: 'immunizations', label: 'Immunization History', type: 'textarea' },
      { id: 'feeding', label: 'Feeding History', type: 'textarea' },
      { id: 'growth', label: 'Growth Parameters', type: 'vitals-pediatric' },
      { id: 'school-performance', label: 'School Performance', type: 'textarea' }
    ]
  },
  'orthopedics': {
    title: 'Orthopedics Assessment',
    icon: Bone,
    backgroundImage: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
    category: 'Allopathy',
    sections: [
      { id: 'injury-mechanism', label: 'Mechanism of Injury', type: 'textarea', required: true },
      { id: 'pain-assessment', label: 'Pain Assessment', type: 'pain-scale' },
      { id: 'mobility', label: 'Mobility Assessment', type: 'checklist', options: ['Walking', 'Standing', 'Sitting', 'Range of Motion'] },
      { id: 'previous-injuries', label: 'Previous Injuries/Surgeries', type: 'textarea' },
      { id: 'imaging', label: 'Imaging Studies', type: 'textarea' },
      { id: 'functional-limitations', label: 'Functional Limitations', type: 'textarea' }
    ]
  },
  'ophthalmology': {
    title: 'Ophthalmology Assessment',
    icon: Eye,
    backgroundImage: 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg',
    category: 'Allopathy',
    sections: [
      { id: 'visual-complaints', label: 'Visual Complaints', type: 'checklist', options: ['Blurred Vision', 'Eye Pain', 'Redness', 'Discharge', 'Flashing Lights'] },
      { id: 'visual-acuity', label: 'Visual Acuity', type: 'vision-test' },
      { id: 'eye-history', label: 'Ocular History', type: 'textarea' },
      { id: 'glasses-contacts', label: 'Glasses/Contact Lens History', type: 'textarea' },
      { id: 'family-eye-history', label: 'Family Ocular History', type: 'textarea' },
      { id: 'eye-exam', label: 'External Eye Examination', type: 'textarea' }
    ]
  },
  'neurology': {
    title: 'Neurology Assessment',
    icon: Brain,
    backgroundImage: 'https://images.pexels.com/photos/4386465/pexels-photo-4386465.jpeg',
    category: 'Allopathy',
    sections: [
      { id: 'neuro-complaints', label: 'Neurological Complaints', type: 'checklist', options: ['Headache', 'Seizures', 'Weakness', 'Numbness', 'Memory Loss'] },
      { id: 'neuro-history', label: 'Neurological History', type: 'textarea', required: true },
      { id: 'mental-status', label: 'Mental Status Examination', type: 'textarea' },
      { id: 'cranial-nerves', label: 'Cranial Nerve Examination', type: 'textarea' },
      { id: 'motor-exam', label: 'Motor Examination', type: 'textarea' },
      { id: 'sensory-exam', label: 'Sensory Examination', type: 'textarea' }
    ]
  }
};

const MedicalAssessmentForm = () => {
  const [selectedCategory, setSelectedCategory] = useState('AYUSH');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ayurveda');
  const [formData, setFormData] = useState({});
  const [handwrittenNotes, setHandwrittenNotes] = useState('');
  const [patientInfo, setPatientInfo] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: '',
    contact: '',
    address: '',
    referredBy: '',
    consultingDoctor: 'Dr. Sheetal Shelke, BHMS'
  });
  const [vitals, setVitals] = useState({
    temperature: '',
    pulse: '',
    bp: '',
    respiration: '',
    spo2: '',
    height: '',
    weight: '',
    bmi: ''
  });

  const signatureRef = useRef(null);
  const template = specialtyTemplates[selectedSpecialty];
  const IconComponent = template.icon;

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const firstSpecialty = Object.keys(specialtyTemplates).find(
      key => specialtyTemplates[key].category === category
    );
    setSelectedSpecialty(firstSpecialty);
  };

  const handleInputChange = (sectionId, value) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: value
    }));
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const renderFormSection = (section) => {
    switch (section.type) {
      case 'textarea':
        return (
          <div key={section.id} className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {section.label} {section.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder={`Enter ${section.label.toLowerCase()}`}
              value={formData[section.id] || ''}
              onChange={(e) => handleInputChange(section.id, e.target.value)}
              required={section.required}
            />
          </div>
        );
      
      case 'checklist':
        return (
          <div key={section.id} className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {section.label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {section.options.map((option) => (
                <label key={option} className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-all cursor-pointer border">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 text-[var(--accent-color)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--accent-color)]"
                    onChange={(e) => {
                      const currentValues = formData[section.id] || [];
                      if (e.target.checked) {
                        handleInputChange(section.id, [...currentValues, option]);
                      } else {
                        handleInputChange(section.id, currentValues.filter(v => v !== option));
                      }
                    }}
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'radio':
        return (
          <div key={section.id} className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {section.label}
            </label>
            <div className="space-y-1">
              {section.options.map((option) => (
                <label key={option} className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-all cursor-pointer border">
                  <input
                    type="radio"
                    name={section.id}
                    className="mr-2 w-4 h-4 text-[var(--accent-color)] bg-gray-100 border-gray-300 focus:ring-[var(--accent-color)]"
                    onChange={() => handleInputChange(section.id, option)}
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'pain-scale':
        return (
          <div key={section.id} className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pain Scale (0-10)
            </label>
            <div className="flex items-center space-x-2 bg-gray-50 rounded p-3 border">
              <span className="text-xs text-gray-600">No Pain</span>
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                    formData[section.id] === i 
                      ? 'bg-[var(--accent-color)] text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  onClick={() => handleInputChange(section.id, i)}
                >
                  {i}
                </button>
              ))}
              <span className="text-xs text-gray-600">Severe</span>
            </div>
          </div>
        );

      case 'vitals-pediatric':
        return (
          <div key={section.id} className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Growth Parameters
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Height (cm)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Height"
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Weight"
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Head Circumference (cm)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Head Circ."
                  onChange={(e) => handleInputChange('headCircumference', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Percentile</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Percentile"
                  onChange={(e) => handleInputChange('percentile', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'vision-test':
        return (
          <div key={section.id} className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Visual Acuity
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Right Eye</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., 20/20"
                  onChange={(e) => handleInputChange('rightEye', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Left Eye</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., 20/20"
                  onChange={(e) => handleInputChange('leftEye', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { patientInfo, vitals, formData, handwrittenNotes });
    alert('Assessment form submitted successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredSpecialties = Object.entries(specialtyTemplates).filter(
    ([key, spec]) => spec.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[var(--primary-color)] text-white shadow-lg print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-[var(--accent-color)] rounded-full">
                <IconComponent size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold shimmer-text">{template.title}</h1>
                <p className="text-sm opacity-90">AVSwasthya Hospital System</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Time: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block">
        <div className="text-center border-b-2 border-[var(--primary-color)] pb-4 mb-6">
          <h1 className="text-2xl font-bold text-[var(--primary-color)]">AVSwasthya Hospital System</h1>
          <p className="text-lg font-semibold text-[var(--accent-color)] mt-1">{template.title}</p>
          <div className="flex justify-between mt-3 text-sm">
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>Form ID: MED-{Date.now()}</span>
            <span>Time: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category & Specialty Selector */}
          <div className="bg-white rounded-lg shadow-sm border p-4 print:hidden">
            <h2 className="h3-heading mb-4">Select Medical System & Specialty</h2>
            
            {/* Category Selection */}
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-3">Medical System</h3>
              <div className="grid grid-cols-2 gap-3">
                {['AYUSH', 'Allopathy'].map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                      selectedCategory === category 
                        ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--primary-color)]' 
                        : 'border-gray-200 hover:border-[var(--accent-color)]/50'
                    }`}
                    onClick={() => handleCategoryChange(category)}
                  >
                    <div className="text-center">
                      <h4 className="font-semibold">{category}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {category === 'AYUSH' ? 'Traditional Medicine' : 'Modern Medicine'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Specialty Selection */}
            <div>
              <h3 className="text-base font-semibold mb-3">Specialty</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSpecialties.map(([key, spec]) => {
                  const SpecIcon = spec.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        selectedSpecialty === key 
                          ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--primary-color)]' 
                          : 'border-gray-200 hover:border-[var(--accent-color)]/50'
                      }`}
                      onClick={() => setSelectedSpecialty(key)}
                    >
                      <div className="flex items-center space-x-2">
                        <SpecIcon size={18} className="text-[var(--accent-color)]" />
                        <div className="text-left">
                          <h4 className="font-semibold text-sm">{spec.title.replace(' Assessment', '')}</h4>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="h3-heading mb-4 flex items-center">
              <User className="mr-2 text-[var(--accent-color)]" size={20} />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter Patient ID"
                  value={patientInfo.patientId}
                  onChange={(e) => setPatientInfo({...patientInfo, patientId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter Full Name"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Age"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                <select
                  className="input-field"
                  value={patientInfo.gender}
                  onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="Contact Number"
                  value={patientInfo.contact}
                  onChange={(e) => setPatientInfo({...patientInfo, contact: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Consulting Doctor</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Doctor Name"
                  value={patientInfo.consultingDoctor}
                  onChange={(e) => setPatientInfo({...patientInfo, consultingDoctor: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Enter Complete Address"
                value={patientInfo.address}
                onChange={(e) => setPatientInfo({...patientInfo, address: e.target.value})}
              />
            </div>
          </div>

          {/* Vital Signs */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="h3-heading mb-4 flex items-center">
              <Stethoscope className="mr-2 text-[var(--accent-color)]" size={20} />
              Vital Signs
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="98.6"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pulse (BPM)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="72"
                  value={vitals.pulse}
                  onChange={(e) => setVitals({...vitals, pulse: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Pressure</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="120/80"
                  value={vitals.bp}
                  onChange={(e) => setVitals({...vitals, bp: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="98"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({...vitals, spo2: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Specialty-specific Sections */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="h3-heading mb-4 flex items-center">
              <IconComponent className="mr-2 text-[var(--accent-color)]" size={20} />
              {template.title}
            </h2>
            {template.sections.map(renderFormSection)}
          </div>

          {/* Handwritten Notes Section */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="h3-heading mb-4 flex items-center">
              <PenTool className="mr-2 text-[var(--accent-color)]" size={20} />
              Clinical Notes & Observations
            </h2>
            <div className="relative">
              <textarea
                className="w-full h-32 p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 resize-none focus:outline-none focus:border-[var(--accent-color)] text-gray-700 font-mono"
                placeholder="Write your clinical notes and observations here..."
                value={handwrittenNotes}
                onChange={(e) => setHandwrittenNotes(e.target.value)}
                style={{ 
                  lineHeight: '24px',
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, #e5e7eb 23px, #e5e7eb 24px)'
                }}
              />
            </div>
          </div>

          {/* Signature Section */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="h3-heading mb-4 flex items-center">
              <FileText className="mr-2 text-[var(--accent-color)]" size={20} />
              Doctor's Signature
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Digital Signature</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      width: 350,
                      height: 150,
                      className: 'signature-canvas w-full rounded-lg'
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="mt-2 flex items-center text-sm text-red-600 hover:text-red-800"
                >
                  <Trash2 size={14} className="mr-1" />
                  Clear Signature
                </button>
              </div>
              <div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={patientInfo.consultingDoctor}
                      onChange={(e) => setPatientInfo({...patientInfo, consultingDoctor: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      defaultValue={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Registration Number</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Medical Registration Number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border p-4 print:hidden">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="submit"
                className="btn btn-primary animate-pulse-save"
              >
                <Save size={18} />
                Save Assessment
              </button>
              <button
                type="button"
                className="btn bg-gray-600 hover:bg-gray-700"
                onClick={handlePrint}
              >
                <Print size={16} />
                Print Form
              </button>
              <button
                type="button"
                className="btn bg-blue-600 hover:bg-blue-700"
              >
                <Download size={16} />
                Export PDF
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Print Footer - Only visible when printing */}
      <div className="hidden print:block mt-8 border-t-2 border-[var(--primary-color)] pt-4">
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--primary-color)]">
            {selectedCategory === 'AYUSH' ? 'AYUSH Department' : 'Allopathy Department'} - {template.title.replace(' Assessment', '')} Excellence
          </p>
          <p className="text-xs text-gray-600 mt-2">
            © 2025 AVSwasthya Hospital System. All rights reserved. | Confidential Medical Document
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This form contains confidential patient information and should be handled according to HIPAA guidelines.
          </p>
          <div className="mt-3 flex justify-center space-x-6 text-xs text-gray-500">
            <span>Emergency: +91-XXXX-XXXX</span>
            <span>Email: info@avswasthya.com</span>
            <span>Website: www.avswasthya.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalAssessmentForm;