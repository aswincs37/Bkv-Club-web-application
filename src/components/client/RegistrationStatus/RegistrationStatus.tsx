"use client"
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { UserX } from 'lucide-react';
import Link from 'next/link';

// Define the theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '10px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// TypeScript interface for Member (to match PDF generation function)
interface Member {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: 'accepted' | 'pending' | 'rejected' | 'banned';
  address?: string;
  age?: string;
  bloodGroup?: string;
  fatherName?: string;
  gender?: string;
  hasCriminalCase?: string;
  hobbies?: string;
  isClubMember?: string;
  job?: string;
  memberId: string;
  nomineeName?: string;
  education?: string;
  photoUrl?: string;
  signatureUrl?: string;
  createdBy?: string;
  registrationDate?: string;
  message?: string;
  customMessage?: string;
}

// TypeScript interface for registration status
interface RegistrationStatus {
  id: string;
  status: 'accepted' | 'pending' | 'rejected' | 'banned';
  name: string;
  email: string;
  date: string;
  message?: string;
  memberId: string;
  applicationUrl?: string;
}

// Helper function to prepare image for PDF
const prepareImageForPDF = async (imageUrl: string): Promise<string> => {
  try {
    // If it's already a base64 string
    if (imageUrl && imageUrl.startsWith('data:image')) {
      return imageUrl;
    }

    // If it's a URL, fetch it and convert to base64
    if (imageUrl) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    return '';
  } catch (error) {
    console.error("Error preparing image for PDF:", error);
    return '';
  }
};

// Function to generate PDF for member details
const generateMemberPDF = (member: Member) => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // Add logo if available
  try {
    const logoPath = "/logo.png";
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

  const statusColors: {[key: string]: string} = {
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

  // Add profile photo if available
  if (member.photoUrl) {
    try {
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

// Function to fetch registration status from Firestore
const checkRegistrationStatus = async (memberId: string): Promise<RegistrationStatus> => {
    try {
        const q = query(collection(db, "members"), where("memberId", "==", memberId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();

            const registrationData: RegistrationStatus = {
                id: docSnap.id,
                memberId: data.memberId,
                status: data.status || "pending",
                name: data.fullName || "Unknown",
                email: data.email || "No email provided",
                date: data.registrationDate
                    ? new Date(data.registrationDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                message: data.message || getStatusMessage(data.status, data.customMessage),
                applicationUrl: data.applicationUrl || null,
            };

            return registrationData;
        } else {
            return Promise.reject("Registration ID not found");
        }
    } catch (error) {
        console.log(error)
        return Promise.reject("Error fetching registration status");

    }
};

// Function to fetch complete member data for PDF generation
const fetchMemberData = async (memberId: string): Promise<Member> => {
    try {
        const q = query(collection(db, "members"), where("memberId", "==", memberId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data() as Member;
            data.id = docSnap.id;

            return data;
        } else {
            return Promise.reject("Member data not found");
        }
    } catch (error) {
        console.error("Error fetching member data:", error);
        return Promise.reject("Error fetching member data");
    }
};

// Helper function to get appropriate message based on status
const getStatusMessage = (status: string, customMessage?: string): string => {
  if (customMessage) return customMessage;

  switch (status) {
    case 'accepted':
      return 'Your registration has been accepted. Welcome to Bhagathsingh Kalavedhi Vazhakkad !';
    case 'pending':
      return 'Your registration is currently being reviewed.';
    case 'rejected':
      return 'Your registration has been rejected. Please contact support for more information.';
    case 'banned':
      return 'Your registration has been canceled. Please contact support for more information.';
    default:
      return 'Status information not available.';
  }
};

// Function to generate and download PDF
const handleGeneratePDF = async (memberId: string): Promise<void> => {
  try {
    // Fetch complete member data
    const memberData = await fetchMemberData(memberId);

    // Prepare images if they exist
    if (memberData.photoUrl && !memberData.photoUrl.startsWith('data:image')) {
      memberData.photoUrl = await prepareImageForPDF(memberData.photoUrl);
    }

    if (memberData.signatureUrl && !memberData.signatureUrl.startsWith('data:image')) {
      memberData.signatureUrl = await prepareImageForPDF(memberData.signatureUrl);
    }

    // Generate PDF
    generateMemberPDF(memberData);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating the certificate. Please try again later.");
  }
};

const RegistrationStatus: React.FC = () => {
  const [registrationId, setRegistrationId] = useState('');
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationId.trim()) {
      setError('Please enter a registration ID');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const result = await checkRegistrationStatus(registrationId);
      setStatus(result);
    } catch (err) {
      console.log(err);
      setError('Registration ID not found. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!status?.memberId) return;

    setPdfLoading(true);
    try {
      await handleGeneratePDF(status.memberId);
    } finally {
      setPdfLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40 }} />;
      case 'pending':
        return <PendingIcon sx={{ color: 'warning.main', fontSize: 40 }} />;
      case 'rejected':
        return <UserX color='red' />;
      case 'banned':
        return <CancelIcon sx={{ color: 'error.main', fontSize: 40 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'rejected':
        return 'error.main';
      case 'banned':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <>
    <div className="bg-blue-700 py-3 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Club Logo"
              className="h-15 w-12 rounded-full border-2 border-white"
            />
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg md:text-xl">
                BHAGATH SINGH KALAVEDHÍ VAZHAKKAD (BKV)
              </span>
            </div>
          </div>
          <div>
          <Link href="/" className="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition duration-300 flex items-center">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
  Home
</Link>
          </div>
        </div>
      </div>
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Check Registration Status
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Enter your registration ID to check the current status of your application
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Registration ID"
              placeholder="Enter your registration ID"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{ flex: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SearchIcon />}
              disabled={loading}
              sx={{
                minWidth: { xs: '100%', sm: '150px' },
                height: { sm: '56px' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Check'}
            </Button>
          </Box>
        </Paper>

        {status && (
          <Card elevation={2} sx={{ mt: 4, overflow: 'visible' }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: -3,
              position: 'relative'
            }}>
              <Box sx={{
                backgroundColor: 'background.paper',
                borderRadius: '50%',
                p: 1,
                boxShadow: 1
              }}>
                {getStatusIcon(status.status)}
              </Box>
            </Box>
            <CardContent sx={{ pt: 4 }}>
              <Typography variant="h5" align="center" color={getStatusColor(status.status)} gutterBottom sx={{ textTransform: 'capitalize' }}>
                {status.status}
              </Typography>
              <Typography variant="body1" align="center" paragraph>
                {status.message}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ minWidth: '45%' }}>
                  <Typography variant="body2" color="text.secondary">Registration ID</Typography>
                  <Typography variant="body1">{status.memberId}</Typography>
                </Box>
                <Box sx={{ minWidth: '45%' }}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{status.name}</Typography>
                </Box>
                <Box sx={{ minWidth: '45%' }}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{status.email}</Typography>
                </Box>
                <Box sx={{ minWidth: '45%' }}>
                  <Typography variant="body2" color="text.secondary">Submission Date</Typography>
                  <Typography variant="body1">{status.date}</Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                {status.applicationUrl && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      if (status.applicationUrl) {
                        window.open(status.applicationUrl, '_blank');
                      }
                    }}
                    sx={{ minWidth: '200px' }}
                  >
                    View Application
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                  onClick={handleDownloadPDF}
                  disabled={pdfLoading}
                  sx={{ minWidth: '200px' }}
                >
                 View Your Application
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </ThemeProvider>
    </>
  );
};

export default RegistrationStatus;