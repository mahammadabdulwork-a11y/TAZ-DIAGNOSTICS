import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit3,
  Trash2,
  Printer,
  Download,
  Share2,
  X,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  FileText,
  ChevronDown,
  UserRound,
  FlaskConical,
  RefreshCw,
} from "lucide-react";

const REPORT_KEY = "taz_company_reports";
const PATIENT_KEY = "taz_company_patients";
const DOCTOR_KEY = "taz_company_doctors";
const TEST_KEY = "taz_company_tests";
const TEST_MASTER_KEY = "taz_company_test_master";

const LOGO_URL =
  "https://dummyimage.com/180x80/5b0a1a/ffffff.png&text=TAZ+DIAGNOSTIC";

const DEFAULT_TESTS = [
  {
    id: "TEST001",
    testId: "TEST001",
    name: "Complete Blood Count",
    testName: "Complete Blood Count",
    category: "Hematology",
    specimen: "Blood",
    unit: "Various",
    referenceRange: "As per laboratory",
    price: 350,
    status: "Active",
  },
  {
    id: "TEST002",
    testId: "TEST002",
    name: "Blood Sugar - Fasting",
    testName: "Blood Sugar - Fasting",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "mg/dL",
    referenceRange: "70 - 100",
    price: 120,
    status: "Active",
  },
  {
    id: "TEST003",
    testId: "TEST003",
    name: "Blood Sugar - Random",
    testName: "Blood Sugar - Random",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "mg/dL",
    referenceRange: "70 - 140",
    price: 120,
    status: "Active",
  },
  {
    id: "TEST004",
    testId: "TEST004",
    name: "Lipid Profile",
    testName: "Lipid Profile",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "mg/dL",
    referenceRange: "See individual parameters",
    price: 650,
    status: "Active",
  },
  {
    id: "TEST005",
    testId: "TEST005",
    name: "Liver Function Test",
    testName: "Liver Function Test",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "Various",
    referenceRange: "See individual parameters",
    price: 700,
    status: "Active",
  },
  {
    id: "TEST006",
    testId: "TEST006",
    name: "Kidney Function Test",
    testName: "Kidney Function Test",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "Various",
    referenceRange: "See individual parameters",
    price: 650,
    status: "Active",
  },
  {
    id: "TEST007",
    testId: "TEST007",
    name: "Thyroid Profile",
    category: "Hormones",
    specimen: "Blood",
    unit: "Various",
    referenceRange: "See individual parameters",
    price: 750,
    status: "Active",
  },
  {
    id: "TEST008",
    testId: "TEST008",
    name: "HbA1c",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "%",
    referenceRange: "4.0 - 5.6",
    price: 450,
    status: "Active",
  },
  {
    id: "TEST009",
    testId: "TEST009",
    name: "CRP",
    category: "Immunology",
    specimen: "Blood",
    unit: "mg/L",
    referenceRange: "< 5",
    price: 300,
    status: "Active",
  },
];

const DEFAULT_DOCTORS = [
  {
    id: "DOC001",
    doctorId: "DOC001",
    name: "Dr. Ahmed Khan",
    doctorName: "Dr. Ahmed Khan",
    specialization: "General Physician",
    status: "Active",
  },
  {
    id: "DOC002",
    doctorId: "DOC002",
    name: "Dr. Priya Sharma",
    doctorName: "Dr. Priya Sharma",
    specialization: "Cardiologist",
    status: "Active",
  },
  {
    id: "DOC003",
    doctorId: "DOC003",
    name: "Dr. Syed Rahman",
    doctorName: "Dr. Syed Rahman",
    specialization: "Internal Medicine",
    status: "Active",
  },
];

function safeRead(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getTestName(test) {
  return (
    test?.testName ||
    test?.name ||
    test?.title ||
    test?.label ||
    "Unnamed Test"
  );
}

function getTestId(test) {
  return test?.testId || test?.id || test?.code || "";
}

function getDoctorName(doctor) {
  return doctor?.doctorName || doctor?.name || doctor?.fullName || "";
}

function getPatientId(patient) {
  return patient?.patientId || patient?.id || "";
}

function getPatientName(patient) {
  return patient?.patientName || patient?.name || patient?.fullName || "";
}

function formatDate(value) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateInput(value) {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value;
  }

  return d.toISOString().slice(0, 10);
}

function generateId(items, prefix) {
  let max = 0;

  items.forEach((item) => {
    const raw =
      item?.reportId ||
      item?.id ||
      item?.billId ||
      item?.patientId ||
      "";

    const match = String(raw).match(/(\d+)$/);

    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  });

  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function normalizeTest(test) {
  return {
    testId: getTestId(test),
    testName: getTestName(test),
    name: getTestName(test),
    category: test?.category || "",
    specimen: test?.specimen || "",
    unit: test?.unit || "-",
    referenceRange:
      test?.referenceRange ||
      test?.reference ||
      test?.normalRange ||
      "-",
    price: Number(test?.price || 0),
    status: test?.status || "Active",
    result: test?.result ?? "",
  };
}

function getQrUrl(report) {
  const data = encodeURIComponent(
    [
      "TAZ DIAGNOSTIC",
      `Report ID: ${report.reportId}`,
      `Patient ID: ${report.patientId}`,
      `Patient: ${report.patientName}`,
      `Date: ${formatDate(report.date)}`,
    ].join("\n")
  );

  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=10&data=${data}`;
}

function createDefaultReports() {
  return [
    {
      id: "REP001",
      reportId: "REP001",
      patientId: "PAT001",
      patientName: "Abdul Raheem Mahammad",
      doctorId: "DOC001",
      doctorName: "Dr. Ahmed Khan",
      date: new Date().toISOString(),
      status: "Completed",
      priority: "Normal",
      technician: "Lab Technician",
      remarks: "",
      tests: [
        normalizeTest(DEFAULT_TESTS[0]),
        normalizeTest(DEFAULT_TESTS[1]),
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: "REP002",
      reportId: "REP002",
      patientId: "PAT001",
      patientName: "Abdul Raheem Mahammad",
      doctorId: "SELF",
      doctorName: "Self",
      date: new Date().toISOString(),
      status: "Pending",
      priority: "Urgent",
      technician: "Lab Technician",
      remarks: "",
      tests: [
        normalizeTest(DEFAULT_TESTS[7]),
        normalizeTest(DEFAULT_TESTS[3]),
        normalizeTest(DEFAULT_TESTS[1]),
        normalizeTest(DEFAULT_TESTS[2]),
        normalizeTest(DEFAULT_TESTS[8]),
      ],
      createdAt: new Date().toISOString(),
    },
  ];
}

function buildReportHtml(report) {
  const tests = Array.isArray(report.tests) ? report.tests : [];

  const hasDoctor =
    report.doctorName &&
    report.doctorName !== "Self" &&
    report.doctorName !== "SELF";

  const qr = getQrUrl(report);

  const patientInfo = `
    <div class="patient-info">
      <div class="info-left">
        <div><span>Patient ID</span><strong>${escapeHtml(
          report.patientId || "-"
        )}</strong></div>
        <div><span>Patient Name</span><strong>${escapeHtml(
          report.patientName || "-"
        )}</strong></div>
        <div><span>Age / Gender</span><strong>${escapeHtml(
          report.patientAge
            ? `${report.patientAge} / ${report.patientGender || "-"}`
            : report.patientGender || "-"
        )}</strong></div>
        <div><span>Phone</span><strong>${escapeHtml(
          report.patientPhone || "-"
        )}</strong></div>
        <div><span>Referred By</span><strong>${escapeHtml(
          report.doctorName || "Self"
        )}</strong></div>
      </div>

      <div class="info-right">
        <div><span>Report ID</span><strong>${escapeHtml(
          report.reportId || "-"
        )}</strong></div>
        <div><span>Report Date</span><strong>${escapeHtml(
          formatDate(report.date)
        )}</strong></div>
        <div><span>Priority</span><strong>${escapeHtml(
          report.priority || "Normal"
        )}</strong></div>
        <div><span>Status</span><strong>${escapeHtml(
          report.status || "Pending"
        )}</strong></div>
        <div><span>Technician</span><strong>${escapeHtml(
          report.technician || "Lab Technician"
        )}</strong></div>
      </div>
    </div>
  `;

  const rows = tests
    .map(
      (test) => `
        <tr>
          <td>
            <strong>${escapeHtml(test.testName || "-")}</strong>
            ${
              test.category
                ? `<small>${escapeHtml(test.category)}</small>`
                : ""
            }
          </td>
          <td class="result-cell">${escapeHtml(
            test.result === "" || test.result === undefined
              ? "-"
              : test.result
          )}</td>
          <td>${escapeHtml(test.unit || "-")}</td>
          <td>${escapeHtml(test.referenceRange || "-")}</td>
        </tr>
      `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${escapeHtml(report.reportId)} - ${escapeHtml(
    report.patientName
  )}</title>

<style>
@page {
  size: A4;
  margin: 12mm 12mm 16mm 12mm;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  color: #26030b;
  background: #ffffff;
  font-size: 12px;
}

body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.report-page {
  width: 100%;
  min-height: 100%;
  position: relative;
}

.report-header {
  border-bottom: 3px solid #5b0a1a;
  padding-bottom: 12px;
  margin-bottom: 14px;
}

.header-grid {
  display: grid;
  grid-template-columns: 110px 1fr 120px;
  align-items: center;
  gap: 12px;
}

.qr-box {
  width: 92px;
  height: 92px;
  border: 1px solid #d9c5ca;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.qr-box img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.brand {
  text-align: center;
}

.brand h1 {
  margin: 0;
  color: #5b0a1a;
  font-size: 29px;
  letter-spacing: 1px;
  font-weight: 800;
}

.brand h2 {
  margin: 6px 0 0;
  color: #5b0a1a;
  font-size: 14px;
  font-weight: 600;
}

.brand p {
  margin: 5px 0 0;
  color: #555;
  font-size: 10px;
}

.logo-box {
  text-align: right;
}

.logo-box img {
  width: 110px;
  max-height: 70px;
  object-fit: contain;
}

.logo-title {
  color: #5b0a1a;
  font-weight: 800;
  font-size: 13px;
  margin-top: 4px;
}

.meta-strip {
  margin-top: 10px;
  padding: 7px 10px;
  background: #f8edf0;
  border: 1px solid #ead5da;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
}

.patient-heading {
  color: #5b0a1a;
  font-size: 14px;
  font-weight: 800;
  margin: 14px 0 7px;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.patient-info {
  border: 1px solid #d9c5ca;
  border-radius: 5px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  margin-bottom: 16px;
}

.info-left,
.info-right {
  padding: 8px 12px;
}

.info-left {
  border-right: 1px solid #e1d4d7;
}

.info-left > div,
.info-right > div {
  display: grid;
  grid-template-columns: 125px 1fr;
  padding: 4px 0;
  border-bottom: 1px dotted #ddd;
}

.info-left > div:last-child,
.info-right > div:last-child {
  border-bottom: 0;
}

.info-left span,
.info-right span {
  color: #666;
  font-weight: 600;
}

.info-left strong,
.info-right strong {
  color: #1e1014;
}

.section-title {
  color: #5b0a1a;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  margin: 15px 0 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-line {
  height: 2px;
  background: #5b0a1a;
  width: 100%;
  margin-bottom: 10px;
}

.test-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  page-break-inside: auto;
}

.test-table thead {
  display: table-header-group;
}

.test-table tr {
  page-break-inside: avoid;
  page-break-after: auto;
}

.test-table th {
  background: #5b0a1a;
  color: white;
  padding: 8px;
  text-align: left;
  border: 1px solid #5b0a1a;
  font-size: 11px;
}

.test-table td {
  border: 1px solid #d4c7ca;
  padding: 8px;
  vertical-align: top;
  font-size: 11px;
}

.test-table td small {
  display: block;
  margin-top: 3px;
  color: #777;
  font-size: 9px;
}

.result-cell {
  font-weight: 800;
  color: #5b0a1a;
}

.remarks {
  margin-top: 15px;
  border: 1px solid #d9c5ca;
  border-left: 4px solid #5b0a1a;
  padding: 9px 12px;
  min-height: 55px;
}

.remarks-title {
  color: #5b0a1a;
  font-weight: 800;
  margin-bottom: 6px;
}

.signature-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  margin-top: 80px;
  page-break-inside: avoid;
}

.signature-area.single {
  grid-template-columns: 1fr;
}

.signature {
  text-align: center;
  min-height: 80px;
}

.signature-line {
  width: 160px;
  border-top: 1px solid #222;
  margin: 30px auto 5px;
}

.signature-name {
  font-weight: 800;
  color: #26030b;
}

.signature-role {
  font-size: 10px;
  color: #666;
  margin-top: 3px;
}

.footer-note {
  margin-top: 28px;
  padding-top: 8px;
  border-top: 1px solid #ddd;
  text-align: center;
  color: #666;
  font-size: 9px;
}

@media print {
  .report-page {
    min-height: 0;
  }

  .signature-area {
    break-inside: avoid;
  }

  .remarks {
    break-inside: avoid;
  }
}
</style>
</head>

<body>
<div class="report-page">

  <div class="report-header">
    <div class="header-grid">

      <div class="qr-box">
        <img src="${qr}" alt="Patient QR Code">
      </div>

      <div class="brand">
        <h1>TAZ DIAGNOSTIC</h1>
        <h2>Laboratory Diagnostic Report</h2>
        <p>Accurate • Reliable • Trusted Laboratory Services</p>
      </div>

      <div class="logo-box">
        <img src="${LOGO_URL}" alt="TAZ Diagnostic Logo">
        <div class="logo-title">TAZ DIAGNOSTIC</div>
      </div>

    </div>

    <div class="meta-strip">
      <span>Report: <strong>${escapeHtml(
        report.reportId || "-"
      )}</strong></span>
      <span>Patient: <strong>${escapeHtml(
        report.patientName || "-"
      )}</strong></span>
      <span>Date: <strong>${escapeHtml(
        formatDate(report.date)
      )}</strong></span>
    </div>
  </div>

  <div class="patient-heading">Patient Information</div>

  ${patientInfo}

  <div class="section-title">Laboratory Test Results</div>
  <div class="section-line"></div>

  <table class="test-table">
    <thead>
      <tr>
        <th style="width:40%">Test</th>
        <th style="width:18%">Result</th>
        <th style="width:17%">Unit</th>
        <th style="width:25%">Reference Range</th>
      </tr>
    </thead>

    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="remarks">
    <div class="remarks-title">Remarks</div>
    <div>${escapeHtml(report.remarks || "No remarks")}</div>
  </div>

  ${
    hasDoctor
      ? `
    <div class="signature-area">

      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(
          report.doctorName
        )}</div>
        <div class="signature-role">Referring Doctor</div>
      </div>

      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(
          report.technician || "Lab Technician"
        )}</div>
        <div class="signature-role">Lab Technician</div>
      </div>

    </div>
  `
      : `
    <div class="signature-area single">

      <div class="signature">
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(
          report.technician || "Lab Technician"
        )}</div>
        <div class="signature-role">Lab Technician</div>
      </div>

    </div>
  `}

  <div class="footer-note">
    This report is electronically generated by TAZ DIAGNOSTIC.
    Please correlate laboratory findings with clinical information.
  </div>

</div>
</body>
</html>
`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");

  const [patientOpen, setPatientOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);

  const [form, setForm] = useState({
    reportId: "",
    patientId: "",
    patientName: "",
    patientAge: "",
    patientGender: "",
    patientPhone: "",
    doctorId: "SELF",
    doctorName: "Self",
    date: formatDateInput(new Date()),
    status: "Pending",
    priority: "Normal",
    technician: "Lab Technician",
    remarks: "",
    tests: [],
  });

  useEffect(() => {
    loadEverything();
  }, []);

  function loadEverything() {
    let savedReports = safeRead(REPORT_KEY, []);

    if (!savedReports.length) {
      savedReports = createDefaultReports();
      safeWrite(REPORT_KEY, savedReports);
    }

    const savedPatients = safeRead(PATIENT_KEY, []);
    const savedDoctors = safeRead(DOCTOR_KEY, []);
    const savedTests = safeRead(TEST_MASTER_KEY, []);

    const alternateTests = safeRead(TEST_KEY, []);

    const combinedTests = [
      ...(savedTests.length ? savedTests : []),
      ...alternateTests,
      ...DEFAULT_TESTS,
    ];

    const uniqueTests = [];

    combinedTests.forEach((test) => {
      const id = getTestId(test);
      const name = getTestName(test);

      if (!id && !name) return;

      const exists = uniqueTests.some(
        (item) =>
          getTestId(item) === id ||
          getTestName(item).toLowerCase() === name.toLowerCase()
      );

      if (!exists) {
        uniqueTests.push(test);
      }
    });

    setReports(savedReports);
    setPatients(savedPatients);
    setDoctors(savedDoctors.length ? savedDoctors : DEFAULT_DOCTORS);
    setTests(uniqueTests);
  }

  function saveReports(next) {
    setReports(next);
    safeWrite(REPORT_KEY, next);
  }

  function resetForm() {
    setForm({
      reportId: generateId(reports, "REP"),
      patientId: "",
      patientName: "",
      patientAge: "",
      patientGender: "",
      patientPhone: "",
      doctorId: "SELF",
      doctorName: "Self",
      date: formatDateInput(new Date()),
      status: "Pending",
      priority: "Normal",
      technician: "Lab Technician",
      remarks: "",
      tests: [],
    });

    setPatientSearch("");
    setDoctorSearch("");
    setTestSearch("");

    setPatientOpen(false);
    setDoctorOpen(false);
    setTestOpen(false);
  }

  function openNew() {
    resetForm();
    setModal("form");
  }

  function openEdit(report) {
    setForm({
      reportId: report.reportId || report.id || generateId(reports, "REP"),
      patientId: report.patientId || "",
      patientName: report.patientName || "",
      patientAge: report.patientAge || "",
      patientGender: report.patientGender || "",
      patientPhone: report.patientPhone || "",
      doctorId: report.doctorId || "SELF",
      doctorName: report.doctorName || "Self",
      date: formatDateInput(report.date || new Date()),
      status: report.status || "Pending",
      priority: report.priority || "Normal",
      technician: report.technician || "Lab Technician",
      remarks: report.remarks || "",
      tests: Array.isArray(report.tests)
        ? report.tests.map(normalizeTest)
        : [],
    });

    setPatientSearch(report.patientName || "");
    setDoctorSearch(report.doctorName || "");
    setTestSearch("");

    setPatientOpen(false);
    setDoctorOpen(false);
    setTestOpen(false);

    setSelectedReport(report);
    setModal("form");
  }

  function selectPatient(patient) {
    const id = getPatientId(patient);
    const name = getPatientName(patient);

    const patientTests =
      patient?.tests ||
      patient?.selectedTests ||
      patient?.selectedTestsData ||
      [];

    const normalizedPatientTests = Array.isArray(patientTests)
      ? patientTests.map(normalizeTest)
      : [];

    setForm((prev) => ({
      ...prev,
      patientId: id,
      patientName: name,
      patientAge: patient?.age || "",
      patientGender: patient?.gender || "",
      patientPhone: patient?.phone || patient?.mobile || "",
      tests:
        normalizedPatientTests.length > 0
          ? normalizedPatientTests
          : prev.tests,
    }));

    setPatientSearch(name);
    setPatientOpen(false);
  }

  function selectDoctor(doctor) {
    if (doctor === "SELF") {
      setForm((prev) => ({
        ...prev,
        doctorId: "SELF",
        doctorName: "Self",
      }));

      setDoctorSearch("Self");
      setDoctorOpen(false);
      return;
    }

    const id = doctor?.doctorId || doctor?.id || "";
    const name = getDoctorName(doctor);

    setForm((prev) => ({
      ...prev,
      doctorId: id,
      doctorName: name,
    }));

    setDoctorSearch(name);
    setDoctorOpen(false);
  }

  function addTest(test) {
    const normalized = normalizeTest(test);

    setForm((prev) => {
      const alreadyExists = prev.tests.some(
        (item) =>
          item.testId === normalized.testId ||
          item.testName === normalized.testName
      );

      if (alreadyExists) {
        return prev;
      }

      return {
        ...prev,
        tests: [...prev.tests, normalized],
      };
    });

    setTestSearch("");
    setTestOpen(false);
  }

  function removeTest(index) {
    setForm((prev) => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index),
    }));
  }

  function updateTest(index, field, value) {
    setForm((prev) => ({
      ...prev,
      tests: prev.tests.map((test, i) =>
        i === index
          ? {
              ...test,
              [field]: value,
            }
          : test
      ),
    }));
  }

  function handleSave() {
    if (!form.patientId || !form.patientName) {
      alert("Please select a patient.");
      return;
    }

    if (!form.tests.length) {
      alert("Please select at least one test.");
      return;
    }

    const normalized = {
      ...form,
      id: form.reportId,
      reportId: form.reportId,
      date: form.date || formatDateInput(new Date()),
      tests: form.tests.map(normalizeTest),
      createdAt:
        selectedReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const editing = reports.some(
      (item) =>
        (item.reportId || item.id) === form.reportId
    );

    const next = editing
      ? reports.map((item) =>
          (item.reportId || item.id) === form.reportId
            ? normalized
            : item
        )
      : [normalized, ...reports];

    saveReports(next);

    setModal(null);
    setSelectedReport(null);
    resetForm();
  }

  function deleteReport(report) {
    const ok = window.confirm(
      `Delete report ${report.reportId || report.id}?`
    );

    if (!ok) return;

    const id = report.reportId || report.id;

    saveReports(
      reports.filter(
        (item) => (item.reportId || item.id) !== id
      )
    );
  }

  function markCompleted(report) {
    const id = report.reportId || report.id;

    saveReports(
      reports.map((item) =>
        (item.reportId || item.id) === id
          ? {
              ...item,
              status: "Completed",
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  }

  function viewReport(report) {
    setSelectedReport(report);
    setModal("view");
  }

  function printReport(report) {
    const html = buildReportHtml(report);

    const win = window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

    if (!win) {
      alert("Please allow pop-ups to print the report.");
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();

    setTimeout(() => {
      win.focus();
      win.print();
    }, 800);
  }

  function downloadReport(report) {
    const html = buildReportHtml(report);

    const blob = new Blob([html], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${report.reportId || "report"}-${
      report.patientName || "patient"
    }.html`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  async function shareReport(report) {
    const text = [
      "TAZ DIAGNOSTIC",
      "Laboratory Diagnostic Report",
      `Report ID: ${report.reportId}`,
      `Patient ID: ${report.patientId}`,
      `Patient: ${report.patientName}`,
      `Date: ${formatDate(report.date)}`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "TAZ DIAGNOSTIC Report",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Report information copied to clipboard.");
      }
    } catch {
      // User cancelled sharing.
    }
  }

  const filteredReports = useMemo(() => {
    const q = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !q ||
        String(report.reportId || "")
          .toLowerCase()
          .includes(q) ||
        String(report.patientId || "")
          .toLowerCase()
          .includes(q) ||
        String(report.patientName || "")
          .toLowerCase()
          .includes(q) ||
        String(report.doctorName || "")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        statusFilter === "All" ||
        report.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        report.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [reports, search, statusFilter, priorityFilter]);

  const activePatients = patients.filter(
    (patient) => patient?.status !== "Inactive"
  );

  const activeDoctors = doctors.filter(
    (doctor) => doctor?.status !== "Inactive"
  );

  const activeTests = tests.filter(
    (test) => test?.status !== "Inactive"
  );

  const filteredPatients = activePatients.filter((patient) =>
    getPatientName(patient)
      .toLowerCase()
      .includes(patientSearch.toLowerCase())
  );

  const filteredDoctors = activeDoctors.filter((doctor) =>
    getDoctorName(doctor)
      .toLowerCase()
      .includes(doctorSearch.toLowerCase())
  );

  const filteredTests = activeTests.filter((test) =>
    getTestName(test)
      .toLowerCase()
      .includes(testSearch.toLowerCase())
  );

  const total = reports.length;

  const completed = reports.filter(
    (report) => report.status === "Completed"
  ).length;

  const pending = reports.filter(
    (report) => report.status === "Pending"
  ).length;

  const urgent = reports.filter(
    (report) => report.priority === "Urgent"
  ).length;

  return (
    <div className="reports-page">

      <div className="reports-header">
        <div>
          <div className="breadcrumb">
            <span>TAZ COMPANY</span>
            <b>›</b>
            <strong>Reports</strong>
          </div>

          <h1>Laboratory Reports</h1>

          <p>
            Create, review, complete and print professional
            TAZ DIAGNOSTIC laboratory reports.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="secondary-btn"
            onClick={loadEverything}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="primary-btn"
            onClick={openNew}
          >
            <Plus size={18} />
            New Report
          </button>
        </div>
      </div>

      <div className="report-stats">

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={22} />
          </div>
          <div>
            <span>Total Reports</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span>Completed</span>
            <strong>{completed}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Clock3 size={22} />
          </div>
          <div>
            <span>Pending</span>
            <strong>{pending}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <AlertTriangle size={22} />
          </div>
          <div>
            <span>Urgent</span>
            <strong>{urgent}</strong>
          </div>
        </div>

      </div>

      <div className="filter-card">

        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report, patient or doctor..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value)
          }
        >
          <option value="All">All Priority</option>
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
        </select>

      </div>

      <div className="reports-table-card">

        <div className="table-title">
          <div>
            <h2>Reports</h2>
            <span>
              {filteredReports.length} report
              {filteredReports.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="table-wrapper">

          <table className="reports-table">

            <thead>
              <tr>
                <th>REPORT ID</th>
                <th>PATIENT</th>
                <th>DOCTOR / REFERRAL</th>
                <th>TESTS</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>PRIORITY</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>

              {filteredReports.map((report) => (

                <tr key={report.reportId || report.id}>

                  <td>
                    <strong className="report-id">
                      {report.reportId || report.id}
                    </strong>
                  </td>

                  <td>
                    <div className="patient-cell">
                      <strong>
                        {report.patientName || "-"}
                      </strong>
                      <span>
                        {report.patientId || "-"}
                      </span>
                    </div>
                  </td>

                  <td>
                    {report.doctorName || "Self"}
                  </td>

                  <td>
                    <span className="test-count">
                      <FlaskConical size={14} />
                      {Array.isArray(report.tests)
                        ? report.tests.length
                        : 0}
                    </span>
                  </td>

                  <td>
                    {formatDate(report.date)}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        report.status === "Completed"
                          ? "completed"
                          : "pending"
                      }`}
                    >
                      {report.status || "Pending"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`priority-badge ${
                        report.priority === "Urgent"
                          ? "urgent"
                          : "normal"
                      }`}
                    >
                      {report.priority || "Normal"}
                    </span>
                  </td>

                  <td>

                    <div className="action-buttons">

                      <button
                        className="icon-btn"
                        title="View Report"
                        onClick={() =>
                          viewReport(report)
                        }
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() =>
                          openEdit(report)
                        }
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        className="icon-btn"
                        title="Print"
                        onClick={() =>
                          printReport(report)
                        }
                      >
                        <Printer size={15} />
                      </button>

                      {report.status !== "Completed" && (
                        <button
                          className="icon-btn complete-btn"
                          title="Mark Completed"
                          onClick={() =>
                            markCompleted(report)
                          }
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      )}

                      <button
                        className="icon-btn danger-btn"
                        title="Delete"
                        onClick={() =>
                          deleteReport(report)
                        }
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

              {!filteredReports.length && (
                <tr>
                  <td
                    colSpan="8"
                    className="empty-table"
                  >
                    <FileText size={35} />
                    <strong>No reports found</strong>
                    <span>
                      Create a new report to get started.
                    </span>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

      {modal === "form" && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setModal(null);
            }
          }}
        >

          <div className="report-modal">

            <div className="modal-header">
              <div>
                <h2>
                  {selectedReport
                    ? "Edit Report"
                    : "Create Report"}
                </h2>
                <p>
                  Select patient and tests for the
                  laboratory report.
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() => setModal(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">

              <div className="form-grid">

                <div className="field full">
                  <label>Patient *</label>

                  <div className="dropdown">

                    <button
                      type="button"
                      className={`dropdown-control ${
                        patientOpen ? "open" : ""
                      }`}
                      onClick={() => {
                        setPatientOpen((v) => !v);
                        setDoctorOpen(false);
                        setTestOpen(false);
                      }}
                    >
                      <UserRound size={17} />

                      <span>
                        {form.patientName
                          ? `${form.patientId} - ${form.patientName}`
                          : "Search or select patient"}
                      </span>

                      <ChevronDown size={17} />
                    </button>

                    {patientOpen && (
                      <div className="dropdown-menu">

                        <div className="dropdown-search">
                          <Search size={15} />
                          <input
                            autoFocus
                            value={patientSearch}
                            onChange={(e) =>
                              setPatientSearch(
                                e.target.value
                              )
                            }
                            placeholder="Search patient..."
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          />
                        </div>

                        <div className="dropdown-list">

                          {filteredPatients.map(
                            (patient) => (
                              <button
                                type="button"
                                key={getPatientId(
                                  patient
                                )}
                                onClick={() =>
                                  selectPatient(
                                    patient
                                  )
                                }
                              >
                                <strong>
                                  {getPatientName(
                                    patient
                                  )}
                                </strong>
                                <small>
                                  {getPatientId(
                                    patient
                                  )}
                                </small>
                              </button>
                            )
                          )}

                          {!filteredPatients.length && (
                            <div className="no-results">
                              No patients found
                            </div>
                          )}

                        </div>

                      </div>
                    )}

                  </div>
                </div>

                <div className="field">
                  <label>Doctor / Referral</label>

                  <div className="dropdown">

                    <button
                      type="button"
                      className="dropdown-control"
                      onClick={() => {
                        setDoctorOpen((v) => !v);
                        setPatientOpen(false);
                        setTestOpen(false);
                      }}
                    >
                      <span>
                        {form.doctorName || "Self"}
                      </span>
                      <ChevronDown size={17} />
                    </button>

                    {doctorOpen && (
                      <div className="dropdown-menu">

                        <div className="dropdown-search">
                          <Search size={15} />
                          <input
                            autoFocus
                            value={doctorSearch}
                            onChange={(e) =>
                              setDoctorSearch(
                                e.target.value
                              )
                            }
                            placeholder="Search doctor..."
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          />
                        </div>

                        <div className="dropdown-list">

                          <button
                            type="button"
                            onClick={() =>
                              selectDoctor("SELF")
                            }
                          >
                            <strong>Self</strong>
                            <small>
                              No referring doctor
                            </small>
                          </button>

                          {filteredDoctors.map(
                            (doctor) => (
                              <button
                                type="button"
                                key={
                                  doctor.doctorId ||
                                  doctor.id
                                }
                                onClick={() =>
                                  selectDoctor(
                                    doctor
                                  )
                                }
                              >
                                <strong>
                                  {getDoctorName(
                                    doctor
                                  )}
                                </strong>
                                <small>
                                  {doctor.specialization ||
                                    "Doctor"}
                                </small>
                              </button>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  </div>
                </div>

                <div className="field">
                  <label>Report Date</label>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="field">
                  <label>Status</label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="Completed">
                      Completed
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>Priority</label>

                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                  >
                    <option value="Normal">
                      Normal
                    </option>
                    <option value="Urgent">
                      Urgent
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>Technician</label>

                  <input
                    value={form.technician}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        technician: e.target.value,
                      }))
                    }
                    placeholder="Lab Technician"
                  />
                </div>

              </div>

              <div className="tests-section">

                <div className="section-heading">
                  <div>
                    <h3>Tests *</h3>
                    <span>
                      {form.tests.length} selected
                    </span>
                  </div>
                </div>

                <div className="test-selector">

                  <button
                    type="button"
                    className="test-selector-control"
                    onClick={() => {
                      setTestOpen((v) => !v);
                      setPatientOpen(false);
                      setDoctorOpen(false);
                    }}
                  >
                    <FlaskConical size={17} />

                    <span>
                      Select laboratory tests
                    </span>

                    <ChevronDown size={17} />
                  </button>

                  {testOpen && (
                    <div className="test-dropdown">

                      <div className="dropdown-search">
                        <Search size={15} />
                        <input
                          autoFocus
                          value={testSearch}
                          onChange={(e) =>
                            setTestSearch(
                              e.target.value
                            )
                          }
                          placeholder="Search tests..."
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        />
                      </div>

                      <div className="dropdown-list">

                        {filteredTests.map((test) => {

                          const normalized =
                            normalizeTest(test);

                          const selected =
                            form.tests.some(
                              (item) =>
                                item.testId ===
                                  normalized.testId ||
                                item.testName ===
                                  normalized.testName
                            );

                          return (
                            <button
                              type="button"
                              key={
                                normalized.testId ||
                                normalized.testName
                              }
                              className={
                                selected
                                  ? "selected-option"
                                  : ""
                              }
                              onClick={() =>
                                addTest(test)
                              }
                            >
                              <div>
                                <strong>
                                  {
                                    normalized.testName
                                  }
                                </strong>
                                <small>
                                  {
                                    normalized.category
                                  }{" "}
                                  •{" "}
                                  {normalized.unit}
                                </small>
                              </div>

                              <span>
                                {selected
                                  ? "Added"
                                  : "Add"}
                              </span>
                            </button>
                          );
                        })}

                        {!filteredTests.length && (
                          <div className="no-results">
                            No matching tests found.
                          </div>
                        )}

                      </div>

                    </div>
                  )}

                </div>

                <div className="selected-tests">

                  {form.tests.map((test, index) => (

                    <div
                      className="selected-test-card"
                      key={`${test.testId}-${index}`}
                    >

                      <div className="selected-test-title">

                        <div>
                          <strong>
                            {test.testName}
                          </strong>

                          <span>
                            {test.category ||
                              "Laboratory Test"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeTest(index)
                          }
                        >
                          <X size={16} />
                        </button>

                      </div>

                      <div className="test-result-grid">

                        <div>
                          <label>Result</label>

                          <input
                            value={test.result || ""}
                            onChange={(e) =>
                              updateTest(
                                index,
                                "result",
                                e.target.value
                              )
                            }
                            placeholder="Enter result"
                          />
                        </div>

                        <div>
                          <label>Unit</label>

                          <input
                            value={test.unit || ""}
                            onChange={(e) =>
                              updateTest(
                                index,
                                "unit",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label>
                            Reference Range
                          </label>

                          <input
                            value={
                              test.referenceRange ||
                              ""
                            }
                            onChange={(e) =>
                              updateTest(
                                index,
                                "referenceRange",
                                e.target.value
                              )
                            }
                          />
                        </div>

                      </div>

                    </div>

                  ))}

                  {!form.tests.length && (
                    <div className="no-tests">
                      <FlaskConical size={30} />
                      <strong>
                        No tests selected
                      </strong>
                      <span>
                        Click "Select laboratory
                        tests" to add tests.
                      </span>
                    </div>
                  )}

                </div>

              </div>

              <div className="field full">

                <label>Remarks</label>

                <textarea
                  value={form.remarks}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                  placeholder="Enter report remarks..."
                  rows="4"
                />

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="secondary-btn"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                onClick={handleSave}
              >
                <CheckCircle2 size={17} />
                Save Report
              </button>

            </div>

          </div>

        </div>
      )}

      {modal === "view" && selectedReport && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setModal(null);
            }
          }}
        >

          <div className="view-modal">

            <div className="view-header">

              <div>
                <h2>Report Preview</h2>
                <p>
                  {selectedReport.reportId} •{" "}
                  {selectedReport.patientName}
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() => setModal(null)}
              >
                <X size={20} />
              </button>

            </div>

            <div className="view-actions">

              <button
                className="primary-btn"
                onClick={() =>
                  printReport(selectedReport)
                }
              >
                <Printer size={17} />
                Print / PDF
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  downloadReport(selectedReport)
                }
              >
                <Download size={17} />
                Download
              </button>

              <button
                className="secondary-btn"
                onClick={() =>
                  shareReport(selectedReport)
                }
              >
                <Share2 size={17} />
                Share
              </button>

            </div>

            <div className="report-preview">

              <div className="preview-header">

                <div className="preview-qr">
                  <img
                    src={getQrUrl(selectedReport)}
                    alt="Patient QR"
                  />
                </div>

                <div className="preview-brand">
                  <h1>TAZ DIAGNOSTIC</h1>
                  <h3>
                    Laboratory Diagnostic Report
                  </h3>
                  <p>
                    Accurate • Reliable • Trusted
                  </p>
                </div>

                <div className="preview-logo">
                  <img
                    src={LOGO_URL}
                    alt="TAZ Diagnostic"
                  />
                </div>

              </div>

              <div className="preview-line" />

              <div className="preview-patient-grid">

                <div>
                  <span>Patient ID</span>
                  <strong>
                    {selectedReport.patientId ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Report ID</span>
                  <strong>
                    {selectedReport.reportId ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Patient Name</span>
                  <strong>
                    {selectedReport.patientName ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>
                    {formatDate(
                      selectedReport.date
                    )}
                  </strong>
                </div>

                <div>
                  <span>Doctor / Referral</span>
                  <strong>
                    {selectedReport.doctorName ||
                      "Self"}
                  </strong>
                </div>

                <div>
                  <span>Priority</span>
                  <strong>
                    {selectedReport.priority ||
                      "Normal"}
                  </strong>
                </div>

              </div>

              <h3 className="preview-title">
                Laboratory Test Results
              </h3>

              <table className="preview-table">

                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Result</th>
                    <th>Unit</th>
                    <th>Reference Range</th>
                  </tr>
                </thead>

                <tbody>

                  {(selectedReport.tests || []).map(
                    (test, index) => (
                      <tr key={index}>
                        <td>
                          <strong>
                            {test.testName}
                          </strong>
                          <small>
                            {test.category || ""}
                          </small>
                        </td>

                        <td>
                          {test.result || "-"}
                        </td>

                        <td>
                          {test.unit || "-"}
                        </td>

                        <td>
                          {test.referenceRange ||
                            "-"}
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>

              <div className="preview-remarks">

                <strong>Remarks</strong>

                <span>
                  {selectedReport.remarks ||
                    "No remarks"}
                </span>

              </div>

              <div
                className={`preview-signatures ${
                  selectedReport.doctorName &&
                  selectedReport.doctorName !==
                    "Self" &&
                  selectedReport.doctorName !==
                    "SELF"
                    ? ""
                    : "single"
                }`}
              >

                {selectedReport.doctorName &&
                  selectedReport.doctorName !==
                    "Self" &&
                  selectedReport.doctorName !==
                    "SELF" && (
                    <div>
                      <div className="signature-line" />
                      <strong>
                        {selectedReport.doctorName}
                      </strong>
                      <span>
                        Referring Doctor
                      </span>
                    </div>
                  )}

                <div>
                  <div className="signature-line" />
                  <strong>
                    {selectedReport.technician ||
                      "Lab Technician"}
                  </strong>
                  <span>Lab Technician</span>
                </div>

              </div>

              <div className="preview-footer">
                This report is electronically
                generated by TAZ DIAGNOSTIC.
              </div>

            </div>

          </div>

        </div>
      )}

      <style>{`
        .reports-page {
          padding: 28px;
          color: #26030b;
          min-height: 100%;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .breadcrumb {
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: 13px;
          color: #9a7c84;
          margin-bottom: 12px;
        }

        .breadcrumb strong {
          color: #5b0a1a;
        }

        .reports-header h1 {
          margin: 0;
          font-size: 28px;
          color: #3a0610;
        }

        .reports-header p {
          margin: 8px 0 0;
          color: #8c737a;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .primary-btn,
        .secondary-btn {
          border: 0;
          border-radius: 9px;
          min-height: 42px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 700;
          cursor: pointer;
          font-size: 13px;
        }

        .primary-btn {
          background: #5b0a1a;
          color: white;
        }

        .primary-btn:hover {
          background: #3a0610;
        }

        .secondary-btn {
          background: #f6edef;
          color: #5b0a1a;
          border: 1px solid #ead8dd;
        }

        .secondary-btn:hover {
          background: #f1e1e5;
        }

        .report-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          border: 1px solid #eadce0;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 5px 20px rgba(91, 10, 26, .04);
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          border-radius: 11px;
          background: #f8e8ed;
          color: #5b0a1a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon.success {
          background: #eaf7ef;
          color: #187443;
        }

        .stat-icon.warning {
          background: #fff6df;
          color: #9a6a00;
        }

        .stat-icon.danger {
          background: #fdebec;
          color: #b32636;
        }

        .stat-card span {
          display: block;
          color: #8c737a;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .stat-card strong {
          font-size: 23px;
          color: #3a0610;
        }

        .filter-card {
          background: white;
          border: 1px solid #eadce0;
          border-radius: 14px;
          padding: 15px;
          display: grid;
          grid-template-columns: 1fr 180px 180px;
          gap: 12px;
          margin-bottom: 18px;
        }

        .search-box {
          height: 43px;
          border: 1px solid #e2d1d6;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          color: #9a7c84;
        }

        .search-box input {
          border: 0;
          outline: 0;
          width: 100%;
          font-size: 13px;
          color: #3a0610;
        }

        .filter-card select,
        .field select,
        .field input,
        .field textarea {
          width: 100%;
          border: 1px solid #e2d1d6;
          border-radius: 9px;
          outline: none;
          background: white;
          color: #3a0610;
          padding: 0 12px;
          min-height: 43px;
          font-size: 13px;
        }

        .field textarea {
          padding-top: 12px;
          resize: vertical;
        }

        .reports-table-card {
          background: white;
          border: 1px solid #eadce0;
          border-radius: 14px;
          overflow: hidden;
        }

        .table-title {
          padding: 18px 20px;
          border-bottom: 1px solid #eee2e5;
        }

        .table-title h2 {
          margin: 0;
          font-size: 17px;
          color: #3a0610;
        }

        .table-title span {
          display: block;
          margin-top: 4px;
          color: #9a7c84;
          font-size: 12px;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .reports-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
        }

        .reports-table th {
          text-align: left;
          background: #fbf6f7;
          color: #765861;
          font-size: 11px;
          padding: 13px 15px;
          border-bottom: 1px solid #eadce0;
        }

        .reports-table td {
          padding: 14px 15px;
          border-bottom: 1px solid #f0e7e9;
          font-size: 12px;
          color: #4b343b;
        }

        .reports-table tr:hover td {
          background: #fffafb;
        }

        .report-id {
          color: #5b0a1a;
        }

        .patient-cell strong,
        .patient-cell span {
          display: block;
        }

        .patient-cell span {
          color: #9a7c84;
          font-size: 11px;
          margin-top: 3px;
        }

        .test-count {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #5b0a1a;
          background: #f9edf0;
          border-radius: 20px;
          padding: 5px 9px;
          font-weight: 700;
        }

        .status-badge,
        .priority-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 20px;
          padding: 5px 9px;
          font-size: 10px;
          font-weight: 800;
        }

        .status-badge.completed {
          color: #187443;
          background: #eaf7ef;
        }

        .status-badge.pending {
          color: #9a6a00;
          background: #fff6df;
        }

        .priority-badge.normal {
          color: #5b0a1a;
          background: #f8e8ed;
        }

        .priority-badge.urgent {
          color: #b32636;
          background: #fdebec;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
        }

        .icon-btn {
          width: 31px;
          height: 31px;
          border: 1px solid #e5d5da;
          background: white;
          color: #5b0a1a;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .icon-btn:hover {
          background: #f9edf0;
        }

        .complete-btn {
          color: #187443;
        }

        .danger-btn {
          color: #b32636;
        }

        .empty-table {
          height: 220px;
          text-align: center !important;
        }

        .empty-table svg {
          display: block;
          margin: 0 auto 10px;
          color: #b99ba3;
        }

        .empty-table strong,
        .empty-table span {
          display: block;
        }

        .empty-table span {
          margin-top: 5px;
          color: #9a7c84;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(38, 3, 11, .58);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 25px;
        }

        .report-modal,
        .view-modal {
          background: white;
          width: min(1050px, 100%);
          max-height: 94vh;
          overflow: hidden;
          border-radius: 17px;
          box-shadow: 0 30px 80px rgba(0,0,0,.28);
        }

        .view-modal {
          width: min(1000px, 100%);
          overflow-y: auto;
        }

        .modal-header,
        .view-header {
          padding: 20px 24px;
          border-bottom: 1px solid #eadce0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .modal-header h2,
        .view-header h2 {
          margin: 0;
          color: #5b0a1a;
          font-size: 21px;
        }

        .modal-header p,
        .view-header p {
          margin: 5px 0 0;
          color: #9a7c84;
          font-size: 12px;
        }

        .close-btn {
          width: 38px;
          height: 38px;
          border: 0;
          background: #f8e8ed;
          color: #5b0a1a;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .modal-body {
          padding: 22px 24px;
          overflow-y: auto;
          max-height: calc(94vh - 150px);
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          display: block;
          color: #4a3038;
          font-weight: 700;
          font-size: 12px;
          margin-bottom: 7px;
        }

        .dropdown {
          position: relative;
        }

        .dropdown-control,
        .test-selector-control {
          width: 100%;
          min-height: 43px;
          border: 1px solid #e2d1d6;
          border-radius: 9px;
          background: white;
          color: #4b343b;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          cursor: pointer;
          text-align: left;
        }

        .dropdown-control span,
        .test-selector-control span {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .dropdown-menu,
        .test-dropdown {
          position: absolute;
          z-index: 10000;
          left: 0;
          right: 0;
          top: calc(100% + 5px);
          background: white;
          border: 1px solid #dfcbd1;
          border-radius: 10px;
          box-shadow: 0 18px 40px rgba(91,10,26,.16);
          overflow: hidden;
        }

        .dropdown-search {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px;
          border-bottom: 1px solid #eee2e5;
        }

        .dropdown-search input {
          border: 0;
          outline: 0;
          width: 100%;
          font-size: 12px;
        }

        .dropdown-list {
          max-height: 220px;
          overflow-y: auto;
        }

        .dropdown-list button {
          width: 100%;
          border: 0;
          background: white;
          padding: 10px 12px;
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .dropdown-list button:hover,
        .dropdown-list button.selected-option {
          background: #f9edf0;
        }

        .dropdown-list button strong,
        .dropdown-list button small {
          display: block;
        }

        .dropdown-list button small {
          color: #9a7c84;
          margin-top: 3px;
        }

        .dropdown-list button > span {
          color: #5b0a1a;
          font-size: 10px;
          font-weight: 800;
        }

        .no-results {
          padding: 25px;
          text-align: center;
          color: #9a7c84;
          font-size: 12px;
        }

        .tests-section {
          margin-top: 22px;
          margin-bottom: 20px;
        }

        .section-heading {
          margin-bottom: 8px;
        }

        .section-heading h3 {
          margin: 0;
          font-size: 14px;
          color: #3a0610;
        }

        .section-heading span {
          color: #9a7c84;
          font-size: 11px;
        }

        .test-selector {
          position: relative;
        }

        .test-dropdown {
          z-index: 10001;
        }

        .selected-tests {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .selected-test-card {
          border: 1px solid #ead8dd;
          border-radius: 10px;
          padding: 12px;
          background: #fffafb;
        }

        .selected-test-title {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
        }

        .selected-test-title strong,
        .selected-test-title span {
          display: block;
        }

        .selected-test-title strong {
          color: #5b0a1a;
          font-size: 13px;
        }

        .selected-test-title span {
          color: #9a7c84;
          font-size: 10px;
          margin-top: 3px;
        }

        .selected-test-title button {
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: 7px;
          background: #f8e8ed;
          color: #b32636;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .test-result-grid {
          display: grid;
          grid-template-columns: 1.3fr .7fr 1.3fr;
          gap: 10px;
        }

        .test-result-grid label {
          display: block;
          color: #765861;
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .test-result-grid input {
          width: 100%;
          min-height: 38px;
          border: 1px solid #e2d1d6;
          border-radius: 8px;
          padding: 0 9px;
          outline: none;
        }

        .no-tests {
          border: 1px dashed #dfcbd1;
          border-radius: 10px;
          padding: 25px;
          text-align: center;
          color: #9a7c84;
        }

        .no-tests svg {
          color: #b99ba3;
        }

        .no-tests strong,
        .no-tests span {
          display: block;
        }

        .no-tests strong {
          color: #5b0a1a;
          margin-top: 6px;
        }

        .no-tests span {
          font-size: 11px;
          margin-top: 3px;
        }

        .modal-footer {
          padding: 15px 24px;
          border-top: 1px solid #eadce0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .view-actions {
          padding: 15px 20px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          border-bottom: 1px solid #eadce0;
        }

        .report-preview {
          width: min(794px, 100%);
          min-height: 1123px;
          margin: 20px auto;
          background: white;
          border: 1px solid #ddd;
          box-shadow: 0 5px 25px rgba(0,0,0,.08);
          padding: 35px;
          color: #26030b;
        }

        .preview-header {
          display: grid;
          grid-template-columns: 90px 1fr 110px;
          align-items: center;
          gap: 15px;
        }

        .preview-qr img {
          width: 75px;
          height: 75px;
        }

        .preview-brand {
          text-align: center;
        }

        .preview-brand h1 {
          color: #5b0a1a;
          margin: 0;
          font-size: 27px;
        }

        .preview-brand h3 {
          margin: 5px 0;
          font-size: 13px;
        }

        .preview-brand p {
          margin: 0;
          color: #777;
          font-size: 10px;
        }

        .preview-logo {
          text-align: right;
        }

        .preview-logo img {
          width: 100px;
        }

        .preview-line {
          height: 3px;
          background: #5b0a1a;
          margin: 15px 0;
        }

        .preview-patient-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border: 1px solid #ddd;
        }

        .preview-patient-grid div {
          padding: 8px 10px;
          border-bottom: 1px solid #eee;
          display: grid;
          grid-template-columns: 115px 1fr;
          font-size: 10px;
        }

        .preview-patient-grid span {
          color: #777;
        }

        .preview-title {
          text-align: center;
          color: #5b0a1a;
          margin: 20px 0 8px;
          font-size: 15px;
        }

        .preview-table {
          width: 100%;
          border-collapse: collapse;
        }

        .preview-table th {
          background: #5b0a1a;
          color: white;
          padding: 8px;
          text-align: left;
          font-size: 10px;
        }

        .preview-table td {
          border: 1px solid #ddd;
          padding: 8px;
          font-size: 10px;
        }

        .preview-table small {
          display: block;
          color: #888;
          margin-top: 3px;
        }

        .preview-remarks {
          margin-top: 15px;
          padding: 10px;
          border: 1px solid #ddd;
          border-left: 4px solid #5b0a1a;
          display: flex;
          gap: 10px;
          font-size: 10px;
        }

        .preview-remarks strong {
          color: #5b0a1a;
        }

        .preview-signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;
          margin-top: 110px;
          text-align: center;
        }

        .preview-signatures.single {
          grid-template-columns: 1fr;
        }

        .preview-signatures .signature-line {
          width: 160px;
          border-top: 1px solid #222;
          margin: 0 auto 5px;
        }

        .preview-signatures strong,
        .preview-signatures span {
          display: block;
          font-size: 10px;
        }

        .preview-signatures span {
          color: #777;
          margin-top: 3px;
        }

        .preview-footer {
          text-align: center;
          color: #777;
          font-size: 8px;
          margin-top: 35px;
          padding-top: 8px;
          border-top: 1px solid #ddd;
        }

        @media (max-width: 900px) {
          .report-stats {
            grid-template-columns: 1fr 1fr;
          }

          .filter-card {
            grid-template-columns: 1fr;
          }

          .reports-header {
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }
        }

        @media (max-width: 600px) {
          .reports-page {
            padding: 15px;
          }

          .report-stats {
            grid-template-columns: 1fr;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }

          .modal-overlay {
            padding: 8px;
          }

          .test-result-grid {
            grid-template-columns: 1fr;
          }

          .report-preview {
            padding: 18px;
          }
        }
      `}</style>
    </div>
  );
}