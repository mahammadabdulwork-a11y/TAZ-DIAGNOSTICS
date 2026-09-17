import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  X,
} from "lucide-react";

const KEY = "taz_company_reports";

function readReports() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function nextId(items) {
  let max = 0;

  items.forEach((x) => {
    const n = Number(String(x.id || "").replace(/\D/g, ""));
    if (n > max) max = n;
  });

  return `REP${String(max + 1).padStart(4, "0")}`;
}

export default function Reports() {
  const [reports, setReports] = useState(readReports);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tests, setTests] = useState([]);

  const blank = {
    patientId: "",
    patientName: "",
    doctorId: "",
    doctorName: "",
    testId: "",
    testName: "",
    result: "",
    unit: "",
    referenceRange: "",
    date: new Date().toISOString().slice(0, 10),
    status: "Pending",
    priority: "Normal",
    technician: "",
    remarks: "",
  };

  const [form, setForm] = useState(blank);

  const refresh = () => {
    setReports(readReports());

    try {
      setPatients(
        JSON.parse(
          localStorage.getItem("taz_company_patients") || "[]"
        )
      );

      setDoctors(
        JSON.parse(
          localStorage.getItem("taz_company_doctors") || "[]"
        )
      );

      setTests(
        JSON.parse(
          localStorage.getItem("taz_company_test_master") || "[]"
        )
      );
    } catch {}
  };

  useEffect(() => {
    refresh();

    const handler = () => refresh();

    window.addEventListener("storage", handler);
    window.addEventListener("focus", handler);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("focus", handler);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return reports.filter((r) => {
      const matchesSearch =
        !q ||
        [
          r.id,
          r.patientId,
          r.patientName,
          r.doctorName,
          r.testName,
          r.technician,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        status === "All" || r.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, status]);

  const openNew = () => {
    setForm(blank);
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({ ...blank, ...r });
    setShowForm(true);
  };

  const patientChange = (id) => {
    const p = patients.find(
      (x) => (x.id || x.patientId) === id
    );

    setForm({
      ...form,
      patientId: id,
      patientName: p?.name || p?.patientName || "",
    });
  };

  const doctorChange = (id) => {
    if (id === "SELF") {
      setForm({
        ...form,
        doctorId: "SELF",
        doctorName: "Self",
      });
      return;
    }

    const d = doctors.find(
      (x) => (x.id || x.doctorId) === id
    );

    setForm({
      ...form,
      doctorId: id,
      doctorName: d?.name || d?.doctorName || "",
    });
  };

  const testChange = (id) => {
    const t = tests.find(
      (x) => (x.id || x.testId) === id
    );

    setForm({
      ...form,
      testId: id,
      testName: t?.name || t?.testName || "",
      unit: t?.unit || "",
      referenceRange:
        t?.referenceRange || t?.reference || "",
    });
  };

  const save = () => {
    if (!form.patientId || !form.testId) {
      alert("Please select patient and test.");
      return;
    }

    let updated;

    if (form.id) {
      updated = reports.map((r) =>
        r.id === form.id ? { ...form } : r
      );
    } else {
      updated = [
        {
          ...form,
          id: nextId(reports),
          createdAt: new Date().toISOString(),
        },
        ...reports,
      ];
    }

    setReports(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setShowForm(false);
    setForm(blank);
  };

  const remove = (r) => {
    if (!window.confirm(`Delete report ${r.id}?`)) return;

    const updated = reports.filter((x) => x.id !== r.id);

    setReports(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  };

  const complete = (r) => {
    const updated = reports.map((x) =>
      x.id === r.id ? { ...x, status: "Completed" } : x
    );

    setReports(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  };

  const printReport = (r) => {
    const doctor =
      r.doctorName && r.doctorName !== "Self"
        ? r.doctorName
        : "";

    const doctorSignature = doctor
      ? `
        <div class="signature">
          <b>${doctor}</b>
          <span>Referring Doctor</span>
        </div>
      `
      : "";

    const html = `
      <html>
      <head>
        <title>${r.id}</title>
        <style>
          body {
            font-family: Arial;
            padding: 40px;
            color: #222;
          }
          .head {
            text-align:center;
            border-bottom:2px solid #700b22;
            padding-bottom:15px;
          }
          h1 { color:#700b22; }
          table {
            width:100%;
            border-collapse:collapse;
            margin-top:30px;
          }
          th,td {
            border:1px solid #ccc;
            padding:12px;
            text-align:left;
          }
          th {
            background:#f4e8eb;
          }
          .signatures {
            display:flex;
            justify-content:space-between;
            margin-top:100px;
          }
          .signature {
            width:220px;
            border-top:1px solid #333;
            padding-top:8px;
            text-align:center;
          }
          .signature span {
            display:block;
            font-size:12px;
            color:#777;
          }
        </style>
      </head>
      <body>
        <div class="head">
          <h1>TAZ DIAGNOSTIC</h1>
          <p>Laboratory Diagnostic Report</p>
        </div>

        <p><b>Report ID:</b> ${r.id}</p>
        <p><b>Patient ID:</b> ${r.patientId}</p>
        <p><b>Patient Name:</b> ${r.patientName}</p>
        <p><b>Date:</b> ${r.date}</p>
        <p><b>Status:</b> ${r.status}</p>

        <table>
          <tr>
            <th>Test</th>
            <th>Result</th>
            <th>Unit</th>
            <th>Reference Range</th>
          </tr>
          <tr>
            <td>${r.testName}</td>
            <td>${r.result || "-"}</td>
            <td>${r.unit || "-"}</td>
            <td>${r.referenceRange || "-"}</td>
          </tr>
        </table>

        <p><b>Remarks:</b> ${r.remarks || "-"}</p>

        <div class="signatures">
          ${doctorSignature}
          <div class="signature">
            <b>${r.technician || "Laboratory Technician"}</b>
            <span>Laboratory Technician</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const w = window.open("", "_blank");

    if (!w) return;

    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const downloadReport = (r) => {
    const text = `
TAZ DIAGNOSTIC
Laboratory Diagnostic Report

Report ID: ${r.id}
Patient ID: ${r.patientId}
Patient Name: ${r.patientName}
Date: ${r.date}
Status: ${r.status}

Test: ${r.testName}
Result: ${r.result || "-"}
Unit: ${r.unit || "-"}
Reference Range: ${r.referenceRange || "-"}

Doctor: ${r.doctorName || "Self"}
Technician: ${r.technician || "-"}
Remarks: ${r.remarks || "-"}
`;

    const blob = new Blob([text], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.id}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const shareReport = async (r) => {
    const text = `TAZ DIAGNOSTIC Report ${r.id}
Patient: ${r.patientName}
Test: ${r.testName}
Result: ${r.result || "-"}
Status: ${r.status}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `TAZ Diagnostic ${r.id}`,
          text,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert("Report information copied.");
    }
  };

  return (
    <div className="reports-page">
      <style>{`
        .reports-page {
          padding: 28px;
          background:#f8f5f6;
          min-height:calc(100vh - 72px);
        }

        .reports-head {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:20px;
        }

        .reports-title {
          display:flex;
          align-items:center;
          gap:14px;
        }

        .reports-icon {
          width:52px;
          height:52px;
          border-radius:14px;
          background:#f8e9ed;
          color:#710b22;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .reports-title h1 {
          margin:0;
          color:#4d0818;
          font-size:25px;
        }

        .reports-title p {
          margin:4px 0 0;
          color:#8c7d82;
          font-size:13px;
        }

        .report-actions {
          display:flex;
          gap:9px;
        }

        .report-btn {
          height:42px;
          padding:0 15px;
          border-radius:8px;
          border:1px solid #dfd2d6;
          background:white;
          color:#670b20;
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:7px;
          font-weight:700;
        }

        .report-btn.primary {
          color:white;
          background:#700b22;
          border-color:#700b22;
        }

        .report-stats {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:14px;
          margin-bottom:16px;
        }

        .report-stat {
          background:white;
          border:1px solid #eadde1;
          border-radius:13px;
          padding:17px;
        }

        .report-stat span {
          color:#8d7d83;
          font-size:12px;
        }

        .report-stat strong {
          display:block;
          color:#4d0818;
          font-size:24px;
          margin-top:4px;
        }

        .report-toolbar {
          background:white;
          border:1px solid #eadde1;
          border-radius:13px;
          padding:13px;
          display:grid;
          grid-template-columns:1fr 160px;
          gap:10px;
          margin-bottom:15px;
        }

        .report-search {
          display:flex;
          align-items:center;
          gap:8px;
          border:1px solid #ddd0d5;
          border-radius:8px;
          padding:0 12px;
        }

        .report-search input {
          width:100%;
          height:42px;
          border:none;
          outline:none;
        }

        .report-toolbar select {
          border:1px solid #ddd0d5;
          border-radius:8px;
          padding:0 10px;
          background:white;
        }

        .report-table-card {
          background:white;
          border:1px solid #eadde1;
          border-radius:13px;
          overflow:hidden;
        }

        .report-table {
          width:100%;
          border-collapse:collapse;
        }

        .report-table th {
          background:#fbf8f9;
          color:#74666c;
          font-size:11px;
          padding:13px;
          text-align:left;
        }

        .report-table td {
          padding:14px 13px;
          border-top:1px solid #eee5e8;
          font-size:13px;
        }

        .report-id {
          color:#650a20;
          font-weight:800;
        }

        .report-name {
          font-weight:800;
          color:#520819;
        }

        .sub {
          color:#96878c;
          font-size:11px;
          margin-top:3px;
        }

        .badge {
          display:inline-flex;
          padding:5px 9px;
          border-radius:20px;
          font-size:10px;
          font-weight:800;
          background:#f7e7eb;
          color:#700b22;
        }

        .badge.completed {
          background:#e6f6eb;
          color:#23723e;
        }

        .badge.urgent {
          background:#fff0e5;
          color:#aa4a08;
        }

        .r-action {
          width:33px;
          height:33px;
          border:1px solid #e0d4d8;
          background:white;
          color:#6b0b21;
          border-radius:7px;
          cursor:pointer;
          margin-right:4px;
        }

        .empty-reports {
          text-align:center;
          padding:80px 20px;
          color:#93848a;
        }

        .empty-reports svg {
          color:#760d24;
        }

        .modal-bg {
          position:fixed;
          inset:0;
          background:rgba(30,0,8,.48);
          display:flex;
          justify-content:center;
          align-items:center;
          z-index:1000;
          padding:20px;
        }

        .report-modal {
          width:min(760px,100%);
          max-height:90vh;
          overflow:auto;
          background:white;
          border-radius:16px;
        }

        .modal-head {
          padding:18px 20px;
          border-bottom:1px solid #eee4e7;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .modal-head h2 {
          margin:0;
          color:#520819;
        }

        .close {
          width:34px;
          height:34px;
          border:none;
          background:#f8e9ed;
          color:#700b22;
          border-radius:7px;
          cursor:pointer;
        }

        .form-grid {
          padding:20px;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
        }

        .field.full {
          grid-column:1/-1;
        }

        .field label {
          display:block;
          font-size:12px;
          font-weight:700;
          color:#5d5156;
          margin-bottom:6px;
        }

        .field input,
        .field select,
        .field textarea {
          width:100%;
          box-sizing:border-box;
          border:1px solid #ddd0d5;
          border-radius:8px;
          padding:10px;
          outline:none;
          font-family:inherit;
        }

        .field textarea {
          min-height:85px;
          resize:vertical;
        }

        .modal-footer {
          border-top:1px solid #eee4e7;
          padding:15px 20px;
          display:flex;
          justify-content:flex-end;
          gap:10px;
        }

        .view-grid {
          padding:20px;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:12px;
        }

        .view-item {
          border:1px solid #eee2e5;
          border-radius:8px;
          padding:13px;
        }

        .view-item label {
          display:block;
          color:#93848a;
          font-size:11px;
          margin-bottom:5px;
        }

        .view-item strong {
          color:#520819;
        }

        @media(max-width:900px) {
          .report-stats {
            grid-template-columns:1fr 1fr;
          }

          .report-table-card {
            overflow-x:auto;
          }

          .report-table {
            min-width:1000px;
          }
        }

        @media(max-width:650px) {
          .reports-page {
            padding:15px;
          }

          .reports-head {
            flex-direction:column;
            align-items:flex-start;
            gap:15px;
          }

          .report-toolbar,
          .form-grid,
          .view-grid {
            grid-template-columns:1fr;
          }

          .field.full {
            grid-column:auto;
          }
        }
      `}</style>

      <div className="reports-head">
        <div className="reports-title">
          <div className="reports-icon">
            <FileText size={27} />
          </div>

          <div>
            <h1>Reports</h1>
            <p>Laboratory report history and report management</p>
          </div>
        </div>

        <div className="report-actions">
          <button className="report-btn" onClick={refresh}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button className="report-btn primary" onClick={openNew}>
            <Plus size={16} />
            New Report
          </button>
        </div>
      </div>

      <div className="report-stats">
        <div className="report-stat">
          <span>Total Reports</span>
          <strong>{reports.length}</strong>
        </div>

        <div className="report-stat">
          <span>Completed</span>
          <strong>
            {reports.filter((r) => r.status === "Completed").length}
          </strong>
        </div>

        <div className="report-stat">
          <span>Pending</span>
          <strong>
            {reports.filter((r) => r.status === "Pending").length}
          </strong>
        </div>

        <div className="report-stat">
          <span>Urgent</span>
          <strong>
            {reports.filter((r) => r.priority === "Urgent").length}
          </strong>
        </div>
      </div>

      <div className="report-toolbar">
        <div className="report-search">
          <Search size={18} color="#8c7d82" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report, patient, doctor or test..."
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          <option>Pending</option>
          <option>Completed</option>
        </select>
      </div>

      <div className="report-table-card">
        {filtered.length === 0 ? (
          <div className="empty-reports">
            <FileText size={50} />
            <h3>No report history available</h3>
            <p>
              Create a laboratory report and it will automatically appear
              here.
            </p>

            <button
              className="report-btn primary"
              onClick={openNew}
              style={{ margin: "15px auto" }}
            >
              <Plus size={16} />
              Create First Report
            </button>
          </div>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>REPORT</th>
                <th>PATIENT</th>
                <th>TEST</th>
                <th>DOCTOR</th>
                <th>RESULT</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="report-id">{r.id}</div>
                  </td>

                  <td>
                    <div className="report-name">
                      {r.patientName || "-"}
                    </div>
                    <div className="sub">{r.patientId}</div>
                  </td>

                  <td>
                    <div className="report-name">
                      {r.testName || "-"}
                    </div>
                    <div className="sub">{r.testId}</div>
                  </td>

                  <td>{r.doctorName || "Self"}</td>

                  <td>
                    <b>{r.result || "-"}</b>{" "}
                    <span className="sub">{r.unit}</span>
                  </td>

                  <td>{r.date || "-"}</td>

                  <td>
                    <span
                      className={`badge ${
                        r.status === "Completed"
                          ? "completed"
                          : ""
                      }`}
                    >
                      {r.status || "Pending"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="r-action"
                      title="View"
                      onClick={() => setSelected(r)}
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      className="r-action"
                      title="Edit"
                      onClick={() => openEdit(r)}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      className="r-action"
                      title="Print"
                      onClick={() => printReport(r)}
                    >
                      <Printer size={15} />
                    </button>

                    <button
                      className="r-action"
                      title="Download"
                      onClick={() => downloadReport(r)}
                    >
                      <Download size={15} />
                    </button>

                    <button
                      className="r-action"
                      title="Share"
                      onClick={() => shareReport(r)}
                    >
                      <Share2 size={15} />
                    </button>

                    {r.status !== "Completed" && (
                      <button
                        className="r-action"
                        title="Complete"
                        onClick={() => complete(r)}
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    )}

                    <button
                      className="r-action"
                      title="Delete"
                      onClick={() => remove(r)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-bg" onMouseDown={() => setShowForm(false)}>
          <div
            className="report-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>{form.id ? "Edit Report" : "New Report"}</h2>

              <button
                className="close"
                onClick={() => setShowForm(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Patient *</label>
                <select
                  value={form.patientId}
                  onChange={(e) =>
                    patientChange(e.target.value)
                  }
                >
                  <option value="">Select patient</option>

                  {patients.map((p) => {
                    const id = p.id || p.patientId;
                    const name = p.name || p.patientName || id;

                    return (
                      <option key={id} value={id}>
                        {id} - {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="field">
                <label>Doctor / Referral</label>
                <select
                  value={form.doctorId}
                  onChange={(e) =>
                    doctorChange(e.target.value)
                  }
                >
                  <option value="">Select referral</option>
                  <option value="SELF">Self</option>

                  {doctors.map((d) => {
                    const id = d.id || d.doctorId;
                    const name = d.name || d.doctorName || id;

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="field">
                <label>Test *</label>
                <select
                  value={form.testId}
                  onChange={(e) =>
                    testChange(e.target.value)
                  }
                >
                  <option value="">Select test</option>

                  {tests.map((t) => {
                    const id = t.id || t.testId;
                    const name = t.name || t.testName || id;

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="field">
                <label>Result</label>
                <input
                  value={form.result}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      result: e.target.value,
                    })
                  }
                  placeholder="Enter result"
                />
              </div>

              <div className="field">
                <label>Unit</label>
                <input
                  value={form.unit}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unit: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Reference Range</label>
                <input
                  value={form.referenceRange}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      referenceRange: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                >
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
              </div>

              <div className="field">
                <label>Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority: e.target.value,
                    })
                  }
                >
                  <option>Normal</option>
                  <option>Urgent</option>
                </select>
              </div>

              <div className="field">
                <label>Technician</label>
                <input
                  value={form.technician}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      technician: e.target.value,
                    })
                  }
                />
              </div>

              <div className="field full">
                <label>Remarks</label>
                <textarea
                  value={form.remarks}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      remarks: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="report-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                className="report-btn primary"
                onClick={save}
              >
                Save Report
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="modal-bg" onMouseDown={() => setSelected(null)}>
          <div
            className="report-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>Report Details</h2>

              <button
                className="close"
                onClick={() => setSelected(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="view-grid">
              <div className="view-item">
                <label>Report ID</label>
                <strong>{selected.id}</strong>
              </div>

              <div className="view-item">
                <label>Status</label>
                <strong>{selected.status}</strong>
              </div>

              <div className="view-item">
                <label>Patient</label>
                <strong>{selected.patientName}</strong>
              </div>

              <div className="view-item">
                <label>Patient ID</label>
                <strong>{selected.patientId}</strong>
              </div>

              <div className="view-item">
                <label>Test</label>
                <strong>{selected.testName}</strong>
              </div>

              <div className="view-item">
                <label>Result</label>
                <strong>
                  {selected.result || "-"} {selected.unit || ""}
                </strong>
              </div>

              <div className="view-item">
                <label>Reference Range</label>
                <strong>{selected.referenceRange || "-"}</strong>
              </div>

              <div className="view-item">
                <label>Doctor / Referral</label>
                <strong>{selected.doctorName || "Self"}</strong>
              </div>

              <div className="view-item">
                <label>Date</label>
                <strong>{selected.date}</strong>
              </div>

              <div className="view-item">
                <label>Technician</label>
                <strong>{selected.technician || "-"}</strong>
              </div>

              <div
                className="view-item"
                style={{ gridColumn: "1 / -1" }}
              >
                <label>Remarks</label>
                <strong>{selected.remarks || "-"}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}