// WhatsApp API utility functions
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';

const WHATSAPP_API_BASE = 'https://api.whatsapp.com/send';

// Format phone number automatically
export const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/[^0-9]/g, '');
  
  // If it starts with 91, keep as is
  if (cleaned.startsWith('91')) {
    return cleaned;
  }
  
  // If it's 10 digits, add 91 prefix
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  
  // Return as is for other cases
  return cleaned;
};

// Validate phone number
export const validatePhoneNumber = (phoneNumber) => {
  try {
    const formatted = formatPhoneNumber(phoneNumber);
    return isValidPhoneNumber(`+${formatted}`, 'IN');
  } catch (error) {
    return false;
  }
};

// Convert HTML to image using html2canvas
export const convertToImage = async (element) => {
  const html2canvas = (await import('html2canvas')).default;
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight
  });
  
  return canvas.toDataURL('image/png', 0.9);
};

// Generate PDF template
export const generatePDFTemplate = async (displayData, medicalRecordElement) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Add hospital header
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AV Hospital Medical Record', 105, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('District Hospital Dharwad Karnataka', 105, 30, { align: 'center' });
  
  // Add patient information
  let yPos = 50;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Patient Information:', 20, yPos);
  
  yPos += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${displayData.patientName || 'N/A'}`, 20, yPos);
  yPos += 7;
  pdf.text(`Gender: ${displayData.gender || 'N/A'}`, 20, yPos);
  yPos += 7;
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
  
  // Add medical details
  yPos += 15;
  const medicalFields = [
    { label: 'Chief Complaint', value: displayData.chiefComplaint },
    { label: 'Past Medical History', value: displayData.pastHistory },
    { label: 'Initial Assessment', value: displayData.initialAssessment },
    { label: 'Systematic Examination', value: displayData.systematicExamination },
    { label: 'Investigations', value: displayData.investigations },
    { label: 'Treatment Advice', value: displayData.treatmentAdvice },
    { label: 'Treatment Given', value: displayData.treatmentGiven },
    { label: 'Diagnosis', value: displayData.diagnosis },
    { label: 'Doctor\'s Notes', value: displayData.doctorsNotes }
  ];

  medicalFields.forEach(field => {
    if (field.value) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${field.label}:`, 20, yPos);
      yPos += 7;
      pdf.setFont('helvetica', 'normal');
      
      // Handle long text with word wrapping
      const lines = pdf.splitTextToSize(field.value, 170);
      lines.forEach(line => {
        if (yPos > 270) { // Add new page if needed
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line, 20, yPos);
        yPos += 5;
      });
      yPos += 5;
    }
  });

  // Add signature area
  yPos += 20;
  pdf.setFont('helvetica', 'normal');
  pdf.text('Doctor Signature: ____________________', 20, yPos);
  yPos += 10;
  pdf.text('Dr. Shital S Shelke', 20, yPos);

  // Convert to blob and create download URL
  const pdfBlob = pdf.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  
  return {
    url: url,
    filename: `medical-record-${displayData.patientName || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`,
    blob: pdfBlob
  };
};

// Generate DOC template (HTML format that opens in Word)
export const generateDOCTemplate = async (displayData) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Medical Record - ${displayData.patientName || 'Patient'}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .section { margin-bottom: 15px; }
        .label { font-weight: bold; }
        .signature { margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>AV Hospital Medical Record</h1>
        <p>District Hospital Dharwad Karnataka</p>
      </div>
      
      <div class="section">
        <h3>Patient Information</h3>
        <p><span class="label">Name:</span> ${displayData.patientName || 'N/A'}</p>
        <p><span class="label">Gender:</span> ${displayData.gender || 'N/A'}</p>
        <p><span class="label">Date:</span> ${new Date().toLocaleDateString()}</p>
      </div>
      
      ${displayData.chiefComplaint ? `
      <div class="section">
        <p><span class="label">Chief Complaint:</span></p>
        <p>${displayData.chiefComplaint}</p>
      </div>` : ''}
      
      ${displayData.pastHistory ? `
      <div class="section">
        <p><span class="label">Past Medical History:</span></p>
        <p>${displayData.pastHistory}</p>
      </div>` : ''}
      
      ${displayData.initialAssessment ? `
      <div class="section">
        <p><span class="label">Initial Assessment:</span></p>
        <p>${displayData.initialAssessment}</p>
      </div>` : ''}
      
      ${displayData.systematicExamination ? `
      <div class="section">
        <p><span class="label">Systematic Examination:</span></p>
        <p>${displayData.systematicExamination}</p>
      </div>` : ''}
      
      ${displayData.investigations ? `
      <div class="section">
        <p><span class="label">Investigations:</span></p>
        <p>${displayData.investigations}</p>
      </div>` : ''}
      
      ${displayData.treatmentAdvice ? `
      <div class="section">
        <p><span class="label">Treatment Advice:</span></p>
        <p>${displayData.treatmentAdvice}</p>
      </div>` : ''}
      
      ${displayData.treatmentGiven ? `
      <div class="section">
        <p><span class="label">Treatment Given:</span></p>
        <p>${displayData.treatmentGiven}</p>
      </div>` : ''}
      
      ${displayData.diagnosis ? `
      <div class="section">
        <p><span class="label">Diagnosis:</span></p>
        <p>${displayData.diagnosis}</p>
      </div>` : ''}
      
      ${displayData.doctorsNotes ? `
      <div class="section">
        <p><span class="label">Doctor's Notes:</span></p>
        <p>${displayData.doctorsNotes}</p>
      </div>` : ''}
      
      <div class="signature">
        <p>Doctor Signature: ____________________</p>
        <p>Dr. Shital S Shelke</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  
  return {
    url: url,
    filename: `medical-record-${displayData.patientName || 'patient'}-${new Date().toISOString().split('T')[0]}.doc`,
    blob: blob
  };
};

// Generate WhatsApp message with medical record data
export const generateWhatsAppMessage = (patientData, displayData) => {
  const { patientName, gender, doctorName } = displayData;
  let message = `🏥 *AV Hospital Medical Record*\n`;
  message += `📋 *Patient Details*\n`;
  message += `👤 *Name:* ${patientName || 'Not provided'}\n`;
  message += `⚥ *Gender:* ${gender || 'Not provided'}\n`;
  message += `👨‍⚕️ *Doctor:* ${doctorName || 'Dr. Shital S Shelke'}\n`;
  message += `📅 *Date:* ${new Date().toLocaleDateString()}\n\n`;

  // Clinical Information
  if (displayData.chiefComplaint) {
    message += `🩺 *Chief Complaint:*\n${displayData.chiefComplaint}\n\n`;
  }
  
  if (displayData.diagnosis) {
    message += `🔍 *Diagnosis:*\n${displayData.diagnosis}\n\n`;
  }
  
  if (displayData.treatmentAdvice) {
    message += `💊 *Treatment Advice:*\n${displayData.treatmentAdvice}\n\n`;
  }
  
  if (displayData.doctorsNotes) {
    message += `📝 *Doctor's Notes:*\n${displayData.doctorsNotes}\n\n`;
  }

  message += `\n📱 *Sent via AV Hospital Digital System*`;
  message += `\n⚠️ *Note:* This is an official medical record. Please keep it safe for future reference.`;
  
  return encodeURIComponent(message);
};

// Send message via WhatsApp Web
export const sendWhatsAppMessage = (phoneNumber, message) => {
  // Format phone number
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  const whatsappURL = `${WHATSAPP_API_BASE}?phone=${formattedPhone}&text=${message}`;
  
  // Open WhatsApp in new tab
  window.open(whatsappURL, '_blank');
};

// Open WhatsApp chat directly without pre-filled message
export const openWhatsAppChat = (phoneNumber) => {
  // Format phone number
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  // Open WhatsApp chat directly
  const whatsappURL = `https://wa.me/${formattedPhone}`;
  
  // Open WhatsApp in new tab
  window.open(whatsappURL, '_blank');
};

// Send message with medical record image and template
export const sendWhatsAppWithImage = async (phoneNumber, message, medicalRecordElement, templateFile = null) => {
  try {
    // Convert medical record to image
    const imageDataUrl = await convertToImage(medicalRecordElement);
    
    // Open WhatsApp with text message
    sendWhatsAppMessage(phoneNumber, message);
    
    // Download the medical record image
    const link = document.createElement('a');
    link.download = 'medical-record.png';
    link.href = imageDataUrl;
    link.click();
    
    // Download template file if provided
    if (templateFile) {
      const templateLink = document.createElement('a');
      templateLink.download = templateFile.filename;
      templateLink.href = templateFile.url;
      templateLink.click();
    }
    
    return { success: true, message: 'WhatsApp opened and files downloaded' };
  } catch (error) {
    console.error('Error sending WhatsApp with image:', error);
    return { success: false, error: error.message };
  }
};

// Alternative: Use WhatsApp Business API (requires setup)
export const sendWhatsAppBusinessAPI = async (phoneNumber, message, imageBase64 = null) => {
  try {
    // This is a placeholder for WhatsApp Business API
    // You would need to replace with your actual API endpoint
    const response = await fetch('https://your-whatsapp-api-endpoint.com/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_TOKEN'
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message: message,
        image: imageBase64
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('WhatsApp API Error:', error);
    throw error;
  }
};

// Free alternative using CallMeBot API (limited but free)
export const sendWhatsAppViaCallMeBot = async (phoneNumber, message) => {
  try {
    // Note: This requires registration at callmebot.com
    const apiKey = 'YOUR_CALLMEBOT_API_KEY'; // Get from callmebot.com
    const cleanPhone = formatPhoneNumber(phoneNumber);
    
    const response = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`);
    
    if (response.ok) {
      return { success: true, message: 'Message sent successfully' };
    } else {
      throw new Error('Failed to send message');
    }
  } catch (error) {
    console.error('CallMeBot API Error:', error);
    return { success: false, error: error.message };
  }
};

// Twilio WhatsApp API integration (requires Twilio account)
export const sendWhatsAppViaTwilio = async (phoneNumber, message) => {
  try {
    const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
    const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
    const fromNumber = 'whatsapp:+14155238886'; // Twilio Sandbox number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: `whatsapp:+${formattedPhone}`,
        Body: message
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Twilio API Error:', error);
    throw error;
  }
};












