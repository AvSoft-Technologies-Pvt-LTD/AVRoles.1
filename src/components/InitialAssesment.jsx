import React, { useState, useRef } from 'react';
import { 
  Calendar, User, Phone, MapPin, FileText, Heart, Brain, Baby, 
  Bone, Eye, Stethoscope, Save, Printer as Print, Download, 
  Leaf, FlaskConical, Activity, Users, PenTool, Trash2, ChevronDown, ChevronUp
} from 'lucide-react';
import ImageAnnotationCanvas from './microcomponents/ImageAnnotationCanvas';

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
  const [annotatedImages, setAnnotatedImages] = useState([]);
  const [showImageAnnotation, setShowImageAnnotation] = useState(false);
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

  const handleImageAnnotated = (imageData) => {
    setAnnotatedImages(prev => [...prev, {
      id: Date.now(),
      data: imageData,
      timestamp: new Date().toISOString(),
      specialty: selectedSpecialty
    }]);
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
              className="input-field min-h-[80px] resize-none focus:border-[var(--primary-color)] transition-all duration-200"
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
                <label key={option} className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-all cursor-pointer border hover:border-[var(--accent-color)]">
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
                <label key={option} className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 transition-all cursor-pointer border hover:border-[var(--accent-color)]">
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
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="Height"
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="Weight"
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Head Circumference (cm)</label>
                <input
                  type="number"
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="Head Circ."
                  onChange={(e) => handleInputChange('headCircumference', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Percentile</label>
                <input
                  type="text"
                  className="input-field focus:border-[var(--primary-color)]"
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
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="e.g., 20/20"
                  onChange={(e) => handleInputChange('rightEye', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Left Eye</label>
                <input
                  type="text"
                  className="input-field focus:border-[var(--primary-color)]"
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
    console.log('Form submitted:', { patientInfo, vitals, formData, handwrittenNotes, annotatedImages });
    alert('Assessment form submitted successfully!');
  };

  const handlePrint = () => {
    generatePrintTemplate();
  };

  const generatePrintTemplate = () => {
    const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.title} - ${patientInfo.name || 'Patient'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
            font-size: 14px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #01D48C;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .hospital-name {
            font-size: 28px;
            font-weight: bold;
            color: #01D48C;
            margin-bottom: 5px;
        }
        
        .form-title {
            font-size: 20px;
            color: #0E1630;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .form-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #666;
        }
        
        .section {
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .section-header {
            background: #f3f4f6;
            padding: 12px 15px;
            font-weight: bold;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .section-content {
            padding: 15px;
        }
        
        .field-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .field {
            margin-bottom: 10px;
        }
        
        .field-label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
            font-size: 13px;
        }
        
        .field-value {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            border-radius: 4px;
            background: #f9fafb;
            min-height: 35px;
            display: flex;
            align-items: center;
        }
        
        .field-value.large {
            min-height: 80px;
            align-items: flex-start;
            padding-top: 10px;
        }
        
        .checkbox-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 8px;
        }
        
        .checkbox-item {
            display: flex;
            align-items: center;
            padding: 5px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            background: #f9fafb;
        }
        
        .checkbox {
            width: 16px;
            height: 16px;
            border: 2px solid #d1d5db;
            margin-right: 8px;
            border-radius: 3px;
            position: relative;
        }
        
        .checkbox.checked::after {
            content: '✓';
            position: absolute;
            top: -2px;
            left: 2px;
            color: #059669;
            font-weight: bold;
            font-size: 14px;
        }
        
        .radio-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .radio-item {
            display: flex;
            align-items: center;
            padding: 5px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            background: #f9fafb;
        }
        
        .radio {
            width: 16px;
            height: 16px;
            border: 2px solid #d1d5db;
            border-radius: 50%;
            margin-right: 8px;
            position: relative;
        }
        
        .radio.selected::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 8px;
            height: 8px;
            background: #059669;
            border-radius: 50%;
        }
        
        .pain-scale {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
        }
        
        .pain-number {
            width: 30px;
            height: 30px;
            border: 2px solid #d1d5db;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
        }
        
        .pain-number.selected {
            background: #dc2626;
            color: white;
            border-color: #dc2626;
        }
        
        .notes-section {
            background: #f9fafb;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 15px;
            min-height: 120px;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            line-height: 1.8;
        }
        
        .footer {
            margin-top: 40px;
            border-top: 2px solid #01D48C;
            padding-top: 20px;
            text-align: center;
        }
        
        .footer-title {
            font-weight: bold;
            color: #01D48C;
            margin-bottom: 10px;
        }
        
        .footer-info {
            font-size: 11px;
            color: #666;
            line-height: 1.4;
        }
        
        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        .signature-box {
            text-align: center;
        }
        
        .signature-line {
            border-bottom: 1px solid #374151;
            height: 40px;
            margin-bottom: 10px;
        }
        
        @media print {
            body { padding: 0; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="hospital-name">AVSwasthya Hospital System</div>
        <div class="form-title">${template.title}</div>
        <div class="form-meta">
            <span>Date: ${new Date().toLocaleDateString()}</span>
            <span>Form ID: MED-${Date.now()}</span>
            <span>Time: ${new Date().toLocaleTimeString()}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-header">Patient Information</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field">
                    <div class="field-label">Patient ID</div>
                    <div class="field-value">${patientInfo.patientId || ''}</div>
                </div>
                <div class="field">
                    <div class="field-label">Full Name</div>
                    <div class="field-value">${patientInfo.name || ''}</div>
                </div>
                <div class="field">
                    <div class="field-label">Age</div>
                    <div class="field-value">${patientInfo.age || ''}</div>
                </div>
                <div class="field">
                    <div class="field-label">Gender</div>
                    <div class="field-value">${patientInfo.gender || ''}</div>
                </div>
                <div class="field">
                    <div class="field-label">Contact Number</div>
                    <div class="field-value">${patientInfo.contact || ''}</div>
                </div>
                <div class="field">
                    <div class="field-label">Consulting Doctor</div>
                    <div class="field-value">${patientInfo.consultingDoctor || ''}</div>
                </div>
            </div>
            <div class="field">
                <div class="field-label">Address</div>
                <div class="field-value large">${patientInfo.address || ''}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-header">Vital Signs</div>
        <div class="section-content">
            <div class="field-grid">
                <div class="field">
                    <div class="field-label">Temperature (°F)</div>
                    <div class="field-value">${vitals.temperature || ''}</div>
                </div>
                <div class="field">
                    <div class="field-label">Pulse (BPM)</div>
                    <div class="field-value">${vitals.pulse || ''}</div>
                </div>
                <div class="field">
                    <div class="field-label">Blood Pressure</div>
                    <div class="field-value">${vitals.bp || ''}</div>
                </div>
                <div class="field">
                    <div class="field-label">SpO2 (%)</div>
                    <div class="field-value">${vitals.spo2 || ''}</div>
                </div>
            </div>
        </div>
    </div>

    ${template.sections.map(section => {
      const sectionData = formData[section.id];
      
      return `
        <div class="section">
            <div class="section-header">${section.label}</div>
            <div class="section-content">
                ${renderPrintSection(section, sectionData)}
            </div>
        </div>
      `;
    }).join('')}

    <div class="section">
        <div class="section-header">Clinical Notes & Observations</div>
        <div class="section-content">
            <div class="notes-section">${handwrittenNotes || 'No additional notes provided.'}</div>
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <div>Doctor Signature</div>
        </div>
    </div>

    <div class="footer">
        <div class="footer-title">
            ${selectedCategory === 'AYUSH' ? 'AYUSH Department' : 'Allopathy Department'} - ${template.title.replace(' Assessment', '')} Excellence
        </div>
        <div class="footer-info">
            © 2025 AVSwasthya Hospital System. All rights reserved. | Confidential Medical Document<br>
            This form contains confidential patient information and should be handled according to HIPAA guidelines.<br>
            Emergency: +91-XXXX-XXXX | Email: info@avswasthya.com | Website: www.avswasthya.com
        </div>
    </div>
</body>
</html>`;

    // Create a new window with the print content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const renderPrintSection = (section, sectionData) => {
    switch (section.type) {
      case 'textarea':
        return `<div class="field-value large">${sectionData || ''}</div>`;
      
      case 'checklist':
        return `
          <div class="checkbox-grid">
            ${section.options.map(option => `
              <div class="checkbox-item">
                <div class="checkbox ${(sectionData && sectionData.includes(option)) ? 'checked' : ''}"></div>
                <span>${option}</span>
              </div>
            `).join('')}
          </div>
        `;

      case 'radio':
        return `
          <div class="radio-group">
            ${section.options.map(option => `
              <div class="radio-item">
                <div class="radio ${sectionData === option ? 'selected' : ''}"></div>
                <span>${option}</span>
              </div>
            `).join('')}
          </div>
        `;

      case 'pain-scale':
        return `
          <div class="pain-scale">
            <span style="font-size: 12px; color: #666;">No Pain</span>
            ${[...Array(11)].map((_, i) => `
              <div class="pain-number ${sectionData === i ? 'selected' : ''}">${i}</div>
            `).join('')}
            <span style="font-size: 12px; color: #666;">Severe</span>
          </div>
        `;

      case 'vitals-pediatric':
        return `
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Height (cm)</div>
              <div class="field-value">${formData.height || ''}</div>
            </div>
            <div class="field">
              <div class="field-label">Weight (kg)</div>
              <div class="field-value">${formData.weight || ''}</div>
            </div>
            <div class="field">
              <div class="field-label">Head Circumference (cm)</div>
              <div class="field-value">${formData.headCircumference || ''}</div>
            </div>
            <div class="field">
              <div class="field-label">Percentile</div>
              <div class="field-value">${formData.percentile || ''}</div>
            </div>
          </div>
        `;

      case 'vision-test':
        return `
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Right Eye</div>
              <div class="field-value">${formData.rightEye || ''}</div>
            </div>
            <div class="field">
              <div class="field-label">Left Eye</div>
              <div class="field-value">${formData.leftEye || ''}</div>
            </div>
          </div>
        `;

      default:
        return `<div class="field-value">${sectionData || ''}</div>`;
    }
  };

  const filteredSpecialties = Object.entries(specialtyTemplates).filter(
    ([key, spec]) => spec.category === selectedCategory
  );

  // For dropdown options
  const categoryOptions = [
    { value: 'Allopathy', label: 'Allopathy (Modern Medicine)' },
    { value: 'AYUSH', label: 'AYUSH (Traditional Medicine)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[var(--primary-color)] text-white shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
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
          <h1 className="h2-heading">AVSwasthya Hospital System</h1>
          <p className="text-lg font-semibold text-[var(--accent-color)] mt-1">{template.title}</p>
          <div className="flex justify-between mt-3 text-sm">
            <span>Date: {new Date().toLocaleDateString()}</span>
            <span>Form ID: MED-{Date.now()}</span>
            <span>Time: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category & Specialty Selector - Modern Card UI */}
          <div className="print:hidden rounded-xl shadow-lg bg-white p-6 mb-6 border border-gray-100">
            <h2 className="h3-heading mb-4">Select Medical System & Specialty</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Medical System Dropdown */}
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">Medical System</label>
                <div className="relative group">
                  <select
                    className="w-full py-3 px-4 pr-10 rounded-lg border-2 border-[var(--accent-color)] focus:border-[var(--accent-color)] focus:ring-0 ring-0 outline-none text-[var(--accent-color)] shadow transition-all duration-200 appearance-none font-semibold hover:border-[var(--accent-color)] cursor-pointer"
                    value={selectedCategory}
                    onChange={e => handleCategoryChange(e.target.value)}
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="font-semibold text-gray-900 bg-white text-[var(--accent-color)]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--accent-color)]  group-focus-within:text-white">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              </div>
              {/* Specialty Dropdown */}
              <div>
                <label className="block text-base font-semibold mb-2 text-gray-700">Specialty</label>
                <div className="relative group">
                  <select
                    className="w-full py-3 px-4 pr-10 rounded-lg border-2 border-[var(--accent-color)] focus:border-[var(--accent-color)] focus:ring-0 ring-0 outline-none text-[var(--accent-color)] shadow transition-all duration-200 appearance-none font-semibold hover:border-[var(--accent-color)] cursor-pointer"
                    value={selectedSpecialty}
                    onChange={e => setSelectedSpecialty(e.target.value)}
                  >
                    {filteredSpecialties.map(([key, spec]) => (
                      <option key={key} value={key} className="font-semibold text-gray-900 bg-white text-[var(--accent-color)]">
                        {spec.title.replace(' Assessment', '')}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--accent-color)]  group-focus-within:text-white">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Medical Image Upload & Annotation Section (Collapsible) */}
          <div className="print:hidden rounded-xl shadow-lg bg-white mb-6 border border-gray-100">
            <button
              type="button"
              className="w-full flex items-center justify-between px-6 py-4 focus:outline-none group"
              onClick={() => setShowImageAnnotation((prev) => !prev)}
            >
              <span className="text-lg font-semibold text-gray-800 flex items-center">
                <Download className="mr-2 text-[var(--accent-color)]" size={20} />
                Upload Your Template
              </span>
              {showImageAnnotation ? (
                <ChevronUp size={22} className="text-gray-400 group-hover:text-[var(--accent-color)] transition-all" />
              ) : (
                <ChevronDown size={22} className="text-gray-400 group-hover:text-[var(--accent-color)] transition-all" />
              )}
            </button>
            {showImageAnnotation && (
              <div className="px-6 pb-6">
                <ImageAnnotationCanvas onImageChange={handleImageAnnotated} />
              </div>
            )}
          </div>

          {/* Patient Information */}
          <div className="rounded-xl shadow-lg bg-white p-6 mb-6 border border-gray-100">
            <h2 className="h3-heading mb-4 flex items-center">
              <User className="mr-2 text-[var(--accent-color)]" size={20} />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Patient ID</label>
                <input
                  type="text"
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="Enter Patient ID"
                  value={patientInfo.patientId}
                  onChange={(e) => setPatientInfo({...patientInfo, patientId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="Enter Full Name"
                  value={patientInfo.name}
                  onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="Age"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                <select
                  className="input-field focus:border-[var(--primary-color)]"
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
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="Contact Number"
                  value={patientInfo.contact}
                  onChange={(e) => setPatientInfo({...patientInfo, contact: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Consulting Doctor</label>
                <input
                  type="text"
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="Doctor Name"
                  value={patientInfo.consultingDoctor}
                  onChange={(e) => setPatientInfo({...patientInfo, consultingDoctor: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <textarea
                className="input-field resize-none focus:border-[var(--primary-color)]"
                rows={2}
                placeholder="Enter Complete Address"
                value={patientInfo.address}
                onChange={(e) => setPatientInfo({...patientInfo, address: e.target.value})}
              />
            </div>
          </div>

          {/* Vital Signs */}
          <div className="rounded-xl shadow-lg bg-white p-6 mb-6 border border-gray-100">
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
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="98.6"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({...vitals, temperature: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pulse (BPM)</label>
                <input
                  type="number"
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="72"
                  value={vitals.pulse}
                  onChange={(e) => setVitals({...vitals, pulse: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Pressure</label>
                <input
                  type="text"
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="120/80"
                  value={vitals.bp}
                  onChange={(e) => setVitals({...vitals, bp: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  className="input-field focus:border-[var(--primary-color)]"
                  placeholder="98"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({...vitals, spo2: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Specialty-specific Sections */}
          <div className="rounded-xl shadow-lg bg-white p-6 mb-6 border border-gray-100">
            <h2 className="h3-heading mb-4 flex items-center">
              <IconComponent className="mr-2 text-[var(--accent-color)]" size={20} />
              {template.title}
            </h2>
            {template.sections.map(renderFormSection)}
          </div>

          {/* Handwritten Notes Section */}
          <div className="rounded-xl shadow-lg bg-white p-6 mb-6 border border-gray-100">
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

          {/* Action Buttons */}
          <div className="print:hidden">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="submit"
                className="btn btn-primary animate-pulse-save"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <Save size={18} />
                Save Assessment
              </button>
              <button
                type="button"
                className="btn bg-gray-600 hover:bg-gray-700 text-white"
                onClick={handlePrint}
              >
                <Print size={16} />
                Print Form
              </button>
              <button
                type="button"
                className="edit-btn"
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