import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  X,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const DOCTORS_KEY = "taz_company_doctors";

const DEFAULT_DOCTORS = [
  {
    id: "DOC001",
    name: "Dr. Ahmed Khan",
    specialization: "General Physician",
    phone: "9876543210",
    email: "",
    clinic: "TAZ Medical Center",
    address: "Main Branch",
    status: "Active",
  },
  {
    id: "DOC002",
    name: "Dr. Priya Sharma",
    specialization: "Internal Medicine",
    phone: "9876543211",
    email: "",
    clinic: "City Medical Center",
    address: "Branch 2",
    status: "Active",
  },
  {
    id: "DOC003",
    name: "Dr. Syed Rahman",
    specialization: "Cardiology",
    phone: "9876543212",
    email: "",
    clinic: "Heart Care Clinic",
    address: "Branch 3",
    status: "Active",
  },
  {
    id: "DOC004",
    name: "Dr. Fatima Begum",
    specialization: "Gynecology",
    phone: "9876543213",
    email: "",
    clinic: "Women Care Center",
    address: "Branch 4",
    status: "Active",
  },
];

function loadDoctors() {
  try {
    const saved = localStorage.getItem(DOCTORS_KEY);

    if (!saved) {
      localStorage.setItem(
        DOCTORS_KEY,
        JSON.stringify(DEFAULT_DOCTORS)
      );
      return DEFAULT_DOCTORS;
    }

    const data = JSON.parse(saved);

    if (!Array.isArray(data)) {
      localStorage.setItem(
        DOCTORS_KEY,
        JSON.stringify(DEFAULT_DOCTORS)
      );
      return DEFAULT_DOCTORS;
    }

    return data;
  } catch {
    return DEFAULT_DOCTORS;
  }
}

function generateDoctorId(doctors) {
  let max = 0;

  doctors.forEach((doctor) => {
    const number = parseInt(
      String(doctor.id || "").replace("DOC", ""),
      10
    );

    if (!Number.isNaN(number)) {
      max = Math.max(max, number);
    }
  });

  return `DOC${String(max + 1).padStart(3, "0")}`;
}

const EMPTY_FORM = {
  name: "",
  specialization: "",
  phone: "",
  email: "",
  clinic: "",
  address: "",
  status: "Active",
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modal, setModal] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setDoctors(loadDoctors());
  }, []);

  function saveDoctors(data) {
    setDoctors(data);
    localStorage.setItem(
      DOCTORS_KEY,
      JSON.stringify(data)
    );
  }

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const text =
        `${doctor.id} ${doctor.name} ${doctor.specialization} ${doctor.phone} ${doctor.clinic}`
          .toLowerCase();

      const matchesSearch = text.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        statusFilter === "All" ||
        doctor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [doctors, search, statusFilter]);

  function openAdd() {
    setForm(EMPTY_FORM);
    setModal("add");
  }

  function openEdit(doctor) {
    setForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
      clinic: doctor.clinic || "",
      address: doctor.address || "",
      status: doctor.status || "Active",
    });

    setSelectedDoctor(doctor);
    setModal("edit");
  }

  function openView(doctor) {
    setSelectedDoctor(doctor);
    setModal("view");
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Doctor name is required.");
      return;
    }

    if (!form.specialization.trim()) {
      alert("Specialization is required.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Phone number is required.");
      return;
    }

    if (modal === "add") {
      const newDoctor = {
        id: generateDoctorId(doctors),
        ...form,
        name: form.name.trim(),
        specialization: form.specialization.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        clinic: form.clinic.trim(),
        address: form.address.trim(),
      };

      saveDoctors([
        ...doctors,
        newDoctor,
      ]);
    }

    if (modal === "edit") {
      const updated = doctors.map((doctor) =>
        doctor.id === selectedDoctor.id
          ? {
              ...doctor,
              ...form,
              name: form.name.trim(),
              specialization:
                form.specialization.trim(),
              phone: form.phone.trim(),
              email: form.email.trim(),
              clinic: form.clinic.trim(),
              address: form.address.trim(),
            }
          : doctor
      );

      saveDoctors(updated);
    }

    setModal(null);
    setSelectedDoctor(null);
    setForm(EMPTY_FORM);
  }

  function deleteDoctor(doctor) {
    const confirmed = window.confirm(
      `Delete ${doctor.name}?`
    );

    if (!confirmed) return;

    saveDoctors(
      doctors.filter(
        (item) => item.id !== doctor.id
      )
    );
  }

  function refresh() {
    setDoctors(loadDoctors());
  }

  return (
    <div className="taz-page">

      <div className="taz-page-header">
        <div>
          <div className="taz-page-title-row">
            <div className="taz-page-icon">
              <Stethoscope size={20} />
            </div>

            <div>
              <h1>Doctors / Referral</h1>
              <p>
                Manage doctors and referral information.
              </p>
            </div>
          </div>
        </div>

        <div className="taz-header-actions">
          <button
            className="taz-secondary-btn"
            onClick={refresh}
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            className="taz-primary-btn"
            onClick={openAdd}
          >
            <Plus size={15} />
            Add Doctor
          </button>
        </div>
      </div>

      <div className="taz-toolbar">
        <div className="taz-search-box">
          <Search size={16} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search doctor by name, ID, specialization or phone"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="taz-select"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="taz-table-card">

        <div className="taz-table-head">
          <span>Doctor</span>
          <span>Specialization</span>
          <span>Phone</span>
          <span>Clinic</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="taz-empty">
            No doctors found.
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <div
              className="taz-table-row"
              key={doctor.id}
            >
              <div className="taz-doctor-cell">
                <div className="taz-avatar">
                  {doctor.name
                    .replace("Dr. ", "")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {doctor.name}
                  </strong>

                  <small>
                    {doctor.id}
                  </small>
                </div>
              </div>

              <span>
                {doctor.specialization}
              </span>

              <span>
                {doctor.phone}
              </span>

              <span>
                {doctor.clinic || "-"}
              </span>

              <span>
                <span
                  className={
                    doctor.status === "Active"
                      ? "taz-status active"
                      : "taz-status inactive"
                  }
                >
                  {doctor.status === "Active" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}
                  {doctor.status}
                </span>
              </span>

              <div className="taz-action-buttons">

                <button
                  onClick={() =>
                    openView(doctor)
                  }
                  title="View"
                >
                  <Eye size={14} />
                </button>

                <button
                  onClick={() =>
                    openEdit(doctor)
                  }
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>

                <button
                  className="danger"
                  onClick={() =>
                    deleteDoctor(doctor)
                  }
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>

              </div>
            </div>
          ))
        )}

      </div>

      {(modal === "add" ||
        modal === "edit") && (
        <div
          className="taz-modal-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              setModal(null);
            }
          }}
        >
          <div className="taz-modal">

            <div className="taz-modal-header">
              <div>
                <h2>
                  {modal === "add"
                    ? "Add Doctor"
                    : "Edit Doctor"}
                </h2>

                <p>
                  Email is optional.
                </p>
              </div>

              <button
                onClick={() =>
                  setModal(null)
                }
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="taz-form"
              onSubmit={handleSubmit}
            >

              <div className="taz-form-grid">

                <div className="taz-field">
                  <label>
                    Doctor Name *
                  </label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter doctor name"
                  />
                </div>

                <div className="taz-field">
                  <label>
                    Specialization *
                  </label>

                  <input
                    value={
                      form.specialization
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        specialization:
                          e.target.value,
                      })
                    }
                    placeholder="e.g. Cardiologist"
                  />
                </div>

                <div className="taz-field">
                  <label>
                    Phone *
                  </label>

                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone:
                          e.target.value.replace(
                            /\D/g,
                            ""
                          ),
                      })
                    }
                    maxLength={15}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="taz-field">
                  <label>
                    Email
                    <span>
                      Optional
                    </span>
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email:
                          e.target.value,
                      })
                    }
                    placeholder="Enter email (optional)"
                  />
                </div>

                <div className="taz-field">
                  <label>
                    Clinic / Hospital
                  </label>

                  <input
                    value={form.clinic}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        clinic:
                          e.target.value,
                      })
                    }
                    placeholder="Clinic or hospital"
                  />
                </div>

                <div className="taz-field">
                  <label>
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target.value,
                      })
                    }
                  >
                    <option>
                      Active
                    </option>
                    <option>
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="taz-field full">
                  <label>
                    Address
                  </label>

                  <textarea
                    value={form.address}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address:
                          e.target.value,
                      })
                    }
                    placeholder="Enter address"
                    rows="3"
                  />
                </div>

              </div>

              <div className="taz-modal-footer">

                <button
                  type="button"
                  className="taz-secondary-btn"
                  onClick={() =>
                    setModal(null)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="taz-primary-btn"
                >
                  {modal === "add"
                    ? "Save Doctor"
                    : "Update Doctor"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {modal === "view" &&
        selectedDoctor && (
          <div
            className="taz-modal-overlay"
            onMouseDown={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setModal(null);
              }
            }}
          >
            <div className="taz-modal">

              <div className="taz-modal-header">
                <div>
                  <h2>
                    Doctor Details
                  </h2>

                  <p>
                    {selectedDoctor.id}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setModal(null)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <div className="taz-details">

                <div className="taz-detail-card">
                  <Stethoscope size={17} />
                  <div>
                    <small>
                      Doctor
                    </small>
                    <strong>
                      {selectedDoctor.name}
                    </strong>
                  </div>
                </div>

                <div className="taz-detail-card">
                  <Building2 size={17} />
                  <div>
                    <small>
                      Specialization
                    </small>
                    <strong>
                      {
                        selectedDoctor.specialization
                      }
                    </strong>
                  </div>
                </div>

                <div className="taz-detail-card">
                  <Phone size={17} />
                  <div>
                    <small>
                      Phone
                    </small>
                    <strong>
                      {selectedDoctor.phone}
                    </strong>
                  </div>
                </div>

                <div className="taz-detail-card">
                  <Mail size={17} />
                  <div>
                    <small>
                      Email
                    </small>
                    <strong>
                      {selectedDoctor.email ||
                        "Not provided"}
                    </strong>
                  </div>
                </div>

                <div className="taz-detail-card">
                  <Building2 size={17} />
                  <div>
                    <small>
                      Clinic / Hospital
                    </small>
                    <strong>
                      {selectedDoctor.clinic ||
                        "-"}
                    </strong>
                  </div>
                </div>

                <div className="taz-detail-card">
                  <MapPin size={17} />
                  <div>
                    <small>
                      Address
                    </small>
                    <strong>
                      {selectedDoctor.address ||
                        "-"}
                    </strong>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      <style>{`
        .taz-page {
          width: 100%;
        }

        .taz-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .taz-page-title-row {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .taz-page-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #f8e9ed;
          color: #5b0a1a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .taz-page h1 {
          margin: 0;
          color: #3a0610;
          font-size: 19px;
          font-weight: 900;
        }

        .taz-page-header p {
          margin: 4px 0 0;
          color: #999;
          font-size: 9px;
        }

        .taz-header-actions {
          display: flex;
          gap: 7px;
        }

        .taz-primary-btn,
        .taz-secondary-btn {
          height: 37px;
          padding: 0 13px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
        }

        .taz-primary-btn {
          border: 1px solid #5b0a1a;
          background: #5b0a1a;
          color: white;
        }

        .taz-primary-btn:hover {
          background: #3a0610;
        }

        .taz-secondary-btn {
          border: 1px solid #ddd4d7;
          background: white;
          color: #5b0a1a;
        }

        .taz-toolbar {
          display: flex;
          gap: 9px;
          margin-bottom: 12px;
        }

        .taz-search-box {
          flex: 1;
          height: 40px;
          background: white;
          border: 1px solid #ddd4d7;
          border-radius: 7px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          color: #999;
        }

        .taz-search-box input {
          border: 0;
          outline: 0;
          flex: 1;
          font-size: 9px;
          color: #333;
        }

        .taz-select {
          height: 40px;
          min-width: 130px;
          padding: 0 10px;
          border: 1px solid #ddd4d7;
          border-radius: 7px;
          background: white;
          color: #555;
          font-size: 9px;
          outline: 0;
        }

        .taz-table-card {
          background: white;
          border: 1px solid #eee4e6;
          border-radius: 10px;
          overflow: hidden;
        }

        .taz-table-head,
        .taz-table-row {
          display: grid;
          grid-template-columns:
            1.7fr 1.2fr 1fr 1.2fr 1fr .9fr;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
        }

        .taz-table-head {
          background: #faf7f8;
          border-bottom: 1px solid #eee4e6;
          color: #888;
          font-size: 8px;
          font-weight: 850;
          text-transform: uppercase;
        }

        .taz-table-row {
          min-height: 64px;
          border-bottom: 1px solid #f0e9eb;
          color: #555;
          font-size: 9px;
        }

        .taz-table-row:last-child {
          border-bottom: 0;
        }

        .taz-doctor-cell {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .taz-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #f7e8ec;
          color: #5b0a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
        }

        .taz-doctor-cell strong {
          display: block;
          color: #3a0610;
          font-size: 9px;
        }

        .taz-doctor-cell small {
          display: block;
          margin-top: 3px;
          color: #999;
          font-size: 7px;
        }

        .taz-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 7px;
          border-radius: 20px;
          font-size: 7px;
          font-weight: 800;
        }

        .taz-status.active {
          background: #eaf8ef;
          color: #20733b;
        }

        .taz-status.inactive {
          background: #f9e9eb;
          color: #a3293d;
        }

        .taz-action-buttons {
          display: flex;
          gap: 4px;
        }

        .taz-action-buttons button {
          width: 28px;
          height: 28px;
          border: 1px solid #e3dadd;
          border-radius: 6px;
          background: white;
          color: #5b0a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .taz-action-buttons button:hover {
          background: #f8e9ed;
        }

        .taz-action-buttons button.danger {
          color: #b02036;
        }

        .taz-empty {
          padding: 55px;
          text-align: center;
          color: #aaa;
          font-size: 10px;
        }

        .taz-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          background: rgba(28, 5, 10, .42);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .taz-modal {
          width: min(650px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 25px 80px rgba(0,0,0,.2);
        }

        .taz-modal-header {
          padding: 17px 20px;
          border-bottom: 1px solid #eee4e6;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .taz-modal-header h2 {
          margin: 0;
          color: #3a0610;
          font-size: 15px;
        }

        .taz-modal-header p {
          margin: 4px 0 0;
          color: #999;
          font-size: 8px;
        }

        .taz-modal-header > button {
          width: 31px;
          height: 31px;
          border: 0;
          border-radius: 6px;
          background: #f7edef;
          color: #5b0a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .taz-form {
          padding: 20px;
        }

        .taz-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .taz-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .taz-field.full {
          grid-column: 1 / -1;
        }

        .taz-field label {
          color: #3a0610;
          font-size: 8px;
          font-weight: 800;
        }

        .taz-field label span {
          color: #999;
          margin-left: 5px;
          font-weight: 500;
        }

        .taz-field input,
        .taz-field select,
        .taz-field textarea {
          width: 100%;
          border: 1px solid #ddd4d7;
          border-radius: 7px;
          outline: 0;
          padding: 0 10px;
          height: 39px;
          color: #444;
          font-size: 9px;
          background: white;
        }

        .taz-field textarea {
          height: auto;
          padding: 10px;
          resize: vertical;
        }

        .taz-field input:focus,
        .taz-field select:focus,
        .taz-field textarea:focus {
          border-color: #8b1730;
          box-shadow: 0 0 0 3px rgba(139,23,48,.06);
        }

        .taz-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #eee4e6;
        }

        .taz-details {
          padding: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .taz-detail-card {
          padding: 13px;
          border: 1px solid #eee4e6;
          border-radius: 8px;
          display: flex;
          gap: 9px;
          color: #5b0a1a;
        }

        .taz-detail-card small,
        .taz-detail-card strong {
          display: block;
        }

        .taz-detail-card small {
          color: #999;
          font-size: 7px;
        }

        .taz-detail-card strong {
          margin-top: 4px;
          color: #3a0610;
          font-size: 9px;
        }

        @media(max-width:800px) {
          .taz-table-card {
            overflow-x: auto;
          }

          .taz-table-head,
          .taz-table-row {
            min-width: 800px;
          }
        }

        @media(max-width:600px) {
          .taz-page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .taz-header-actions {
            width: 100%;
          }

          .taz-header-actions button {
            flex: 1;
          }

          .taz-toolbar {
            flex-direction: column;
          }

          .taz-form-grid,
          .taz-details {
            grid-template-columns: 1fr;
          }

          .taz-field.full {
            grid-column: auto;
          }
        }
      `}</style>
    </div>
  );
}