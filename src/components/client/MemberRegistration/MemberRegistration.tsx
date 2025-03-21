"use client";
import React, { useContext, useState } from "react";
import { motion } from "framer-motion";
import Footer from "../Footer/Footer";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import SuccessPopup from "../../SuccessPopup/SuccessPopup";
import { getAuth, signInAnonymously } from "firebase/auth";
import { Button, Typography } from "@mui/material";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import LanguageSelector, { LanguageContext } from "./languageSelector";




const MemberRegistration = () => {
  const { t } = useContext(LanguageContext);
 // const { t} = useLanguage();
  const router = useRouter();
  type ValidationErrorsType = {
    fullName: string;
    age: string;
    phoneNumber: string;
    email: string;
    [key: string]: string;
  };

  const [validationErrors, setValidationErrors] =
    useState<ValidationErrorsType>({
      fullName: "",
      address: "",
      age: "",
      education: "",
      job: "",
      fatherName: "",
      hobbies: "",
      nomineeName: "",
      phoneNumber: "",
      email: "",
      gender: "",
      bloodGroup: "",
      isClubMember: "",
      hasCriminalCase: "",
      photo: "",
      signature: "",
    });

  type FormDataType = {
    fullName: string;
    address: string;
    age: string;
    education: string;
    job: string;
    fatherName: string;
    hobbies: string;
    nomineeName: string;
    phoneNumber: string;
    email: string;
    isClubMember: string;
    hasCriminalCase: string;
    bloodGroup: string;
    gender: string;
    photo: File | null;
    signature: File | null;
  };
  const [formData, setFormData] = useState<FormDataType>({
    fullName: "",
    address: "",
    age: "",
    education: "",
    job: "",
    fatherName: "",
    hobbies: "",
    nomineeName: "",
    phoneNumber: "",
    email: "",
    isClubMember: "",
    hasCriminalCase: "",
    bloodGroup: "",
    gender: "",
    photo: null,
    signature: null,
  });
  const [previews, setPreviews] = useState({
    photo: null,
    signature: null,
  });
  const [errorMessages, setErrorMessages] = useState({
    photo: "",
    signature: "",
  });
  const [formStep, setFormStep] = useState(1);
  const [uploadMessages, setUploadMessages] = useState({
    photo: "",
    signature: "",
  });
  // Add these new states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [affidavitChecked, setAffidavitChecked] = useState(false);
  const setSubmissionError = useState("")[1];
  const setSubmissionSuccess = useState(false)[1];
  const [registeredMemberId, setRegisteredMemberId] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [stepErrorMessage, setStepErrorMessage] = useState("");
  const [stepErrorMessageButton, setStepErrorMessageButton] = useState(false);
  // Add this function to close the popup
  const handleClosePopup = () => {
    setShowSuccessPopup(false);
  };
//affidavit checkbox
  const handleCheckboxChange = () => {
    setAffidavitChecked((prev) => !prev);
  };

  // Function to get the next member ID
  const getNextMemberId = async () => {
    try {
      // Query the collection to find the highest existing member ID
      const membersRef = collection(db, "members");
      const q = query(membersRef, orderBy("memberId", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      let nextId = "001"; // Default starting ID

      if (!querySnapshot.empty) {
        // Get the highest ID and increment
        const lastDoc = querySnapshot.docs[0];
        const lastId = lastDoc.data().memberId;

        // Extract the numeric part and increment
        const numericPart = parseInt(lastId, 10);
        const nextNumericPart = numericPart + 1;

        // Format to ensure it has leading zeros (001, 002, etc.)
        nextId = nextNumericPart.toString().padStart(3, "0");
      }

      return nextId;
    } catch (error) {
      console.error("Error getting next member ID:", error);
      return "001"; // Fallback to default if error occurs
    }
  };

  //Add this function to compress and resize images before converting to base64

  const compressImage = async (
    file: File | Blob,
    maxWidth = 800,
    quality = 0.7
  ): Promise<string> => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event: ProgressEvent<FileReader>) => {
          try {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
              try {
                // Create canvas
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress image on canvas
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                  reject(new Error("Could not get canvas context"));
                  return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to base64 with reduced quality
                const compressedBase64 = canvas.toDataURL(
                  "image/jpeg",
                  quality
                );
                resolve(compressedBase64);
              } catch (err) {
                console.error("Image compression error:", err);
                // Fallback to original image if compression fails
                resolve(event.target?.result as string);
              }
            };

            img.onerror = () => {
              reject(new Error("Failed to load image"));
            };
          } catch (err) {
            console.error("Image reader error:", err);
            reject(err);
          }
        };

        reader.onerror = (error) => {
          reject(error);
        };
      });
    } catch (err) {
      console.error("Compress image error:", err);
      // Return a placeholder or the original file as a fallback
      return URL.createObjectURL(file);
    }
  };
  const totalSteps = 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Clear the step error message when user makes changes
    setStepErrorMessage("");

    if (type === "file") {
      // File inputs can only be HTMLInputElement
      const fileInput = e.target as HTMLInputElement;
      const files = fileInput.files;
      const file = files?.[0];

      if (file) {
        // Check file size (4MB = 4 * 1024 * 1024 bytes)
        if (file.size > 4 * 1024 * 1024) {
          setErrorMessages({
            ...errorMessages,
            [name]: t("fileSizeLimit"),
          });
          return;
        }

        setFormData({
          ...formData,
          [name]: file,
        });

        setErrorMessages({
          ...errorMessages,
          [name]: "",
        });

        setUploadMessages({
          ...uploadMessages,
          [name]: `${file.name} uploaded successfully!`,
        });

        // Create and set preview
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const target = e.target;
          if (target && target.result) {
            setPreviews((prev) => ({
              ...prev,
              [name]: target.result as string,
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      let updatedValue = value;
      let error = "";

      // Validation logic based on field name
      switch (name) {
        case "fullName":
        case "fatherName":
        case "address":
        case "nomineeName":
        case "hobbies":
        case "education":
        case "job":
          // Convert to uppercase
          updatedValue = value.toUpperCase();
          break;

        case "age":
          // Only allow numbers
          if (!/^\d*$/.test(value)) {
            error = t("ageNumbersOnly");
          } else if (value && parseInt(value) < 18) {
            error = t("ageLimit");
          }
          break;

        case "phoneNumber":
          // Only allow numbers and check length
          if (!/^\d*$/.test(value)) {
            error = t("phoneNumberDigits");
          } else if (value.length > 0 && value.length !== 10) {
            error = t("phoneNumberLength");
          }
          break;

        case "email":
          // Email validation
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            error = t("invalidEmail");
          }
          break;

        default:
          break;
      }
      // Update form data with potentially modified value
      setFormData({
        ...formData,
        [name]: updatedValue,
      });

      // Update validation errors
      setValidationErrors({
        ...validationErrors,
        [name]: error,
      });
    }
  };

  const checkIfMemberExists = async (email: string, phoneNumber: string) => {
   // const { t } = useLanguage();

    try {
      // Check if the email exists
      const emailQuery = query(
        collection(db, "members"),
        where("email", "==", email)
      );
      const emailQuerySnapshot = await getDocs(emailQuery);

      if (!emailQuerySnapshot.empty) {
        // Return the existing member's ID
        return {
          exists: true,
          memberId: emailQuerySnapshot.docs[0].data().memberId,
          field: t("email")
        };
      }

      // Check if the phone number exists
      const phoneQuery = query(
        collection(db, "members"),
        where("phoneNumber", "==", phoneNumber)
      );
      const phoneQuerySnapshot = await getDocs(phoneQuery);

      if (!phoneQuerySnapshot.empty) {
        // Return the existing member's ID
        return {
          exists: true,
          memberId: phoneQuerySnapshot.docs[0].data().memberId,
          field: t("phoneNumber")
        };
      }

      // If neither exists, return false
      return { exists: false };
    } catch (error) {
      console.error("Error checking if member exists:", error);
      throw error;
    }
  };

  const nextStep = () => {
    // Define required fields for each step
    let requiredForCurrentStep: Array<keyof FormDataType> = [];

    if (formStep === 1) {
      requiredForCurrentStep = [
        "fullName",
        "fatherName",
        "age",
        "gender",
        "address",
        "bloodGroup",
        "hobbies",
      ];
    } else if (formStep === 2) {
      requiredForCurrentStep = [
        "phoneNumber",
        "email",
        "education",
        "job",
        "nomineeName",
      ];
    } else if (formStep === 3) {
      requiredForCurrentStep = [
        "hasCriminalCase",
        "photo",
        "signature",
        "isClubMember",
      ];
    }

    // Check if any required fields are empty
    const missingFields = requiredForCurrentStep.filter(
      (field) => !formData[field]
    );

    // Check if there are validation errors
    const hasValidationErrors = Object.keys(validationErrors)
      .filter((key) =>
        requiredForCurrentStep.includes(key as keyof FormDataType)
      )
      .some((key) => validationErrors[key]);

    if (missingFields.length > 0) {
      setStepErrorMessage(t("fillRequired"));
      return;
    } else if (hasValidationErrors) {
      setStepErrorMessage(t("correctErrors"));
      return;
    }

    // If all validations pass, move to next step
    if (formStep === 2) {
      // Check if member already exists
     //setStepErrorMessage("Checking registration status...");
      checkIfMemberExists(formData.email, formData.phoneNumber)
        .then((result) => {
          if (result.exists) {

            setStepErrorMessage(
               // ` ${result.field}. Your member ID is ${result.memberId}. Please check your registration status.`
              `${t("alreadyMember")} ${result.field}. ${t("checkStatus")} ${result.memberId}.`
            );
            setStepErrorMessageButton(true)
          } else {
            // If not registered, proceed to next step
            setStepErrorMessage("");
            if (formStep < totalSteps) {
              setFormStep(formStep + 1);
            }
          }
        })
        .catch((error) => {
          console.error("Error checking member existence:", error);
          setStepErrorMessage("An error occurred while checking registration status. Please try again.");
        });
    } else {
      // For other steps, just proceed
      setStepErrorMessage("");
      if (formStep < totalSteps) {
        setFormStep(formStep + 1);
      }
    }
  };

  const prevStep = () => {
    setStepErrorMessage("");
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  // Handle the form submission
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Check all validations before submission
    const requiredFields = [
      "fullName",
      "address",
      "age",
      "gender",
      "fatherName",
      "phoneNumber",
      "email",
      "education",
      "bloodGroup",
      "isClubMember",
      "hasCriminalCase",
      "photo",
      "signature",
    ] as Array<keyof FormDataType>;
    // let requiredForCurrentStep: Array<keyof FormDataType> = [];
    //  // Check if any required fields are empty
    //  const missingFields = requiredForCurrentStep.filter(field => !formData[field]);

    //  // Check if there are validation errors
    //  const hasValidationErrors = Object.keys(validationErrors)
    //    .filter(key => requiredForCurrentStep.includes(key as keyof FormDataType))
    //    .some(key => validationErrors[key]);

    //  if (missingFields.length > 0) {
    //    setStepErrorMessage('Please fill all required fields before proceeding.');
    //    return;
    //  } else if (hasValidationErrors) {
    //    setStepErrorMessage('Please correct the errors before proceeding.');
    //    return;
    //  }
    const missingFields = requiredFields.filter((field) => !formData[field]);
    const hasValidationErrors = Object.values(validationErrors).some(
      (error) => error
    );

    if (missingFields.length > 0 || hasValidationErrors) {
      setStepErrorMessage(t("completeAllFields"));
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");

    try {
      // Check if member already exists one final time before submission
    //const existingMember = await checkIfMemberExists(formData.email, formData.phoneNumber);

    // if (existingMember.exists) {
    //   setStepErrorMessage(
    //     `You are already registered with this ${existingMember.field}. Your member ID is ${existingMember.memberId}. Please check your registration status.`
    //   );
    //   setIsSubmitting(false);
    //   return;
    // }
      // First, authenticate anonymously
      const auth = getAuth();
      const userCredential = await signInAnonymously(auth);
      const userId = userCredential.user.uid;

      // Get the next member ID
      const memberId = await getNextMemberId();

      // Compress and convert photos to base64 strings
      let photoBase64 = null;
      let signatureBase64 = null;

      if (formData.photo) {
        // Compress photo - smaller dimensions for signature
        photoBase64 = await compressImage(formData.photo, 600, 0.6);
      }

      if (formData.signature) {
        // Compress signature - smaller dimensions and higher compression
        signatureBase64 = await compressImage(formData.signature, 400, 0.5);
      }

      // Prepare the data object to save to Firestore
      const memberData = {
        memberId,
        fullName: formData.fullName,
        address: formData.address,
        age: formData.age,
        education: formData.education,
        job: formData.job,
        fatherName: formData.fatherName,
        hobbies: formData.hobbies,
        nomineeName: formData.nomineeName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        isClubMember: formData.isClubMember,
        hasCriminalCase: formData.hasCriminalCase,
        bloodGroup: formData.bloodGroup,
        gender: formData.gender,
        photoUrl: photoBase64,
        signatureUrl: signatureBase64,
        registrationDate: new Date().toISOString(),
        status: "pending", // You can use this to track membership status
        createdBy: userId, // Add this field to match your security rules
      };

      // Add the document to Firestore
      const docRef = await addDoc(collection(db, "members"), memberData);
      console.log("Member registered with ID:", docRef.id);

      // Show success message
      setRegisteredMemberId(memberId);
      setShowSuccessPopup(true);
      setSubmissionSuccess(true);

      // Reset the form after successful submission
      setFormData({
        fullName: "",
        address: "",
        age: "",
        education: "",
        job: "",
        fatherName: "",
        hobbies: "",
        nomineeName: "",
        phoneNumber: "",
        email: "",
        isClubMember: "",
        hasCriminalCase: "",
        bloodGroup: "",
        gender: "",
        photo: null,
        signature: null,
      });

      setPreviews({
        photo: null,
        signature: null,
      });

      setFormStep(1);
    } catch (error) {
      console.error("Error submitting registration:", error);
      // More detailed error for debugging
      let errorMessage = "";
      if (typeof error === "object" && error !== null) {
        errorMessage = "Unknown error";
        if ("code" in error) {
          errorMessage += ` (Code: ${error.code})`;
        }
      } else {
        errorMessage = String(error);
      }
      setSubmissionError(`Failed to submit registration: ${errorMessage}`);
      // Alert for mobile debugging
      alert(`Registration error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 },
  };

  const renderStep1 = () => {
    //const { t } = useLanguage();

    return (
      <motion.div
        key="step1"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeInUp}
        className="space-y-4"
      >
        <h2 className="text-xl font-bold text-blue-600 mb-6">
          {t("personalInfo")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-gray-700 mb-2">{t('fullName')}</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.fullName ? "border-red-500" : ""
              }`}
              required
            />
            {validationErrors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.fullName}
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="block text-gray-700 mb-2">{t('fatherName')}</label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-gray-700 mb-2">{t('age')}</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.age ? "border-red-500" : ""
              }`}
              required
            />
            {validationErrors.age && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.age}</p>
            )}
          </div>

          <div className="form-group">
            <label className="block text-gray-700 mb-2">{t('gender')}</label>
            <div className="flex space-x-4 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">{t('male')}</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">{t('female')}</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === "other"}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">{t('other')}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="block text-gray-700 mb-2">{t('address')}</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-gray-700 mb-2">{t('bloodGroup')}</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{t('selectBloodGroup')}</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="form-group">
            <label className="block text-gray-700 mb-2">{t('hobbies')}</label>
            <input
              type="text"
              name="hobbies"
              value={formData.hobbies}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('hobbiesSeparator')}
              required
            />
          </div>
        </div>
      </motion.div>
    );
  };

  const renderStep2 = () => (
    <motion.div
    key="step2"
    initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeInUp}
    className="space-y-4"
  >
    <h2 className="text-xl font-bold text-blue-600 mb-6">
      {t("contactInfo")}
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="block text-gray-700 mb-2">{t("phoneNumber")}</label>
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.phoneNumber ? "border-red-500" : ""
          }`}
          required
        />
        {validationErrors.phoneNumber && (
          <p className="text-red-500 text-sm mt-1">
            {validationErrors.phoneNumber}
          </p>
        )}
      </div>

      <div className="form-group">
        <label className="block text-gray-700 mb-2">{t("email")}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            validationErrors.email ? "border-red-500" : ""
          }`}
          required
        />
        {validationErrors.email && (
          <p className="text-red-500 text-sm mt-1">
            {validationErrors.email}
          </p>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="block text-gray-700 mb-2">
          {t("education")}
        </label>
        <input
          type="text"
          name="education"
          value={formData.education}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="form-group">
        <label className="block text-gray-700 mb-2">{t("job")}</label>
        <input
          type="text"
          name="job"
          value={formData.job}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>

    <div className="form-group">
      <label className="block text-gray-700 mb-2">{t("nomineeName")}</label>
      <input
        type="text"
        name="nomineeName"
        value={formData.nomineeName}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
    </div>
  </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeInUp}
      className="space-y-4"
    >
      <h2 className="text-xl font-bold text-blue-600 mb-6">
        Additional Information
      </h2>

      <div className="form-group mb-6">
        <label className="block text-gray-700 mb-2">
          Are you a member of any other club?
        </label>
        <div className="flex space-x-4 mt-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="isClubMember"
              value="yes"
              checked={formData.isClubMember === "yes"}
              onChange={handleChange}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="isClubMember"
              value="no"
              checked={formData.isClubMember === "no"}
              onChange={handleChange}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">No</span>
          </label>
        </div>
      </div>

      <div className="form-group mb-6">
        <label className="block text-gray-700 mb-2">
          Have you been involved in any criminal case?
        </label>
        <div className="flex space-x-4 mt-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="hasCriminalCase"
              value="yes"
              checked={formData.hasCriminalCase === "yes"}
              onChange={handleChange}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">Yes</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="hasCriminalCase"
              value="no"
              checked={formData.hasCriminalCase === "no"}
              onChange={handleChange}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-gray-700">No</span>
          </label>
        </div>
      </div>

      <div className="form-group mb-6">
        <label className="block text-gray-700 mb-2">Upload Photo</label>
        <div className="flex items-center">
          <input
            type="file"
            name="photo"
            onChange={handleChange}
            className="hidden"
            id="photo-upload"
            accept="image/*"
            required
          />
          <label
            htmlFor="photo-upload"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition duration-300"
          >
            Choose Photo
          </label>
          {uploadMessages.photo && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-4 text-green-600 text-sm"
            >
              {uploadMessages.photo}
            </motion.span>
          )}
        </div>
        {errorMessages.photo && (
          <p className="text-red-500 text-sm mt-1">{errorMessages.photo}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">Maximum file size: 4MB</p>

        {previews.photo && (
          <div className="mt-3">
            <img
              src={previews.photo}
              alt="Photo preview"
              className="h-24 w-24 object-cover rounded-md border border-gray-300"
            />
          </div>
        )}
      </div>

      <div className="form-group mb-6">
        <label className="block text-gray-700 mb-2">Upload Signature</label>
        <div className="flex items-center">
          <input
            type="file"
            name="signature"
            onChange={handleChange}
            className="hidden"
            id="signature-upload"
            accept="image/*"
            required
          />
          <label
            htmlFor="signature-upload"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer transition duration-300"
          >
            Choose Signature
          </label>
          {uploadMessages.signature && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-4 text-green-600 text-sm"
            >
              {uploadMessages.signature}
            </motion.span>
          )}
        </div>
        {errorMessages.signature && (
          <p className="text-red-500 text-sm mt-1">{errorMessages.signature}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">Maximum file size: 4MB</p>

        {previews.signature && (
          <div className="mt-3">
            <img
              src={previews.signature}
              alt="Signature preview"
              className="h-24 w-auto object-contain rounded-md border border-gray-300"
            />
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="text-sm text-gray-600 font-medium">
            Step {i + 1}
          </div>
        ))}
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
        <motion.div
          initial={{ width: `${((formStep - 1) / totalSteps) * 100}%` }}
          animate={{ width: `${(formStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5 }}
          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
        ></motion.div>
      </div>
    </div>
  );

  return (

    <>

      <div className="bg-blue-700 py-3 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
  <img src="/logo.png" alt="Club Logo" className="h-15 w-12 rounded-full border-2 border-white" />
  <div className="flex flex-col">
    <span className="text-white font-bold text-lg md:text-xl">
      {t("clubName")}
    </span>
  </div>
  <LanguageSelector /> {/* 🌐 Language Switcher */}
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
  {t('home')}
</Link>
          </div>
        </div>
      </div>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-blue-600 py-6 px-8">
            <h1 className="text-2xl font-bold text-white text-center">
         {t('formTitle')}
            </h1>
          </div>

          <div className="p-8">
            {renderProgressBar()}

            <form onSubmit={handleSubmit}>
              {formStep === 1 && renderStep1()}
              {formStep === 2 && renderStep2()}
              {formStep === 3 && renderStep3()}
              {/* ✅ Affidavit Section */}
        {formStep === totalSteps && (
          <div className="mt-8 bg-gray-100 p-6 rounded-lg border">
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {t("affidavit")}
            </Typography>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="affidavit"
                checked={affidavitChecked}
                onChange={handleCheckboxChange}
                className="mr-2 mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="affidavit" className="text-sm text-gray-700">
             {t("affidavitText")}
              </label>
            </div>
          </div>
        )}
              <div>
              {stepErrorMessage && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
    <Typography variant="body1" color="error">
      {stepErrorMessage}
    </Typography>

    {stepErrorMessageButton && ( // ✅ Show button only when true
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push("/registration-status")}
        sx={{ mt: 2 }}
      >
        Check Status
      </Button>
    )}
  </div>
)}

    </div>
              {/* <div className="w-full">
                {stepErrorMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <span className="block sm:inline">{stepErrorMessage}</span>
                  </motion.div>
                )}
              </div> */}
              <div className="flex justify-between mt-8">
                {formStep > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    {t('previous')}
                  </motion.button>
                )}

                <div className="ml-auto">
                  {formStep < totalSteps ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                      {t('next')}
                    </motion.button>
                  ) : (
                    <motion.button
                    whileHover={{ scale: affidavitChecked ? 1.05 : 1 }}
                    whileTap={{ scale: affidavitChecked ? 0.95 : 1 }}
                    type="submit"
                    disabled={!affidavitChecked || isSubmitting}
                    className={`
                      px-6 py-2 rounded-lg transition duration-300 text-white
                      ${
                        !affidavitChecked || isSubmitting
                          ? "bg-gray-400 cursor-not-allowed opacity-50"   // ✅ Explicit disabled styling
                          : "bg-green-600 hover:bg-green-700"
                      }
                    `}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </motion.button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      <Footer />
      <SuccessPopup
        isOpen={showSuccessPopup}
        memberId={registeredMemberId}
        onClose={handleClosePopup}
      />
    </>
  );
};

export default MemberRegistration;


