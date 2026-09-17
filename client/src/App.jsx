import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Database,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  FlaskConical,
  Home,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  MoreVertical,
  Phone,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Stethoscope,
  Trash2,
  User,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
// PDF is now generated via a dedicated print window (no external PDF lib needed)
import "./styles.css";

/* =========================================================
   TAZ COMPANY — STORAGE KEYS & UTILITIES
   ========================================================= */

const STORAGE = {
  session: "taz_company_session",
  patients: "taz_company_patients",
  doctors: "taz_company_doctors",
  tests: "taz_company_tests",
  reports: "taz_company_reports",
  bills: "taz_company_bills",
  messages: "taz_company_messages",
  branches: "taz_company_branches",
  users: "taz_company_users",
  settings: "taz_company_settings",
};

const today = () => new Date().toISOString().slice(0, 10);

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("taz-company-update"));
}

function nextId(prefix, items) {
  const numbers = items.map((item) => {
    const match = String(item.id || "").match(/\d+/);
    return match ? Number(match[0]) : 0;
  });
  const next = Math.max(0, ...numbers) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

/* =========================================================
   DEFAULT SEED DATA
   ========================================================= */

const DEFAULT_DOCTORS = [
  {
    id: "DOC001",
    name: "Dr. Ahmed Khan",
    specialization: "Consultant Physician",
    phone: "9876543210",
    email: "ahmed@tazdiagnostic.com",
    status: "Active",
  },
  {
    id: "DOC002",
    name: "Dr. Ananya Rao",
    specialization: "General Physician",
    phone: "9876501234",
    email: "ananya@tazdiagnostic.com",
    status: "Active",
  },
  {
    id: "DOC003",
    name: "Dr. Rahul Mehta",
    specialization: "Cardiologist",
    phone: "9876505678",
    email: "rahul@tazdiagnostic.com",
    status: "Active",
  },
  {
    id: "DOC004",
    name: "Dr. Priya Sharma",
    specialization: "Pathologist",
    phone: "9988776655",
    email: "priya@tazdiagnostic.com",
    status: "Active",
  },
];

const DEFAULT_TESTS = [
  // ==========================================
  // Clinical Pathology
  // ==========================================
  {
    id: "TST001",
    name: "H.B.",
    category: "Clinical Pathology",
    unit: "g/dL",
    reference: "Male: 13.0 - 17.0, Female: 12.0 - 15.0",
    price: 100,
    status: "Active",
  },
  {
    id: "TST002",
    name: "TRBC",
    category: "Clinical Pathology",
    unit: "mil/cu.mm",
    reference: "4.5 - 5.5 mil/cu.mm",
    price: 0,
    status: "Active",
  },
  {
    id: "TST003",
    name: "TWBC",
    category: "Clinical Pathology",
    unit: "/cu.mm",
    reference: "4,000 - 11,000 /cu.mm",
    price: 0,
    status: "Active",
  },
  {
    id: "TST004",
    name: "Platelet Count",
    category: "Clinical Pathology",
    unit: "Lakhs/cu.mm",
    reference: "1.5 - 4.5 Lakhs/cu.mm",
    price: 0,
    status: "Active",
  },
  {
    id: "TST005",
    name: "DC Count",
    category: "Clinical Pathology",
    unit: "%",
    reference: "Differential Leucocyte Count",
    price: 0,
    status: "Active",
  },
  {
    id: "TST006",
    name: "Polymorphs",
    category: "Clinical Pathology",
    unit: "%",
    reference: "40 - 75 %",
    price: 0,
    status: "Active",
  },
  {
    id: "TST007",
    name: "Lymphocytes",
    category: "Clinical Pathology",
    unit: "%",
    reference: "20 - 45 %",
    price: 0,
    status: "Active",
  },
  {
    id: "TST008",
    name: "Eosinophils",
    category: "Clinical Pathology",
    unit: "%",
    reference: "1 - 6 %",
    price: 0,
    status: "Active",
  },
  {
    id: "TST009",
    name: "Monocytes",
    category: "Clinical Pathology",
    unit: "%",
    reference: "2 - 8 %",
    price: 0,
    status: "Active",
  },
  {
    id: "TST010",
    name: "ESR",
    category: "Clinical Pathology",
    unit: "mm/1st hr",
    reference: "Male: 0 - 15, Female: 0 - 20 (Westergren)",
    price: 100,
    status: "Active",
  },
  {
    id: "TST011",
    name: "Bleeding Time",
    category: "Clinical Pathology",
    unit: "min:sec",
    reference: "2 - 7 mins (Duke's method)",
    price: 50,
    status: "Active",
  },
  {
    id: "TST012",
    name: "Clotting Time",
    category: "Clinical Pathology",
    unit: "min:sec",
    reference: "3 - 8 mins (Lee-White method)",
    price: 50,
    status: "Active",
  },
  {
    id: "TST013",
    name: "MP",
    category: "Clinical Pathology",
    unit: "Smear Examination",
    reference: "Negative / Not Seen",
    price: 150,
    status: "Active",
  },
  {
    id: "TST014",
    name: "MF",
    category: "Clinical Pathology",
    unit: "Smear Examination",
    reference: "Negative / Not Seen",
    price: 200,
    status: "Active",
  },
  {
    id: "TST015",
    name: "Blood Group",
    category: "Clinical Pathology",
    unit: "Agglutination",
    reference: "A / B / AB / O",
    price: 100,
    status: "Active",
  },
  {
    id: "TST016",
    name: "Rh Type",
    category: "Clinical Pathology",
    unit: "Agglutination",
    reference: "Positive / Negative",
    price: 0,
    status: "Active",
  },
  {
    id: "TST017",
    name: "R.A. Test",
    category: "Clinical Pathology",
    unit: "IU/mL",
    reference: "< 20 IU/mL (Negative)",
    price: 200,
    status: "Active",
  },
  {
    id: "TST018",
    name: "VDRL",
    category: "Clinical Pathology",
    unit: "Qualitative",
    reference: "Non-Reactive",
    price: 200,
    status: "Active",
  },
  {
    id: "TST019",
    name: "Widal Test",
    category: "Clinical Pathology",
    unit: "Titer",
    reference: "S. Typhi 'O' & 'H' < 1:80",
    price: 100,
    status: "Active",
  },
  {
    id: "TST020",
    name: "OT",
    category: "Clinical Pathology",
    unit: "Titer",
    reference: "< 1:80 (Negative)",
    price: 0,
    status: "Active",
  },
  {
    id: "TST021",
    name: "HT",
    category: "Clinical Pathology",
    unit: "Titer",
    reference: "< 1:80 (Negative)",
    price: 0,
    status: "Active",
  },
  {
    id: "TST022",
    name: "HA",
    category: "Clinical Pathology",
    unit: "Titer",
    reference: "< 1:80 (Negative)",
    price: 0,
    status: "Active",
  },
  {
    id: "TST023",
    name: "HB",
    category: "Clinical Pathology",
    unit: "Titer",
    reference: "< 1:80 (Negative)",
    price: 0,
    status: "Active",
  },
  {
    id: "TST024",
    name: "Mantoux Test",
    category: "Clinical Pathology",
    unit: "mm (induration)",
    reference: "< 5 mm: Negative, > 10 mm: Positive",
    price: 200,
    status: "Active",
  },

  // ==========================================
  // Urine Examinations
  // ==========================================
  {
    id: "TST025",
    name: "Sugar",
    category: "Urine Examinations",
    unit: "Qualitative",
    reference: "Nil / Negative",
    price: 50,
    status: "Active",
  },
  {
    id: "TST026",
    name: "Albumin",
    category: "Urine Examinations",
    unit: "Qualitative",
    reference: "Nil / Negative",
    price: 50,
    status: "Active",
  },
  {
    id: "TST027",
    name: "Bile Salts",
    category: "Urine Examinations",
    unit: "Qualitative",
    reference: "Negative / Not Detected",
    price: 50,
    status: "Active",
  },
  {
    id: "TST028",
    name: "Bile Pigments",
    category: "Urine Examinations",
    unit: "Qualitative",
    reference: "Negative / Not Detected",
    price: 50,
    status: "Active",
  },
  {
    id: "TST029",
    name: "Pus Cells",
    category: "Urine Examinations",
    unit: "/HPF",
    reference: "0 - 4 /HPF",
    price: 50,
    status: "Active",
  },
  {
    id: "TST030",
    name: "RBC",
    category: "Urine Examinations",
    unit: "/HPF",
    reference: "Nil / Occasional",
    price: 0,
    status: "Active",
  },
  {
    id: "TST031",
    name: "Casts",
    category: "Urine Examinations",
    unit: "/LPF",
    reference: "Not Seen / Nil",
    price: 0,
    status: "Active",
  },
  {
    id: "TST032",
    name: "Crystals",
    category: "Urine Examinations",
    unit: "Microscopy",
    reference: "Not Seen / Nil",
    price: 0,
    status: "Active",
  },
  {
    id: "TST033",
    name: "WBC",
    category: "Urine Examinations",
    unit: "/HPF",
    reference: "0 - 2 /HPF",
    price: 0,
    status: "Active",
  },
  {
    id: "TST034",
    name: "Epithelial Cells",
    category: "Urine Examinations",
    unit: "/HPF",
    reference: "0 - 3 /HPF",
    price: 0,
    status: "Active",
  },
  {
    id: "TST035",
    name: "Others",
    category: "Urine Examinations",
    unit: "Examination",
    reference: "Nil",
    price: 0,
    status: "Active",
  },
  {
    id: "TST036",
    name: "Pregnancy Test",
    category: "Urine Examinations",
    unit: "Qualitative",
    reference: "Negative",
    price: 0,
    status: "Active",
  },

  // ==========================================
  // Bio Chemistry
  // ==========================================
  {
    id: "TST037",
    name: "Serum Glucose (F)",
    category: "Bio Chemistry",
    unit: "mg/dL",
    reference: "70 - 100",
    price: 50,
    status: "Active",
  },
  {
    id: "TST038",
    name: "Serum Glucose (R)",
    category: "Bio Chemistry",
    unit: "mg/dL",
    reference: "70 - 140",
    price: 50,
    status: "Active",
  },
  {
    id: "TST039",
    name: "Serum Glucose (PP)",
    category: "Bio Chemistry",
    unit: "mg/dL",
    reference: "< 140",
    price: 50,
    status: "Active",
  },
  {
    id: "TST040",
    name: "Urea",
    category: "Bio Chemistry",
    unit: "mg/dL",
    reference: "15 - 40",
    price: 150,
    status: "Active",
  },
  {
    id: "TST041",
    name: "Creatinine",
    category: "Bio Chemistry",
    unit: "mg/dL",
    reference: "Male: 0.7 - 1.3, Female: 0.6 - 1.1",
    price: 150,
    status: "Active",
  },
  {
    id: "TST042",
    name: "Cholesterol",
    category: "Bio Chemistry",
    unit: "mg/dL",
    reference: "Desirable: < 200",
    price: 100,
    status: "Active",
  },
  {
    id: "TST043",
    name: "Bilirubin Total",
    category: "Bio Chemistry",
    unit: "mg/dL",
    reference: "0.2 - 1.2",
    price: 100,
    status: "Active",
  },
  {
    id: "TST044",
    name: "Vanden Bergh Reaction",
    category: "Bio Chemistry",
    unit: "Reaction",
    reference: "Negative / Indirect",
    price: 100,
    status: "Active",
  },
  {
    id: "TST045",
    name: "HIV TRI DOT 1 & 2 Method",
    category: "Bio Chemistry",
    unit: "Qualitative",
    reference: "Non-Reactive",
    price: 300,
    status: "Active",
  },
  {
    id: "TST046",
    name: "HIV-1 Positive",
    category: "Bio Chemistry",
    unit: "Qualitative",
    reference: "Non-Reactive",
    price: 300,
    status: "Active",
  },
  {
    id: "TST047",
    name: "HIV-2 Positive",
    category: "Bio Chemistry",
    unit: "Qualitative",
    reference: "Non-Reactive",
    price: 300,
    status: "Active",
  },
  {
    id: "TST048",
    name: "HBsAg",
    category: "Bio Chemistry",
    unit: "Qualitative",
    reference: "Non-Reactive",
    price: 300,
    status: "Active",
  },

  // ==========================================
  // Motion Examination
  // ==========================================
  {
    id: "TST049",
    name: "Motion Examination",
    category: "Motion Examination",
    unit: "Routine",
    reference: "Normal / Semisolid",
    price: 300,
    status: "Active",
  },
  {
    id: "TST050",
    name: "Mucus",
    category: "Motion Examination",
    unit: "Macroscopy",
    reference: "Not Seen / Nil",
    price: 0,
    status: "Active",
  },
  {
    id: "TST051",
    name: "Occult Blood",
    category: "Motion Examination",
    unit: "Chemical",
    reference: "Negative",
    price: 0,
    status: "Active",
  },
  {
    id: "TST052",
    name: "Microscopy Examination",
    category: "Motion Examination",
    unit: "Microscopy",
    reference: "See individual findings",
    price: 0,
    status: "Active",
  },
  {
    id: "TST053",
    name: "OVA",
    category: "Motion Examination",
    unit: "/HPF",
    reference: "Not Seen / Nil",
    price: 0,
    status: "Active",
  },
  {
    id: "TST054",
    name: "Cyst's",
    category: "Motion Examination",
    unit: "/HPF",
    reference: "Not Seen / Nil",
    price: 0,
    status: "Active",
  },
  {
    id: "TST055",
    name: "Bacteria",
    category: "Motion Examination",
    unit: "/HPF",
    reference: "Normal Flora",
    price: 0,
    status: "Active",
  },
  {
    id: "TST056",
    name: "Others",
    category: "Motion Examination",
    unit: "Microscopy",
    reference: "Nil",
    price: 0,
    status: "Active",
  },

  // ==========================================
  // Semen Analysis
  // ==========================================
  {
    id: "TST057",
    name: "Semen Analysis",
    category: "Semen Analysis",
    unit: "Analysis",
    reference: "Volume: 2 - 5 mL, Liquefaction: 20-30 min",
    price: 350,
    status: "Active",
  },
  {
    id: "TST058",
    name: "Collection",
    category: "Semen Analysis",
    unit: "Observation",
    reference: "Complete Specimen",
    price: 0,
    status: "Active",
  },
  {
    id: "TST059",
    name: "Reaction",
    category: "Semen Analysis",
    unit: "pH",
    reference: "Alkaline (7.2 - 8.0)",
    price: 0,
    status: "Active",
  },
  {
    id: "TST060",
    name: "Semen Total Count",
    category: "Semen Analysis",
    unit: "Million/mL",
    reference: "> 15 Million/mL",
    price: 0,
    status: "Active",
  },
  {
    id: "TST061",
    name: "Motile",
    category: "Semen Analysis",
    unit: "%",
    reference: "> 40 % Progressive",
    price: 0,
    status: "Active",
  },
  {
    id: "TST062",
    name: "Non Motile",
    category: "Semen Analysis",
    unit: "%",
    reference: "< 60 %",
    price: 0,
    status: "Active",
  },
  {
    id: "TST063",
    name: "Pus Cells",
    category: "Semen Analysis",
    unit: "/HPF",
    reference: "0 - 2 /HPF",
    price: 0,
    status: "Active",
  },
  {
    id: "TST064",
    name: "Others",
    category: "Semen Analysis",
    unit: "Observation",
    reference: "Nil",
    price: 0,
    status: "Active",
  },

  // ==========================================
  // Additional Tests
  // ==========================================
  {
    id: "TST065",
    name: "Thyroid",
    category: "Additional Tests",
    unit: "Various",
    reference: "TSH: 0.4 - 4.2 µIU/mL, T3/T4: Normal",
    price: 500,
    status: "Active",
  },
  {
    id: "TST066",
    name: "LFT",
    category: "Additional Tests",
    unit: "Various",
    reference: "Bilirubin: 0.2-1.2, SGOT: 5-40, SGPT: 7-56 U/L",
    price: 800,
    status: "Active",
  },
  {
    id: "TST067",
    name: "Vitamin D",
    category: "Additional Tests",
    unit: "ng/mL",
    reference: "Sufficiency: 30.0 - 100.0",
    price: 1000,
    status: "Active",
  },
  {
    id: "TST068",
    name: "Vitamin B12",
    category: "Additional Tests",
    unit: "pg/mL",
    reference: "211 - 911",
    price: 1000,
    status: "Active",
  },
  {
    id: "TST069",
    name: "Iron",
    category: "Additional Tests",
    unit: "µg/dL",
    reference: "Male: 65 - 175, Female: 50 - 170",
    price: 800,
    status: "Active",
  },
  {
    id: "TST070",
    name: "CRP",
    category: "Additional Tests",
    unit: "mg/L",
    reference: "< 6.0 mg/L (Normal)",
    price: 500,
    status: "Active",
  },
  {
    id: "TST071",
    name: "HbA1c",
    category: "Additional Tests",
    unit: "%",
    reference: "Normal: < 5.7%, Diabetic: ≥ 6.5%",
    price: 500,
    status: "Active",
  },
];

const DEFAULT_BRANCHES = [
  {
    id: "BR001",
    name: "Main Branch",
    address: "MG Road, Hyderabad",
    phone: "040-24567890",
    status: "Active",
  },
];

const DEFAULT_PATIENTS = [
  {
    id: "PAT001",
    name: "Mohammed Irfan",
    phone: "9876543210",
    age: "32",
    gender: "Male",
    email: "irfan@example.com",
    referredBy: "Dr. Ahmed Khan",
    branch: "Main Branch",
    date: today(),
    tests: [
      // Clinical Pathology
      "TST001","TST002","TST003","TST004","TST005","TST006","TST007","TST010","TST011","TST012","TST015","TST016",
      // Urine Examinations
      "TST025","TST026","TST027","TST028","TST029","TST030",
      // Bio Chemistry
      "TST037","TST038","TST039","TST040","TST041","TST042",
    ],
  },
  {
    id: "PAT002",
    name: "Ayesha Khan",
    phone: "9988776655",
    age: "28",
    gender: "Female",
    email: "ayesha@example.com",
    referredBy: "Dr. Ahmed Khan",
    branch: "Main Branch",
    date: today(),
    tests: ["TST001","TST003","TST010","TST025","TST026","TST037","TST038"],
  },
  {
    id: "PAT003",
    name: "Arjun Reddy",
    phone: "9123456780",
    age: "45",
    gender: "Male",
    email: "",
    referredBy: "Dr. Ahmed Khan",
    branch: "Main Branch",
    date: today(),
    tests: ["TST001","TST003","TST004","TST005","TST006","TST007"],
  },
];

const DEFAULT_USERS = [
  {
    id: "USR001",
    name: "Administrator",
    username: "admin",
    password: "admin123",
    role: "Administrator",
    status: "Active",
  },
  {
    id: "USR002",
    name: "Lab Technician",
    username: "technician",
    password: "tech123",
    role: "Lab Technician",
    status: "Active",
  },
];

const DEFAULT_REPORTS = [
  {
    id: "REP001",
    patientId: "PAT001",
    doctor: "Dr. Ahmed Khan",
    date: today(),
    status: "Completed",
    results: {
      // Clinical Pathology
      TST001: "13.8",
      TST002: "4.9",
      TST003: "7,200",
      TST004: "2.8",
      TST005: "DC Count",
      TST006: "62",
      TST007: "31",
      TST010: "8",
      TST011: "2:30",
      TST012: "5:00",
      TST015: "B +ve",
      TST016: "Positive",
      // Urine Examinations
      TST025: "Nil",
      TST026: "Nil",
      TST027: "1+",
      TST028: "4-5 cells/hpf",
      TST029: "2-3 cells/hpf",
      TST030: "Nil",
      // Bio Chemistry
      TST037: "92",
      TST038: "128",
      TST039: "145",
      TST040: "38",
      TST041: "42",
      TST042: "0.9",
    },
  },
  {
    id: "REP002",
    patientId: "PAT002",
    doctor: "Dr. Ahmed Khan",
    date: today(),
    status: "Pending",
    results: {
      TST001: "11.2",
      TST003: "6,800",
      TST010: "18",
      TST025: "Nil",
      TST026: "Nil",
      TST037: "105",
      TST038: "140",
    },
  },
];

const DEFAULT_BILLS = [
  {
    id: "BILL001",
    patientId: "PAT001",
    date: today(),
    amount: 600,
    paid: 600,
    mode: "UPI / QR",
    status: "Paid",
  },
  {
    id: "BILL002",
    patientId: "PAT002",
    date: today(),
    amount: 1350,
    paid: 500,
    mode: "Cash",
    status: "Partial",
  },
];

const DEFAULT_MESSAGES = [
  {
    id: "MSG001",
    patient: "Mohammed Irfan",
    phone: "9876543210",
    channel: "WhatsApp",
    type: "Report Ready",
    message: "Dear Mohammed Irfan, your laboratory report (REP001) is ready. Please visit our center or download via portal.",
    date: today(),
    status: "Sent",
  },
  {
    id: "MSG002",
    patient: "Ayesha Khan",
    phone: "9988776655",
    channel: "SMS",
    type: "Payment Reminder",
    message: "Dear Ayesha Khan, please clear your balance of ₹850 at TAZ DIAGNOSTIC. Thank you!",
    date: today(),
    status: "Pending",
  },
];

function seed(force = false) {
  const existingDocs = read(STORAGE.doctors, []);
  if (force || !existingDocs.length || !existingDocs.some((d) => d.name === "Dr. Ahmed Khan")) {
    write(STORAGE.doctors, DEFAULT_DOCTORS);
  }
  
  const existingTests = read(STORAGE.tests, []);
  const catalogVersion = read("taz_tests_catalog_v", 0);
  if (force || !existingTests.length || existingTests.length !== DEFAULT_TESTS.length || catalogVersion < 4) {
    write(STORAGE.tests, DEFAULT_TESTS);
    write("taz_tests_catalog_v", 4);
  }

  // Always ensure branches exist and are valid (v2 check)
  const branchVersion = read("taz_branches_v", 0);
  const existingBranches = read(STORAGE.branches, []);
  if (force || !existingBranches.length || branchVersion < 3) {
    write(STORAGE.branches, DEFAULT_BRANCHES);
    write("taz_branches_v", 3);
  }

  if (force || !localStorage.getItem(STORAGE.users)) write(STORAGE.users, DEFAULT_USERS);

  // Version-bump patients so enriched test assignments propagate
  const patientsV = read("taz_patients_v", 0);
  if (force || !localStorage.getItem(STORAGE.patients) || patientsV < 2) {
    write(STORAGE.patients, DEFAULT_PATIENTS);
    write("taz_patients_v", 2);
  }

  // Version-bump reports so enriched results propagate
  const reportsV = read("taz_reports_v", 0);
  if (force || !localStorage.getItem(STORAGE.reports) || reportsV < 2) {
    write(STORAGE.reports, DEFAULT_REPORTS);
    write("taz_reports_v", 2);
  }
  if (force || !localStorage.getItem(STORAGE.bills)) write(STORAGE.bills, DEFAULT_BILLS);
  if (force || !localStorage.getItem(STORAGE.messages)) write(STORAGE.messages, DEFAULT_MESSAGES);
  if (force || !localStorage.getItem(STORAGE.settings)) {
    write(STORAGE.settings, {
      labName: "TAZ DIAGNOSTIC",
      phone: "040-24567890",
      email: "info@tazdiagnostic.com",
      address: "Hyderabad, Telangana",
      footerNote: "This laboratory report is generated electronically. Please consult your physician for clinical correlation.",
    });
  }
}

/* =========================================================
   COMMON UI PRIMITIVES
   ========================================================= */

function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2600);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className="toast">
      <Check size={18} />
      <span>{message}</span>
    </div>
  );
}

function Button({
  children,
  onClick,
  primary = false,
  danger = false,
  type = "button",
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn ${primary ? "primary" : ""} ${danger ? "danger" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PageHeader({ title, subtitle, children }) {
  return (
    <div className="pagehead">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="headactions">{children}</div>}
    </div>
  );
}

function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
  allowSelf = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected =
    options.find((item) => item.value === value) ||
    (value === "Self" ? { label: "Self", value: "Self" } : null);

  const filtered = options.filter((item) =>
    `${item.label} ${item.meta || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="field">
      <div
        className="selectbox"
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
      >
        <span>{selected?.label || placeholder}</span>
        <ChevronDown size={17} />
      </div>

      {open && (
        <div className="dropdown">
          <div className="dropsearch">
            <Search size={15} />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>

          {allowSelf && (
            <button
              type="button"
              className="dropitem"
              onClick={() => {
                onChange("Self");
                setOpen(false);
              }}
            >
              <strong>Self</strong>
              <span>Patient Direct</span>
            </button>
          )}

          {filtered.map((item) => (
            <button
              type="button"
              key={item.value}
              className="dropitem"
              onClick={() => {
                onChange(item.value);
                setOpen(false);
              }}
            >
              <strong>{item.label}</strong>
              <span>{item.meta}</span>
            </button>
          ))}

          {!filtered.length && !allowSelf && (
            <div className="emptydrop">No matching records</div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   APPLICATION LAYOUT
   ========================================================= */

function Layout({
  route,
  navigate,
  session,
  children,
  logout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menu = [
    ["/dashboard", "Dashboard", Home],
    ["/patients/new", "Patient Entry", User],
    ["/patients", "Patients", Users],
    ["/doctors", "Doctors", Stethoscope],
    ["/tests", "Test Management", FlaskConical],
    ["/test-master", "Test Master", ClipboardList],
    ["/reports", "Reports", FileText],
    ["/messages", "Messages", MessageSquare],
    ["/billing", "Billing", CreditCard],
    ["/analytics", "Analytics", BarChart3],
    ["/branches", "Branches", Building2],
    ["/users", "Users", UserCog],
    ["/settings", "Settings", SettingsIcon],
  ];

  const active =
    menu.find(([path]) => route === path)?.[1] ||
    (route.startsWith("/patients/") ? "Patient Entry" : "Dashboard");

  return (
    <div className="app">
      <div
        className={`sidebar-backdrop ${mobileOpen ? "show" : ""}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brandmark">
            <Activity />
          </div>
          <div>
            <strong>TAZ COMPANY</strong>
            <small>Laboratory Management</small>
          </div>
          <button
            className="mobile-x"
            onClick={() => setMobileOpen(false)}
          >
            <X />
          </button>
        </div>

        <div className="menutitle">MAIN MENU</div>

        <nav>
          {menu.map(([path, label, Ico]) => (
            <button
              key={path}
              className={`navitem ${
                route === path ||
                (path === "/patients/new" &&
                  route.startsWith("/patients/") &&
                  route !== "/patients")
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                navigate(path);
                setMobileOpen(false);
              }}
            >
              <Ico />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebottom">
          <div
            className="profile"
            onClick={() => navigate("/users")}
            style={{ cursor: "pointer" }}
            title="Click to view Users & Roles"
          >
            <div className="avatar">
              {session.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <b>{session.name}</b>
              <small>{session.role}</small>
            </div>
          </div>

          <button className="logout" onClick={logout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <button
              className="mobile-menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </button>
            <span>TAZ COMPANY</span>
            <span>/</span>
            <strong>{active}</strong>
          </div>

          <div className="topuser">
            <div className="avatar">
              {session.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <b>{session.name}</b>
              <small>{session.role}</small>
            </div>
          </div>
        </header>

        <section className="content">{children}</section>
      </main>
    </div>
  );
}

/* =========================================================
   PAGE: LOGIN
   ========================================================= */

function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function submit(e) {
    if (e) e.preventDefault();
    const users = read(STORAGE.users, DEFAULT_USERS);
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password
    );

    if (!user) {
      setError("Invalid username or password.");
      return;
    }
    onLogin(user);
  }

  const fillAndLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
    const users = read(STORAGE.users, DEFAULT_USERS);
    const user = users.find((x) => x.username === u && x.password === p);
    if (user) onLogin(user);
  };

  return (
    <div className="login">
      <div className="loginpanel">
        <div className="loginbrand">
          <div className="brandmark">
            <Activity />
          </div>
          <h1>TAZ COMPANY</h1>
          <p>Laboratory Management System</p>
          <div className="hint">
            Complete patient registration, laboratory testing, reporting, billing
            and multi-branch management.
          </div>
        </div>

        <form className="loginform" onSubmit={submit}>
          <h2>Welcome Back</h2>
          <p>Sign in to access your laboratory workstation.</p>

          <div className="field">
            <label>Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </div>

          <div className="field pass" style={{ marginTop: 16 }}>
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: 0,
                  background: "transparent",
                  color: "#8c757e",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button className="btn primary" type="submit" style={{ width: "100%", marginTop: 18 }}>
            Sign In
          </button>

          <div style={{ marginTop: 22 }}>
            <span style={{ fontSize: 11, color: "#8c757e", fontWeight: 700 }}>
              QUICK LOGIN CHIPS (CLICK TO SIGN IN):
            </span>
            <div className="role-chips">
              <button
                type="button"
                className="role-chip"
                onClick={() => fillAndLogin("admin", "admin123")}
              >
                Admin (Full Access)
              </button>
              <button
                type="button"
                className="role-chip"
                onClick={() => fillAndLogin("technician", "tech123")}
              >
                Technician (Lab Ops)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE: DASHBOARD
   ========================================================= */

function Dashboard({ navigate, onToast }) {
  const patients = read(STORAGE.patients, DEFAULT_PATIENTS);
  const tests = read(STORAGE.tests, DEFAULT_TESTS);
  const reports = read(STORAGE.reports, DEFAULT_REPORTS);
  const bills = read(STORAGE.bills, DEFAULT_BILLS);
  const branches = read(STORAGE.branches, DEFAULT_BRANCHES);

  const revenue = bills.reduce((sum, bill) => sum + Number(bill.paid || 0), 0);
  const pending = reports.filter((r) => r.status !== "Completed").length;

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle="Laboratory overview and daily operations."
      >
        <Button onClick={() => navigate("/patients/new")} primary>
          <Plus size={16} /> New Patient
        </Button>
      </PageHeader>

      <div className="stats">
        <div className="stat" style={{ cursor: "pointer" }} onClick={() => navigate("/patients")}>
          <div className="staticon">
            <Users />
          </div>
          <div>
            <span>Total Patients</span>
            <strong>{patients.length}</strong>
            <small>Registered patients</small>
          </div>
        </div>

        <div className="stat" style={{ cursor: "pointer" }} onClick={() => navigate("/tests")}>
          <div className="staticon">
            <FlaskConical />
          </div>
          <div>
            <span>Active Tests</span>
            <strong>{tests.length}</strong>
            <small>Available tests</small>
          </div>
        </div>

        <div className="stat" style={{ cursor: "pointer" }} onClick={() => navigate("/reports")}>
          <div className="staticon">
            <AlertCircle />
          </div>
          <div>
            <span>Pending Reports</span>
            <strong>{pending}</strong>
            <small>Need technician action</small>
          </div>
        </div>

        <div className="stat" style={{ cursor: "pointer" }} onClick={() => navigate("/reports")}>
          <div className="staticon">
            <FileText />
          </div>
          <div>
            <span>Total Reports</span>
            <strong>{reports.length}</strong>
            <small>Generated reports</small>
          </div>
        </div>

        <div className="stat" style={{ cursor: "pointer" }} onClick={() => navigate("/billing")}>
          <div className="staticon">
            <CreditCard />
          </div>
          <div>
            <span>Collected</span>
            <strong>{money(revenue)}</strong>
            <small>Received payments</small>
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardhead">
            <div>
              <h3>Revenue Overview</h3>
              <p>Collected payments from diagnostic services.</p>
            </div>
            <BarChart3 />
          </div>

          <div className="bars">
            {[35, 55, 42, 72, 62, 84, 68].map((height, i) => (
              <div className="barcol" key={i}>
                <div className="bar" style={{ height: `${height}%` }} />
                <small>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </small>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="cardhead">
            <div>
              <h3>Quick Actions</h3>
              <p>Frequently accessed operations.</p>
            </div>
          </div>

          <div className="quickgrid">
            <button
              className="quick"
              onClick={() => navigate("/patients/new")}
            >
              <User /> New Patient
            </button>
            <button
              className="quick"
              onClick={() => navigate("/reports")}
            >
              <FileText /> Reports
            </button>
            <button
              className="quick"
              onClick={() => navigate("/billing")}
            >
              <CreditCard /> Billing
            </button>
            <button
              className="quick"
              onClick={() => navigate("/messages")}
            >
              <MessageSquare /> Messages
            </button>
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardhead">
            <div>
              <h3>Recent Patients</h3>
              <p>Latest patient admissions.</p>
            </div>
            <button
              className="link"
              onClick={() => navigate("/patients")}
            >
              View All
            </button>
          </div>

          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Branch</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 5).map((patient) => (
                  <tr key={patient.id}>
                    <td>
                      <b>{patient.name}</b>
                      <small>{patient.id}</small>
                    </td>
                    <td>{patient.phone}</td>
                    <td>{patient.branch}</td>
                    <td>{patient.date}</td>
                    <td className="actions">
                      <button
                        title="View Reports"
                        onClick={() => navigate(`/reports?patient=${patient.id}`)}
                      >
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="cardhead">
            <div>
              <h3>Branches</h3>
              <p>Network centers overview.</p>
            </div>
            <button
              className="link"
              onClick={() => navigate("/branches")}
            >
              Manage
            </button>
          </div>

          {branches.map((branch) => (
            <div className="summaryrow" key={branch.id}>
              <Building2 size={17} />
              <span>{branch.name}</span>
              <b>{branch.status}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE: PATIENT ENTRY
   ========================================================= */

function PatientEntry({ navigate, onToast }) {
  const doctors = read(STORAGE.doctors, DEFAULT_DOCTORS);
  const tests = read(STORAGE.tests, DEFAULT_TESTS);
  const branches = read(STORAGE.branches, DEFAULT_BRANCHES);
  const patients = read(STORAGE.patients, DEFAULT_PATIENTS);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "Male",
    email: "",
    referredBy: "Dr. Ahmed Khan",
    branch: branches[0]?.name || "Main Branch",
  });

  const [selectedTests, setSelectedTests] = useState([]);
  const [saved, setSaved] = useState(false);

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor.name,
    label: doctor.name,
    meta: doctor.specialization,
  }));

  function toggleTest(id) {
    setSelectedTests((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function selectAllInCategory(category) {
    const catTestIds = tests
      .filter((t) => t.category === category)
      .map((t) => t.id);
    setSelectedTests((prev) => [...new Set([...prev, ...catTestIds])]);
  }

  function clearAllTests() {
    setSelectedTests([]);
  }

  const calculatedTotal = useMemo(() => {
    return tests
      .filter((t) => selectedTests.includes(t.id))
      .reduce((sum, t) => sum + Number(t.price || 0), 0);
  }, [tests, selectedTests]);

  function submit(e) {
    e.preventDefault();

    if (!form.name || !form.phone || !form.age || !form.gender) {
      alert("Please complete the required patient details.");
      return;
    }

    if (!selectedTests.length) {
      alert("Please select at least one laboratory test.");
      return;
    }

    const currentPatients = read(STORAGE.patients, DEFAULT_PATIENTS);
    const patient = {
      id: nextId("PAT", currentPatients),
      ...form,
      date: today(),
      tests: selectedTests,
    };

    write(STORAGE.patients, [...currentPatients, patient]);

    // Auto create report
    const reports = read(STORAGE.reports, DEFAULT_REPORTS);
    write(STORAGE.reports, [
      ...reports,
      {
        id: nextId("REP", reports),
        patientId: patient.id,
        doctor: form.referredBy || "Self",
        date: today(),
        status: "Pending",
        results: {},
      },
    ]);

    // Auto create bill
    const bills = read(STORAGE.bills, DEFAULT_BILLS);
    write(STORAGE.bills, [
      ...bills,
      {
        id: nextId("BILL", bills),
        patientId: patient.id,
        date: today(),
        amount: calculatedTotal,
        paid: 0,
        mode: "Cash",
        status: "Pending",
      },
    ]);

    setSaved(true);
    onToast(`Patient ${patient.name} registered successfully! ID: ${patient.id}`);

    setTimeout(() => {
      navigate("/patients");
    }, 800);
  }

  return (
    <>
      <PageHeader
        title="Patient Entry"
        subtitle="Register a new patient, select lab tests, and generate orders."
      >
        <Button onClick={clearAllTests}>
          <RefreshCw size={14} /> Clear Selection
        </Button>
      </PageHeader>

      <form onSubmit={submit}>
        <div className="card formcard">
          <div className="sectiontitle">
            <User />
            <div>
              <h3>Patient Demographics</h3>
              <p>Enter patient personal and contact information.</p>
            </div>
          </div>

          <div className="formgrid">
            <div className="field">
              <label>Next Patient ID</label>
              <input value={nextId("PAT", patients)} disabled />
            </div>

            <div className="field">
              <label>Full Patient Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div className="field">
              <label>Phone Number *</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile number"
              />
            </div>

            <div className="field">
              <label>Age *</label>
              <input
                required
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                placeholder="e.g. 35"
              />
            </div>

            <div className="field">
              <label>Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="patient@example.com (optional)"
              />
            </div>

            <div className="field">
              <label>Referred By Doctor</label>
              <SearchSelect
                value={form.referredBy}
                onChange={(value) => setForm({ ...form, referredBy: value })}
                options={doctorOptions}
                placeholder="Select Doctor / Self"
                allowSelf
              />
            </div>

            <div className="field">
              <label>Branch Center</label>
              <select
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card formcard" style={{ marginTop: 18 }}>
          <div className="sectiontitle">
            <FlaskConical />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Test Selection Panel</h3>
                <span className="badge active" style={{ fontSize: 12 }}>
                  Selected: {selectedTests.length} tests · Total: {money(calculatedTotal)}
                </span>
              </div>
              <p>Click any test card to include or remove it from the patient panel.</p>
            </div>
          </div>

          {[
            "Clinical Pathology",
            "Urine Examinations",
            "Bio Chemistry",
            "Motion Examination",
            "Semen Analysis",
            "Additional Tests",
          ].map((category) => {
              const categoryTests = tests.filter(
                (test) => test.category === category
              );
              if (!categoryTests.length) return null;

              return (
                <div key={category} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <h4 style={{ color: "#5b0a1a", margin: 0 }}>
                      {category}
                    </h4>
                    <button
                      type="button"
                      className="tab"
                      style={{ padding: "3px 8px", fontSize: 10 }}
                      onClick={() => selectAllInCategory(category)}
                    >
                      + Select All {category}
                    </button>
                  </div>

                  <div className="quickgrid">
                    {categoryTests.map((test) => {
                      const selected = selectedTests.includes(test.id);
                      return (
                        <button
                          type="button"
                          key={test.id}
                          className="quick"
                          style={{
                            borderColor: selected ? "#8b1730" : undefined,
                            background: selected ? "#fff0f3" : undefined,
                          }}
                          onClick={() => toggleTest(test.id)}
                        >
                          {selected ? (
                            <Check color="#8b1730" size={18} />
                          ) : (
                            <FlaskConical size={18} />
                          )}
                          <span>
                            {test.name}
                            <small>
                              {test.price ? money(test.price) : "Included"} · {test.unit} ({test.reference})
                            </small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}

          <div className="notice">
            <b>{selectedTests.length}</b> laboratory test(s) selected totaling <b>{money(calculatedTotal)}</b>.
            Saving will automatically create corresponding report and invoice records.
          </div>

          {saved && (
            <div className="success">
              Patient registered successfully! Generating records...
            </div>
          )}

          <div className="formactions">
            <Button onClick={() => navigate("/patients")}>
              Cancel
            </Button>
            <Button primary type="submit">
              <Check size={16} /> Complete & Register Patient
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}

/* =========================================================
   PAGE: PATIENTS DIRECTORY
   ========================================================= */

function Patients({ navigate, onToast }) {
  const [patients, setPatients] = useState(() =>
    read(STORAGE.patients, DEFAULT_PATIENTS)
  );
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // stores patient id to delete

  const filtered = patients.filter((patient) =>
    `${patient.name} ${patient.id} ${patient.phone} ${patient.branch}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function remove(id) {
    const next = patients.filter((patient) => patient.id !== id);
    setPatients(next);
    write(STORAGE.patients, next);
    setConfirmDelete(null);
    onToast("Patient record deleted.");
  }

  function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingPatient) return;
    const next = patients.map((p) =>
      p.id === editingPatient.id ? editingPatient : p
    );
    setPatients(next);
    write(STORAGE.patients, next);
    setEditingPatient(null);
    onToast(`Patient ${editingPatient.name} updated successfully!`);
  }

  return (
    <>
      <PageHeader
        title="Patients Directory"
        subtitle="Search, view, update, and manage registered patients."
      >
        <Button primary onClick={() => navigate("/patients/new")}>
          <Plus size={16} /> Add Patient
        </Button>
      </PageHeader>

      <div className="card">
        <div className="toolbar">
          <div className="search">
            <Search size={17} />
            <input
              placeholder="Search by name, patient ID, phone, or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ border: 0, background: "transparent", cursor: "pointer" }}
              >
                <X size={15} />
              </button>
            )}
          </div>
          <span className="badge active">
            {filtered.length} Patients
          </span>
        </div>

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Age / Gender</th>
                <th>Referred By</th>
                <th>Branch</th>
                <th>Tests</th>
                <th>Reg. Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <b>{patient.name}</b>
                    <small>{patient.id}</small>
                  </td>
                  <td>{patient.phone}</td>
                  <td>
                    {patient.age} yrs / {patient.gender}
                  </td>
                  <td>{patient.referredBy || "Self"}</td>
                  <td>{patient.branch}</td>
                  <td>
                    <span className="badge">{patient.tests?.length || 0} tests</span>
                  </td>
                  <td>{patient.date}</td>
                  <td className="actions">
                    <button
                      title="View Details"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      title="Edit Patient"
                      onClick={() => setEditingPatient({ ...patient })}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      title="View Reports"
                      onClick={() => navigate(`/reports?patient=${patient.id}`)}
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      title="Delete Patient"
                      onClick={() => setConfirmDelete(patient.id)}
                    >
                      <Trash2 size={16} color="#a12929" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW PATIENT MODAL */}
      {selectedPatient && (
        <div className="modalshade">
          <div className="modal">
            <div className="modalhead">
              <h3>Patient Profile — {selectedPatient.id}</h3>
              <button
                className="close"
                type="button"
                onClick={() => setSelectedPatient(null)}
              >
                ×
              </button>
            </div>

            <div className="receipt-box">
              <div className="receipt-row">
                <b>Full Name</b>
                <span>{selectedPatient.name}</span>
              </div>
              <div className="receipt-row">
                <b>Phone</b>
                <span>{selectedPatient.phone}</span>
              </div>
              <div className="receipt-row">
                <b>Age / Gender</b>
                <span>{selectedPatient.age} / {selectedPatient.gender}</span>
              </div>
              <div className="receipt-row">
                <b>Email</b>
                <span>{selectedPatient.email || "Not Provided"}</span>
              </div>
              <div className="receipt-row">
                <b>Branch</b>
                <span>{selectedPatient.branch}</span>
              </div>
              <div className="receipt-row">
                <b>Referred By</b>
                <span>{selectedPatient.referredBy || "Self"}</span>
              </div>
              <div className="receipt-row">
                <b>Registration Date</b>
                <span>{selectedPatient.date}</span>
              </div>
              <div className="receipt-row">
                <b>Enrolled Tests</b>
                <span>{selectedPatient.tests?.join(", ") || "None"}</span>
              </div>
            </div>

            <div className="formactions" style={{ marginTop: 15 }}>
              <Button
                primary
                onClick={() => {
                  const pid = selectedPatient.id;
                  setSelectedPatient(null);
                  navigate(`/reports?patient=${pid}`);
                }}
              >
                <FileText size={15} /> Open Lab Report
              </Button>
              <Button onClick={() => setSelectedPatient(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PATIENT MODAL */}
      {editingPatient && (
        <div className="modalshade">
          <form className="modal" onSubmit={handleSaveEdit}>
            <div className="modalhead">
              <h3>Edit Patient — {editingPatient.id}</h3>
              <button
                className="close"
                type="button"
                onClick={() => setEditingPatient(null)}
              >
                ×
              </button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Full Name</label>
                <input
                  required
                  value={editingPatient.name}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, name: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Phone</label>
                <input
                  required
                  value={editingPatient.phone}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, phone: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Age</label>
                <input
                  required
                  value={editingPatient.age}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, age: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Gender</label>
                <select
                  value={editingPatient.gender}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, gender: e.target.value })
                  }
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  value={editingPatient.email || ""}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, email: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Referred By</label>
                <input
                  value={editingPatient.referredBy || ""}
                  onChange={(e) =>
                    setEditingPatient({ ...editingPatient, referredBy: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => setEditingPatient(null)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDelete && (
        <div className="modalshade">
          <div className="modal" style={{ maxWidth: 420, textAlign: "center" }}>
            <div style={{ padding: "10px 0 18px" }}>
              <Trash2 size={40} color="#a12929" style={{ marginBottom: 12 }} />
              <h3 style={{ margin: "0 0 8px", color: "#350913" }}>Delete Patient?</h3>
              <p style={{ margin: 0, color: "#836f77", fontSize: 14 }}>
                This will permanently remove the patient record. This action cannot be undone.
              </p>
            </div>
            <div className="formactions" style={{ justifyContent: "center", gap: 12 }}>
              <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <button
                onClick={() => remove(confirmDelete)}
                style={{
                  padding: "9px 22px",
                  borderRadius: 8,
                  border: 0,
                  background: "#a12929",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <Trash2 size={15} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   PAGE: DOCTORS
   ========================================================= */

function Doctors({ onToast }) {
  const [doctors, setDoctors] = useState(() =>
    read(STORAGE.doctors, DEFAULT_DOCTORS)
  );
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
  });

  const filtered = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialization}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function saveAdd(e) {
    e.preventDefault();
    if (!form.name || !form.specialization) return;

    const next = [
      ...doctors,
      {
        id: nextId("DOC", doctors),
        ...form,
        status: "Active",
      },
    ];
    setDoctors(next);
    write(STORAGE.doctors, next);
    setForm({ name: "", specialization: "", phone: "", email: "" });
    setShowAdd(false);
    onToast(`Doctor ${form.name} added successfully!`);
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editingDoctor) return;
    const next = doctors.map((d) =>
      d.id === editingDoctor.id ? editingDoctor : d
    );
    setDoctors(next);
    write(STORAGE.doctors, next);
    setEditingDoctor(null);
    onToast(`Doctor ${editingDoctor.name} updated!`);
  }

  function toggleStatus(id) {
    const next = doctors.map((d) =>
      d.id === id
        ? { ...d, status: d.status === "Active" ? "Inactive" : "Active" }
        : d
    );
    setDoctors(next);
    write(STORAGE.doctors, next);
    onToast("Doctor status changed.");
  }

  function remove(id) {
    if (!confirm("Are you sure you want to remove this doctor?")) return;
    const next = doctors.filter((d) => d.id !== id);
    setDoctors(next);
    write(STORAGE.doctors, next);
    onToast("Doctor removed.");
  }

  return (
    <>
      <PageHeader
        title="Doctors Management"
        subtitle="Manage referring doctors, specializations, and credentials."
      >
        <Button primary onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Doctor
        </Button>
      </PageHeader>

      <div className="card">
        <div className="toolbar">
          <div className="search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors by name or specialization..."
            />
          </div>
          <span className="badge active">{filtered.length} Doctors</span>
        </div>

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doctor) => (
                <tr key={doctor.id}>
                  <td>
                    <b>{doctor.name}</b>
                    <small>{doctor.id}</small>
                  </td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.phone}</td>
                  <td>{doctor.email}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleStatus(doctor.id)}
                      className={`badge ${doctor.status === "Active" ? "active" : "inactive"}`}
                      style={{ border: 0, cursor: "pointer" }}
                      title="Click to toggle status"
                    >
                      {doctor.status}
                    </button>
                  </td>
                  <td className="actions">
                    <button
                      title="Edit Doctor"
                      onClick={() => setEditingDoctor({ ...doctor })}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      title="Delete Doctor"
                      onClick={() => remove(doctor.id)}
                    >
                      <Trash2 size={16} color="#a12929" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD DOCTOR MODAL */}
      {showAdd && (
        <div className="modalshade">
          <form className="modal" onSubmit={saveAdd}>
            <div className="modalhead">
              <h3>Add New Doctor</h3>
              <button
                className="close"
                type="button"
                onClick={() => setShowAdd(false)}
              >
                ×
              </button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Doctor Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar"
                />
              </div>

              <div className="field">
                <label>Specialization *</label>
                <input
                  required
                  value={form.specialization}
                  onChange={(e) =>
                    setForm({ ...form, specialization: e.target.value })
                  }
                  placeholder="e.g. Pathologist / Cardiologist"
                />
              </div>

              <div className="field">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Save Doctor
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT DOCTOR MODAL */}
      {editingDoctor && (
        <div className="modalshade">
          <form className="modal" onSubmit={saveEdit}>
            <div className="modalhead">
              <h3>Edit Doctor — {editingDoctor.id}</h3>
              <button
                className="close"
                type="button"
                onClick={() => setEditingDoctor(null)}
              >
                ×
              </button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Doctor Name</label>
                <input
                  required
                  value={editingDoctor.name}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, name: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Specialization</label>
                <input
                  required
                  value={editingDoctor.specialization}
                  onChange={(e) =>
                    setEditingDoctor({
                      ...editingDoctor,
                      specialization: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Phone</label>
                <input
                  value={editingDoctor.phone}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, phone: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  value={editingDoctor.email}
                  onChange={(e) =>
                    setEditingDoctor({ ...editingDoctor, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => setEditingDoctor(null)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Update Doctor
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/* =========================================================
   PAGE: TEST MANAGEMENT
   ========================================================= */

function TestManagement({ navigate, onToast }) {
  const [tests, setTests] = useState(() => read(STORAGE.tests, DEFAULT_TESTS));
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editingTest, setEditingTest] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const categories = [
    "All",
    "Clinical Pathology",
    "Urine Examinations",
    "Bio Chemistry",
    "Motion Examination",
    "Semen Analysis",
    "Additional Tests",
  ];

  const filtered = tests.filter((test) => {
    const matchesCategory =
      selectedCategory === "All" || test.category === selectedCategory;
    const matchesSearch = `${test.name} ${test.category}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function toggle(id) {
    const next = tests.map((test) =>
      test.id === id
        ? {
            ...test,
            status: test.status === "Active" ? "Inactive" : "Active",
          }
        : test
    );
    setTests(next);
    write(STORAGE.tests, next);
    onToast("Test availability toggled.");
  }

  function remove(id) {
    const next = tests.filter((t) => t.id !== id);
    setTests(next);
    write(STORAGE.tests, next);
    setConfirmDelete(null);
    onToast("Test removed from catalog.");
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editingTest) return;
    const next = tests.map((t) => (t.id === editingTest.id ? editingTest : t));
    setTests(next);
    write(STORAGE.tests, next);
    setEditingTest(null);
    onToast(`Test "${editingTest.name}" updated successfully!`);
  }

  return (
    <>
      <PageHeader
        title="Test Management"
        subtitle="Manage laboratory test offerings, active status, and catalog."
      >
        <Button primary onClick={() => navigate("/test-master")}>
          <Plus size={16} /> Open Test Master
        </Button>
      </PageHeader>

      <div className="stats mini">
        <div className="stat">
          <div className="staticon">
            <Database />
          </div>
          <div>
            <span>Total Tests</span>
            <strong>{tests.length}</strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <Check />
          </div>
          <div>
            <span>Active Tests</span>
            <strong>{tests.filter((t) => t.status === "Active").length}</strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <AlertCircle />
          </div>
          <div>
            <span>Inactive Tests</span>
            <strong>{tests.filter((t) => t.status !== "Active").length}</strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <CreditCard />
          </div>
          <div>
            <span>Avg. Price</span>
            <strong>
              {money(
                tests.reduce((a, b) => a + Number(b.price || 0), 0) /
                  Math.max(1, tests.length)
              )}
            </strong>
          </div>
        </div>
      </div>

      <div className="tabs">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            className={`tab ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests..."
            />
          </div>
        </div>

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Reference Range</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((test) => (
                <tr key={test.id}>
                  <td>
                    <b>{test.name}</b>
                    <small>{test.id}</small>
                  </td>
                  <td>{test.category}</td>
                  <td>{test.unit}</td>
                  <td>{test.reference}</td>
                  <td>{test.price > 0 ? money(test.price) : "— —"}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggle(test.id)}
                      className={`badge ${test.status === "Active" ? "active" : "inactive"}`}
                      style={{ border: 0, cursor: "pointer" }}
                      title="Click to toggle Active / Inactive"
                    >
                      {test.status}
                    </button>
                  </td>
                  <td className="actions">
                    <button
                      title="Edit Test"
                      onClick={() => setEditingTest({ ...test })}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      title="Delete Test"
                      onClick={() => setConfirmDelete(test.id)}
                    >
                      <Trash2 size={16} color="#a12929" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT TEST MODAL */}
      {editingTest && (
        <div className="modalshade">
          <form className="modal" onSubmit={saveEdit}>
            <div className="modalhead">
              <h3>Edit Test — {editingTest.id}</h3>
              <button type="button" className="close" onClick={() => setEditingTest(null)}>×</button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Test Name *</label>
                <input
                  required
                  value={editingTest.name}
                  onChange={(e) => setEditingTest({ ...editingTest, name: e.target.value })}
                  placeholder="e.g. Haemoglobin"
                />
              </div>

              <div className="field">
                <label>Category</label>
                <select
                  value={editingTest.category}
                  onChange={(e) => setEditingTest({ ...editingTest, category: e.target.value })}
                >
                  {categories.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Unit</label>
                <input
                  value={editingTest.unit || ""}
                  onChange={(e) => setEditingTest({ ...editingTest, unit: e.target.value })}
                  placeholder="e.g. g/dL"
                />
              </div>

              <div className="field">
                <label>Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={editingTest.price || 0}
                  onChange={(e) => setEditingTest({ ...editingTest, price: Number(e.target.value) })}
                  placeholder="e.g. 100"
                />
              </div>

              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Reference Range</label>
                <input
                  value={editingTest.reference || ""}
                  onChange={(e) => setEditingTest({ ...editingTest, reference: e.target.value })}
                  placeholder="e.g. Male: 13.0 - 17.0, Female: 12.0 - 15.0"
                />
              </div>

              <div className="field">
                <label>Status</label>
                <select
                  value={editingTest.status}
                  onChange={(e) => setEditingTest({ ...editingTest, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => setEditingTest(null)}>Cancel</Button>
              <Button primary type="submit"><Check size={16} /> Save Changes</Button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDelete && (
        <div className="modalshade">
          <div className="modal" style={{ maxWidth: 420, textAlign: "center" }}>
            <div style={{ padding: "10px 0 18px" }}>
              <Trash2 size={40} color="#a12929" style={{ marginBottom: 12 }} />
              <h3 style={{ margin: "0 0 8px", color: "#350913" }}>Delete Test?</h3>
              <p style={{ margin: 0, color: "#836f77", fontSize: 14 }}>
                This will permanently remove the test from the catalog.
              </p>
            </div>
            <div className="formactions" style={{ justifyContent: "center", gap: 12 }}>
              <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <button
                onClick={() => remove(confirmDelete)}
                style={{
                  padding: "9px 22px", borderRadius: 8, border: 0,
                  background: "#a12929", color: "#fff", fontWeight: 700,
                  fontSize: 14, cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 7,
                }}
              >
                <Trash2 size={15} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   PAGE: TEST MASTER
   ========================================================= */

function TestMaster({ onToast }) {
  const [tests, setTests] = useState(() => read(STORAGE.tests, DEFAULT_TESTS));
  const [show, setShow] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "Clinical Pathology",
    unit: "",
    reference: "",
    price: "",
  });

  function saveAdd(e) {
    e.preventDefault();
    if (!form.name) return;

    const next = [
      ...tests,
      {
        id: nextId("TST", tests),
        ...form,
        price: Number(form.price || 0),
        status: "Active",
      },
    ];
    setTests(next);
    write(STORAGE.tests, next);
    setForm({ name: "", category: "Clinical Pathology", unit: "", reference: "", price: "" });
    setShow(false);
    onToast(`Test ${form.name} created successfully!`);
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editingTest) return;

    const next = tests.map((t) =>
      t.id === editingTest.id
        ? { ...editingTest, price: Number(editingTest.price || 0) }
        : t
    );
    setTests(next);
    write(STORAGE.tests, next);
    setEditingTest(null);
    onToast(`Test ${editingTest.name} updated successfully!`);
  }

  function remove(id) {
    if (!confirm("Are you sure you want to delete this test?")) return;
    const next = tests.filter((t) => t.id !== id);
    setTests(next);
    write(STORAGE.tests, next);
    onToast("Test deleted.");
  }

  function resetToDefaultTests() {
    if (!confirm("Reset test master to the full 71 standard tests catalog?")) return;
    setTests(DEFAULT_TESTS);
    write(STORAGE.tests, DEFAULT_TESTS);
    onToast("Reset to 71 standard laboratory tests!");
  }

  return (
    <>
      <PageHeader
        title="Test Master"
        subtitle="Define, price, and maintain comprehensive laboratory tests (71 Clinical Tests across 6 departments)."
      >
        <Button onClick={resetToDefaultTests}>
          <RefreshCw size={16} /> Reset 71 Clinical Tests
        </Button>
        <Button primary onClick={() => setShow(true)}>
          <Plus size={16} /> Add Test
        </Button>
      </PageHeader>

      <div className="card">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Test Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Reference Range</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td>{test.id}</td>
                  <td>
                    <b>{test.name}</b>
                  </td>
                  <td>{test.category}</td>
                  <td>{test.unit}</td>
                  <td>{test.reference}</td>
                  <td>{test.price > 0 ? money(test.price) : "— —"}</td>
                  <td className="actions">
                    <button
                      title="Edit Test"
                      onClick={() => setEditingTest({ ...test })}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      title="Delete Test"
                      onClick={() => remove(test.id)}
                    >
                      <Trash2 size={16} color="#a12929" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD TEST MODAL */}
      {show && (
        <div className="modalshade">
          <form className="modal" onSubmit={saveAdd}>
            <div className="modalhead">
              <h3>Add Laboratory Test</h3>
              <button
                type="button"
                className="close"
                onClick={() => setShow(false)}
              >
                ×
              </button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Test Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Serum Creatinine"
                />
              </div>

              <div className="field">
                <label>Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Clinical Pathology">Clinical Pathology</option>
                  <option value="Urine Examinations">Urine Examinations</option>
                  <option value="Bio Chemistry">Bio Chemistry</option>
                  <option value="Motion Examination">Motion Examination</option>
                  <option value="Semen Analysis">Semen Analysis</option>
                  <option value="Additional Tests">Additional Tests</option>
                </select>
              </div>

              <div className="field">
                <label>Unit</label>
                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="e.g. mg/dL or g/dL"
                />
              </div>

              <div className="field">
                <label>Reference Range</label>
                <input
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="e.g. 0.7 - 1.3"
                />
              </div>

              <div className="field">
                <label>Price (₹) *</label>
                <input
                  required
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. 250"
                />
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => setShow(false)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Save Test
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT TEST MODAL */}
      {editingTest && (
        <div className="modalshade">
          <form className="modal" onSubmit={saveEdit}>
            <div className="modalhead">
              <h3>Edit Test — {editingTest.id}</h3>
              <button
                type="button"
                className="close"
                onClick={() => setEditingTest(null)}
              >
                ×
              </button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Test Name</label>
                <input
                  required
                  value={editingTest.name}
                  onChange={(e) =>
                    setEditingTest({ ...editingTest, name: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Category</label>
                <select
                  value={editingTest.category}
                  onChange={(e) =>
                    setEditingTest({ ...editingTest, category: e.target.value })
                  }
                >
                  <option value="Clinical Pathology">Clinical Pathology</option>
                  <option value="Urine Examinations">Urine Examinations</option>
                  <option value="Bio Chemistry">Bio Chemistry</option>
                  <option value="Motion Examination">Motion Examination</option>
                  <option value="Semen Analysis">Semen Analysis</option>
                  <option value="Additional Tests">Additional Tests</option>
                </select>
              </div>

              <div className="field">
                <label>Unit</label>
                <input
                  value={editingTest.unit}
                  onChange={(e) =>
                    setEditingTest({ ...editingTest, unit: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Reference Range</label>
                <input
                  value={editingTest.reference}
                  onChange={(e) =>
                    setEditingTest({ ...editingTest, reference: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Price (₹)</label>
                <input
                  required
                  type="number"
                  value={editingTest.price}
                  onChange={(e) =>
                    setEditingTest({ ...editingTest, price: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => setEditingTest(null)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Update Test
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/* =========================================================
   PAGE: REPORTS WORKFLOW & VIEWER
   ========================================================= */

function Reports({ onToast }) {
  const patients = read(STORAGE.patients, DEFAULT_PATIENTS);
  const tests = read(STORAGE.tests, DEFAULT_TESTS);
  const [reports, setReports] = useState(() =>
    read(STORAGE.reports, DEFAULT_REPORTS)
  );
  const settings = read(STORAGE.settings, {
    labName: "TAZ DIAGNOSTIC",
    phone: "040-24567890",
    email: "info@tazdiagnostic.com",
    address: "Hyderabad, Telangana",
    footerNote: "This report is generated electronically.",
  });

  const [filterTab, setFilterTab] = useState("All");

  // Check URL param if patient is specified
  const urlParams = new URLSearchParams(window.location.search);
  const patientParam = urlParams.get("patient");

  const initialReportId = useMemo(() => {
    if (patientParam) {
      const match = reports.find((r) => r.patientId === patientParam);
      if (match) return match.id;
    }
    return reports[0]?.id || "";
  }, [patientParam, reports]);

  const [selectedReport, setSelectedReport] = useState(initialReportId);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [newReportPatientId, setNewReportPatientId] = useState("");

  const filteredReports = reports.filter((r) => {
    if (filterTab === "Pending") return r.status !== "Completed";
    if (filterTab === "Completed") return r.status === "Completed";
    return true;
  });

  const report = reports.find((r) => r.id === selectedReport);
  const patient = patients.find((p) => p.id === report?.patientId);

  const CLINICAL_GROUPS = [
    "Clinical Pathology",
    "Urine Examinations",
    "Bio Chemistry",
    "Motion Examination",
    "Semen Analysis",
    "Additional Tests",
  ];

  const [activeGroupPage, setActiveGroupPage] = useState("All");
  const [sheetScope, setSheetScope] = useState("prescribed");
  const [panelMode, setPanelMode] = useState("ordered");
  const [resultFilterCategory, setResultFilterCategory] = useState("All");
  const [resultScope, setResultScope] = useState("prescribed");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const selectedTests = patient
    ? tests.filter((test) => patient.tests?.includes(test.id))
    : [];

  const availableGroups = useMemo(() => {
    if (sheetScope === "prescribed" || panelMode === "ordered") {
      if (patient?.tests?.length) {
        const active = CLINICAL_GROUPS.filter((grp) =>
          tests.some((t) => t.category === grp && patient.tests.includes(t.id))
        );
        return active.length ? active : [CLINICAL_GROUPS[0]];
      }
    }
    return CLINICAL_GROUPS;
  }, [sheetScope, panelMode, patient, tests]);

  const displayedGroups = useMemo(() => {
    if (activeGroupPage === "All") return availableGroups;
    if (availableGroups.includes(activeGroupPage)) return [activeGroupPage];
    return availableGroups;
  }, [activeGroupPage, availableGroups]);

  const resultTests = useMemo(() => {
    const base =
      resultScope === "prescribed" && selectedTests.length
        ? selectedTests
        : tests;
    if (resultFilterCategory === "All") return base;
    return base.filter((t) => t.category === resultFilterCategory);
  }, [resultScope, selectedTests, tests, resultFilterCategory]);

  function updateResult(testId, value) {
    if (!report) return;
    const next = reports.map((item) =>
      item.id === report.id
        ? {
            ...item,
            results: {
              ...item.results,
              [testId]: value,
            },
            status: "In Progress",
          }
        : item
    );
    setReports(next);
    write(STORAGE.reports, next);
  }

  function completeReport() {
    if (!report) return;
    const next = reports.map((item) =>
      item.id === report.id ? { ...item, status: "Completed" } : item
    );
    setReports(next);
    write(STORAGE.reports, next);
    onToast(`Report ${report.id} marked as Completed!`);
  }

  function sendReportReadyMessage() {
    if (!patient || !report) return;
    const currentMessages = read(STORAGE.messages, DEFAULT_MESSAGES);
    const newMsg = {
      id: nextId("MSG", currentMessages),
      patient: patient.name,
      phone: patient.phone,
      channel: "WhatsApp",
      type: "Report Ready",
      message: `Dear ${patient.name}, your laboratory report (${report.id}) is now ready at ${settings.labName}. Thank you!`,
      date: today(),
      status: "Sent",
    };
    write(STORAGE.messages, [...currentMessages, newMsg]);
    onToast(`Report notification dispatched to ${patient.name} via WhatsApp!`);
  }

  function printReport() {
    if (!report || !patient) {
      window.print();
      return;
    }
    const patName = (patient.name || "Patient").replace(/\s+/g, "_");
    const repCode = report.id || "REP";
    const originalTitle = document.title;
    document.title = `TAZ_Diagnostic_Report_${patient.id}_${patName}_${repCode}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  }

  async function saveAsPdf() {
    if (!report || !patient) {
      onToast("Please select a valid report first.", "warning");
      return;
    }

    const sheetElements = Array.from(document.querySelectorAll(".paper.report-sheet"));
    if (sheetElements.length === 0) {
      onToast("No report pages found to export.", "error");
      return;
    }

    const patName = (patient.name || "Patient").replace(/[^a-zA-Z0-9]/g, "_");
    const repCode = String(report.id || "REP").replace(/[^a-zA-Z0-9]/g, "_");
    const safeFileName = `TAZ_Report_${patName}_${repCode}`;

    setIsGeneratingPdf(true);
    onToast(`Opening PDF print dialog (${sheetElements.length} page${sheetElements.length > 1 ? "s" : ""})...`, "info");

    try {
      // Collect all styles from the current document
      const styleSheets = Array.from(document.styleSheets)
        .map((ss) => {
          try {
            return Array.from(ss.cssRules || []).map((r) => r.cssText).join("\n");
          } catch {
            // Cross-origin stylesheets — skip
            return "";
          }
        })
        .join("\n");

      // Collect all sheet HTML
      const pagesHtml = sheetElements.map((el) => el.outerHTML).join("\n");

      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (!printWindow) {
        onToast("Popup blocked! Please allow popups for this site, then try again.", "error");
        setIsGeneratingPdf(false);
        return;
      }

      printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${safeFileName}</title>
  <style>
    ${styleSheets}

    /* ── Print / PDF overrides ── */
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }

    body { margin: 0; padding: 0; background: #fff; }

    @page {
      size: A4 portrait;
      margin: 0;
    }

    /* Each sheet = one A4 page */
    .paper.report-sheet {
      width: 210mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      overflow: hidden !important;
      page-break-after: always !important;
      break-after: page !important;
      box-sizing: border-box !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 12mm 14mm !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
    }

    /* Each populated group = exactly one A4 page */
    .paper.report-sheet {
      page-break-after: always !important;
      break-after: page !important;
    }

    .paper.report-sheet:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    /* Table is compact — does NOT stretch to fill page.
       Footer anchors to bottom via justify-content: space-between on parent. */
    .paper.report-sheet .report-section {
      flex: 0 0 auto !important;
    }

    .paper.report-sheet .report-bottom {
      margin-top: auto !important;
    }

    /* Full color for dept-banner, section heading */
    .paper.report-sheet .dept-banner h1 {
      background: #5b0a1a !important; color: #ffffff !important;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .paper.report-sheet .report-section h3 {
      background: #5b0a1a !important; color: #ffffff !important;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .paper.report-sheet .report-section table th {
      background: #f6edf0 !important; color: #4c1421 !important;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .paper.report-sheet .report-section table tr:nth-child(even) td {
      background: #fcf9fa !important;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .paper.report-sheet .report-section table .badge.completed {
      background: #e4f5ec !important; color: #16764f !important;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }
    .paper.report-sheet .patient-box {
      background: #fdfafb !important;
      -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
    }

    /* No screen-only chrome */
    .no-print, .report-toolbar, .sidebar, .topbar,
    nav, header.app-header, .app-sidebar, button, .btn { display: none !important; }
  </style>
</head>
<body>
  ${pagesHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 600);
    };
  <\/script>
</body>
</html>`);

      printWindow.document.close();
      onToast(`PDF dialog opened — choose "Save as PDF" in the print dialog and name it: ${safeFileName}`, "success");
    } catch (err) {
      console.error("PDF generation failed:", err);
      onToast("Failed to open PDF window. Check popup permissions.", "error");
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function createNewReport(e) {
    e.preventDefault();
    if (!newReportPatientId) return;

    const pat = patients.find((p) => p.id === newReportPatientId);
    const newId = nextId("REP", reports);
    const newEntry = {
      id: newId,
      patientId: newReportPatientId,
      doctor: pat?.referredBy || "Self",
      date: today(),
      status: "Pending",
      results: {},
    };

    const next = [newEntry, ...reports];
    setReports(next);
    write(STORAGE.reports, next);
    setSelectedReport(newId);
    setShowCreateReport(false);
    onToast(`New report ${newId} generated for ${pat?.name}!`);
  }

  function deleteReport(id) {
    if (!confirm("Are you sure you want to delete this report?")) return;
    const next = reports.filter((r) => r.id !== id);
    setReports(next);
    write(STORAGE.reports, next);
    if (selectedReport === id) {
      setSelectedReport(next[0]?.id || "");
    }
    onToast("Report deleted.");
  }

  return (
    <>
      <PageHeader
        title="Diagnostic Reports"
        subtitle="Record test findings, verify reference limits, and print authorized reports."
      >
        <Button onClick={() => setShowCreateReport(true)}>
          <Plus size={16} /> New Report
        </Button>
        <Button
          primary
          disabled={isGeneratingPdf}
          onClick={saveAsPdf}
          style={{
            background: "#7a1126",
            color: "#ffffff",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            opacity: isGeneratingPdf ? 0.75 : 1,
            cursor: isGeneratingPdf ? "not-allowed" : "pointer",
          }}
        >
          {isGeneratingPdf ? (
            <>
              <RefreshCw size={16} className="spin" /> Generating PDF...
            </>
          ) : (
            <>
              <Download size={16} /> Save into PDF
            </>
          )}
        </Button>
        <Button onClick={printReport} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Printer size={16} /> Print Report
        </Button>
      </PageHeader>

      <div className="reportmeta">
        <div>
          <b>Total Reports</b>
          <span>{reports.length}</span>
        </div>
        <div>
          <b>Completed</b>
          <span>{reports.filter((r) => r.status === "Completed").length}</span>
        </div>
        <div>
          <b>Pending</b>
          <span>{reports.filter((r) => r.status !== "Completed").length}</span>
        </div>
        <div>
          <b>Selected</b>
          <span>{report?.id || "None"}</span>
        </div>
      </div>

      <div className="tabs">
        {["All", "Pending", "Completed"].map((tab) => (
          <button
            type="button"
            key={tab}
            className={`tab ${filterTab === tab ? "active" : ""}`}
            onClick={() => setFilterTab(tab)}
          >
            {tab} Reports
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="toolbar">
          <div className="search">
            <Search size={17} />
            <input
              placeholder="Search report by patient name or ID..."
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                const found = reports.find((item) => {
                  const p = patients.find(
                    (patientItem) => patientItem.id === item.patientId
                  );
                  return (
                    p?.name.toLowerCase().includes(value) ||
                    item.id.toLowerCase().includes(value)
                  );
                });
                if (found) setSelectedReport(found.id);
              }}
            />
          </div>

          <select
            className="smallselect"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
          >
            {filteredReports.map((item) => {
              const p = patients.find(
                (patientItem) => patientItem.id === item.patientId
              );
              return (
                <option key={item.id} value={item.id}>
                  {item.id} — {p?.name} ({item.status})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {report && patient ? (
        <>
          {/* RESULT ENTRY FORM */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="sectiontitle">
              <FileText />
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3>Result Entry — {patient.name} ({report.id})</h3>
                  <p>Input and modify test values. Reference values are populated from Test Master.</p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    className={`tab ${resultScope === "all" ? "active" : ""}`}
                    style={{ padding: "4px 10px", fontSize: "11px" }}
                    onClick={() => setResultScope("all")}
                  >
                    All 71 Tests
                  </button>
                  <button
                    type="button"
                    className={`tab ${resultScope === "prescribed" ? "active" : ""}`}
                    style={{ padding: "4px 10px", fontSize: "11px" }}
                    onClick={() => setResultScope("prescribed")}
                  >
                    Prescribed Only ({selectedTests.length})
                  </button>
                  <button
                    type="button"
                    title="Delete Report"
                    className="btn danger"
                    onClick={() => deleteReport(report.id)}
                    style={{ padding: "5px 9px", fontSize: "11px" }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Department Filter Tabs for Result Entry */}
            <div className="tabs" style={{ marginBottom: "12px", flexWrap: "wrap" }}>
              {["All", ...CLINICAL_GROUPS].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`tab ${resultFilterCategory === cat ? "active" : ""}`}
                  style={{ fontSize: "11px", padding: "4px 10px" }}
                  onClick={() => setResultFilterCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="tablewrap">
              <table className="resulttable">
                <thead>
                  <tr>
                    <th>Test Name</th>
                    <th>Category</th>
                    <th>Result Value</th>
                    <th>Unit</th>
                    <th>Reference Range</th>
                    <th>Observation</th>
                  </tr>
                </thead>
                <tbody>
                  {resultTests.map((test) => {
                    const val = report.results?.[test.id] || "";
                    return (
                      <tr key={test.id}>
                        <td>
                          <b>{test.name}</b>
                          <small>{test.id}</small>
                        </td>
                        <td>{test.category}</td>
                        <td style={{ width: 170 }}>
                          <input
                            value={val}
                            placeholder="Enter result..."
                            onChange={(e) =>
                              updateResult(test.id, e.target.value)
                            }
                          />
                        </td>
                        <td>{test.unit}</td>
                        <td>{test.reference}</td>
                        <td>
                          <span
                            className={`badge ${val ? "active" : "pending"}`}
                          >
                            {val ? "Recorded" : "Awaiting Input"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="formactions">
              <Button onClick={() => onToast("Draft values preserved.")}>
                Save As Draft
              </Button>
              <Button onClick={sendReportReadyMessage}>
                <MessageSquare size={16} /> Notify Patient (WhatsApp)
              </Button>
              <Button primary onClick={completeReport}>
                <Check size={16} /> Mark Report Completed
              </Button>
            </div>
          </div>

          {/* PRINTABLE LAB REPORT (EXACTLY 1 GROUP PER SEPARATE A4 PAGE — XEROX READY) */}
          <div className="card report-print">
            <div className="a4-toolbar no-print">
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <div className="a4-badge">
                  <FileText size={16} /> Separate A4 Department Sheets (210 × 297 mm)
                </div>
                <span style={{ fontSize: "11px", color: "#6e5962" }}>
                  Exactly 1 Group on 1 Separate A4 Page · Ready for Xerox / Photocopy Printing
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <select
                  className="smallselect"
                  value={sheetScope}
                  onChange={(e) => {
                    setSheetScope(e.target.value);
                    setActiveGroupPage("All");
                  }}
                  style={{ padding: "5px 8px", fontSize: "11px", fontWeight: 600 }}
                >
                  <option value="prescribed">Patient Active Departments Only</option>
                  <option value="all-6">All 6 Department Sheets (Blank Master Xerox)</option>
                </select>

                <select
                  className="smallselect"
                  value={panelMode}
                  onChange={(e) => setPanelMode(e.target.value)}
                  style={{ padding: "5px 8px", fontSize: "11px", fontWeight: 600 }}
                >
                  <option value="ordered">Selected Tests Only (Nothing Else)</option>
                  <option value="full">All Department Tests (Blank Fill-in Master)</option>
                </select>

                <button
                  type="button"
                  className="btn primary"
                  disabled={isGeneratingPdf}
                  onClick={saveAsPdf}
                  style={{
                    padding: "7px 16px",
                    fontSize: "12px",
                    background: "#7a1126",
                    color: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    fontWeight: 700,
                    opacity: isGeneratingPdf ? 0.75 : 1,
                    cursor: isGeneratingPdf ? "not-allowed" : "pointer",
                  }}
                >
                  {isGeneratingPdf ? (
                    <>
                      <RefreshCw size={15} className="spin" /> Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download size={15} /> Save into PDF ({displayedGroups.length} A4 {displayedGroups.length === 1 ? "Page" : "Pages"})
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn"
                  onClick={printReport}
                  style={{
                    padding: "7px 16px",
                    fontSize: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <Printer size={15} /> Print Xerox Sheets
                </button>
              </div>
            </div>

            {/* Department Sheet Navigation Tabs */}
            <div className="tabs no-print" style={{ width: "210mm", maxWidth: "100%", marginBottom: "18px", flexWrap: "wrap" }}>
              <button
                type="button"
                className={`tab ${activeGroupPage === "All" ? "active" : ""}`}
                onClick={() => setActiveGroupPage("All")}
              >
                All Pages ({availableGroups.length} Sheets)
              </button>
              {availableGroups.map((grp, idx) => (
                <button
                  type="button"
                  key={grp}
                  className={`tab ${activeGroupPage === grp ? "active" : ""}`}
                  onClick={() => setActiveGroupPage(grp)}
                >
                  Page {idx + 1}: {grp}
                </button>
              ))}
            </div>

            {/* A4 REPORT SHEETS CONTAINER */}
            <div className="report-sheets-container">
              {(() => {
                // Build data-driven active sheets:
                // - For EACH group in displayedGroups
                // - Find tests for that group that are assigned to the patient
                // - From those, keep ONLY the ones that have an ACTUAL result entered
                // - If zero results → skip the group entirely (no blank page)

                const activeSheets = displayedGroups
                  .map((groupName) => {
                    const allInGrp = tests.filter((t) => t.category === groupName);

                    // Which tests are relevant for this patient?
                    const patientAssigned =
                      panelMode === "ordered" && patient?.tests?.length
                        ? allInGrp.filter((t) => patient.tests.includes(t.id))
                        : allInGrp;

                    // From those, keep only tests with an actual entered result
                    const testsWithResults = patientAssigned.filter(
                      (t) => {
                        const val = report.results?.[t.id];
                        return val !== undefined && val !== null && String(val).trim() !== "";
                      }
                    );

                    return { groupName, groupTests: patientAssigned, resultTests: testsWithResults };
                  })
                  .filter((item) => {
                    // Skip group if no results have been entered
                    return item.resultTests.length > 0;
                  });

                const totalPages = activeSheets.length || 1;

                if (activeSheets.length === 0) {
                  return (
                    <div className="card empty" style={{ maxWidth: "210mm", margin: "40px auto", padding: "40px", textAlign: "center" }}>
                      <h3 style={{ color: "#5b0a1a", marginBottom: "8px" }}>No Results Entered Yet</h3>
                      <p style={{ color: "#666", fontSize: "13px" }}>
                        Enter test result values in the Result Entry form above, then the report pages will appear here automatically.
                      </p>
                    </div>
                  );
                }

                return activeSheets.map(({ groupName, resultTests: pageTests }, idx) => {
                  const pageNum = idx + 1;

                  return (
                    <div
                      key={groupName}
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <div className="sheet-page-tag no-print">
                        <span>PAGE {pageNum} OF {totalPages}</span>
                        <strong>DEPARTMENT OF {groupName.toUpperCase()} — SEPARATE A4 SHEET</strong>
                        <span>{pageTests.length} Test{pageTests.length !== 1 ? "s" : ""} with Results</span>
                      </div>

                      <div
                        className="paper report-sheet"
                        id={`sheet-${groupName.replace(/\s+/g, "-").toLowerCase()}`}
                        style={{ pageBreakAfter: idx < activeSheets.length - 1 ? "always" : "avoid" }}
                      >
                        {/* 1. Header */}
                        <div className="paper-head" style={{ justifyContent: "center", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div className="paper-logo" style={{ justifyContent: "center" }}>
                            <div className="logo-symbol" style={{ background: "transparent", padding: 0, overflow: "hidden", borderRadius: 8 }}>
                              <img
                                src="/microscope.jpg"
                                alt="Microscope"
                                style={{ width: 72, height: 72, objectFit: "contain", display: "block" }}
                              />
                            </div>
                            <div className="paper-logo-text" style={{ textAlign: "center" }}>
                              <div className="paper-brand-title">
                                <b>TAZ</b> <strong>DIAGNOSTIC</strong>
                              </div>
                              <small>LABORATORY &amp; DIAGNOSTIC CENTRE</small>
                            </div>
                          </div>
                        </div>

                        {/* 2. Department Title Banner */}
                        <div className="dept-banner">
                          <h1>DEPARTMENT OF {groupName.toUpperCase()}</h1>
                          <div className="dept-sub">
                            LABORATORY INVESTIGATION &amp; CLINICAL FINDINGS REPORT
                          </div>
                        </div>

                        {/* 3. Patient Demographics Box */}
                        <div className="patient-box">
                          <div>
                            <div>
                              <b>Patient ID:</b> <span>{patient.id}</span>
                            </div>
                            <div>
                              <b>Patient Name:</b> <strong>{patient.name}</strong>
                            </div>
                            <div>
                              <b>Age / Gender:</b> {patient.age} Yrs / {patient.gender}
                            </div>
                            <div>
                              <b>Phone:</b> {patient.phone}
                            </div>
                            <div>
                              <b>Email:</b> {patient.email || "N/A"}
                            </div>
                          </div>

                          <div>
                            <div>
                              <b>Report Code:</b> <span>{report.id}</span>
                            </div>
                            <div>
                              <b>Report Date:</b> {report.date}
                            </div>
                            <div>
                              <b>Referred By:</b> {report.doctor && report.doctor !== "Self" ? report.doctor : "Dr. Ahmed Khan"}
                            </div>
                            <div>
                              <b>Branch:</b> {patient.branch}
                            </div>
                            <div>
                              <b>Status:</b> <em>{report.status}</em>
                            </div>
                          </div>
                        </div>

                        {/* 4. Test Results — ONLY tests with actual values, no blank rows */}
                        <div className="report-section">
                          <div className="report-section-head">
                            <h3>{groupName.toUpperCase()} — TEST FINDINGS</h3>
                            <span style={{ fontSize: "8.5px", color: "#6b5860", fontWeight: 700, paddingBottom: 3 }}>
                              Method: Standard Laboratory Clinical Assay
                            </span>
                          </div>
                          <table>
                            <thead>
                              <tr>
                                <th style={{ width: "32%", textAlign: "left", paddingLeft: "12px" }}>Test / Parameter Description</th>
                                <th style={{ width: "18%", textAlign: "center" }}>Observed Value</th>
                                <th style={{ width: "14%", textAlign: "center" }}>Unit</th>
                                <th style={{ width: "24%", textAlign: "center" }}>Biological Ref. Range</th>
                                <th style={{ width: "12%", textAlign: "center" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pageTests.map((test) => {
                                const result = report.results?.[test.id];
                                const isDifferential = ["Polymorphs", "Lymphocytes", "Eosinophils", "Monocytes"].includes(test.name);
                                const isMicroscopySub = ["OVA", "Cyst's", "Bacteria"].includes(test.name);
                                const isSemenSub = ["Motile", "Non Motile"].includes(test.name);
                                const isSubItem = isDifferential || isMicroscopySub || isSemenSub;

                                return (
                                  <tr key={test.id}>
                                    <td style={{ textAlign: "left", verticalAlign: "middle", paddingLeft: isSubItem ? "20px" : "12px" }}>
                                      {isSubItem ? (
                                        <span style={{ fontSize: "13.5px" }}>• {test.name}</span>
                                      ) : test.name === "DC Count" ? (
                                        <strong style={{ fontSize: "14px" }}>Differential Count (DC):</strong>
                                      ) : (
                                        <strong style={{ fontSize: "14px" }}>{test.name}</strong>
                                      )}
                                    </td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                      <b style={{ color: "#000000", fontWeight: 800, fontSize: "14px", display: "inline-block" }}>
                                        {result}
                                      </b>
                                    </td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontSize: "13px" }}>
                                      {test.unit || "—"}
                                    </td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle", fontSize: "12.5px" }}>
                                      {test.reference || "—"}
                                    </td>
                                    <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                      <span
                                        className="badge completed"
                                        style={{ fontSize: "11.5px", fontWeight: 700, padding: "2.5px 8px", display: "inline-block" }}
                                      >
                                        Recorded
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* 5. Bottom: Signatures & Footer */}
                        <div className="report-bottom">
                          <div className="signatures">
                            <div className="signature">
                              <i>________________________</i>
                              <b>Lab Pathologist / Technician</b>
                              <span>Authorized Signatory · Reg. #LP-88421</span>
                            </div>
                            <div className="signature">
                              <i>________________________</i>
                              <b>Dr. Ahmed Khan</b>
                              <span>Referring Physician</span>
                            </div>
                          </div>

                          <footer>
                            <div>
                              <strong>{settings.labName || "TAZ DIAGNOSTIC"}</strong> · Laboratory &amp; Diagnostic Centre
                              <div style={{ fontSize: "7.5px", color: "#8b777f" }}>
                                NABL Accredited Medical Lab · State Healthcare Reg. #TS-55421
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div>
                                Department: <strong>{groupName}</strong>
                              </div>
                              <div>
                                Page <strong>{pageNum} of {totalPages}</strong> (Authorized Medical Report)
                              </div>
                            </div>
                          </footer>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </>
      ) : (
        <div className="card empty">
          No report selected. Choose a report or create a new one above.
        </div>
      )}

      {/* CREATE NEW REPORT MODAL */}
      {showCreateReport && (
        <div className="modalshade">
          <form className="modal" onSubmit={createNewReport}>
            <div className="modalhead">
              <h3>Create New Laboratory Report</h3>
              <button
                type="button"
                className="close"
                onClick={() => setShowCreateReport(false)}
              >
                ×
              </button>
            </div>

            <div className="field" style={{ marginBottom: 20 }}>
              <label>Select Patient</label>
              <select
                required
                value={newReportPatientId}
                onChange={(e) => setNewReportPatientId(e.target.value)}
              >
                <option value="">-- Choose Registered Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} — {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="formactions">
              <Button onClick={() => setShowCreateReport(false)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Create Report
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/* =========================================================
   PAGE: MESSAGING & REMINDERS
   ========================================================= */

function Messages({ onToast }) {
  const patients = read(STORAGE.patients, DEFAULT_PATIENTS);
  const [messages, setMessages] = useState(() =>
    read(STORAGE.messages, DEFAULT_MESSAGES)
  );

  const [filter, setFilter] = useState("All");
  const [showCompose, setShowCompose] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    channel: "WhatsApp",
    type: "Report Ready",
    customMessage: "",
  });

  const filtered = messages.filter((m) => {
    if (filter === "Sent") return m.status === "Sent";
    if (filter === "Pending") return m.status === "Pending";
    return true;
  });

  function markSent(id) {
    const next = messages.map((message) =>
      message.id === id ? { ...message, status: "Sent" } : message
    );
    setMessages(next);
    write(STORAGE.messages, next);
    onToast("Message dispatched successfully!");
  }

  function resend(id) {
    onToast("Message re-sent to patient channel.");
  }

  function remove(id) {
    if (!confirm("Delete this message record?")) return;
    const next = messages.filter((m) => m.id !== id);
    setMessages(next);
    write(STORAGE.messages, next);
    onToast("Message record deleted.");
  }

  function handleComposeSubmit(e) {
    e.preventDefault();
    const pat = patients.find((p) => p.id === form.patientId);
    if (!pat) {
      alert("Please select a valid patient.");
      return;
    }

    let body = form.customMessage;
    if (!body) {
      if (form.type === "Report Ready") {
        body = `Dear ${pat.name}, your diagnostic report from TAZ DIAGNOSTIC is ready for collection.`;
      } else if (form.type === "Payment Reminder") {
        body = `Dear ${pat.name}, this is a gentle reminder regarding your pending balance at TAZ DIAGNOSTIC.`;
      } else {
        body = `Hello ${pat.name}, greetings from TAZ DIAGNOSTIC.`;
      }
    }

    const newMsg = {
      id: nextId("MSG", messages),
      patient: pat.name,
      phone: pat.phone,
      channel: form.channel,
      type: form.type,
      message: body,
      date: today(),
      status: "Sent",
    };

    const next = [newMsg, ...messages];
    setMessages(next);
    write(STORAGE.messages, next);
    setShowCompose(false);
    onToast(`Message dispatched to ${pat.name} via ${form.channel}!`);
  }

  return (
    <>
      <PageHeader
        title="Patient Messages & Reminders"
        subtitle="Manage automated and manual WhatsApp/SMS communication."
      >
        <Button primary onClick={() => setShowCompose(true)}>
          <Plus size={16} /> New Message
        </Button>
      </PageHeader>

      <div className="stats mini">
        <div className="stat">
          <div className="staticon">
            <MessageSquare />
          </div>
          <div>
            <span>Total Messages</span>
            <strong>{messages.length}</strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <Check />
          </div>
          <div>
            <span>Sent Messages</span>
            <strong>{messages.filter((m) => m.status === "Sent").length}</strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <Bell />
          </div>
          <div>
            <span>Pending Delivery</span>
            <strong>{messages.filter((m) => m.status !== "Sent").length}</strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <Phone />
          </div>
          <div>
            <span>Channels</span>
            <strong>WhatsApp / SMS</strong>
          </div>
        </div>
      </div>

      <div className="tabs">
        {["All", "Sent", "Pending"].map((tab) => (
          <button
            type="button"
            key={tab}
            className={`tab ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab} Messages
          </button>
        ))}
      </div>

      <div className="card">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Channel</th>
                <th>Type</th>
                <th>Message Content</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((message) => (
                <tr key={message.id}>
                  <td>
                    <b>{message.patient}</b>
                  </td>
                  <td>{message.phone}</td>
                  <td>
                    <span className="badge">{message.channel || "SMS"}</span>
                  </td>
                  <td>{message.type}</td>
                  <td style={{ maxWidth: 350 }}>
                    <div style={{ wordBreak: "break-word" }}>{message.message}</div>
                  </td>
                  <td>{message.date}</td>
                  <td>
                    <span
                      className={`badge ${
                        message.status === "Sent" ? "sent" : "pending"
                      }`}
                    >
                      {message.status}
                    </span>
                  </td>
                  <td className="actions">
                    {message.status !== "Sent" ? (
                      <button
                        className="btn primary btn-sm"
                        onClick={() => markSent(message.id)}
                      >
                        Send Now
                      </button>
                    ) : (
                      <button
                        title="Resend Message"
                        onClick={() => resend(message.id)}
                      >
                        <RefreshCw size={15} />
                      </button>
                    )}
                    <button
                      title="Delete Record"
                      onClick={() => remove(message.id)}
                    >
                      <Trash2 size={16} color="#a12929" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPOSE MESSAGE MODAL */}
      {showCompose && (
        <div className="modalshade">
          <form className="modal" onSubmit={handleComposeSubmit}>
            <div className="modalhead">
              <h3>Compose Patient Notification</h3>
              <button
                type="button"
                className="close"
                onClick={() => setShowCompose(false)}
              >
                ×
              </button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Target Patient *</label>
                <select
                  required
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Dispatch Channel</label>
                <select
                  value={form.channel}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">Direct SMS</option>
                </select>
              </div>

              <div className="field">
                <label>Message Template Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Report Ready">Report Ready Notification</option>
                  <option value="Payment Reminder">Payment Reminder</option>
                  <option value="Custom Message">Custom Clinical Note</option>
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: 15 }}>
              <label>Custom Body (leave blank to use system template)</label>
              <textarea
                rows={3}
                value={form.customMessage}
                onChange={(e) =>
                  setForm({ ...form, customMessage: e.target.value })
                }
                placeholder="Type customized SMS / WhatsApp text..."
              />
            </div>

            <div className="formactions">
              <Button onClick={() => setShowCompose(false)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Send Notification
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/* =========================================================
   PAGE: BILLING & PAYMENTS
   ========================================================= */

function Billing({ onToast }) {
  const patients = read(STORAGE.patients, DEFAULT_PATIENTS);
  const [bills, setBills] = useState(() => read(STORAGE.bills, DEFAULT_BILLS));
  const [filter, setFilter] = useState("All");

  const [showCreateBill, setShowCreateBill] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [collectingBill, setCollectingBill] = useState(null);

  const [newBill, setNewBill] = useState({
    patientId: "",
    amount: "",
    paid: "",
    mode: "Cash",
  });

  const total = bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
  const paid = bills.reduce((sum, bill) => sum + Number(bill.paid || 0), 0);
  const pending = total - paid;

  const filteredBills = bills.filter((b) => {
    if (filter === "Paid") return b.status === "Paid";
    if (filter === "Pending") return b.status !== "Paid";
    return true;
  });

  function collect(id) {
    const next = bills.map((bill) =>
      bill.id === id
        ? {
            ...bill,
            paid: bill.amount,
            status: "Paid",
          }
        : bill
    );
    setBills(next);
    write(STORAGE.bills, next);
    onToast("Payment collected! Invoice marked as Paid.");
  }

  function handleCreateBillSubmit(e) {
    e.preventDefault();
    if (!newBill.patientId || !newBill.amount) return;

    const amt = Number(newBill.amount || 0);
    const pd = Number(newBill.paid || 0);

    const bill = {
      id: nextId("BILL", bills),
      patientId: newBill.patientId,
      date: today(),
      amount: amt,
      paid: pd,
      mode: newBill.mode,
      status: pd >= amt ? "Paid" : pd > 0 ? "Partial" : "Pending",
    };

    const next = [bill, ...bills];
    setBills(next);
    write(STORAGE.bills, next);
    setShowCreateBill(false);
    setNewBill({ patientId: "", amount: "", paid: "", mode: "Cash" });
    onToast(`Invoice ${bill.id} created successfully!`);
  }

  function remove(id) {
    if (!confirm("Are you sure you want to delete this bill record?")) return;
    const next = bills.filter((b) => b.id !== id);
    setBills(next);
    write(STORAGE.bills, next);
    onToast("Bill removed.");
  }

  return (
    <>
      <PageHeader
        title="Billing & Collections"
        subtitle="Generate diagnostic invoices, manage payments, and print receipts."
      >
        <Button primary onClick={() => setShowCreateBill(true)}>
          <Plus size={16} /> Create Invoice
        </Button>
      </PageHeader>

      <div className="stats">
        <div className="stat">
          <div className="staticon">
            <CreditCard />
          </div>
          <div>
            <span>Total Invoiced</span>
            <strong>{money(total)}</strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <Check />
          </div>
          <div>
            <span>Collected Cash/UPI</span>
            <strong>{money(paid)}</strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <AlertCircle />
          </div>
          <div>
            <span>Outstanding Due</span>
            <strong>{money(pending)}</strong>
          </div>
        </div>
      </div>

      <div className="tabs">
        {["All", "Paid", "Pending"].map((tab) => (
          <button
            type="button"
            key={tab}
            className={`tab ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab} Invoices
          </button>
        ))}
      </div>

      <div className="card">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => {
                const patient = patients.find((p) => p.id === bill.patientId);
                const balance = Number(bill.amount || 0) - Number(bill.paid || 0);

                return (
                  <tr key={bill.id}>
                    <td>
                      <b>{bill.id}</b>
                    </td>
                    <td>
                      {patient?.name}
                      <small>{bill.patientId}</small>
                    </td>
                    <td>{bill.date}</td>
                    <td>
                      <span className="badge">{bill.mode || "Cash"}</span>
                    </td>
                    <td>{money(bill.amount)}</td>
                    <td>{money(bill.paid)}</td>
                    <td>
                      <b style={{ color: balance > 0 ? "#b42318" : "#147344" }}>
                        {money(balance)}
                      </b>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          bill.status === "Paid" ? "paid" : "partial"
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="actions">
                      {bill.status !== "Paid" && (
                        <button
                          className="btn primary btn-sm"
                          onClick={() => collect(bill.id)}
                          title="Collect full payment"
                        >
                          Collect
                        </button>
                      )}
                      <button
                        title="View / Print Receipt"
                        onClick={() => setSelectedReceipt(bill)}
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        title="Delete Bill"
                        onClick={() => remove(bill.id)}
                      >
                        <Trash2 size={16} color="#a12929" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE BILL MODAL */}
      {showCreateBill && (
        <div className="modalshade">
          <form className="modal" onSubmit={handleCreateBillSubmit}>
            <div className="modalhead">
              <h3>Create Diagnostic Invoice</h3>
              <button
                type="button"
                className="close"
                onClick={() => setShowCreateBill(false)}
              >
                ×
              </button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Select Patient *</label>
                <select
                  required
                  value={newBill.patientId}
                  onChange={(e) =>
                    setNewBill({ ...newBill, patientId: e.target.value })
                  }
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name} ({p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Payment Method</label>
                <select
                  value={newBill.mode}
                  onChange={(e) =>
                    setNewBill({ ...newBill, mode: e.target.value })
                  }
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI / QR">UPI / QR Code</option>
                  <option value="Credit/Debit Card">Credit/Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div className="field">
                <label>Total Invoiced Amount (₹) *</label>
                <input
                  required
                  type="number"
                  value={newBill.amount}
                  onChange={(e) =>
                    setNewBill({ ...newBill, amount: e.target.value })
                  }
                  placeholder="e.g. 1200"
                />
              </div>

              <div className="field">
                <label>Amount Received Today (₹)</label>
                <input
                  type="number"
                  value={newBill.paid}
                  onChange={(e) =>
                    setNewBill({ ...newBill, paid: e.target.value })
                  }
                  placeholder="e.g. 1200 or 0"
                />
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => setShowCreateBill(false)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Generate Invoice
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="modalshade">
          <div className="modal">
            <div className="modalhead">
              <h3>Diagnostic Payment Receipt</h3>
              <button
                type="button"
                className="close"
                onClick={() => setSelectedReceipt(null)}
              >
                ×
              </button>
            </div>

            <div className="receipt-box">
              <div className="receipt-header">
                <strong style={{ fontSize: 18, color: "#5b0a1a" }}>
                  TAZ DIAGNOSTIC
                </strong>
                <div style={{ fontSize: 11, color: "#8c7980" }}>
                  Official Diagnostic Payment Voucher
                </div>
              </div>

              <div className="receipt-row">
                <b>Receipt / Bill ID:</b>
                <span>{selectedReceipt.id}</span>
              </div>
              <div className="receipt-row">
                <b>Date:</b>
                <span>{selectedReceipt.date}</span>
              </div>
              <div className="receipt-row">
                <b>Patient:</b>
                <span>
                  {
                    patients.find((p) => p.id === selectedReceipt.patientId)
                      ?.name
                  }{" "}
                  ({selectedReceipt.patientId})
                </span>
              </div>
              <div className="receipt-row">
                <b>Payment Mode:</b>
                <span>{selectedReceipt.mode || "Cash"}</span>
              </div>
              <div className="receipt-row">
                <b>Total Billed:</b>
                <span>{money(selectedReceipt.amount)}</span>
              </div>
              <div className="receipt-row">
                <b>Amount Paid:</b>
                <span style={{ color: "#147344", fontWeight: 700 }}>
                  {money(selectedReceipt.paid)}
                </span>
              </div>
              <div className="receipt-row" style={{ borderBottom: 0 }}>
                <b>Balance Due:</b>
                <span style={{ color: "#b42318", fontWeight: 700 }}>
                  {money(
                    Number(selectedReceipt.amount || 0) -
                      Number(selectedReceipt.paid || 0)
                  )}
                </span>
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => window.print()}>
                <Printer size={15} /> Print Receipt
              </Button>
              <Button primary onClick={() => setSelectedReceipt(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   PAGE: ANALYTICS & INSIGHTS
   ========================================================= */

function Analytics({ onToast }) {
  const patients = read(STORAGE.patients, DEFAULT_PATIENTS);
  const reports = read(STORAGE.reports, DEFAULT_REPORTS);
  const bills = read(STORAGE.bills, DEFAULT_BILLS);
  const tests = read(STORAGE.tests, DEFAULT_TESTS);

  const [period, setPeriod] = useState("All Time");

  const completed = reports.filter((report) => report.status === "Completed").length;
  const revenue = bills.reduce((sum, bill) => sum + Number(bill.paid || 0), 0);

  return (
    <>
      <PageHeader
        title="Analytics & Laboratory Statistics"
        subtitle="Operational metrics, patient throughput, and financial performance."
      >
        <Button onClick={() => window.print()}>
          <Printer size={16} /> Print Report
        </Button>
      </PageHeader>

      <div className="tabs">
        {["Today", "This Week", "This Month", "All Time"].map((p) => (
          <button
            type="button"
            key={p}
            className={`tab ${period === p ? "active" : ""}`}
            onClick={() => {
              setPeriod(p);
              onToast(`Analytics filtered by ${p}`);
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="stats">
        <div className="stat">
          <div className="staticon">
            <Users />
          </div>
          <div>
            <span>Patients Registered</span>
            <strong>{patients.length}</strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <FileText />
          </div>
          <div>
            <span>Total Reports</span>
            <strong>{reports.length}</strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <Check />
          </div>
          <div>
            <span>Report Completion</span>
            <strong>
              {reports.length
                ? Math.round((completed / reports.length) * 100)
                : 0}{" "}
              %
            </strong>
          </div>
        </div>

        <div className="stat">
          <div className="staticon">
            <CreditCard />
          </div>
          <div>
            <span>Total Revenue</span>
            <strong>{money(revenue)}</strong>
          </div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardhead">
            <div>
              <h3>Test Categories Share</h3>
              <p>Breakdown across medical departments.</p>
            </div>
            <FlaskConical />
          </div>

          {[
            "Clinical Pathology",
            "Urine Examinations",
            "Bio Chemistry",
            "Motion Examination",
            "Semen Analysis",
            "Additional Tests",
          ].map((category) => {
            const count = tests.filter((test) => test.category === category).length;
            const percentage = Math.round(
              (count / Math.max(1, tests.length)) * 100
            );

            return (
              <div className="metricbar" key={category}>
                <div>
                  <span>{category}</span>
                  <b>{count} Tests</b>
                </div>
                <div className="track">
                  <i style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="cardhead">
            <div>
              <h3>Workplace Status</h3>
              <p>Daily workflow turnaround statistics.</p>
            </div>
            <Activity />
          </div>

          <div className="summaryrow">
            <span>Completed Investigations</span>
            <b style={{ color: "#147344" }}>{completed}</b>
          </div>
          <div className="summaryrow">
            <span>In Progress / Pending</span>
            <b style={{ color: "#b42318" }}>{reports.length - completed}</b>
          </div>
          <div className="summaryrow">
            <span>Overall Diagnostic Orders</span>
            <b>{reports.length}</b>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   PAGE: BRANCHES
   ========================================================= */

function Branches({ onToast }) {
  const [branches, setBranches] = useState(() =>
    read(STORAGE.branches, DEFAULT_BRANCHES)
  );
  const [showAdd, setShowAdd] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
  });

  function toggle(id) {
    const next = branches.map((b) =>
      b.id === id
        ? { ...b, status: b.status === "Active" ? "Inactive" : "Active" }
        : b
    );
    setBranches(next);
    write(STORAGE.branches, next);
    onToast("Branch status updated.");
  }

  function saveAdd(e) {
    e.preventDefault();
    if (!form.name) return;

    const next = [
      ...branches,
      {
        id: nextId("BR", branches),
        ...form,
        status: "Active",
      },
    ];
    setBranches(next);
    write(STORAGE.branches, next);
    setForm({ name: "", address: "", phone: "" });
    setShowAdd(false);
    onToast(`Branch ${form.name} created successfully!`);
  }

  function saveEdit(e) {
    e.preventDefault();
    if (!editingBranch) return;

    const next = branches.map((b) =>
      b.id === editingBranch.id ? editingBranch : b
    );
    setBranches(next);
    write(STORAGE.branches, next);
    setEditingBranch(null);
    onToast(`Branch ${editingBranch.name} updated!`);
  }

  function remove(id) {
    if (!confirm("Are you sure you want to remove this branch?")) return;
    const next = branches.filter((b) => b.id !== id);
    setBranches(next);
    write(STORAGE.branches, next);
    onToast("Branch deleted.");
  }

  return (
    <>
      <PageHeader
        title="Branches & Centers"
        subtitle="Manage multi-center locations, contact info, and operation status."
      >
        <Button primary onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Branch
        </Button>
      </PageHeader>

      <div className="branchgrid">
        {branches.map((branch) => (
          <div className="card branch" key={branch.id}>
            <div className="branchicon">
              <Building2 />
            </div>
            <h3>{branch.name}</h3>
            <p>
              <b>Code:</b> {branch.id}
            </p>
            <p>{branch.address}</p>
            <p>
              <b>Contact:</b> {branch.phone}
            </p>

            <div className="cardactions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => toggle(branch.id)}
                className={`badge ${
                  branch.status === "Active" ? "active" : "inactive"
                }`}
                style={{ border: 0, cursor: "pointer" }}
                title="Click to toggle status"
              >
                {branch.status}
              </button>

              <div className="actions">
                <button
                  title="Edit Branch"
                  onClick={() => setEditingBranch({ ...branch })}
                >
                  <Edit3 size={15} />
                </button>
                <button
                  title="Delete Branch"
                  onClick={() => remove(branch.id)}
                >
                  <Trash2 size={15} color="#a12929" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD BRANCH MODAL */}
      {showAdd && (
        <div className="modalshade">
          <form className="modal" onSubmit={saveAdd}>
            <div className="modalhead">
              <h3>Add New Center Branch</h3>
              <button
                type="button"
                className="close"
                onClick={() => setShowAdd(false)}
              >
                ×
              </button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Branch Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Hitech City Branch"
                />
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="040-xxxxxxx"
                />
              </div>

              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street address, City"
                />
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Save Branch
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT BRANCH MODAL */}
      {editingBranch && (
        <div className="modalshade">
          <form className="modal" onSubmit={saveEdit}>
            <div className="modalhead">
              <h3>Edit Branch — {editingBranch.id}</h3>
              <button
                type="button"
                className="close"
                onClick={() => setEditingBranch(null)}
              >
                ×
              </button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Branch Name</label>
                <input
                  required
                  value={editingBranch.name}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, name: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input
                  value={editingBranch.phone}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, phone: e.target.value })
                  }
                />
              </div>

              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Address</label>
                <input
                  value={editingBranch.address}
                  onChange={(e) =>
                    setEditingBranch({
                      ...editingBranch,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => setEditingBranch(null)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Update Branch
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/* =========================================================
   PAGE: USERS & ACCESS CONTROL
   ========================================================= */

function UsersPage({ session, onToast }) {
  const [users, setUsers] = useState(() => read(STORAGE.users, DEFAULT_USERS));
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "Lab Technician",
  });

  function toggle(id) {
    const next = users.map((user) =>
      user.id === id
        ? {
            ...user,
            status: user.status === "Active" ? "Inactive" : "Active",
          }
        : user
    );
    setUsers(next);
    write(STORAGE.users, next);
    onToast("User account status updated.");
  }

  function saveAdd(e) {
    e.preventDefault();
    if (!form.username || !form.password) return;

    if (users.find((u) => u.username === form.username)) {
      alert("A user with this username already exists.");
      return;
    }

    const next = [
      ...users,
      {
        id: nextId("USR", users),
        ...form,
        status: "Active",
      },
    ];
    setUsers(next);
    write(STORAGE.users, next);
    setForm({ name: "", username: "", password: "", role: "Lab Technician" });
    setShowAdd(false);
    onToast(`User account ${form.username} created!`);
  }

  function remove(id) {
    const u = users.find((item) => item.id === id);
    if (u?.username === session?.username) {
      alert("You cannot delete the account you are currently logged into.");
      return;
    }
    if (!confirm(`Delete user ${u?.name}?`)) return;

    const next = users.filter((user) => user.id !== id);
    setUsers(next);
    write(STORAGE.users, next);
    onToast("User account removed.");
  }

  return (
    <>
      <PageHeader
        title="Users & Access Permissions"
        subtitle="Manage laboratory staff accounts, system roles, and credentials."
      >
        <Button primary onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add User
        </Button>
      </PageHeader>

      <div className="card">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <b>{user.name}</b>
                    <small>{user.id}</small>
                  </td>
                  <td>
                    <code>{user.username}</code>
                  </td>
                  <td>
                    <span className="badge">{user.role}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggle(user.id)}
                      className={`badge ${
                        user.status === "Active" ? "active" : "inactive"
                      }`}
                      style={{ border: 0, cursor: "pointer" }}
                      title="Click to toggle status"
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-sm"
                      onClick={() => toggle(user.id)}
                    >
                      Toggle Status
                    </button>
                    <button
                      title="Delete User"
                      onClick={() => remove(user.id)}
                    >
                      <Trash2 size={16} color="#a12929" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showAdd && (
        <div className="modalshade">
          <form className="modal" onSubmit={saveAdd}>
            <div className="modalhead">
              <h3>Create Staff User Account</h3>
              <button
                type="button"
                className="close"
                onClick={() => setShowAdd(false)}
              >
                ×
              </button>
            </div>

            <div className="formgrid">
              <div className="field">
                <label>Full Staff Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sara Ahmed"
                />
              </div>

              <div className="field">
                <label>System Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Receptionist">Receptionist / Billing Clerk</option>
                </select>
              </div>

              <div className="field">
                <label>Username *</label>
                <input
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="login username"
                />
              </div>

              <div className="field">
                <label>Initial Password *</label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Secure password"
                />
              </div>
            </div>

            <div className="formactions">
              <Button onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button primary type="submit">
                <Check size={16} /> Create User
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/* =========================================================
   PAGE: SETTINGS
   ========================================================= */

function SettingsPage({ onToast }) {
  const [settings, setSettings] = useState(() =>
    read(STORAGE.settings, {
      labName: "TAZ DIAGNOSTIC",
      phone: "040-24567890",
      email: "info@tazdiagnostic.com",
      address: "Hyderabad, Telangana",
      footerNote:
        "This laboratory report is generated electronically. Please consult your physician for clinical interpretation.",
    })
  );

  const [saved, setSaved] = useState(false);

  function save(e) {
    e.preventDefault();
    write(STORAGE.settings, settings);
    setSaved(true);
    onToast("System settings saved successfully!");
    setTimeout(() => setSaved(false), 2000);
  }

  function handleResetDemoData() {
    if (
      !confirm(
        "CAUTION: This will reset all demo patients, tests, reports, and bills to their original sample state. Do you want to continue?"
      )
    ) {
      return;
    }
    seed(true);
    onToast("All demo data reset to fresh default state!");
    setTimeout(() => {
      window.location.reload();
    }, 800);
  }

  return (
    <>
      <PageHeader
        title="System Settings & Preferences"
        subtitle="Configure laboratory letterhead, report headers, and administrative controls."
      />

      <form className="card formcard" onSubmit={save}>
        <div className="sectiontitle">
          <SettingsIcon />
          <div>
            <h3>Laboratory Identity & Header</h3>
            <p>These details are automatically printed on reports and invoices.</p>
          </div>
        </div>

        <div className="formgrid">
          <div className="field">
            <label>Laboratory Name</label>
            <input
              required
              value={settings.labName}
              onChange={(e) =>
                setSettings({ ...settings, labName: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label>Helpline Phone</label>
            <input
              value={settings.phone}
              onChange={(e) =>
                setSettings({ ...settings, phone: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label>Contact Email</label>
            <input
              value={settings.email}
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
            />
          </div>

          <div className="field">
            <label>Headquarters Address</label>
            <input
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
            />
          </div>

          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <label>Report Footer Disclaimer Note</label>
            <textarea
              rows={3}
              value={settings.footerNote}
              onChange={(e) =>
                setSettings({ ...settings, footerNote: e.target.value })
              }
            />
          </div>
        </div>

        {saved && (
          <div className="success">
            Settings saved successfully to workstation storage.
          </div>
        )}

        <div
          className="formactions"
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 25,
            paddingTop: 15,
            borderTop: "1px solid #eadde1",
          }}
        >
          <Button danger onClick={handleResetDemoData}>
            <RefreshCw size={15} /> Reset All Demo Data
          </Button>

          <Button primary type="submit">
            <Check size={16} /> Save Settings
          </Button>
        </div>
      </form>
    </>
  );
}

/* =========================================================
   MAIN APP ROUTER & COMPONENT
   ========================================================= */

export default function App() {
  const [session, setSession] = useState(() =>
    read(STORAGE.session, null)
  );

  const [route, setRoute] = useState(
    window.location.pathname || "/dashboard"
  );

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    seed();

    const onPop = () => {
      setRoute(window.location.pathname || "/dashboard");
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function navigate(path) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setRoute(path);
  }

  function login(user) {
    write(STORAGE.session, user);
    setSession(user);
    navigate("/dashboard");
    showToast(`Welcome back, ${user.name}!`);
  }

  function logout() {
    localStorage.removeItem(STORAGE.session);
    setSession(null);
    navigate("/dashboard");
  }

  if (!session) {
    return (
      <>
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
        <Login onLogin={login} />
      </>
    );
  }

  let page;

  if (route === "/dashboard" || route === "/") {
    page = <Dashboard navigate={navigate} onToast={showToast} />;
  } else if (route === "/patients/new") {
    page = <PatientEntry navigate={navigate} onToast={showToast} />;
  } else if (route === "/patients") {
    page = <Patients navigate={navigate} onToast={showToast} />;
  } else if (route === "/doctors") {
    page = <Doctors onToast={showToast} />;
  } else if (route === "/tests") {
    page = <TestManagement navigate={navigate} onToast={showToast} />;
  } else if (route === "/test-master") {
    page = <TestMaster onToast={showToast} />;
  } else if (route === "/reports") {
    page = <Reports onToast={showToast} />;
  } else if (route === "/messages") {
    page = <Messages onToast={showToast} />;
  } else if (route === "/billing") {
    page = <Billing onToast={showToast} />;
  } else if (route === "/analytics") {
    page = <Analytics onToast={showToast} />;
  } else if (route === "/branches") {
    page = <Branches onToast={showToast} />;
  } else if (route === "/users") {
    page = <UsersPage session={session} onToast={showToast} />;
  } else if (route === "/settings") {
    page = <SettingsPage onToast={showToast} />;
  } else {
    page = <Dashboard navigate={navigate} onToast={showToast} />;
  }

  return (
    <>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      <Layout
        route={route}
        navigate={navigate}
        session={session}
        logout={logout}
      >
        {page}
      </Layout>
    </>
  );
}
