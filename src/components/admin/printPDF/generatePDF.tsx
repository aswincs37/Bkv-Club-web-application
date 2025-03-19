import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Member } from "../AdminHomePage/AdminHomePage";

// Function to generate PDF for member details
export const generateMemberPDF = (member: Member) => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Add logo if available - you'll need to replace with your actual logo path
  try {
    // You can replace this with your actual logo path or base64 string
    const logoPath = "/logo.png"; // Update this with your actual logo path
    doc.addImage(logoPath, "PNG", 10, 10, 20, 20);
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
  }

  // Add styled header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 20, 20); // Red color for the heading
  doc.text("BHAGATH SINGH KALAVEDHÍ VAZHAKKAD", 105, 15, { align: "center" });

  // Add address and registration details
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.text("Vazhakkad, Thottakam P.O., Vaikom - 686 607", 105, 20, { align: "center" });
  doc.text("Regi. No. K. 202/87", 105, 24, { align: "center" });

  // Add affiliations
  doc.setFontSize(7);
  doc.text("Affiliated by: Kerala Sangeetha Nataka Academy (Reg. No. 55/KTM/88),", 105, 28, { align: "center" });
  doc.text("Nehru Yuva Kendra, Kerala State Youth Welfare Board.", 105, 32, { align: "center" });

  // Add email
  doc.setTextColor(0, 0, 255); // Blue for email
  doc.text("E-mail: bhagathsinghkalavedi@gmail.com", 105, 36, { align: "center" });
  doc.setTextColor(0, 0, 0); // Reset to black

  // Add red underline
  doc.setDrawColor(220, 20, 20); // Red for underline
  doc.setLineWidth(0.5);
  doc.line(10, 40, 200, 40);

  // Add document title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("MEMBER CERTIFICATE", 105, 48, { align: "center" });

  // Add member ID and status badge
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Member ID: ${member.memberId || "N/A"}`, 20, 55);

  const statusColors = {
    accepted: "#4CAF50",
    pending: "#FFC107",
    rejected: "#F44336",
    banned: "#9C27B0"
  };

  const statusText = `Status: ${member.status.charAt(0).toUpperCase() + member.status.slice(1)}`;
  doc.setTextColor(statusColors[member.status] || "#000000");
  doc.text(statusText, 190, 55, { align: "right" });
  doc.setTextColor(0, 0, 0); // Reset text color

  // Add rectangular border around the content
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(10, 60, 190, 215);

  // Add profile photo if available - with better error handling
  if (member.photoUrl) {
    try {
      // For base64 images, remove the data URL prefix if present
      const imgData = member.photoUrl.includes('data:image')
        ? member.photoUrl
        : `data:image/jpeg;base64,${member.photoUrl}`;

      doc.addImage(imgData, "JPEG", 150, 65, 40, 40);

      // Add border around photo
      doc.setDrawColor(128, 128, 128);
      doc.setLineWidth(0.2);
      doc.rect(150, 65, 40, 40);
    } catch (error) {
      console.error("Error adding profile photo to PDF:", error);
      // Draw placeholder on error
      doc.setDrawColor(200, 200, 200);
      doc.rect(150, 65, 40, 40);
      doc.setFontSize(8);
      doc.text("Photo error", 170, 85, { align: "center" });
    }
  } else {
    // Draw placeholder for photo
    doc.setDrawColor(200, 200, 200);
    doc.rect(150, 65, 40, 40);
    doc.setFontSize(8);
    doc.text("Photo not available", 170, 85, { align: "center" });
  }

  // Member personal details section with styled heading
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 65, 120, 8, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 102); // Navy blue
  doc.text("Personal Information", 80, 71, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0); // Reset text color
  doc.setFontSize(10);

  const personalInfo = [
    ["Full Name", member.fullName || "N/A"],
    ["Father's Name", member.fatherName || "N/A"],
    ["Gender", member.gender || "N/A"],
    ["Age", member.age || "N/A"],
    ["Blood Group", member.bloodGroup || "N/A"],
    ["Phone Number", member.phoneNumber || "N/A"],
    ["Email", member.email || "N/A"]
  ];

  let yPosition = 80;
  personalInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}: `, 20, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(`${value}`, 60, yPosition);
    yPosition += 7;
  });

  // Address and education section with styled heading
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 130, 170, 8, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 102); // Navy blue
  doc.text("Address & Education", 105, 136, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0); // Reset text color
  doc.setFontSize(10);

  // Multi-line text for address
  const addressLines = doc.splitTextToSize(member.address || "N/A", 130);
  doc.setFont("helvetica", "bold");
  doc.text("Address: ", 20, 145);
  doc.setFont("helvetica", "normal");
  doc.text(addressLines, 60, 145);

  const educationLines = doc.splitTextToSize(member.education || "N/A", 130);
  doc.setFont("helvetica", "bold");
  doc.text("Education: ", 20, 155 + (addressLines.length - 1) * 5);
  doc.setFont("helvetica", "normal");
  doc.text(educationLines, 60, 155 + (addressLines.length - 1) * 5);

  // Additional details
  let additionalYPos = 165 + (addressLines.length - 1) * 5 + (educationLines.length - 1) * 5;

  // Additional information section with styled heading
  doc.setFillColor(240, 240, 240);
  doc.rect(20, additionalYPos, 170, 8, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 102); // Navy blue
  doc.text("Additional Information", 105, additionalYPos + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0); // Reset text color
  doc.setFontSize(10);

  additionalYPos += 15;

  const additionalInfo = [
    ["Occupation", member.job || "N/A"],
    ["Any Club Member", member.isClubMember === "yes" ? "Yes" : "No"],
    ["Nominee Name", member.nomineeName || "N/A"],
    ["Criminal Case", member.hasCriminalCase === "yes" ? "Yes" : "No"],
    ["Hobbies", member.hobbies || "N/A"]
  ];

  additionalInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}: `, 20, additionalYPos);
    doc.setFont("helvetica", "normal");
    doc.text(`${value}`, 60, additionalYPos);
    additionalYPos += 7;
  });

  // Add affidavit section with styled heading
  additionalYPos += 5;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, additionalYPos, 170, 8, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 51, 102); // Navy blue
  doc.text("Member Declaration", 105, additionalYPos + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0); // Reset text color
  doc.setFontSize(10);

  additionalYPos += 15;

  const affidavitText = "I hereby certify that the information given above is true and that I am working in accordance with the rules and regulations of the Kalavedi and that if my performance is not efficient I may be subject to disciplinary action by the Committee.";

  const affidavitLines = doc.splitTextToSize(affidavitText, 170);
  doc.text(affidavitLines, 20, additionalYPos);

  additionalYPos += (affidavitLines.length * 5) + 15;

  // Add signature with better positioning and handling
  if (member.signatureUrl) {
    try {
      // For base64 images, remove the data URL prefix if present
      const sigData = member.signatureUrl.includes('data:image')
        ? member.signatureUrl
        : `data:image/jpeg;base64,${member.signatureUrl}`;

      doc.addImage(sigData, "JPEG", 130, additionalYPos - 15, 50, 20);
      doc.text("Signature", 155, additionalYPos + 10, { align: "center" });

      // Add border around signature
      doc.setDrawColor(128, 128, 128);
      doc.setLineWidth(0.2);
      doc.rect(130, additionalYPos - 15, 50, 20);
    } catch (error) {
      console.error("Error adding signature to PDF:", error);
      // Draw placeholder on error
      doc.setDrawColor(200, 200, 200);
      doc.rect(130, additionalYPos - 15, 50, 20);
      doc.setFontSize(8);
      doc.text("Signature error", 155, additionalYPos - 5, { align: "center" });
    }
  } else {
    // Draw placeholder for signature
    doc.setDrawColor(200, 200, 200);
    doc.rect(130, additionalYPos - 15, 50, 20);
    doc.setFontSize(8);
    doc.text("Signature not available", 155, additionalYPos - 5, { align: "center" });
  }

  // Official stamp and seal section
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Committee Approval", 40, additionalYPos + 10, { align: "center" });

  // Draw circle for stamp
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.circle(40, additionalYPos - 5, 15);
  doc.setFontSize(7);
  doc.text("Official Seal", 40, additionalYPos - 5, { align: "center" });

  // Add footer with styled line
  doc.setDrawColor(220, 20, 20); // Red for footer line
  doc.setLineWidth(0.5);
  doc.line(10, 280, 200, 280);

  doc.setFontSize(8);
  const currentDate = new Date().toLocaleDateString();
  doc.text(`Generated on: ${currentDate}`, 20, 285);
  doc.setFont("helvetica", "bold");
  doc.text("BHAGATH SINGH KALAVEDHÍ VAZHAKKAD", 105, 285, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("Page 1 of 1", 190, 285, { align: "right" });

  // Save the PDF
  doc.save(`${member.fullName}_BKV_Member_Certificate.pdf`);

  return true;
};

// Helper function to properly handle image data from Firebase Storage
export const prepareImageForPDF = async (imageUrl: string): Promise<string> => {
  try {
    // If it's already a base64 string
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }

    // If it's a URL, fetch it and convert to base64
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error preparing image for PDF:", error);
    return '';
  }
};

// Enhanced function to replace the placeholder in your code
export const generatePDF = async (member: Member) => {
  console.log("Generating PDF for member:", member.fullName);

  try {
    // Prepare images if they exist
    if (member.photoUrl && !member.photoUrl.startsWith('data:image')) {
      member.photoUrl = await prepareImageForPDF(member.photoUrl);
    }

    if (member.signatureUrl && !member.signatureUrl.startsWith('data:image')) {
      member.signatureUrl = await prepareImageForPDF(member.signatureUrl);
    }

    const success = generateMemberPDF(member);

    if (success) {
      // Show success message
      alert(`Certificate for ${member.fullName} has been generated successfully!`);
      return true;
    }
  } catch (error) {
    console.error("Error in PDF generation:", error);
    alert(`Error generating certificate for ${member.fullName}. Please try again.`);
    return false;
  }
};

// For testing - You can remove this in production
export const testPDF = () => {
  const testMember: Member = {
    id: "test123",
    fullName: "Test Member",
    email: "test@example.com",
    phoneNumber: "9876543210",
    status: "accepted",
    address: "Test Address, City, State, PIN",
    age: "30",
    bloodGroup: "O+",
    fatherName: "Test Father",
    gender: "Male",
    hasCriminalCase: "no",
    hobbies: "Reading, Sports",
    isClubMember: "yes",
    job: "Engineer",
    memberId: "BKV2023001",
    nomineeName: "Test Nominee",
    education: "Bachelor of Engineering",
    createdBy: "admin",
    // Add placeholder images for testing
    photoUrl: "",
    signatureUrl: ""
  };

  return generateMemberPDF(testMember);
};