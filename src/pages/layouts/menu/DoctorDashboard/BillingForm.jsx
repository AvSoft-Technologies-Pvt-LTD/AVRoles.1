// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { 
//   ArrowLeft, 
//   Save, 
//   Calculator, 
//   Receipt, 
//   FileText, 
//   Stethoscope,
//   Share2,
//   X,
//   Globe,
//   Phone,
//   Mail,
//   Printer,
//   Download,
//   Plus,
//   Trash2,
//   User,
//   Calendar,
//   CreditCard,
//   Clock
// } from 'lucide-react';

// const BillingForm = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const billingType = location.state?.billingType || 'pharmacy';

//   // Patient info from navigation state (if available)
//   const patientNameFromNav = location.state?.patientName || '';
//   const patientIdFromNav = location.state?.patientId || '';
//   const doctorNameFromNav = location.state?.doctorName || '';
//   const phoneFromNav = location.state?.phone || '';
//   const genderFromNav = location.state?.gender || '';
//   const ageFromNav = location.state?.age || '';
//   const addressFromNav = location.state?.address || '';
//   const emailFromNav = location.state?.patientEmail || location.state?.email || '';

//   // Enhanced form states for different billing types, pre-filling patient info
//   const [formData, setFormData] = useState({
//     pharmacy: {
//       patientName: patientNameFromNav,
//       patientId: patientIdFromNav,
//       doctorName: doctorNameFromNav,
//       prescriptionDate: new Date().toISOString().split('T')[0],
//       billNo: `PH-BILL-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
//       medicines: [
//         { id: 1, medicineName: '', quantity: '', unitPrice: '', total: '' }
//       ],
//       subtotal: 0,
//       discountPercent: 0,
//       discountAmount: 0,
//       taxPercent: 5,
//       taxAmount: 0,
//       grandTotal: 0,
//       paymentMode: 'Cash',
//       billingTime: new Date().toLocaleTimeString('en-US', { 
//         hour: '2-digit', 
//         minute: '2-digit', 
//         hour12: true 
//       }),
//       phone: phoneFromNav,
//       gender: genderFromNav,
//       age: ageFromNav,
//       address: addressFromNav,
//       email: emailFromNav
//     },
//     labs: {
//       patientName: patientNameFromNav,
//       patientId: patientIdFromNav,
//       doctorName: doctorNameFromNav,
//       date: new Date().toISOString().split('T')[0],
//       labBillNo: `LAB-BILL-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
//       tests: [
//         { id: 1, testName: '', rate: '', remarks: '' }
//       ],
//       subtotal: 0,
//       discountPercent: 0,
//       discountAmount: 0,
//       taxPercent: 5,
//       taxAmount: 0,
//       grandTotal: 0,
//       paymentMode: 'Cash',
//       billingTime: new Date().toLocaleTimeString('en-US', { 
//         hour: '2-digit', 
//         minute: '2-digit', 
//         hour12: true 
//       }),
//       phone: phoneFromNav,
//       gender: genderFromNav,
//       age: ageFromNav,
//       address: addressFromNav,
//       email: emailFromNav
//     },
//     hospital: {
//       patientName: patientNameFromNav,
//       patientId: patientIdFromNav,
//       admissionDate: new Date().toISOString().split('T')[0],
//       dischargeDate: new Date().toISOString().split('T')[0],
//       billNo: `HOSP-BILL-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
//       roomType: 'Private AC',
//       bedNo: '',
//       charges: [
//         { id: 1, category: 'Room Charges', description: '', amount: '' },
//         { id: 2, category: 'Doctor Visit Fee', description: '', amount: '' },
//         { id: 3, category: 'Nursing Charges', description: '', amount: '' },
//         { id: 4, category: 'Lab Tests', description: '', amount: '' },
//         { id: 5, category: 'Pharmacy Charges', description: '', amount: '' },
//         { id: 6, category: 'Procedure Charges', description: '', amount: '' }
//       ],
//       subtotal: 0,
//       discountPercent: 0,
//       discountAmount: 0,
//       taxPercent: 5,
//       taxAmount: 0,
//       advancePaid: 0,
//       amountPayable: 0,
//       paymentMode: 'Cash',
//       billingTime: new Date().toLocaleTimeString('en-US', { 
//         hour: '2-digit', 
//         minute: '2-digit', 
//         hour12: true 
//       }),
//       phone: phoneFromNav,
//       gender: genderFromNav,
//       age: ageFromNav,
//       address: addressFromNav,
//       email: emailFromNav
//     }
//   });

//   const [currentForm, setCurrentForm] = useState(formData[billingType]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
  
//   // Share modal states
//   const [isShareModalOpen, setIsShareModalOpen] = useState(false);
//   const [shareEmail, setShareEmail] = useState(emailFromNav || '');
//   const [sharePhone, setSharePhone] = useState(phoneFromNav || '');
//   const [language, setLanguage] = useState('English');
//   const [isTranslating, setIsTranslating] = useState(false);

//   // Update form when billing type changes
//   useEffect(() => {
//     setCurrentForm(formData[billingType]);
//     setErrors({});
//   }, [billingType]);

//   // Auto-calculate totals
//   useEffect(() => {
//     calculateTotals();
//     // eslint-disable-next-line
//   }, [currentForm, billingType]);

//   const calculateTotals = () => {
//     let subtotal = 0;

//     if (billingType === 'pharmacy') {
//       subtotal = currentForm.medicines.reduce((sum, medicine) => {
//         const total = parseFloat(medicine.quantity || 0) * parseFloat(medicine.unitPrice || 0);
//         return sum + total;
//       }, 0);
//     } else if (billingType === 'labs') {
//       subtotal = currentForm.tests.reduce((sum, test) => {
//         return sum + parseFloat(test.rate || 0);
//       }, 0);
//     } else if (billingType === 'hospital') {
//       subtotal = currentForm.charges.reduce((sum, charge) => {
//         return sum + parseFloat(charge.amount || 0);
//       }, 0);
//     }

//     const discountAmount = (subtotal * parseFloat(currentForm.discountPercent || 0)) / 100;
//     const taxableAmount = subtotal - discountAmount;
//     const taxAmount = (taxableAmount * parseFloat(currentForm.taxPercent || 0)) / 100;
    
//     let finalAmount = taxableAmount + taxAmount;
    
//     if (billingType === 'hospital') {
//       finalAmount = finalAmount - parseFloat(currentForm.advancePaid || 0);
//     }

//     setCurrentForm(prev => ({
//       ...prev,
//       subtotal: subtotal.toFixed(2),
//       discountAmount: discountAmount.toFixed(2),
//       taxAmount: taxAmount.toFixed(2),
//       ...(billingType === 'hospital' 
//         ? { amountPayable: finalAmount.toFixed(2) }
//         : { grandTotal: finalAmount.toFixed(2) }
//       )
//     }));
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentForm(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleItemChange = (index, field, value, itemType) => {
//     const itemsKey = itemType === 'medicine' ? 'medicines' : 
//                      itemType === 'test' ? 'tests' : 'charges';
//     setCurrentForm(prev => ({
//       ...prev,
//       [itemsKey]: prev[itemsKey].map((item, i) => {
//         if (i === index) {
//           const updatedItem = { ...item, [field]: value };
//           if (itemType === 'medicine' && (field === 'quantity' || field === 'unitPrice')) {
//             const quantity = field === 'quantity' ? parseFloat(value || 0) : parseFloat(item.quantity || 0);
//             const unitPrice = field === 'unitPrice' ? parseFloat(value || 0) : parseFloat(item.unitPrice || 0);
//             updatedItem.total = (quantity * unitPrice).toFixed(2);
//           }
//           return updatedItem;
//         }
//         return item;
//       })
//     }));
//   };

//   const addItem = (itemType) => {
//     const itemsKey = itemType === 'medicine' ? 'medicines' : 
//                      itemType === 'test' ? 'tests' : 'charges';
//     const newItem = itemType === 'medicine' 
//       ? { id: Date.now(), medicineName: '', quantity: '', unitPrice: '', total: '' }
//       : itemType === 'test'
//       ? { id: Date.now(), testName: '', rate: '', remarks: '' }
//       : { id: Date.now(), category: '', description: '', amount: '' };
//     setCurrentForm(prev => ({
//       ...prev,
//       [itemsKey]: [...prev[itemsKey], newItem]
//     }));
//   };

//   const removeItem = (index, itemType) => {
//     const itemsKey = itemType === 'medicine' ? 'medicines' : 
//                      itemType === 'test' ? 'tests' : 'charges';
//     setCurrentForm(prev => ({
//       ...prev,
//       [itemsKey]: prev[itemsKey].filter((_, i) => i !== index)
//     }));
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     if (!currentForm.patientName?.trim()) newErrors.patientName = 'Patient name is required';
//     if (!currentForm.patientId?.trim()) newErrors.patientId = 'Patient ID is required';

//     if (billingType === 'pharmacy') {
//       if (!currentForm.doctorName?.trim()) newErrors.doctorName = 'Doctor name is required';
//       if (!currentForm.prescriptionDate) newErrors.prescriptionDate = 'Prescription date is required';
//       currentForm.medicines.forEach((medicine, index) => {
//         if (!medicine.medicineName?.trim()) {
//           newErrors[`medicine_${index}_name`] = 'Medicine name is required';
//         }
//         if (!medicine.quantity || medicine.quantity <= 0) {
//           newErrors[`medicine_${index}_quantity`] = 'Valid quantity is required';
//         }
//         if (!medicine.unitPrice || medicine.unitPrice <= 0) {
//           newErrors[`medicine_${index}_price`] = 'Valid unit price is required';
//         }
//       });
//     } else if (billingType === 'labs') {
//       if (!currentForm.doctorName?.trim()) newErrors.doctorName = 'Doctor name is required';
//       if (!currentForm.date) newErrors.date = 'Date is required';
//       currentForm.tests.forEach((test, index) => {
//         if (!test.testName?.trim()) {
//           newErrors[`test_${index}_name`] = 'Test name is required';
//         }
//         if (!test.rate || test.rate <= 0) {
//           newErrors[`test_${index}_rate`] = 'Valid rate is required';
//         }
//       });
//     } else if (billingType === 'hospital') {
//       if (!currentForm.admissionDate) newErrors.admissionDate = 'Admission date is required';
//       if (!currentForm.dischargeDate) newErrors.dischargeDate = 'Discharge date is required';
//       if (!currentForm.bedNo?.trim()) newErrors.bedNo = 'Bed number is required';
//       currentForm.charges.forEach((charge, index) => {
//         if (!charge.category?.trim()) {
//           newErrors[`charge_${index}_category`] = 'Category is required';
//         }
//         if (!charge.description?.trim()) {
//           newErrors[`charge_${index}_description`] = 'Description is required';
//         }
//         if (!charge.amount || charge.amount <= 0) {
//           newErrors[`charge_${index}_amount`] = 'Valid amount is required';
//         }
//       });
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//  // ...existing code...
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!validateForm()) {
//     return;
//   }
//   setIsSubmitting(true);
//   try {
//     await new Promise(resolve => setTimeout(resolve, 1000));
//     navigate('/doctordashboard/medical-record', {
//       state: {
//         newBillingRecord: currentForm,
//         billingType: billingType,
//         success: true
//       }
//     });
//   } catch (error) {
//     console.error('Error saving billing record:', error);
//     alert('Error saving billing record. Please try again.');
//   } finally {
//     setIsSubmitting(false);
//   }
// };

//   const handleCancel = () => {
//     navigate('/doctordashboard');
//   };

//   const openShareModal = () => {
//     setIsShareModalOpen(true);
//   };

//   const closeShareModal = () => {
//     setIsShareModalOpen(false);
//   };

//   const handleLanguageChange = async (newLanguage) => {
//     setLanguage(newLanguage);
//     if (newLanguage !== 'English') {
//       setIsTranslating(true);
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       setIsTranslating(false);
//     }
//   };

//   const getBillingIcon = () => {
//     switch (billingType) {
//       case 'pharmacy': return <Receipt className="w-6 h-6" />;
//       case 'labs': return <FileText className="w-6 h-6" />;
//       case 'hospital': return <Stethoscope className="w-6 h-6" />;
//       default: return <Receipt className="w-6 h-6" />;
//     }
//   };

//   const getBillingTitle = () => {
//     switch (billingType) {
//       case 'pharmacy': return 'Pharmacy Billing';
//       case 'labs': return 'Lab Test Billing';
//       case 'hospital': return 'Hospital Billing';
//       default: return 'Billing';
//     }
//   };

//   const getWhatsAppLink = () => {
//     if (!sharePhone) return '#';
//     let message = `*${getBillingTitle()} Receipt*\n\n`;
//     message += `*Bill No:* ${currentForm.billNo || currentForm.labBillNo}\n`;
//     message += `*Patient:* ${currentForm.patientName}\n`;
//     message += `*Date:* ${currentForm.date || currentForm.prescriptionDate || currentForm.dischargeDate}\n\n`;
//     if (billingType === 'pharmacy') {
//       message += `*Medicines:*\n`;
//       currentForm.medicines.forEach((med, index) => {
//         message += `${index + 1}. ${med.medicineName} - Qty: ${med.quantity} - ₹${med.total}\n`;
//       });
//       message += `\n*Total Amount:* ₹${currentForm.grandTotal}\n`;
//     } else if (billingType === 'labs') {
//       message += `*Tests:*\n`;
//       currentForm.tests.forEach((test, index) => {
//         message += `${index + 1}. ${test.testName} - ₹${test.rate}\n`;
//       });
//       message += `\n*Total Amount:* ₹${currentForm.grandTotal}\n`;
//     } else if (billingType === 'hospital') {
//       message += `*Charges:*\n`;
//       currentForm.charges.forEach((charge, index) => {
//         if (charge.amount > 0) {
//           message += `${index + 1}. ${charge.category} - ₹${charge.amount}\n`;
//         }
//       });
//       message += `\n*Amount Payable:* ₹${currentForm.amountPayable}\n`;
//     }
//     message += `\n*AV Hospital*\nDigital Billing System`;
//     return `https://wa.me/${sharePhone}?text=${encodeURIComponent(message)}`;
//   };

//   const renderPharmacyForm = () => (
//     <div className="space-y-8">
//       {/* Patient Information */}
//       <div className="bg-gray-50 p-6 rounded-lg">
        
//        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//   <div>
//     <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
//     <p className="">{currentForm.patientName}</p>
//   </div>

//   <div>
//     <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID *</label>
//     <p className="">{currentForm.patientId}</p>
//   </div>

//   <div>
//     <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name *</label>
//     <p className="">Dr. Shital S. Shelke</p>
//   </div>

//   <div>
//     <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Date *</label>
//     <p className="">
//       {currentForm.prescriptionDate}
//     </p>
//   </div>

//   <div>
//     <label className="block text-sm font-medium text-gray-700 mb-2">Bill No.</label>
//     <p className="">{currentForm.billNo}</p>
//   </div>
// </div>

//       </div>

//       {/* Medicines */}
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">Medicines</h3>
//           <button
//             type="button"
//             onClick={() => addItem('medicine')}
//             className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             <span>Add Medicine</span>
//           </button>
//         </div>
        
//         <div className="space-y-4">
//           {currentForm.medicines.map((medicine, index) => (
//             <div key={medicine.id} className="bg-gray-50 p-4 rounded-lg">
//               <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
//                   <input
//                     type="text"
//                     value={medicine.medicineName}
//                     onChange={(e) => handleItemChange(index, 'medicineName', e.target.value, 'medicine')}
//                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                       errors[`medicine_${index}_name`] ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="Paracetamol 500mg"
//                   />
//                   {errors[`medicine_${index}_name`] && <p className="text-red-500 text-sm mt-1">{errors[`medicine_${index}_name`]}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
//                   <input
//                     type="number"
//                     value={medicine.quantity}
//                     onChange={(e) => handleItemChange(index, 'quantity', e.target.value, 'medicine')}
//                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                       errors[`medicine_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="10"
//                     min="1"
//                   />
//                   {errors[`medicine_${index}_quantity`] && <p className="text-red-500 text-sm mt-1">{errors[`medicine_${index}_quantity`]}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₹) *</label>
//                   <input
//                     type="number"
//                     value={medicine.unitPrice}
//                     onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value, 'medicine')}
//                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                       errors[`medicine_${index}_price`] ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="5"
//                     min="0"
//                     step="0.01"
//                   />
//                   {errors[`medicine_${index}_price`] && <p className="text-red-500 text-sm mt-1">{errors[`medicine_${index}_price`]}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Total (₹)</label>
//                   <input
//                     type="text"
//                     value={medicine.total}
//                     readOnly
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
//                   />
//                 </div>
//                 <div className="flex items-end">
//                   {currentForm.medicines.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeItem(index, 'medicine')}
//                       className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Billing Summary */}
//       <div className="bg-yellow-50 p-6 rounded-lg">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
//             <input
//               type="number"
//               name="discountPercent"
//               value={currentForm.discountPercent}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="5"
//               min="0"
//               max="100"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
//             <input
//               type="number"
//               name="taxPercent"
//               value={currentForm.taxPercent}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="5"
//               min="0"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
//             <select
//               name="paymentMode"
//               value={currentForm.paymentMode}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="Cash">Cash</option>
//               <option value="Card">Card</option>
//               <option value="UPI">UPI</option>
//               <option value="Insurance">Insurance</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Grand Total (₹)</label>
//             <div className="text-2xl font-bold text-green-600">₹{currentForm.grandTotal}</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderLabsForm = () => (
//     <div className="space-y-8">
//       {/* Patient Information */}
//       <div className="bg-blue-50 p-6 rounded-lg">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//           <User className="w-5 h-5 mr-2" />
//           Patient Information
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
//             <input
//               type="text"
//               name="patientName"
//               value={currentForm.patientName}
//               onChange={handleInputChange}
//               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.patientName ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter patient name"
//             />
//             {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID *</label>
//             <input
//               type="text"
//               name="patientId"
//               value={currentForm.patientId}
//               onChange={handleInputChange}
//               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.patientId ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="PT-000456"
//             />
//             {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name *</label>
//             <input
//               type="text"
//               name="doctorName"
//               value={currentForm.doctorName}
//               onChange={handleInputChange}
//               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.doctorName ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Dr. S.K. Gupta"
//             />
//             {errors.doctorName && <p className="text-red-500 text-sm mt-1">{errors.doctorName}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
//             <input
//               type="date"
//               name="date"
//               value={currentForm.date}
//               onChange={handleInputChange}
//               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.date ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Lab Bill No.</label>
//             <input
//               type="text"
//               name="labBillNo"
//               value={currentForm.labBillNo}
//               readOnly
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Lab Tests */}
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">Lab Tests</h3>
//           <button
//             type="button"
//             onClick={() => addItem('test')}
//             className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             <span>Add Test</span>
//           </button>
//         </div>
        
//         <div className="space-y-4">
//           {currentForm.tests.map((test, index) => (
//             <div key={test.id} className="bg-gray-50 p-4 rounded-lg">
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
//                   <input
//                     type="text"
//                     value={test.testName}
//                     onChange={(e) => handleItemChange(index, 'testName', e.target.value, 'test')}
//                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                       errors[`test_${index}_name`] ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="CBC"
//                   />
//                   {errors[`test_${index}_name`] && <p className="text-red-500 text-sm mt-1">{errors[`test_${index}_name`]}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Rate (₹) *</label>
//                   <input
//                     type="number"
//                     value={test.rate}
//                     onChange={(e) => handleItemChange(index, 'rate', e.target.value, 'test')}
//                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                       errors[`test_${index}_rate`] ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="300"
//                     min="0"
//                     step="0.01"
//                   />
//                   {errors[`test_${index}_rate`] && <p className="text-red-500 text-sm mt-1">{errors[`test_${index}_rate`]}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
//                   <input
//                     type="text"
//                     value={test.remarks}
//                     onChange={(e) => handleItemChange(index, 'remarks', e.target.value, 'test')}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Fasting 8hrs"
//                   />
//                 </div>
//                 <div className="flex items-end">
//                   {currentForm.tests.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeItem(index, 'test')}
//                       className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Billing Summary */}
//       <div className="bg-yellow-50 p-6 rounded-lg">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
//             <input
//               type="number"
//               name="discountPercent"
//               value={currentForm.discountPercent}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="10"
//               min="0"
//               max="100"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
//             <input
//               type="number"
//               name="taxPercent"
//               value={currentForm.taxPercent}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="5"
//               min="0"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
//             <select
//               name="paymentMode"
//               value={currentForm.paymentMode}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="Cash">Cash</option>
//               <option value="UPI">UPI</option>
//               <option value="Card">Card</option>
//               <option value="Insurance">Insurance</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Grand Total (₹)</label>
//             <div className="text-2xl font-bold text-green-600">₹{currentForm.grandTotal}</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderHospitalForm = () => (
//     <div className="space-y-8">
//       {/* Patient Information */}
//       <div className="bg-blue-50 p-6 rounded-lg">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//           <User className="w-5 h-5 mr-2" />
//           Patient Information
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
//             <input
//               type="text"
//               name="patientName"
//               value={currentForm.patientName}
//               onChange={handleInputChange}
//               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.patientName ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="Enter patient name"
//             />
//             {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID *</label>
//             <input
//               type="text"
//               name="patientId"
//               value={currentForm.patientId}
//               onChange={handleInputChange}
//               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.patientId ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="PT-000456"
//             />
//             {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
//             <select
//               name="roomType"
//               value={currentForm.roomType}
//               onChange={handleInputChange}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="General">General</option>
//               <option value="Private">Private</option>
//               <option value="Private AC">Private AC</option>
//               <option value="ICU">ICU</option>
//               <option value="ICCU">ICCU</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Bed No. *</label>
//             <input
//               type="text"
//               name="bedNo"
//               value={currentForm.bedNo}
//               onChange={handleInputChange}
//               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.bedNo ? 'border-red-500' : 'border-gray-300'
//               }`}
//               placeholder="302"
//             />
//             {errors.bedNo && <p className="text-red-500 text-sm mt-1">{errors.bedNo}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date *</label>
//             <input
//               type="date"
//               name="admissionDate"
//               value={currentForm.admissionDate}
//               onChange={handleInputChange}
//               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.admissionDate ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {errors.admissionDate && <p className="text-red-500 text-sm mt-1">{errors.admissionDate}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Date *</label>
//             <input
//               type="date"
//               name="dischargeDate"
//               value={currentForm.dischargeDate}
//               onChange={handleInputChange}
//               className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                 errors.dischargeDate ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {errors.dischargeDate && <p className="text-red-500 text-sm mt-1">{errors.dischargeDate}</p>}
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Bill No.</label>
//             <input
//               type="text"
//               name="billNo"
//               value={currentForm.billNo}
//               readOnly
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Hospital Charges */}
//       <div>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">Hospital Charges</h3>
//           <button
//             type="button"
//             onClick={() => addItem('charge')}
//             className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             <span>Add Charge</span>
//           </button>
//         </div>
        
//         <div className="space-y-4">
//           {currentForm.charges.map((charge, index) => (
//             <div key={charge.id} className="bg-gray-50 p-4 rounded-lg">
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
//                   <input
//                     type="text"
//                     value={charge.category}
//                     onChange={(e) => handleItemChange(index, 'category', e.target.value, 'charge')}
//                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                       errors[`charge_${index}_category`] ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="Room Charges"
//                   />
//                   {errors[`charge_${index}_category`] && <p className="text-red-500 text-sm mt-1">{errors[`charge_${index}_category`]}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
//                   <input
//                     type="text"
//                     value={charge.description}
//                     onChange={(e) => handleItemChange(index, 'description', e.target.value, 'charge')}
//                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                       errors[`charge_${index}_description`] ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="2 days x ₹2000"
//                   />
//                   {errors[`charge_${index}_description`] && <p className="text-red-500 text-sm mt-1">{errors[`charge_${index}_description`]}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
//                   <input
//                     type="number"
//                     value={charge.amount}
//                     onChange={(e) => handleItemChange(index, 'amount', e.target.value, 'charge')}
//                     className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                       errors[`charge_${index}_amount`] ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="4000"
//                     min="0"
//                     step="0.01"
//                   />
//                   {errors[`charge_${index}_amount`] && <p className="text-red-500 text-sm mt-1">{errors[`charge_${index}_amount`]}</p>}
//                 </div>
//                 <div className="flex items-end">
//                   {currentForm.charges.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => removeItem(index, 'charge')}
//                       className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Billing Summary */}
//       <div className="bg-yellow-50 p-6 rounded-lg">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
//             <input
//               type="number"
//               name="discountPercent"
//               value={currentForm.discountPercent}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="10"
//               min="0"
//               max="100"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
//             <input
//               type="number"
//               name="taxPercent"
//               value={currentForm.taxPercent}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="5"
//               min="0"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Advance Paid (₹)</label>
//             <input
//               type="number"
//               name="advancePaid"
//               value={currentForm.advancePaid}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="3000"
//               min="0"
//               step="0.01"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
//             <select
//               name="paymentMode"
//               value={currentForm.paymentMode}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="Cash">Cash</option>
//               <option value="Card">Card</option>
//               <option value="UPI">UPI</option>
//               <option value="Insurance">Insurance</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Amount Payable (₹)</label>
//             <div className="text-2xl font-bold text-green-600">₹{currentForm.amountPayable}</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderForm = () => {
//     switch (billingType) {
//       case 'pharmacy': return renderPharmacyForm();
//       case 'labs': return renderLabsForm();
//       case 'hospital': return renderHospitalForm();
//       default: return renderPharmacyForm();
//     }
//   };

//   const renderBillingPreview = () => {
//     return (
//       <div className="bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden max-w-3xl mx-auto text-sm font-mono">
//   {/* Header */}
//   <div className="border-b border-gray-300 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200">
//     <div className="border border-gray-400 rounded-md p-3 text-center">
//       <h2 className="text-xl font-semibold tracking-wide text-gray-800 uppercase">
//         {billingType === 'pharmacy' ? 'Pharmacy Billing' :
//          billingType === 'labs' ? 'Lab Billing' :
//          'Hospital Billing Summary'}
//       </h2>
//     </div>
//   </div>

//   {/* Patient Details */}
//   <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//     <div className="grid grid-cols-2 gap-6 text-[13px]">
//       <div className="space-y-1 text-gray-700">
//         <p><strong>Patient Name:</strong> {currentForm.patientName || 'Patient Name'}</p>
//         <p><strong>Patient ID:</strong> {currentForm.patientId || 'PT-000456'}</p>
//         {billingType === 'pharmacy' && (
//           <>
//             <p><strong>Prescription Date:</strong> {currentForm.prescriptionDate ? new Date(currentForm.prescriptionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '31-Jul-2025'}</p>
//             <p><strong>Doctor Name:</strong> {currentForm.doctorName || 'Dr. S.K. Gupta'}</p>
//           </>
//         )}
//         {billingType === 'labs' && (
//           <>
//             <p><strong>Date:</strong> {currentForm.date ? new Date(currentForm.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '31-Jul-2025'}</p>
//             <p><strong>Doctor Name:</strong> {currentForm.doctorName || 'Dr. S.K. Gupta'}</p>
//           </>
//         )}
//         {billingType === 'hospital' && (
//           <>
//             <p><strong>Admission Date:</strong> {currentForm.admissionDate ? new Date(currentForm.admissionDate).toLocaleDateString('en-GB') : '29-Jul-2025'}</p>
//             <p><strong>Discharge Date:</strong> {currentForm.dischargeDate ? new Date(currentForm.dischargeDate).toLocaleDateString('en-GB') : '31-Jul-2025'}</p>
//             <p><strong>Room Type:</strong> {currentForm.roomType || 'Private AC'}</p>
//             <p><strong>Bed No:</strong> {currentForm.bedNo || '302'}</p>
//           </>
//         )}
//       </div>
//       <div className="space-y-1 text-right text-gray-700">
//         <p><strong>Bill No:</strong> {currentForm.billNo || currentForm.labBillNo || 'BILL-000123'}</p>
//         <p><strong>💳 Payment Mode:</strong> {currentForm.paymentMode || 'Cash'}</p>
//         <p><strong>🕒 Billing Time:</strong> {currentForm.billingTime || '11:45 AM'}</p>
//       </div>
//     </div>
//   </div>

//   {/* Items Table */}
//   <div className="p-6">
//     <div className="border border-gray-200 rounded-md overflow-hidden">
//       {billingType === 'pharmacy' && (
//         <table className="w-full text-[13px]">
//           <thead className="bg-gray-100 text-left text-gray-700">
//             <tr>
//               <th className="p-2 border-r">S.No</th>
//               <th className="p-2 border-r">Medicine Name</th>
//               <th className="text-center p-2 border-r">Qty</th>
//               <th className="text-right p-2 border-r">Unit Price</th>
//               <th className="text-right p-2">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentForm.medicines.map((med, index) => (
//               <tr key={index} className="border-t text-gray-700">
//                 <td className="p-2 border-r">{index + 1}</td>
//                 <td className="p-2 border-r">{med.medicineName || `Medicine ${index + 1}`}</td>
//                 <td className="text-center p-2 border-r">{med.quantity || '0'}</td>
//                 <td className="text-right p-2 border-r">₹{med.unitPrice || '0'}</td>
//                 <td className="text-right p-2">₹{med.total || '0'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {billingType === 'labs' && (
//         <table className="w-full text-[13px]">
//           <thead className="bg-gray-100 text-left text-gray-700">
//             <tr>
//               <th className="p-2 border-r">S.No</th>
//               <th className="p-2 border-r">Lab Test Name</th>
//               <th className="text-right p-2 border-r">Rate</th>
//               <th className="p-2">Remarks</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentForm.tests.map((test, index) => (
//               <tr key={index} className="border-t text-gray-700">
//                 <td className="p-2 border-r">{index + 1}</td>
//                 <td className="p-2 border-r">{test.testName || `Test ${index + 1}`}</td>
//                 <td className="text-right p-2 border-r">₹{test.rate || '0'}</td>
//                 <td className="p-2">{test.remarks || ''}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       {billingType === 'hospital' && (
//         <table className="w-full text-[13px]">
//           <thead className="bg-gray-100 text-left text-gray-700">
//             <tr>
//               <th className="p-2 border-r">Category</th>
//               <th className="p-2 border-r">Description</th>
//               <th className="text-right p-2">Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentForm.charges.map((item, index) => (
//               item.amount > 0 && (
//                 <tr key={index} className="border-t text-gray-700">
//                   <td className="p-2 border-r">{item.category || `Category ${index + 1}`}</td>
//                   <td className="p-2 border-r">{item.description || `Description ${index + 1}`}</td>
//                   <td className="text-right p-2">₹{item.amount || '0'}</td>
//                 </tr>
//               )
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   </div>

//   {/* Billing Summary */}
//   <div className="px-6 py-4 bg-gray-50 border-t border-gray-300">
//     <div className="space-y-1 text-sm text-gray-800">
//       <div className="flex justify-between">
//         <span>Subtotal</span>
//         <span>: ₹{currentForm.subtotal || '0.00'}</span>
//       </div>
//       <div className="flex justify-between">
//         <span>Discount ({currentForm.discountPercent || 0}%)</span>
//         <span>: ₹{currentForm.discountAmount || '0.00'}</span>
//       </div>
//       <div className="flex justify-between">
//         <span>Tax ({currentForm.taxPercent || 0}%)</span>
//         <span>: ₹{currentForm.taxAmount || '0.00'}</span>
//       </div>
//       {billingType === 'hospital' && (
//         <div className="flex justify-between">
//           <span>Advance Paid</span>
//           <span>: ₹{currentForm.advancePaid || '0.00'}</span>
//         </div>
//       )}
//       <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-semibold text-base text-black">
//         <span>🧾 {billingType === 'hospital' ? 'Amount Payable' : 'Grand Total'}</span>
//         <span>: ₹{billingType === 'hospital' ? currentForm.amountPayable || '0.00' : currentForm.grandTotal || '0.00'}</span>
//       </div>
//     </div>
//   </div>

//   {/* Footer */}
//   <div className="bg-gray-100 text-center py-4 border-t border-gray-300 text-xs text-gray-700">
//     <p className="font-semibold">AV Hospital - Digital Healthcare Solutions</p>
//     <p>Thank you for choosing our services</p>
//   </div>
// </div>

//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <button
//                   onClick={handleCancel}
//                   className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
//                 >
//                   <ArrowLeft className="w-5 h-5" />
//                   <span>Back</span>
//                 </button>
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     {getBillingIcon()}
//                   </div>
//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-900">{getBillingTitle()}</h1>
//                     <p className="text-sm text-gray-600">Create comprehensive billing record</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <div className="flex items-center space-x-2 text-sm text-gray-600">
//                   <Clock className="w-4 h-4" />
//                   <span>{currentForm.billingTime}</span>
//                 </div>
//                 <button
//                   onClick={openShareModal}
//                   className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <Share2 className="w-4 h-4" />
//                   <span>Preview & Share</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Form */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900">Billing Information</h2>
//             <p className="text-sm text-gray-600 mt-1">Fill in the comprehensive details below to create a professional billing record</p>
//           </div>

//           <form onSubmit={handleSubmit} className="p-6">
//             {renderForm()}

//             {/* Form Actions */}
//             <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={handleCancel}
//                 className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-white transition-colors ${
//                   isSubmitting 
//                     ? 'bg-blue-400 cursor-not-allowed' 
//                     : 'bg-blue-600 hover:bg-blue-700'
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     <span>Saving...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Save className="w-4 h-4" />
//                     <span>Save Billing Record</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Share Modal */}
//       {isShareModalOpen && (
//         <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-y-auto">
//             <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white">
//               <h3 className="text-xl font-semibold">Professional Billing Receipt</h3>
//               <button onClick={closeShareModal} className="text-white hover:text-gray-200">
//                 <X size={24} />
//               </button>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
//               {/* LEFT SIDE - Receipt Preview */}
//               <div className="p-4 rounded-lg flex flex-col items-center">
//                 <h3 className="text-sm font-semibold text-[#0E1630] mb-4">Receipt Preview</h3>
//                 <div className="w-full">
//                   {renderBillingPreview()}
//                 </div>
//               </div>

//               {/* RIGHT SIDE - Sharing Options */}
//               <div className="space-y-6">
//                 <h4 className="text-lg font-semibold text-[#0E1630]">Share Options</h4>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                     <Globe size={16} />
//                     Language
//                   </label>
//                   <select
//                     value={language}
//                     onChange={(e) => handleLanguageChange(e.target.value)}
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
//                   >
//                     <option value="English">English</option>
//                     <option value="Hindi">हिंदी (Hindi)</option>
//                     <option value="Marathi">मराठी (Marathi)</option>
//                     <option value="Gujarati">ગુજરાતી (Gujarati)</option>
//                     <option value="Tamil">தமிழ் (Tamil)</option>
//                     <option value="Telugu">తెలుగు (Telugu)</option>
//                     <option value="Bengali">বাংলা (Bengali)</option>
//                     <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
//                     <option value="Malayalam">മലയാളം (Malayalam)</option>
//                     <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
//                   </select>
//                   {isTranslating && (
//                     <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
//                       <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
//                       Translating content...
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//                   <input
//                     type="email"
//                     value={shareEmail}
//                     onChange={(e) => setShareEmail(e.target.value)}
//                     placeholder="Enter patient's email"
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
//                   <input
//                     type="tel"
//                     value={sharePhone}
//                     onChange={(e) => setSharePhone(e.target.value)}
//                     placeholder="Enter WhatsApp number (with country code)"
//                     className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
//                   />
//                 </div>

//                 <div className="flex flex-wrap gap-3">
//                   <a
//                     href={sharePhone ? getWhatsAppLink() : '#'}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
//                       sharePhone ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
//                     }`}
//                   >
//                     <Phone size={16} /> WhatsApp
//                   </a>
//                   <button
//                     disabled={!shareEmail}
//                     className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
//                       shareEmail ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                   >
//                     <Mail size={16} /> Email
//                   </button>
//                   <button 
//                     onClick={() => window.print()}
//                     className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
//                   >
//                     <Printer size={16} /> Print
//                   </button>
//                   <button 
//                     className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
//                   >
//                     <Download size={16} /> Download
//                   </button>
//                 </div>

//                 {/* Billing Summary */}
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h5 className="font-semibold text-gray-900 mb-3">Billing Summary</h5>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span>Subtotal:</span>
//                       <span>₹{currentForm.subtotal || '0.00'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Discount:</span>
//                       <span>₹{currentForm.discountAmount || '0.00'}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span>Tax:</span>
//                       <span>₹{currentForm.taxAmount || '0.00'}</span>
//                     </div>
//                     {billingType === 'hospital' && (
//                       <div className="flex justify-between">
//                         <span>Advance Paid:</span>
//                         <span>₹{currentForm.advancePaid || '0.00'}</span>
//                       </div>
//                     )}
//                     <div className="border-t pt-2 mt-2">
//                       <div className="flex justify-between font-bold text-lg">
//                         <span>{billingType === 'hospital' ? 'Amount Payable:' : 'Grand Total:'}</span>
//                         <span className="text-green-600">₹{billingType === 'hospital' ? currentForm.amountPayable || '0.00' : currentForm.grandTotal || '0.00'}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BillingForm;
























import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Calculator, 
  Receipt, 
  FileText, 
  Stethoscope,
  Share2,
  X,
  Globe,
  Phone,
  Mail,
  Printer,
  Download,
  Plus,
  Trash2,
  User,
  Calendar,
  CreditCard,
  Clock
} from 'lucide-react';

const BillingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const billingType = location.state?.billingType || 'pharmacy';

  // Patient info from navigation state (if available)
  const patientNameFromNav = location.state?.patientName || '';
  const patientIdFromNav = location.state?.patientId || '';
  const doctorNameFromNav = location.state?.doctorName || '';
  const phoneFromNav = location.state?.phone || '';
  const genderFromNav = location.state?.gender || '';
  const ageFromNav = location.state?.age || '';
  const addressFromNav = location.state?.address || '';
  const emailFromNav = location.state?.patientEmail || location.state?.email || '';

  // Enhanced form states for different billing types, pre-filling patient info
  const [formData, setFormData] = useState({
    pharmacy: {
      patientName: patientNameFromNav,
      patientId: patientIdFromNav,
      doctorName: doctorNameFromNav || 'Dr. Shital S. Shelke',
      prescriptionDate: new Date().toISOString().split('T')[0],
      billNo: `PH-BILL-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      medicines: [
        { id: 1, medicineName: '', quantity: '', unitPrice: '', total: '' }
      ],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 5,
      taxAmount: 0,
      grandTotal: 0,
      paymentMode: 'Cash',
      billingTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }),
      phone: phoneFromNav,
      gender: genderFromNav,
      age: ageFromNav,
      address: addressFromNav,
      email: emailFromNav
    },
    labs: {
      patientName: patientNameFromNav,
      patientId: patientIdFromNav,
      doctorName: doctorNameFromNav || 'Dr. Shital S. Shelke',
      date: new Date().toISOString().split('T')[0],
      labBillNo: `LAB-BILL-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      tests: [
        { id: 1, testName: '', rate: '', remarks: '' }
      ],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 5,
      taxAmount: 0,
      grandTotal: 0,
      paymentMode: 'Cash',
      billingTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }),
      phone: phoneFromNav,
      gender: genderFromNav,
      age: ageFromNav,
      address: addressFromNav,
      email: emailFromNav
    },
    hospital: {
      patientName: patientNameFromNav,
      patientId: patientIdFromNav,
      admissionDate: new Date().toISOString().split('T')[0],
      dischargeDate: new Date().toISOString().split('T')[0],
      billNo: `HOSP-BILL-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      roomType: 'Private AC',
      bedNo: '',
      charges: [
        { id: 1, category: 'Room Charges', description: '', amount: '' },
        { id: 2, category: 'Doctor Visit Fee', description: '', amount: '' },
        { id: 3, category: 'Nursing Charges', description: '', amount: '' },
        { id: 4, category: 'Lab Tests', description: '', amount: '' },
        { id: 5, category: 'Pharmacy Charges', description: '', amount: '' },
        { id: 6, category: 'Procedure Charges', description: '', amount: '' }
      ],
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 5,
      taxAmount: 0,
      advancePaid: 0,
      amountPayable: 0,
      paymentMode: 'Cash',
      billingTime: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      }),
      phone: phoneFromNav,
      gender: genderFromNav,
      age: ageFromNav,
      address: addressFromNav,
      email: emailFromNav
    }
  });

  const [currentForm, setCurrentForm] = useState(formData[billingType]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Share modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState(emailFromNav || '');
  const [sharePhone, setSharePhone] = useState(phoneFromNav || '');
  const [language, setLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);

  // Update form when billing type changes
  useEffect(() => {
    setCurrentForm(formData[billingType]);
    setErrors({});
  }, [billingType]);

  // Auto-calculate totals
  useEffect(() => {
    const calculateTotals = () => {
      let subtotal = 0;

      if (billingType === 'pharmacy') {
        subtotal = currentForm.medicines.reduce((sum, medicine) => {
          const total = parseFloat(medicine.quantity || 0) * parseFloat(medicine.unitPrice || 0);
          return sum + total;
        }, 0);
      } else if (billingType === 'labs') {
        subtotal = currentForm.tests.reduce((sum, test) => {
          return sum + parseFloat(test.rate || 0);
        }, 0);
      } else if (billingType === 'hospital') {
        subtotal = currentForm.charges.reduce((sum, charge) => {
          return sum + parseFloat(charge.amount || 0);
        }, 0);
      }

      const discountAmount = (subtotal * parseFloat(currentForm.discountPercent || 0)) / 100;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * parseFloat(currentForm.taxPercent || 0)) / 100;
      
      let finalAmount = taxableAmount + taxAmount;
      
      if (billingType === 'hospital') {
        finalAmount = finalAmount - parseFloat(currentForm.advancePaid || 0);
      }

      const newSubtotal = subtotal.toFixed(2);
      const newDiscountAmount = discountAmount.toFixed(2);
      const newTaxAmount = taxAmount.toFixed(2);
      const newFinalAmount = finalAmount.toFixed(2);

      // Only update if values have actually changed to prevent infinite loop
      if (
        currentForm.subtotal !== newSubtotal ||
        currentForm.discountAmount !== newDiscountAmount ||
        currentForm.taxAmount !== newTaxAmount ||
        (billingType === 'hospital' && currentForm.amountPayable !== newFinalAmount) ||
        (billingType !== 'hospital' && currentForm.grandTotal !== newFinalAmount)
      ) {
        setCurrentForm(prev => ({
          ...prev,
          subtotal: newSubtotal,
          discountAmount: newDiscountAmount,
          taxAmount: newTaxAmount,
          ...(billingType === 'hospital' 
            ? { amountPayable: newFinalAmount }
            : { grandTotal: newFinalAmount }
          )
        }));
      }
    };

    calculateTotals();
  }, [
    billingType,
    currentForm.medicines,
    currentForm.tests,
    currentForm.charges,
    currentForm.discountPercent,
    currentForm.taxPercent,
    currentForm.advancePaid
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index, field, value, itemType) => {
    const itemsKey = itemType === 'medicine' ? 'medicines' : 
                     itemType === 'test' ? 'tests' : 'charges';
    setCurrentForm(prev => ({
      ...prev,
      [itemsKey]: prev[itemsKey].map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          if (itemType === 'medicine' && (field === 'quantity' || field === 'unitPrice')) {
            const quantity = field === 'quantity' ? parseFloat(value || 0) : parseFloat(item.quantity || 0);
            const unitPrice = field === 'unitPrice' ? parseFloat(value || 0) : parseFloat(item.unitPrice || 0);
            updatedItem.total = (quantity * unitPrice).toFixed(2);
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const addItem = (itemType) => {
    const itemsKey = itemType === 'medicine' ? 'medicines' : 
                     itemType === 'test' ? 'tests' : 'charges';
    const newItem = itemType === 'medicine' 
      ? { id: Date.now(), medicineName: '', quantity: '', unitPrice: '', total: '' }
      : itemType === 'test'
      ? { id: Date.now(), testName: '', rate: '', remarks: '' }
      : { id: Date.now(), category: '', description: '', amount: '' };
    setCurrentForm(prev => ({
      ...prev,
      [itemsKey]: [...prev[itemsKey], newItem]
    }));
  };

  const removeItem = (index, itemType) => {
    const itemsKey = itemType === 'medicine' ? 'medicines' : 
                     itemType === 'test' ? 'tests' : 'charges';
    setCurrentForm(prev => ({
      ...prev,
      [itemsKey]: prev[itemsKey].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!currentForm.patientName?.trim()) newErrors.patientName = 'Patient name is required';
    if (!currentForm.patientId?.trim()) newErrors.patientId = 'Patient ID is required';

    if (billingType === 'pharmacy') {
      if (!currentForm.doctorName?.trim()) newErrors.doctorName = 'Doctor name is required';
      if (!currentForm.prescriptionDate) newErrors.prescriptionDate = 'Prescription date is required';
      currentForm.medicines.forEach((medicine, index) => {
        if (!medicine.medicineName?.trim()) {
          newErrors[`medicine_${index}_name`] = 'Medicine name is required';
        }
        if (!medicine.quantity || medicine.quantity <= 0) {
          newErrors[`medicine_${index}_quantity`] = 'Valid quantity is required';
        }
        if (!medicine.unitPrice || medicine.unitPrice <= 0) {
          newErrors[`medicine_${index}_price`] = 'Valid unit price is required';
        }
      });
    } else if (billingType === 'labs') {
      if (!currentForm.doctorName?.trim()) newErrors.doctorName = 'Doctor name is required';
      if (!currentForm.date) newErrors.date = 'Date is required';
      currentForm.tests.forEach((test, index) => {
        if (!test.testName?.trim()) {
          newErrors[`test_${index}_name`] = 'Test name is required';
        }
        if (!test.rate || test.rate <= 0) {
          newErrors[`test_${index}_rate`] = 'Valid rate is required';
        }
      });
    } else if (billingType === 'hospital') {
      if (!currentForm.admissionDate) newErrors.admissionDate = 'Admission date is required';
      if (!currentForm.dischargeDate) newErrors.dischargeDate = 'Discharge date is required';
      if (!currentForm.bedNo?.trim()) newErrors.bedNo = 'Bed number is required';
      currentForm.charges.forEach((charge, index) => {
        if (!charge.category?.trim()) {
          newErrors[`charge_${index}_category`] = 'Category is required';
        }
        if (!charge.description?.trim()) {
          newErrors[`charge_${index}_description`] = 'Description is required';
        }
        if (!charge.amount || charge.amount <= 0) {
          newErrors[`charge_${index}_amount`] = 'Valid amount is required';
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Submitting billing record:', currentForm, 'Type:', billingType);
      
      // Navigate back to medical records with success message and billing data
      navigate('/doctordashboard/medical-records', {
        state: {
          newBillingRecord: currentForm,
          billingType: billingType,
          success: true,
          message: `${billingType.charAt(0).toUpperCase() + billingType.slice(1)} billing record saved successfully!`,
          timestamp: new Date().toISOString(),
          // Pass patient info to help identify which patient record to update
          patientName: currentForm.patientName,
          patientId: currentForm.patientId,
          returnPath: '/doctordashboard/medical-records'
        }
      });
    } catch (error) {
      console.error('Error saving billing record:', error);
      alert('Error saving billing record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/doctordashboard/medical-records');
  };

  const openShareModal = () => {
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const handleLanguageChange = async (newLanguage) => {
    setLanguage(newLanguage);
    if (newLanguage !== 'English') {
      setIsTranslating(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTranslating(false);
    }
  };

  const getBillingIcon = () => {
    switch (billingType) {
      case 'pharmacy': return <Receipt className="w-6 h-6" />;
      case 'labs': return <FileText className="w-6 h-6" />;
      case 'hospital': return <Stethoscope className="w-6 h-6" />;
      default: return <Receipt className="w-6 h-6" />;
    }
  };

  const getBillingTitle = () => {
    switch (billingType) {
      case 'pharmacy': return 'Pharmacy Billing';
      case 'labs': return 'Lab Test Billing';
      case 'hospital': return 'Hospital Billing';
      default: return 'Billing';
    }
  };

  const getWhatsAppLink = () => {
    if (!sharePhone) return '#';
    let message = `*${getBillingTitle()} Receipt*\n\n`;
    message += `*Bill No:* ${currentForm.billNo || currentForm.labBillNo}\n`;
    message += `*Patient:* ${currentForm.patientName}\n`;
    message += `*Date:* ${currentForm.date || currentForm.prescriptionDate || currentForm.dischargeDate}\n\n`;
    if (billingType === 'pharmacy') {
      message += `*Medicines:*\n`;
      currentForm.medicines.forEach((med, index) => {
        message += `${index + 1}. ${med.medicineName} - Qty: ${med.quantity} - ₹${med.total}\n`;
      });
      message += `\n*Total Amount:* ₹${currentForm.grandTotal}\n`;
    } else if (billingType === 'labs') {
      message += `*Tests:*\n`;
      currentForm.tests.forEach((test, index) => {
        message += `${index + 1}. ${test.testName} - ₹${test.rate}\n`;
      });
      message += `\n*Total Amount:* ₹${currentForm.grandTotal}\n`;
    } else if (billingType === 'hospital') {
      message += `*Charges:*\n`;
      currentForm.charges.forEach((charge, index) => {
        if (charge.amount > 0) {
          message += `${index + 1}. ${charge.category} - ₹${charge.amount}\n`;
        }
      });
      message += `\n*Amount Payable:* ₹${currentForm.amountPayable}\n`;
    }
    message += `\n*AV Hospital*\nDigital Billing System`;
    return `https://wa.me/${sharePhone}?text=${encodeURIComponent(message)}`;
  };

  const renderPharmacyForm = () => (
    <div className="space-y-8">
      {/* Patient Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
            <input
              type="text"
              name="patientName"
              value={currentForm.patientName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patientName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter patient name"
            />
            {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID *</label>
            <input
              type="text"
              name="patientId"
              value={currentForm.patientId}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patientId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="PT-000456"
            />
            {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name *</label>
            <input
              type="text"
              name="doctorName"
              value={currentForm.doctorName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.doctorName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Dr. Shital S. Shelke"
            />
            {errors.doctorName && <p className="text-red-500 text-sm mt-1">{errors.doctorName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prescription Date *</label>
            <input
              type="date"
              name="prescriptionDate"
              value={currentForm.prescriptionDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.prescriptionDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.prescriptionDate && <p className="text-red-500 text-sm mt-1">{errors.prescriptionDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bill No.</label>
            <input
              type="text"
              name="billNo"
              value={currentForm.billNo}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Medicines */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Medicines</h3>
          <button
            type="button"
            onClick={() => addItem('medicine')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {currentForm.medicines.map((medicine, index) => (
            <div key={medicine.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
                  <input
                    type="text"
                    value={medicine.medicineName}
                    onChange={(e) => handleItemChange(index, 'medicineName', e.target.value, 'medicine')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`medicine_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Paracetamol 500mg"
                  />
                  {errors[`medicine_${index}_name`] && <p className="text-red-500 text-sm mt-1">{errors[`medicine_${index}_name`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={medicine.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value, 'medicine')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`medicine_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10"
                    min="1"
                  />
                  {errors[`medicine_${index}_quantity`] && <p className="text-red-500 text-sm mt-1">{errors[`medicine_${index}_quantity`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₹) *</label>
                  <input
                    type="number"
                    value={medicine.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value, 'medicine')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`medicine_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="5"
                    min="0"
                    step="0.01"
                  />
                  {errors[`medicine_${index}_price`] && <p className="text-red-500 text-sm mt-1">{errors[`medicine_${index}_price`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total (₹)</label>
                  <input
                    type="text"
                    value={medicine.total}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  {currentForm.medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index, 'medicine')}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Summary */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
            <input
              type="number"
              name="discountPercent"
              value={currentForm.discountPercent}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
            <input
              type="number"
              name="taxPercent"
              value={currentForm.taxPercent}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
            <select
              name="paymentMode"
              value={currentForm.paymentMode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grand Total (₹)</label>
            <div className="text-2xl font-bold text-green-600">₹{currentForm.grandTotal}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLabsForm = () => (
    <div className="space-y-8">
      {/* Patient Information */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
            <input
              type="text"
              name="patientName"
              value={currentForm.patientName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patientName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter patient name"
            />
            {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID *</label>
            <input
              type="text"
              name="patientId"
              value={currentForm.patientId}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patientId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="PT-000456"
            />
            {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name *</label>
            <input
              type="text"
              name="doctorName"
              value={currentForm.doctorName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.doctorName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Dr. S.K. Gupta"
            />
            {errors.doctorName && <p className="text-red-500 text-sm mt-1">{errors.doctorName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              name="date"
              value={currentForm.date}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lab Bill No.</label>
            <input
              type="text"
              name="labBillNo"
              value={currentForm.labBillNo}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Lab Tests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Lab Tests</h3>
          <button
            type="button"
            onClick={() => addItem('test')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Test</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {currentForm.tests.map((test, index) => (
            <div key={test.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Name *</label>
                  <input
                    type="text"
                    value={test.testName}
                    onChange={(e) => handleItemChange(index, 'testName', e.target.value, 'test')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`test_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="CBC"
                  />
                  {errors[`test_${index}_name`] && <p className="text-red-500 text-sm mt-1">{errors[`test_${index}_name`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rate (₹) *</label>
                  <input
                    type="number"
                    value={test.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value, 'test')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`test_${index}_rate`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="300"
                    min="0"
                    step="0.01"
                  />
                  {errors[`test_${index}_rate`] && <p className="text-red-500 text-sm mt-1">{errors[`test_${index}_rate`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <input
                    type="text"
                    value={test.remarks}
                    onChange={(e) => handleItemChange(index, 'remarks', e.target.value, 'test')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Fasting 8hrs"
                  />
                </div>
                <div className="flex items-end">
                  {currentForm.tests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index, 'test')}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Summary */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
            <input
              type="number"
              name="discountPercent"
              value={currentForm.discountPercent}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
            <input
              type="number"
              name="taxPercent"
              value={currentForm.taxPercent}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
            <select
              name="paymentMode"
              value={currentForm.paymentMode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grand Total (₹)</label>
            <div className="text-2xl font-bold text-green-600">₹{currentForm.grandTotal}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHospitalForm = () => (
    <div className="space-y-8">
      {/* Patient Information */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Patient Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
            <input
              type="text"
              name="patientName"
              value={currentForm.patientName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patientName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter patient name"
            />
            {errors.patientName && <p className="text-red-500 text-sm mt-1">{errors.patientName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID *</label>
            <input
              type="text"
              name="patientId"
              value={currentForm.patientId}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patientId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="PT-000456"
            />
            {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
            <select
              name="roomType"
              value={currentForm.roomType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="General">General</option>
              <option value="Private">Private</option>
              <option value="Private AC">Private AC</option>
              <option value="ICU">ICU</option>
              <option value="ICCU">ICCU</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bed No. *</label>
            <input
              type="text"
              name="bedNo"
              value={currentForm.bedNo}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bedNo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="302"
            />
            {errors.bedNo && <p className="text-red-500 text-sm mt-1">{errors.bedNo}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date *</label>
            <input
              type="date"
              name="admissionDate"
              value={currentForm.admissionDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.admissionDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.admissionDate && <p className="text-red-500 text-sm mt-1">{errors.admissionDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Date *</label>
            <input
              type="date"
              name="dischargeDate"
              value={currentForm.dischargeDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dischargeDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.dischargeDate && <p className="text-red-500 text-sm mt-1">{errors.dischargeDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bill No.</label>
            <input
              type="text"
              name="billNo"
              value={currentForm.billNo}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Hospital Charges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hospital Charges</h3>
          <button
            type="button"
            onClick={() => addItem('charge')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Charge</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {currentForm.charges.map((charge, index) => (
            <div key={charge.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <input
                    type="text"
                    value={charge.category}
                    onChange={(e) => handleItemChange(index, 'category', e.target.value, 'charge')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`charge_${index}_category`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Room Charges"
                  />
                  {errors[`charge_${index}_category`] && <p className="text-red-500 text-sm mt-1">{errors[`charge_${index}_category`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <input
                    type="text"
                    value={charge.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value, 'charge')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`charge_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="2 days x ₹2000"
                  />
                  {errors[`charge_${index}_description`] && <p className="text-red-500 text-sm mt-1">{errors[`charge_${index}_description`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    value={charge.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value, 'charge')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`charge_${index}_amount`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="4000"
                    min="0"
                    step="0.01"
                  />
                  {errors[`charge_${index}_amount`] && <p className="text-red-500 text-sm mt-1">{errors[`charge_${index}_amount`]}</p>}
                </div>
                <div className="flex items-end">
                  {currentForm.charges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index, 'charge')}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing Summary */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
            <input
              type="number"
              name="discountPercent"
              value={currentForm.discountPercent}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax (%)</label>
            <input
              type="number"
              name="taxPercent"
              value={currentForm.taxPercent}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Advance Paid (₹)</label>
            <input
              type="number"
              name="advancePaid"
              value={currentForm.advancePaid}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3000"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
            <select
              name="paymentMode"
              value={currentForm.paymentMode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount Payable (₹)</label>
            <div className="text-2xl font-bold text-green-600">₹{currentForm.amountPayable}</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => {
    switch (billingType) {
      case 'pharmacy': return renderPharmacyForm();
      case 'labs': return renderLabsForm();
      case 'hospital': return renderHospitalForm();
      default: return renderPharmacyForm();
    }
  };

  const renderBillingPreview = () => {
    return (
      <div className="bg-white border border-gray-300 rounded-2xl shadow-xl overflow-hidden max-w-3xl mx-auto text-sm font-mono">
  {/* Header */}
  <div className="border-b border-gray-300 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200">
    <div className="border border-gray-400 rounded-md p-3 text-center">
      <h2 className="text-xl font-semibold tracking-wide text-gray-800 uppercase">
        {billingType === 'pharmacy' ? 'Pharmacy Billing' :
         billingType === 'labs' ? 'Lab Billing' :
         'Hospital Billing Summary'}
      </h2>
    </div>
  </div>

  {/* Patient Details */}
  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
    <div className="grid grid-cols-2 gap-6 text-[13px]">
      <div className="space-y-1 text-gray-700">
        <p><strong>Patient Name:</strong> {currentForm.patientName || 'Patient Name'}</p>
        <p><strong>Patient ID:</strong> {currentForm.patientId || 'PT-000456'}</p>
        {billingType === 'pharmacy' && (
          <>
            <p><strong>Prescription Date:</strong> {currentForm.prescriptionDate ? new Date(currentForm.prescriptionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '31-Jul-2025'}</p>
            <p><strong>Doctor Name:</strong> {currentForm.doctorName || 'Dr. S.K. Gupta'}</p>
          </>
        )}
        {billingType === 'labs' && (
          <>
            <p><strong>Date:</strong> {currentForm.date ? new Date(currentForm.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '31-Jul-2025'}</p>
            <p><strong>Doctor Name:</strong> {currentForm.doctorName || 'Dr. S.K. Gupta'}</p>
          </>
        )}
        {billingType === 'hospital' && (
          <>
            <p><strong>Admission Date:</strong> {currentForm.admissionDate ? new Date(currentForm.admissionDate).toLocaleDateString('en-GB') : '29-Jul-2025'}</p>
            <p><strong>Discharge Date:</strong> {currentForm.dischargeDate ? new Date(currentForm.dischargeDate).toLocaleDateString('en-GB') : '31-Jul-2025'}</p>
            <p><strong>Room Type:</strong> {currentForm.roomType || 'Private AC'}</p>
            <p><strong>Bed No:</strong> {currentForm.bedNo || '302'}</p>
          </>
        )}
      </div>
      <div className="space-y-1 text-right text-gray-700">
        <p><strong>Bill No:</strong> {currentForm.billNo || currentForm.labBillNo || 'BILL-000123'}</p>
        <p><strong>💳 Payment Mode:</strong> {currentForm.paymentMode || 'Cash'}</p>
        <p><strong>🕒 Billing Time:</strong> {currentForm.billingTime || '11:45 AM'}</p>
      </div>
    </div>
  </div>

  {/* Items Table */}
  <div className="p-6">
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {billingType === 'pharmacy' && (
        <table className="w-full text-[13px]">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="p-2 border-r">S.No</th>
              <th className="p-2 border-r">Medicine Name</th>
              <th className="text-center p-2 border-r">Qty</th>
              <th className="text-right p-2 border-r">Unit Price</th>
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {currentForm.medicines.map((med, index) => (
              <tr key={index} className="border-t text-gray-700">
                <td className="p-2 border-r">{index + 1}</td>
                <td className="p-2 border-r">{med.medicineName || `Medicine ${index + 1}`}</td>
                <td className="text-center p-2 border-r">{med.quantity || '0'}</td>
                <td className="text-right p-2 border-r">₹{med.unitPrice || '0'}</td>
                <td className="text-right p-2">₹{med.total || '0'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {billingType === 'labs' && (
        <table className="w-full text-[13px]">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="p-2 border-r">S.No</th>
              <th className="p-2 border-r">Lab Test Name</th>
              <th className="text-right p-2 border-r">Rate</th>
              <th className="p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {currentForm.tests.map((test, index) => (
              <tr key={index} className="border-t text-gray-700">
                <td className="p-2 border-r">{index + 1}</td>
                <td className="p-2 border-r">{test.testName || `Test ${index + 1}`}</td>
                <td className="text-right p-2 border-r">₹{test.rate || '0'}</td>
                <td className="p-2">{test.remarks || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {billingType === 'hospital' && (
        <table className="w-full text-[13px]">
          <thead className="bg-gray-100 text-left text-gray-700">
            <tr>
              <th className="p-2 border-r">Category</th>
              <th className="p-2 border-r">Description</th>
              <th className="text-right p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentForm.charges.map((item, index) => (
              item.amount > 0 && (
                <tr key={index} className="border-t text-gray-700">
                  <td className="p-2 border-r">{item.category || `Category ${index + 1}`}</td>
                  <td className="p-2 border-r">{item.description || `Description ${index + 1}`}</td>
                  <td className="text-right p-2">₹{item.amount || '0'}</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>

  {/* Billing Summary */}
  <div className="px-6 py-4 bg-gray-50 border-t border-gray-300">
    <div className="space-y-1 text-sm text-gray-800">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>: ₹{currentForm.subtotal || '0.00'}</span>
      </div>
      <div className="flex justify-between">
        <span>Discount ({currentForm.discountPercent || 0}%)</span>
        <span>: ₹{currentForm.discountAmount || '0.00'}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax ({currentForm.taxPercent || 0}%)</span>
        <span>: ₹{currentForm.taxAmount || '0.00'}</span>
      </div>
      {billingType === 'hospital' && (
        <div className="flex justify-between">
          <span>Advance Paid</span>
          <span>: ₹{currentForm.advancePaid || '0.00'}</span>
        </div>
      )}
      <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-semibold text-base text-black">
        <span>🧾 {billingType === 'hospital' ? 'Amount Payable' : 'Grand Total'}</span>
        <span>: ₹{billingType === 'hospital' ? currentForm.amountPayable || '0.00' : currentForm.grandTotal || '0.00'}</span>
      </div>
    </div>
  </div>

  {/* Footer */}
  <div className="bg-gray-100 text-center py-4 border-t border-gray-300 text-xs text-gray-700">
    <p className="font-semibold">AV Hospital - Digital Healthcare Solutions</p>
    <p>Thank you for choosing our services</p>
  </div>
</div>

    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getBillingIcon()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{getBillingTitle()}</h1>
                    <p className="text-sm text-gray-600">Create comprehensive billing record</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{currentForm.billingTime}</span>
                </div>
                <button
                  onClick={openShareModal}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Preview & Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Billing Information</h2>
            <p className="text-sm text-gray-600 mt-1">Fill in the comprehensive details below to create a professional billing record</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {renderForm()}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-white transition-colors ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Billing Record</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full mx-4 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#01D48C] to-[#0E1630] text-white">
              <h3 className="text-xl font-semibold">Professional Billing Receipt</h3>
              <button onClick={closeShareModal} className="text-white hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
              {/* LEFT SIDE - Receipt Preview */}
              <div className="p-4 rounded-lg flex flex-col items-center">
                <h3 className="text-sm font-semibold text-[#0E1630] mb-4">Receipt Preview</h3>
                <div className="w-full">
                  {renderBillingPreview()}
                </div>
              </div>

              {/* RIGHT SIDE - Sharing Options */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-[#0E1630]">Share Options</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Globe size={16} />
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                    <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Bengali">বাংলা (Bengali)</option>
                    <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                    <option value="Malayalam">മലയാളം (Malayalam)</option>
                    <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                  </select>
                  {isTranslating && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      Translating content...
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter patient's email"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={sharePhone}
                    onChange={(e) => setSharePhone(e.target.value)}
                    placeholder="Enter WhatsApp number (with country code)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#01D48C]"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={sharePhone ? getWhatsAppLink() : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      sharePhone ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    <Phone size={16} /> WhatsApp
                  </a>
                  <button
                    disabled={!shareEmail}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      shareEmail ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Mail size={16} /> Email
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                  >
                    <Printer size={16} /> Print
                  </button>
                  <button 
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    <Download size={16} /> Download
                  </button>
                </div>

                {/* Billing Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-900 mb-3">Billing Summary</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{currentForm.subtotal || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>₹{currentForm.discountAmount || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{currentForm.taxAmount || '0.00'}</span>
                    </div>
                    {billingType === 'hospital' && (
                      <div className="flex justify-between">
                        <span>Advance Paid:</span>
                        <span>₹{currentForm.advancePaid || '0.00'}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>{billingType === 'hospital' ? 'Amount Payable:' : 'Grand Total:'}</span>
                        <span className="text-green-600">₹{billingType === 'hospital' ? currentForm.amountPayable || '0.00' : currentForm.grandTotal || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingForm;