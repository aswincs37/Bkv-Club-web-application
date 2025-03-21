"use client";
import React, { useState, createContext, useContext, useEffect, ReactNode, Dispatch, SetStateAction } from "react";

// Define types for translations
type TranslationKey = keyof typeof translations.english;
type LanguageKey = keyof typeof translations;

// Define the context type
interface LanguageContextType {
  language: LanguageKey;
  setLanguage: Dispatch<SetStateAction<LanguageKey>>;
  t: (key: TranslationKey) => string;
}

// Create a context for language settings
export const LanguageContext = createContext<LanguageContextType>({
  language: 'english',
  setLanguage: () => {},
  t: (key) => key as string
});

// Translations object with both languages
const translations = {
  english: {
    // Header
    "clubName": "BHAGATH SINGH KALAVEDHÍ VAZHAKKAD (BKV)",
    "home": "Home",

    // Form Titles
    "formTitle": "Club Membership Registration Form",
    "personalInfo": "Personal Information",
    "contactInfo": "Contact & Professional Information",
    "additionalInfo": "Additional Information",

    // Form Steps
    "step": "Step",
    "next": "Next",
    "previous": "Previous",
    "submit": "Submit Registration",
    "submitting": "Submitting...",

    // Form Fields - Personal
    "fullName": "Full Name",
    "fatherName": "Father Name",
    "age": "Age",
    "gender": "Gender",
    "male": "Male",
    "female": "Female",
    "other": "Other",
    "address": "Address",
    "bloodGroup": "Blood Group",
    "selectBloodGroup": "Select Blood Group",
    "hobbies": "Hobbies",
    "hobbiesSeparator": "Separated by commas",

    // Form Fields - Contact & Professional
    "phoneNumber": "Phone Number",
    "email": "Email",
    "education": "Educational Qualification",
    "job": "Current Job",
    "nomineeName": "Nominee Name",

    // Form Fields - Additional
    "clubMemberQuestion": "Are you a member of any other club?",
    "criminalCaseQuestion": "Have you been involved in any criminal case?",
    "yes": "Yes",
    "no": "No",
    "uploadPhoto": "Upload Photo",
    "choosePhoto": "Choose Photo",
    "uploadSignature": "Upload Signature",
    "chooseSignature": "Choose Signature",
    "fileSizeLimit": "Maximum file size: 4MB",

    // Affidavit
    "affidavit": "Affidavit",
    "affidavitText": "I hereby certify that the information given above is true and that I am working in accordance with the rules and regulations of the Kalavedi. If my performance is not efficient, I may be subject to disciplinary action by the Committee.",

    // Error Messages
    "fillRequired": "Please fill all required fields before proceeding.",
    "correctErrors": "Please correct the errors before proceeding.",
    "completeAllFields": "Please complete all required fields correctly before submitting.",
    "checkStatus": "Check Status With Your member ID is",
    "alreadyMember":"You are already registered with this",

    // Validation Errors
    "ageNumbersOnly": "Age must contain only numbers",
    "ageLimit": "Age must be 18 or above",
    "phoneNumberDigits": "Phone number must contain only digits",
    "phoneNumberLength": "Phone number must be exactly 10 digits",
    "invalidEmail": "Please enter a valid email address"
  },
  malayalam: {
    // Header
    "clubName": "ഭഗത് സിംഗ് കലാവേദി വഴക്കാട് (ബികെവി)",
    "home": "ഹോം",

    // Form Titles
    "formTitle": "ക്ലബ് അംഗത്വ രജിസ്ട്രേഷൻ ഫോം",
    "personalInfo": "വ്യക്തിഗത വിവരങ്ങൾ",
    "contactInfo": "ബന്ധപ്പെടാനുള്ള & പ്രൊഫഷണൽ വിവരങ്ങൾ",
    "additionalInfo": "അധിക വിവരങ്ങൾ",

    // Form Steps
    "step": "ഘട്ടം",
    "next": "അടുത്തത്",
    "previous": "മുൻപത്തെത്",
    "submit": "രജിസ്ട്രേഷൻ സമർപ്പിക്കുക",
    "submitting": "സമർപ്പിക്കുന്നു...",

    // Form Fields - Personal
    "fullName": "പൂർണ്ണ നാമം",
    "fatherName": "പിതാവിന്റെ പേര്",
    "age": "പ്രായം",
    "gender": "ലിംഗം",
    "male": "പുരുഷൻ",
    "female": "സ്ത്രീ",
    "other": "മറ്റുള്ളവ",
    "address": "വിലാസം",
    "bloodGroup": "രക്ത ഗ്രൂപ്പ്",
    "selectBloodGroup": "രക്ത ഗ്രൂപ്പ് തിരഞ്ഞെടുക്കുക",
    "hobbies": "ഹോബികൾ",
    "hobbiesSeparator": "കോമയാൽ വേർതിരിച്ചത്",

    // Form Fields - Contact & Professional
    "phoneNumber": "ഫോൺ നമ്പർ",
    "email": "ഇമെയിൽ",
    "education": "വിദ്യാഭ്യാസ യോഗ്യത",
    "job": "നിലവിലെ ജോലി",
    "nomineeName": "നോമിനിയുടെ പേര്",

    // Form Fields - Additional
    "clubMemberQuestion": "നിങ്ങൾ മറ്റെന്തെങ്കിലും ക്ലബ്ബിലെ അംഗമാണോ?",
    "criminalCaseQuestion": "നിങ്ങൾ എന്തെങ്കിലും ക്രിമിനൽ കേസിൽ ഉൾപ്പെട്ടിട്ടുണ്ടോ?",
    "yes": "അതെ",
    "no": "അല്ല",
    "uploadPhoto": "ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക",
    "choosePhoto": "ഫോട്ടോ തിരഞ്ഞെടുക്കുക",
    "uploadSignature": "ഒപ്പ് അപ്‌ലോഡ് ചെയ്യുക",
    "chooseSignature": "ഒപ്പ് തിരഞ്ഞെടുക്കുക",
    "fileSizeLimit": "പരമാവധി ഫയൽ വലുപ്പം: 4MB",

    // Affidavit
    "affidavit": "സത്യവാങ്മൂലം",
    "affidavitText": "മുകളിൽ കൊടുത്തിരിക്കുന്ന വിവരങ്ങൾ സത്യമാണെന്നും ഞാൻ കലാവേദിയുടെ ചട്ടങ്ങളും നിയമങ്ങളും അനുസരിച്ച് പ്രവർത്തിക്കുന്നുവെന്നും ഞാൻ ഇതിനാൽ സാക്ഷ്യപ്പെടുത്തുന്നു. എന്റെ പ്രകടനം കാര്യക്ഷമമല്ലെങ്കിൽ, കമ്മിറ്റിയുടെ അച്ചടക്ക നടപടികൾക്ക് ഞാൻ വിധേയനാകും.",

    // Error Messages
    "fillRequired": "മുന്നോട്ട് പോകുന്നതിനു മുമ്പ് എല്ലാ ആവശ്യമുള്ള ഫീൽഡുകളും പൂരിപ്പിക്കുക.",
    "correctErrors": "മുന്നോട്ട് പോകുന്നതിനു മുമ്പ് പിശകുകൾ തിരുത്തുക.",
    "completeAllFields": "സമർപ്പിക്കുന്നതിന് മുമ്പ് എല്ലാ ആവശ്യമുള്ള ഫീൽഡുകളും ശരിയായി പൂരിപ്പിക്കുക.",
    "checkStatus": "നിങ്ങളുടെ അംഗത്വ ഐഡി ഉപയോഗിച്ച് സ്റ്റാറ്റസ് പരിശോധിക്കുക",
    "alreadyMember":"നിങ്ങൾ ഇതിൽ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്",

    // Validation Errors
    "ageNumbersOnly": "പ്രായത്തിൽ അക്കങ്ങൾ മാത്രമേ ഉൾപ്പെടുത്താവൂ",
    "ageLimit": "പ്രായം 18നോ അതിലധികമോ ആയിരിക്കണം",
    "phoneNumberDigits": "ഫോൺ നമ്പറിൽ അക്കങ്ങൾ മാത്രമേ അനുവദനീയമാകൂ",
    "phoneNumberLength": "ഫോൺ നമ്പർ കൃത്യം 10 അക്കങ്ങൾ ആയിരിക്കണം",
    "invalidEmail": "ദയവായി സാധുവായ ഇമെയിൽ വിലാസം നൽകുക"
  }
} as const;

// Language Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Try to get the saved language preference from localStorage, default to English
  const [language, setLanguage] = useState<LanguageKey>('english');

  // Set up language on initial load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageKey | null;
    if (savedLanguage && (savedLanguage === 'english' || savedLanguage === 'malayalam')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: TranslationKey): string => {
    return translations[language][key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
//export const useLanguage = () => useContext(LanguageContext);

// Language selector component
export const LanguageSelector = () => {
  const useLanguage = () => useContext(LanguageContext);
  const { language, setLanguage } = useLanguage();
  const handleLanguageChange = (lang: 'english' | 'malayalam') => {
    console.log("Changing language to:", lang);
    setLanguage(lang);
  };
  return (
    <div className="flex space-x-2 items-center">
      <button
        onClick={() => handleLanguageChange('english')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'english'
            ? 'bg-white text-blue-700'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('malayalam')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'malayalam'
            ? 'bg-white text-blue-700'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        മലയാളം
      </button>
    </div>
  );
};

export default LanguageSelector;