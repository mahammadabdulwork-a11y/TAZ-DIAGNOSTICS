import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Activity,
  FlaskConical,
  Printer,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FilePlus,
  Stethoscope,
  Share2,
} from "lucide-react";

import { scheduleMonthlyRetestReminder, calculateNextMonthlyDate } from "../utils/reminderHelper";

const STORAGE_KEY = "taz_company_patients";
const REPORT_STORAGE_KEY = "taz_company_reports";

const createPatientId = (patients) => {
  const numbers = patients
    .map((p) => parseInt(String(p.patientId || "").replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));

  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `PAT${String(next).padStart(4, "0")}`;
};

const emptyForm = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  referredBy: "Self",
  dateOfBirth: "",
  enableMonthlyReminder: true,
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'view'
  const [selected, setSelected] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Load patients and reports on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    // Load patients
    const savedPatients = localStorage.getItem(STORAGE_KEY);
    if (savedPatients) {
      try {
        setPatients(JSON.parse(savedPatients));
      } catch {
        setPatients([]);
      }
    }

    // Load reports for clinical history
    const savedReports = localStorage.getItem(REPORT_STORAGE_KEY);
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports));
      } catch {
        setReports([]);
      }
    }
  };

  const savePatients = (data) => {
    setPatients(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return patients;

    return patients.filter((p) =>
      [
        p.patientId,
        p.name,
        p.phone,
        p.email,
        p.referredBy,
        p.gender,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [patients, search]);

  // Find reports for a specific patient
  const getPatientReports = (patient) => {
    if (!patient) return [];
    const pid = String(patient.patientId || "").trim().toLowerCase();
    const pname = String(patient.name || "").trim().toLowerCase();

    return reports.filter((r) => {
      const rPid = String(r.patientId || "").trim().toLowerCase();
      const rPname = String(r.patientName || "").trim().toLowerCase();
      return (pid && rPid === pid) || (pname && rPname === pname);
    }).sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
  };

  const openAdd = () => {
    setForm(emptyForm);
    setModal("add");
  };

  const openEdit = (patient) => {
    setSelected(patient);
    setForm({
      name: patient.name || "",
      age: patient.age || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
      address: patient.address || "",
      referredBy: patient.referredBy || "Self",
      dateOfBirth: patient.dateOfBirth || "",
      enableMonthlyReminder: patient.enableMonthlyReminder !== false,
    });
    setModal("edit");
  };

  const submit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter patient name.");
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (modal === "add") {
      const patient = {
        patientId: createPatientId(patients),
        ...form,
        enableMonthlyReminder: Boolean(form.enableMonthlyReminder !== false),
        nextReminderDate: calculateNextMonthlyDate(todayStr, 1),
        registeredAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      if (patient.enableMonthlyReminder) {
        scheduleMonthlyRetestReminder(patient, 1);
      }

      savePatients([patient, ...patients]);
    } else {
      const updated = patients.map((p) =>
        p.patientId === selected.patientId
          ? {
              ...p,
              ...form,
              updatedAt: now.toISOString(),
            }
          : p
      );

      savePatients(updated);
    }

    setModal(null);
    setSelected(null);
    setForm(emptyForm);
  };

  const deletePatient = (patient) => {
    if (
      !window.confirm(
        `Delete patient ${patient.name} (${patient.patientId})? This action cannot be undone.`
      )
    ) {
      return;
    }

    savePatients(
      patients.filter((p) => p.patientId !== patient.patientId)
    );
  };

  const viewPatient = (patient) => {
    setSelected(patient);
    setModal("view");
  };

  const createReportForPatient = (patient) => {
    // Save selected patient in session/localStorage for the reports page to auto-fill
    sessionStorage.setItem("taz_selected_patient", JSON.stringify(patient));
    window.history.pushState({}, "", "/reports");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const goToEntry = () => {
    window.history.pushState({}, "", "/patients/new");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = (report) => {
    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Popup blocked! Please allow popups for printing reports.");
      return;
    }

    const testRows = (report.tests || []).map((t, idx) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #ddd;">${idx + 1}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #ddd; font-weight: 600;">${t.testName || t.name || "-"}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #ddd; font-weight: 700; color: #5b0a1a;">${t.result || t.value || "Pending"}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #ddd;">${t.unit || "-"}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #ddd; color: #666;">${t.referenceRange || t.normalRange || "-"}</td>
      </tr>
    `).join("");

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Report - ${report.reportId} - ${report.patientName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 30px; color: #222; margin: 0; }
            .header { text-align: center; border-bottom: 2px solid #5b0a1a; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #5b0a1a; font-size: 24px; }
            .header p { margin: 4px 0 0; color: #666; font-size: 13px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 25px; background: #faf5f6; padding: 15px; border-radius: 6px; }
            .info-item { font-size: 13px; }
            .info-item strong { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #5b0a1a; color: white; padding: 10px 12px; text-align: left; font-size: 13px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; }
            .signature { border-top: 1px dashed #777; padding-top: 5px; text-align: center; min-width: 160px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TAZ DIAGNOSTIC LABORATORY</h1>
            <p>Clinical Pathology & Diagnostic Centre | ISO 9001:2015 Certified</p>
            <p style="font-weight: 600; color: #5b0a1a; margin-top: 6px;">PATIENT DIAGNOSTIC REPORT</p>
          </div>
          <div class="info-grid">
            <div class="info-item"><strong>Report ID:</strong> ${report.reportId || "-"}</div>
            <div class="info-item"><strong>Date:</strong> ${formatDate(report.date || report.createdAt)}</div>
            <div class="info-item"><strong>Patient ID:</strong> ${report.patientId || "-"}</div>
            <div class="info-item"><strong>Patient Name:</strong> ${report.patientName || "-"}</div>
            <div class="info-item"><strong>Referred By:</strong> ${report.doctorName || report.referredBy || "Self"}</div>
            <div class="info-item"><strong>Status:</strong> ${report.status || "Completed"}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Test Parameter</th>
                <th>Result Value</th>
                <th>Units</th>
                <th>Biological Ref Range</th>
              </tr>
            </thead>
            <tbody>
              ${testRows || '<tr><td colspan="5" style="text-align:center; padding: 20px;">No test items found</td></tr>'}
            </tbody>
          </table>
          <div class="footer">
            <div>
              <p style="color: #666; font-size: 11px;">Note: Results relate only to the specimen tested.</p>
            </div>
            <div class="signature">
              <strong>Authorized Pathologist</strong><br/>
              <span style="font-size: 11px; color: #666;">TAZ Diagnostic Center</span>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const selectedPatientReports = selected ? getPatientReports(selected) : [];

  return (
    <div className="page">
      <style>{`
        .page {
          padding: 28px;
          background: #f7f5f6;
          min-height: calc(100vh - 80px);
          color: #241d20;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .title h1 {
          margin: 0;
          font-size: 26px;
          color: #3a0610;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title p {
          margin: 6px 0 0;
          color: #6d6265;
          font-size: 14px;
        }

        .btn {
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #5b0a1a;
          color: white;
          box-shadow: 0 4px 12px rgba(91, 10, 26, 0.2);
        }

        .btn-primary:hover {
          background: #460613;
          transform: translateY(-1px);
        }

        .btn-light {
          background: white;
          color: #5b0a1a;
          border: 1px solid #e2d9dc;
        }

        .btn-light:hover {
          background: #fcf8f9;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
          border-radius: 6px;
        }

        .toolbar {
          background: white;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #eadfe2;
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .search {
          flex: 1;
          position: relative;
        }

        .search svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #8c7f83;
        }

        .search input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px 11px 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
        }

        .search input:focus {
          border-color: #8b1730;
        }

        .table-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #eadfe2;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #faf6f7;
          color: #5b0a1a;
          text-align: left;
          padding: 14px 16px;
          font-size: 13px;
          font-weight: 700;
          border-bottom: 1px solid #eadfe2;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 14px 16px;
          border-bottom: 1px solid #f0ebed;
          font-size: 14px;
          vertical-align: middle;
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:hover td {
          background: #fffdfd;
        }

        .patient-name {
          font-weight: 700;
          color: #3a0610;
        }

        .patient-id {
          font-size: 12px;
          color: #888;
          margin-top: 2px;
          font-family: monospace;
          background: #f8eef0;
          display: inline-block;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .badge-count {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          background: #f5e8eb;
          color: #5b0a1a;
        }

        .actions {
          display: flex;
          gap: 6px;
        }

        .icon-btn {
          width: 34px;
          height: 34px;
          border: 1px solid #e2d9dc;
          background: white;
          border-radius: 7px;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #5b0a1a;
          transition: all 0.15s ease;
        }

        .icon-btn:hover {
          background: #5b0a1a;
          color: white;
          border-color: #5b0a1a;
        }

        .icon-btn.btn-action-report {
          background: #f8eef0;
          color: #5b0a1a;
          border-color: #f1d7dc;
        }

        .icon-btn.btn-action-report:hover {
          background: #5b0a1a;
          color: white;
        }

        .empty {
          padding: 60px 20px;
          text-align: center;
          color: #888;
        }

        .empty svg {
          color: #b9959e;
          margin-bottom: 12px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(20, 5, 10, .6);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal {
          width: min(840px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 24px 70px rgba(0,0,0,.3);
        }

        .modal-header {
          padding: 18px 24px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #faf6f7;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }

        .modal-header h2 {
          margin: 0;
          color: #3a0610;
          font-size: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .close {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #777;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: 50%;
        }

        .close:hover {
          background: #f0e6e8;
          color: #3a0610;
        }

        .form {
          padding: 24px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          font-size: 13px;
          font-weight: 600;
          color: #444;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
        }

        .field textarea {
          min-height: 70px;
          resize: vertical;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: #8b1730;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fafafa;
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
        }

        .details-wrapper {
          padding: 24px;
        }

        .patient-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          background: linear-gradient(135deg, #5b0a1a, #851329);
          color: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .avatar-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: grid;
          place-items: center;
          font-size: 22px;
          font-weight: 800;
          border: 2px solid rgba(255,255,255,0.4);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .detail {
          background: #faf7f8;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid #f1e7e9;
        }

        .detail small {
          color: #887a7d;
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .detail strong {
          color: #3a0610;
          font-size: 14px;
        }

        /* History Section */
        .history-section {
          margin-top: 24px;
          border-top: 2px dashed #eadfe2;
          padding-top: 20px;
        }

        .history-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .history-section-header h3 {
          margin: 0;
          font-size: 17px;
          color: #3a0610;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .history-card {
          background: white;
          border: 1px solid #eadfe2;
          border-radius: 10px;
          padding: 16px;
          transition: all 0.2s ease;
          border-left: 4px solid #5b0a1a;
        }

        .history-card:hover {
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
          border-color: #5b0a1a;
        }

        .history-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .history-report-id {
          font-weight: 700;
          font-size: 15px;
          color: #3a0610;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .history-date {
          color: #777;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }

        .status-completed {
          background: #e6f7ec;
          color: #0d7a36;
        }

        .status-pending {
          background: #fff4e5;
          color: #b76e00;
        }

        .test-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 10px 0;
        }

        .test-tag {
          background: #f4eaed;
          color: #5b0a1a;
          padding: 3px 10px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
        }

        .history-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #f6eff1;
        }

        .no-history-box {
          text-align: center;
          padding: 30px;
          background: #faf6f7;
          border-radius: 10px;
          border: 1px dashed #dec9cf;
        }

        @media (max-width: 800px) {
          .page {
            padding: 16px;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .grid,
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .table-card {
            overflow-x: auto;
          }

          table {
            min-width: 850px;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header">
        <div className="title">
          <h1>
            <User size={28} color="#5b0a1a" />
            Patients & Medical Records
          </h1>
          <p>Search registered patients, review complete diagnostic test history, and print previous reports.</p>
        </div>

        <button className="btn btn-primary" onClick={goToEntry}>
          <Plus size={18} />
          New Patient Entry
        </button>
      </div>

      {/* Search & Actions Toolbar */}
      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient ID, name, phone, email, doctor..."
          />
        </div>

        <button className="btn btn-light" onClick={loadAllData} title="Reload records">
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Patient Table */}
      <div className="table-card">
        {filteredPatients.length === 0 ? (
          <div className="empty">
            <User size={48} />
            <h3>No Patients Found</h3>
            <p>No matching patient records found. Register a new patient to get started.</p>
            <button className="btn btn-primary" onClick={goToEntry}>
              <Plus size={17} />
              Register First Patient
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Age / Gender</th>
                <th>Phone Number</th>
                <th>Referred Doctor</th>
                <th>Tests Done</th>
                <th>Registered Date</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((patient) => {
                const pReports = getPatientReports(patient);
                return (
                  <tr key={patient.patientId}>
                    <td>
                      <div className="patient-name">{patient.name}</div>
                      <div className="patient-id">{patient.patientId}</div>
                    </td>

                    <td>
                      {patient.age ? `${patient.age} yrs` : "-"} / {patient.gender || "-"}
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Phone size={14} color="#888" />
                        {patient.phone || "-"}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Stethoscope size={14} color="#5b0a1a" />
                        {patient.referredBy || "Self"}
                      </div>
                    </td>

                    <td>
                      <span className="badge-count">
                        <FlaskConical size={13} />
                        {pReports.length} {pReports.length === 1 ? "Test" : "Tests"}
                      </span>
                    </td>

                    <td>{formatDate(patient.registeredAt)}</td>

                    <td>
                      <div className="actions" style={{ justifyContent: "center" }}>
                        <button
                          className="icon-btn"
                          title="View Patient & Test History"
                          onClick={() => viewPatient(patient)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="icon-btn btn-action-report"
                          title="Create Test / Report for this Patient"
                          onClick={() => createReportForPatient(patient)}
                        >
                          <FilePlus size={16} />
                        </button>

                        <button
                          className="icon-btn"
                          title="Edit Patient"
                          onClick={() => openEdit(patient)}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="icon-btn"
                          title="Delete Patient"
                          onClick={() => deletePatient(patient)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Patient Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="modal-overlay" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === "add" ? "Register New Patient" : "Edit Patient Profile"}</h2>
              <button className="close" onClick={() => setModal(null)}>
                <X size={20} />
              </button>
            </div>

            <form className="form" onSubmit={submit}>
              <div className="grid">
                <div className="field">
                  <label>Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter patient full name"
                    required
                  />
                </div>

                <div className="field">
                  <label>Age</label>
                  <input
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="e.g. 35"
                  />
                </div>

                <div className="field">
                  <label>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="field">
                  <label>Phone Number</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div className="field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="patient@example.com"
                  />
                </div>

                <div className="field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Referred Doctor</label>
                  <select
                    value={form.referredBy}
                    onChange={(e) => setForm({ ...form, referredBy: e.target.value })}
                  >
                    <option>Self</option>
                    <option>Dr. Ahmed Khan</option>
                    <option>Dr. Priya Sharma</option>
                    <option>Dr. Syed Rahman</option>
                  </select>
                </div>

                <div className="field full">
                  <label>Full Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Street, locality, city..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setModal(null)}>
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary">
                  {modal === "add" ? "Save Patient" : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Patient Details & Clinical Test History Modal */}
      {modal === "view" && selected && (
        <div className="modal-overlay" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <Activity size={22} color="#5b0a1a" />
                Patient Record & Test History
              </h2>
              <button className="close" onClick={() => setModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="details-wrapper">
              {/* Header profile card */}
              <div className="patient-card-header">
                <div className="avatar-circle">
                  {(selected.name || "P").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: "20px" }}>{selected.name}</h2>
                  <div style={{ fontSize: "13px", opacity: 0.9, marginTop: "4px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
                    <span>ID: <strong>{selected.patientId}</strong></span>
                    <span>Age/Gender: <strong>{selected.age ? `${selected.age} yrs` : "-"} / {selected.gender || "-"}</strong></span>
                    <span>Referred by: <strong>{selected.referredBy || "Self"}</strong></span>
                  </div>
                </div>
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => createReportForPatient(selected)}
                  style={{ background: "white", color: "#5b0a1a" }}
                >
                  <FilePlus size={15} />
                  New Test
                </button>
              </div>

              {/* Patient Basic Details Grid */}
              <div className="detail-grid">
                <div className="detail">
                  <small>Phone</small>
                  <strong>{selected.phone || "-"}</strong>
                </div>

                <div className="detail">
                  <small>Email</small>
                  <strong>{selected.email || "-"}</strong>
                </div>

                <div className="detail">
                  <small>Registered On</small>
                  <strong>{formatDate(selected.registeredAt)}</strong>
                </div>

                <div className="detail" style={{ gridColumn: "1 / -1" }}>
                  <small>Address</small>
                  <strong>{selected.address || "No address provided"}</strong>
                </div>
              </div>

              {/* Complete Clinical Test History */}
              <div className="history-section">
                <div className="history-section-header">
                  <h3>
                    <FlaskConical size={19} color="#5b0a1a" />
                    Clinical Diagnostic Test History ({selectedPatientReports.length})
                  </h3>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => createReportForPatient(selected)}
                  >
                    <Plus size={14} />
                    Book New Test
                  </button>
                </div>

                {selectedPatientReports.length === 0 ? (
                  <div className="no-history-box">
                    <FlaskConical size={36} color="#c09fa6" style={{ marginBottom: "8px" }} />
                    <h4 style={{ margin: "0 0 6px", color: "#5b0a1a" }}>No Diagnostic Tests Yet</h4>
                    <p style={{ margin: "0 0 14px", color: "#777", fontSize: "13px" }}>
                      This patient has not undergone any laboratory tests yet.
                    </p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => createReportForPatient(selected)}
                    >
                      <FilePlus size={14} />
                      Generate First Report
                    </button>
                  </div>
                ) : (
                  <div className="history-list">
                    {selectedPatientReports.map((report) => (
                      <div className="history-card" key={report.reportId || report.id}>
                        <div className="history-top">
                          <div>
                            <div className="history-report-id">
                              <FileText size={16} color="#5b0a1a" />
                              Report #{report.reportId || report.id}
                              <span
                                className={`status-badge ${
                                  (report.status || "Completed").toLowerCase() === "completed"
                                    ? "status-completed"
                                    : "status-pending"
                                }`}
                              >
                                {(report.status || "Completed").toLowerCase() === "completed" ? (
                                  <CheckCircle2 size={12} />
                                ) : (
                                  <Clock size={12} />
                                )}
                                {report.status || "Completed"}
                              </span>
                            </div>

                            <div className="history-date">
                              <Calendar size={13} />
                              Visit Date: <strong>{formatDateTime(report.date || report.createdAt)}</strong>
                              <span style={{ margin: "0 4px" }}>•</span>
                              <span>Doctor: <strong>{report.doctorName || report.referredBy || "Self"}</strong></span>
                            </div>
                          </div>

                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => handlePrint(report)}
                            title="Print Laboratory Report"
                          >
                            <Printer size={14} />
                            Print Report
                          </button>
                        </div>

                        {/* List of tests in this visit */}
                        <div style={{ fontSize: "12px", color: "#555", fontWeight: 600, marginTop: "8px" }}>
                          Tests Performed ({Array.isArray(report.tests) ? report.tests.length : 1}):
                        </div>
                        <div className="test-tags">
                          {Array.isArray(report.tests) && report.tests.length > 0 ? (
                            report.tests.map((t, idx) => (
                              <span className="test-tag" key={idx}>
                                {t.testName || t.name || `Test #${idx + 1}`}
                                {t.result ? ` (${t.result} ${t.unit || ""})` : ""}
                              </span>
                            ))
                          ) : (
                            <span className="test-tag">Standard Diagnostic Profile</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-light" onClick={() => setModal(null)}>
                Close
              </button>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-light"
                  onClick={() => {
                    openEdit(selected);
                  }}
                >
                  <Edit size={16} />
                  Edit Profile
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => createReportForPatient(selected)}
                >
                  <FilePlus size={16} />
                  New Test Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}