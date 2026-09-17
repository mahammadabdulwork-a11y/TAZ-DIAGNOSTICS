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
} from "lucide-react";

const STORAGE_KEY = "taz_company_patients";

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
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPatients(JSON.parse(saved));
      } catch {
        setPatients([]);
      }
    }
  }, []);

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

    if (modal === "add") {
      const patient = {
        patientId: createPatientId(patients),
        ...form,
        registeredAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

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
        `Delete patient ${patient.name} (${patient.patientId})?`
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

  return (
    <div className="page">
      <style>{`
        .page {
          padding: 28px;
          background: #f7f5f6;
          min-height: calc(100vh - 80px);
          color: #241d20;
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
          font-size: 28px;
          color: #3a0610;
        }

        .title p {
          margin: 7px 0 0;
          color: #777;
        }

        .btn {
          border: none;
          border-radius: 8px;
          padding: 11px 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-primary {
          background: #5b0a1a;
          color: white;
        }

        .btn-light {
          background: white;
          color: #5b0a1a;
          border: 1px solid #ddd;
        }

        .toolbar {
          background: white;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #eadfe2;
          display: flex;
          gap: 12px;
          margin-bottom: 18px;
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
          color: #888;
        }

        .search input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 12px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          outline: none;
        }

        .search input:focus {
          border-color: #8b1730;
        }

        .table-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #eadfe2;
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #faf7f8;
          color: #5b0a1a;
          text-align: left;
          padding: 14px;
          font-size: 13px;
          border-bottom: 1px solid #eadfe2;
        }

        td {
          padding: 14px;
          border-bottom: 1px solid #f0ebed;
          font-size: 14px;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .patient-name {
          font-weight: 700;
          color: #3a0610;
        }

        .patient-id {
          font-size: 12px;
          color: #888;
          margin-top: 3px;
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
        }

        .icon-btn:hover {
          background: #f8eef1;
        }

        .empty {
          padding: 60px 20px;
          text-align: center;
          color: #888;
        }

        .empty svg {
          color: #b9959e;
          margin-bottom: 10px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(20, 5, 10, .55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 1000;
        }

        .modal {
          width: min(720px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,.25);
        }

        .modal-header {
          padding: 18px 22px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          color: #3a0610;
          font-size: 20px;
        }

        .close {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #666;
        }

        .form {
          padding: 22px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
        }

        .field textarea {
          min-height: 80px;
          resize: vertical;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: #8b1730;
        }

        .modal-footer {
          padding: 16px 22px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .details {
          padding: 22px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .detail {
          background: #faf7f8;
          padding: 14px;
          border-radius: 8px;
        }

        .detail small {
          color: #888;
          display: block;
          margin-bottom: 4px;
        }

        .detail strong {
          color: #3a0610;
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
            min-width: 900px;
          }
        }
      `}</style>

      <div className="page-header">
        <div className="title">
          <h1>Patients</h1>
          <p>Complete patient history and registration records</p>
        </div>

        <button className="btn btn-primary" onClick={goToEntry}>
          <Plus size={18} />
          New Patient
        </button>
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient ID, name, phone, email..."
          />
        </div>

        <button
          className="btn btn-light"
          onClick={() => {
            const saved = localStorage.getItem(STORAGE_KEY);
            setPatients(saved ? JSON.parse(saved) : []);
          }}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="table-card">
        {filteredPatients.length === 0 ? (
          <div className="empty">
            <User size={42} />
            <h3>No patient history available</h3>
            <p>Create a patient from Patient Entry and it will appear here.</p>
            <button className="btn btn-primary" onClick={goToEntry}>
              <Plus size={17} />
              Add First Patient
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age / Gender</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Referred By</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.patientId}>
                  <td>
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-id">{patient.patientId}</div>
                  </td>

                  <td>
                    {patient.age || "-"} / {patient.gender || "-"}
                  </td>

                  <td>{patient.phone || "-"}</td>
                  <td>{patient.email || "-"}</td>
                  <td>{patient.referredBy || "Self"}</td>
                  <td>{formatDate(patient.registeredAt)}</td>

                  <td>
                    <div className="actions">
                      <button
                        className="icon-btn"
                        title="View"
                        onClick={() => viewPatient(patient)}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() => openEdit(patient)}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className="icon-btn"
                        title="Delete"
                        onClick={() => deletePatient(patient)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modal === "add" || modal === "edit") && (
        <div className="modal-overlay" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === "add" ? "Add Patient" : "Edit Patient"}</h2>
              <button className="close" onClick={() => setModal(null)}>
                <X />
              </button>
            </div>

            <form className="form" onSubmit={submit}>
              <div className="grid">
                <div className="field">
                  <label>Patient Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>Age</label>
                  <input
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={(e) =>
                      setForm({ ...form, age: e.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label>Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                  >
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="field">
                  <label>Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) =>
                      setForm({ ...form, dateOfBirth: e.target.value })
                    }
                  />
                </div>

                <div className="field">
                  <label>Referred By</label>
                  <select
                    value={form.referredBy}
                    onChange={(e) =>
                      setForm({ ...form, referredBy: e.target.value })
                    }
                  >
                    <option>Self</option>
                    <option>Dr. Ahmed Khan</option>
                    <option>Dr. Priya Sharma</option>
                    <option>Dr. Syed Rahman</option>
                  </select>
                </div>

                <div className="field full">
                  <label>Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-primary">
                  {modal === "add" ? "Save Patient" : "Update Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "view" && selected && (
        <div className="modal-overlay" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Patient Details</h2>
              <button className="close" onClick={() => setModal(null)}>
                <X />
              </button>
            </div>

            <div className="details">
              <div className="detail-grid">
                <div className="detail">
                  <small>Patient ID</small>
                  <strong>{selected.patientId}</strong>
                </div>

                <div className="detail">
                  <small>Name</small>
                  <strong>{selected.name}</strong>
                </div>

                <div className="detail">
                  <small>Age</small>
                  <strong>{selected.age || "-"}</strong>
                </div>

                <div className="detail">
                  <small>Gender</small>
                  <strong>{selected.gender || "-"}</strong>
                </div>

                <div className="detail">
                  <small>Phone</small>
                  <strong>{selected.phone || "-"}</strong>
                </div>

                <div className="detail">
                  <small>Email</small>
                  <strong>{selected.email || "-"}</strong>
                </div>

                <div className="detail">
                  <small>Referred By</small>
                  <strong>{selected.referredBy || "Self"}</strong>
                </div>

                <div className="detail">
                  <small>Registered</small>
                  <strong>{formatDate(selected.registeredAt)}</strong>
                </div>

                <div className="detail" style={{ gridColumn: "1 / -1" }}>
                  <small>Address</small>
                  <strong>{selected.address || "-"}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-light" onClick={() => setModal(null)}>
                Close
              </button>

              <button
                className="btn btn-primary"
                onClick={() => openEdit(selected)}
              >
                <Edit size={16} />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}