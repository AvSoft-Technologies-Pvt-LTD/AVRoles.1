import React, { useState, useRef } from 'react';
import {
  Calendar, User, Phone, MapPin, FileText, Heart, Brain, Baby,
  Bone, Eye, Stethoscope, Save, Printer as Print, Download,
  Leaf, FlaskConical, Activity, Users, PenTool, Trash2, ChevronDown, 
  ChevronUp, Settings, Upload, Image as ImageIcon
} from 'lucide-react';
import { TemplateModal, prescriptionTemplates, layoutStyles } from './TemplateModal';
// Medical Specialty Templates Configuration
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

const InitialAssessment = () => {
  const [selectedCategory, setSelectedCategory] = useState('AYUSH');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ayurveda');
  const [formData, setFormData] = useState({});
  const [handwrittenNotes, setHandwrittenNotes] = useState('');
  const [annotatedImages, setAnnotatedImages] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [selectedColor, setSelectedColor] = useState('#2563eb');
  const fileInputRef = useRef(null);
  
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

  // Get the selected specialty template configuration
  const template = specialtyTemplates[selectedSpecialty];
  const IconComponent = template.icon;

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const firstSpecialty = Object.keys(specialtyTemplates).find(
      key => specialtyTemplates[key].category === category
    );
    setSelectedSpecialty(firstSpecialty);
    setFormData({}); // Reset form data when category changes
  };

  const handleInputChange = (sectionId, value) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: value
    }));
  };

  const handlePatientInfoChange = (field, value) => {
    setPatientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVitalsChange = (field, value) => {
    setVitals(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  // Handle image upload, convert to base64, send to API, and store returned link
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];
      // Send base64 to API
      try {
        const response = await fetch('https://6899921cfed141b96b9fea9a.mockapi.io/template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String })
        });
        if (response.ok) {
          const result = await response.json();
          // Assume API returns a link to the uploaded image
          setAnnotatedImages(prev => [...prev, {
            id: Date.now(),
            link: result.image || result.link || '',
            timestamp: new Date().toISOString(),
            specialty: selectedTemplate
          }]);
          alert('Image uploaded successfully!');
        } else {
          alert('Failed to upload image');
        }
      } catch (err) {
        alert('Error uploading image');
      }
    };
    reader.readAsDataURL(file);
  };

  const renderFormSection = (section) => {
    switch (section.type) {
      case 'textarea':
        return (
          <div key={section.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {section.label} {section.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none transition-all duration-200"
              placeholder={`Enter ${section.label.toLowerCase()}`}
              value={formData[section.id] || ''}
              onChange={(e) => handleInputChange(section.id, e.target.value)}
              required={section.required}
            />
          </div>
        );

      case 'checklist':
        return (
          <div key={section.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {section.label}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.options.map((option) => (
                <label key={option} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer border hover:border-blue-300">
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
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
          <div key={section.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {section.label}
            </label>
            <div className="space-y-2">
              {section.options.map((option) => (
                <label key={option} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer border hover:border-blue-300">
                  <input
                    type="radio"
                    name={section.id}
                    className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
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
          <div key={section.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Pain Scale (0-10)
            </label>
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-4 border">
              <span className="text-xs text-gray-600 mr-2">No Pain</span>
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    formData[section.id] === i 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  onClick={() => handleInputChange(section.id, i)}
                >
                  {i}
                </button>
              ))}
              <span className="text-xs text-gray-600 ml-2">Severe</span>
            </div>
          </div>
        );

      case 'vitals-pediatric':
        return (
          <div key={section.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Growth Parameters
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Height (cm)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Height"
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Weight"
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Head Circumference (cm)</label>
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Head Circ."
                  onChange={(e) => handleInputChange('headCircumference', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Percentile</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Percentile"
                  onChange={(e) => handleInputChange('percentile', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'vision-test':
        return (
          <div key={section.id} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Visual Acuity
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Right Eye</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 20/20"
                  onChange={(e) => handleInputChange('rightEye', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Left Eye</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

  const generatePrintTemplate = () => {
    const currentTemplate = prescriptionTemplates[selectedTemplate];
    const currentLayout = layoutStyles[currentTemplate.layout] || layoutStyles.traditional;
    
    const printContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.title} - ${patientInfo.name || 'Patient'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Georgia', 'Times New Roman', serif; 
      line-height: 1.6; 
      color: #333; 
      background: white; 
      padding: 20px; 
      font-size: 14px; 
    }
    .header {
      background-color: ${selectedColor};
      color: white;
      padding: 30px;
      margin-bottom: 30px;
      text-align: ${currentLayout.header.textAlign};
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ${currentLayout.header.border ? `border: ${currentLayout.header.border.replace('solid', `solid ${selectedColor}`)}` : ''};
      ${currentLayout.header.borderLeft ? `border-left: ${currentLayout.header.borderLeft.replace('solid', `solid ${selectedColor}`)}` : ''};
      ${currentLayout.header.borderBottom ? `border-bottom: ${currentLayout.header.borderBottom.replace('solid', `solid ${selectedColor}`)}` : ''};
    }
    .hospital-name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .doctor-name { font-size: 20px; margin-bottom: 5px; }
    .hospital-address { font-size: 14px; opacity: 0.9; margin-bottom: 15px; }
    .form-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .form-meta { 
      display: flex; 
      justify-content: ${currentLayout.header.textAlign === 'center' ? 'center' : currentLayout.header.textAlign === 'left' ? 'flex-start' : 'flex-end'}; 
      gap: 30px; 
      font-size: 12px; 
      opacity: 0.9; 
    }
    .category-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      margin-bottom: 10px;
    }
    .patient-info {
      background: #f8fafc;
      border: 2px solid ${selectedColor};
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 25px;
    }
    .patient-info h4 { color: ${selectedColor}; font-size: 18px; margin-bottom: 15px; text-align: center; }
    .patient-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .patient-field { display: flex; flex-direction: column; }
    .patient-field label { font-weight: bold; color: #374151; margin-bottom: 5px; font-size: 12px; }
    .patient-field .value { border-bottom: 2px solid ${selectedColor}; padding: 8px 0; min-height: 30px; }
    .section {
      margin-bottom: 25px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .section-header {
      background: ${selectedColor};
      color: white;
      padding: 15px 20px;
      font-weight: bold;
      font-size: 16px;
    }
    .section-content { padding: 20px; }
    .field-value {
      border: 2px solid #e5e7eb;
      padding: 12px 15px;
      border-radius: 8px;
      background: #fafafa;
      min-height: 80px;
      margin-bottom: 15px;
      white-space: pre-wrap;
    }
    .vitals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px; }
    .vital-field { border: 2px solid #e5e7eb; padding: 10px; border-radius: 8px; background: #fafafa; text-align: center; }
    .vital-label { font-weight: bold; color: ${selectedColor}; font-size: 12px; margin-bottom: 5px; }
    .vital-value { font-size: 16px; font-weight: bold; }
    .checkbox-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 15px; }
    .checkbox-item { display: flex; align-items: center; padding: 8px 12px; border: 2px solid #e5e7eb; border-radius: 6px; background: #f9fafb; }
    .checkbox { width: 18px; height: 18px; border: 2px solid #d1d5db; margin-right: 10px; border-radius: 4px; position: relative; }
    .checkbox.checked::after { content: '✓'; position: absolute; top: -3px; left: 2px; color: ${selectedColor}; font-weight: bold; font-size: 16px; }
    .radio-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 15px; }
    .radio-item { display: flex; align-items: center; padding: 8px 12px; border: 2px solid #e5e7eb; border-radius: 6px; background: #f9fafb; }
    .radio { width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 50%; margin-right: 10px; position: relative; }
    .radio.selected::after { content: ''; position: absolute; top: 3px; left: 3px; width: 8px; height: 8px; border-radius: 50%; background-color: ${selectedColor}; }
    .pain-scale { display: flex; align-items: center; gap: 8px; padding: 15px; background: #f9fafb; border-radius: 8px; border: 2px solid #e5e7eb; margin-bottom: 15px; }
    .pain-number { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2px solid #d1d5db; background: white; }
    .pain-number.selected { background-color: ${selectedColor}; color: white; border-color: ${selectedColor}; }
    .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 50px; padding-top: 30px; border-top: 2px solid ${selectedColor}; }
    .signature-box { text-align: ${currentLayout.footer?.textAlign || 'center'}; }
    .signature-line { border-bottom: 2px solid ${selectedColor}; height: 50px; margin-bottom: 15px; }
    .footer { 
      margin-top: 30px; 
      text-align: ${currentLayout.footer?.textAlign || 'center'}; 
      font-size: 12px; 
      color: #666; 
      border-top: 1px solid #e5e7eb; 
      padding-top: 20px; 
    }
    @media print {
      body { padding: 0; }
      .section { break-inside: avoid; }
      * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="hospital-name">AVSwasthya Hospital System</div>
    <div class="doctor-name">${patientInfo.consultingDoctor || 'Dr. Sample Name'}</div>
    <div class="hospital-address">123 Medical Street, Healthcare City, HC 12345</div>
    <div class="category-badge">${selectedCategory} Department</div>
    <div class="form-title">${template.title}</div>
    <div class="form-meta">
      <span>Date: ${new Date().toLocaleDateString()}</span>
      <span>Form ID: MED-${Date.now().toString().slice(-6)}</span>
      <span>Time: ${new Date().toLocaleTimeString()}</span>
    </div>
  </div>
  
  <div class="patient-info">
    <h4>Patient Information</h4>
    <div class="patient-grid">
      <div class="patient-field"><label>Patient Name</label><div class="value">${patientInfo.name || ''}</div></div>
      <div class="patient-field"><label>Age</label><div class="value">${patientInfo.age || ''}</div></div>
      <div class="patient-field"><label>Gender</label><div class="value">${patientInfo.gender || ''}</div></div>
      <div class="patient-field"><label>Contact</label><div class="value">${patientInfo.contact || ''}</div></div>
      <div class="patient-field"><label>Address</label><div class="value">${patientInfo.address || ''}</div></div>
      <div class="patient-field"><label>Referred By</label><div class="value">${patientInfo.referredBy || ''}</div></div>
    </div>
  </div>
  
  

  ${template.sections.map(section => {
    const sectionData = formData[section.id];
    let content = '';
    
    if (section.type === 'textarea') {
      content = `<div class="field-value">${sectionData || ''}</div>`;
    } else if (section.type === 'checklist' && sectionData) {
      content = `<div class="checkbox-grid">${sectionData.map(item => 
        `<div class="checkbox-item"><div class="checkbox checked"></div>${item}</div>`
      ).join('')}</div>`;
    } else if (section.type === 'radio' && sectionData) {
      content = `<div class="radio-group">${section.options.map(option => 
        `<div class="radio-item"><div class="radio ${sectionData === option ? 'selected' : ''}"></div>${option}</div>`
      ).join('')}</div>`;
    } else if (section.type === 'pain-scale' && sectionData !== undefined) {
      content = `<div class="pain-scale">
        <span style="font-size: 12px; color: #666;">No Pain</span>
        ${[...Array(11)].map((_, i) => `<div class="pain-number ${sectionData === i ? 'selected' : ''}">${i}</div>`).join('')}
        <span style="font-size: 12px; color: #666;">Severe</span>
      </div>`;
    } else if (section.type === 'vitals-pediatric') {
      content = `<div class="vitals-grid">
        <div class="vital-field"><div class="vital-label">Height (cm)</div><div class="vital-value">${formData.height || '___'}</div></div>
        <div class="vital-field"><div class="vital-label">Weight (kg)</div><div class="vital-value">${formData.weight || '___'}</div></div>
        <div class="vital-field"><div class="vital-label">Head Circumference (cm)</div><div class="vital-value">${formData.headCircumference || '___'}</div></div>
        <div class="vital-field"><div class="vital-label">Percentile</div><div class="vital-value">${formData.percentile || '___'}</div></div>
      </div>`;
    } else if (section.type === 'vision-test') {
      content = `<div class="vitals-grid">
        <div class="vital-field"><div class="vital-label">Right Eye</div><div class="vital-value">${formData.rightEye || '___'}</div></div>
        <div class="vital-field"><div class="vital-label">Left Eye</div><div class="vital-value">${formData.leftEye || '___'}</div></div>
      </div>`;
    } else {
      content = `<div class="field-value">${sectionData || ''}</div>`;
    }
    
    return `
      <div class="section">
        <div class="section-header">${section.label}</div>
        <div class="section-content">${content}</div>
      </div>`;
  }).join('')}

  ${handwrittenNotes ? `
    <div class="section">
      <div class="section-header">Additional Notes</div>
      <div class="section-content">
        <div class="field-value" style="font-family: 'Courier New', monospace; white-space: pre-wrap;">${handwrittenNotes}</div>
      </div>
    </div>
  ` : ''}

  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-line"></div>
      <div>Patient Signature</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div>Doctor Signature</div>
    </div>
  </div>
  
  <div class="footer">
    <p><strong>${selectedCategory} Department - ${template.title}</strong></p>
    <p>Generated on ${new Date().toLocaleString()} | AVSwasthya Hospital System</p>
    <p>This is a confidential medical document. For queries, contact: info@avswasthya.com</p>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrint = () => {
    generatePrintTemplate();
  };

  const handleDownload = () => {
    const printContent = generatePrintTemplate();
    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.title.replace(/\s+/g, '_')}_${patientInfo.name || 'Patient'}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter specialties based on selected category
  const filteredSpecialties = Object.entries(specialtyTemplates).filter(
    ([key, spec]) => spec.category === selectedCategory
  );

  // Category options
  const categoryOptions = [
    { value: 'AYUSH', label: 'AYUSH (Traditional Medicine)' },
    { value: 'Allopathy', label: 'Allopathy (Modern Medicine)' }
  ];

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-[var(--primary-color)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center mb-4 lg:mb-0">
              <div className="bg-[var(--accent-color)] p-3 rounded-lg mr-4">
                <IconComponent className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="h3-heading">{template.title}</h1>
                <p className="paragraph">{selectedCategory} Department - Comprehensive medical evaluation form</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="btn btn-secondary"
                type="button"
              >
                <Settings className="w-4 h-4" />
                Templates
              </button>
              <button
                onClick={() => setShowImageUpload(!showImageUpload)}
                className="btn btn-primary"
                type="button"
              >
               Upload Template 
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category & Specialty Selector */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <h4 className="h4-heading mb-4 flex items-center">
              <Settings className="w-5 h-5 text-blue mr-2" />
              Select Medical System & Specialty
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical System</label>
                <select
                  className="input-field font-semibold"
                  value={selectedCategory}
                  onChange={e => handleCategoryChange(e.target.value)}
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <select
                  className="input-field font-semibold"
                  value={selectedSpecialty}
                  onChange={e => setSelectedSpecialty(e.target.value)}
                >
                  {filteredSpecialties.map(([key, spec]) => (
                    <option key={key} value={key}>
                      {spec.title.replace(' Assessment', '')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: selectedColor }}></div>
                <span className="font-medium">Selected:</span>
                <span className="ml-2">{selectedCategory} → {template.title}</span>
                <span className="ml-4 text-xs bg-gray-200 px-2 py-1 rounded">{template.sections.length} sections</span>
              </div>
            </div>
          </div>
          {/* Image Upload Section */}
          {showImageUpload && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <ImageIcon className="w-6 h-6 text-green-500 mr-3" />
                <h4 className="h4-heading">Medical Images</h4>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary mx-auto"
                >
                  Upload Medical Image
                </button>
                <p className="text-sm text-gray-500 mt-2">Upload X-rays, scans, or other medical images</p>
              </div>
              {annotatedImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="h4-heading mb-3">Uploaded Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {annotatedImages.map((image) => (
                      <div key={image.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="text-sm text-gray-600">
                          <p>Uploaded: {new Date(image.timestamp).toLocaleString()}</p>
                          <p>Specialty: {specialtyTemplates[image.specialty]?.title || image.specialty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Patient Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <User className="w-6 h-6 text-[var--(primary-color)]mr-3" />
              <h4 className="h4-heading">Patient Information</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                <input
                  type="text"
                  className="input-field"
                  value={patientInfo.patientId}
                  onChange={(e) => handlePatientInfoChange('patientId', e.target.value)}
                  placeholder="Enter patient ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={patientInfo.name}
                  onChange={(e) => handlePatientInfoChange('name', e.target.value)}
                  placeholder="Enter patient name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  className="input-field"
                  value={patientInfo.age}
                  onChange={(e) => handlePatientInfoChange('age', e.target.value)}
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  className="input-field"
                  value={patientInfo.gender}
                  onChange={(e) => handlePatientInfoChange('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                <input
                  type="tel"
                  className="input-field"
                  value={patientInfo.contact}
                  onChange={(e) => handlePatientInfoChange('contact', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consulting Doctor</label>
                <input
                  type="text"
                  className="input-field"
                  value={patientInfo.consultingDoctor}
                  onChange={(e) => handlePatientInfoChange('consultingDoctor', e.target.value)}
                  placeholder="Doctor name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  className="input-field"
                  value={patientInfo.address}
                  onChange={(e) => handlePatientInfoChange('address', e.target.value)}
                  placeholder="Complete address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referred By</label>
                <input
                  type="text"
                  className="input-field"
                  value={patientInfo.referredBy}
                  onChange={(e) => handlePatientInfoChange('referredBy', e.target.value)}
                  placeholder="Referring doctor/clinic"
                />
              </div>
            </div>
          </div>
          {/* Specialty-specific Assessment Sections */}
          {template.sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-semibold text-sm mr-3">
                  {index + 1}
                </div>
                <h4 className="h4-heading">{section.label}</h4>
                {section.required && <span className="ml-2 text-red-500 text-sm">*Required</span>}
              </div>
              {renderFormSection(section)}
            </div>
          ))}

        {/* Additional Notes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <PenTool className="w-6 h-6 text-purple-500 mr-3" />
            <h4 className="h4-heading">Additional Notes</h4>
          </div>
          <textarea
            className="input-field font-mono min-h-[120px]"
            placeholder="Enter any additional observations, notes, or recommendations..."
            value={handwrittenNotes}
            onChange={(e) => setHandwrittenNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            type="submit"
            className="btn btn-primary animate-pulse-save"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Assessment
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <Print className="w-5 h-5 mr-2" />
            Print Report
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="btn btn-secondary flex items-center"
          >
            <Download className="w-5 h-5" />
            Download 
          </button>
        </div>
        </form>

        {/* Template Modal */}
        {showTemplateModal && (
          <TemplateModal
            isOpen={showTemplateModal}
            onClose={() => setShowTemplateModal(false)}
            onSelectTemplate={handleTemplateSelect}
            selectedTemplate={selectedTemplate}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        )}
      </div>
    </div>
  );
};

export default InitialAssessment;