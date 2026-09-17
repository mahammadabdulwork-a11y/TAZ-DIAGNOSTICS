import React, { useEffect, useMemo, useRef, useState } from "react";
import * as I from "lucide-react";
import "./styles.css";

/* =========================================================
   TAZ COMPANY - COMPLETE APP
   ========================================================= */

const STORAGE = {
  patients: "taz_company_patients",
  doctors: "taz_company_doctors",
  tests: "taz_company_tests",
  reports: "taz_company_reports",
  bills: "taz_company_bills",
  messages: "taz_company_messages",
  users: "taz_company_users",
  branches: "taz_company_branches",
  settings: "taz_company_settings",
  session: "taz_company_session",
};

const today = () => new Date().toISOString().slice(0, 10);

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const read = (key, fallback = []) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("taz-company-data"));
};

const nextId = (prefix, items) => {
  const numbers = items.map((item) => {
    const number = parseInt(
      String(item.id || "").replace(/\D/g, ""),
      10
    );
    return Number.isFinite(number) ? number : 0;
  });

  const next = Math.max(0, ...numbers) + 1;

  return `${prefix}${String(next).padStart(3, "0")}`;
};

/* =========================================================
   DEFAULT DATA
   ========================================================= */

const defaultDoctors = [
  {
    id: "DOC001",
    name: "Dr. Ahmed Khan",
    specialization: "General Physician",
    phone: "9876543210",
    email: "ahmed@example.com",
    clinic: "City Clinic",
    address: "Hyderabad",
    status: "Active",
  },
  {
    id: "DOC002",
    name: "Dr. Priya Sharma",
    specialization: "Cardiologist",
    phone: "9876543211",
    email: "priya@example.com",
    clinic: "Care Hospital",
    address: "Secunderabad",
    status: "Active",
  },
  {
    id: "DOC003",
    name: "Dr. Syed Rahman",
    specialization: "Internal Medicine",
    phone: "9876543212",
    email: "syed@example.com",
    clinic: "Health Centre",
    address: "Uppal",
    status: "Active",
  },
];

const defaultTests = [
  {
    id: "TST001",
    name: "Complete Blood Count",
    category: "Hematology",
    specimen: "Blood",
    unit: "cells/µL",
    reference: "4,000 - 11,000",
    price: 450,
    status: "Active",
  },
  {
    id: "TST002",
    name: "Hemoglobin",
    category: "Hematology",
    specimen: "Blood",
    unit: "g/dL",
    reference: "12 - 17",
    price: 180,
    status: "Active",
  },
  {
    id: "TST003",
    name: "Blood Glucose Fasting",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "mg/dL",
    reference: "70 - 99",
    price: 120,
    status: "Active",
  },
  {
    id: "TST004",
    name: "Lipid Profile",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "mg/dL",
    reference: "See report",
    price: 650,
    status: "Active",
  },
  {
    id: "TST005",
    name: "Thyroid Profile",
    category: "Hormones",
    specimen: "Blood",
    unit: "mIU/L",
    reference: "See report",
    price: 750,
    status: "Active",
  },
  {
    id: "TST006",
    name: "Liver Function Test",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "U/L",
    reference: "See report",
    price: 850,
    status: "Active",
  },
  {
    id: "TST007",
    name: "Kidney Function Test",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "mg/dL",
    reference: "See report",
    price: 800,
    status: "Active",
  },
  {
    id: "TST008",
    name: "Urine Routine",
    category: "Clinical Pathology",
    specimen: "Urine",
    unit: "-",
    reference: "Normal",
    price: 250,
    status: "Active",
  },
  {
    id: "TST009",
    name: "HbA1c",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "%",
    reference: "4.0 - 5.6",
    price: 550,
    status: "Active",
  },
  {
    id: "TST010",
    name: "Vitamin D",
    category: "Hormones",
    specimen: "Blood",
    unit: "ng/mL",
    reference: "30 - 100",
    price: 900,
    status: "Active",
  },
];

const defaultBranches = [
  {
    id: "BR001",
    name: "Main Branch",
    address: "Hyderabad",
    phone: "9000000001",
    status: "Active",
  },
  {
    id: "BR002",
    name: "North Branch",
    address: "Secunderabad",
    phone: "9000000002",
    status: "Active",
  },
  {
    id: "BR003",
    name: "East Branch",
    address: "Uppal",
    phone: "9000000003",
    status: "Active",
  },
  {
    id: "BR004",
    name: "West Branch",
    address: "Kukatpally",
    phone: "9000000004",
    status: "Active",
  },
];

const defaultUsers = [
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

const defaultPatients = [
  {
    id: "PAT001",
    name: "Mohammed Arif",
    age: "32",
    gender: "Male",
    phone: "9000011111",
    email: "arif@example.com",
    address: "Hyderabad",
    branch: "Main Branch",
    referral: "Dr. Ahmed Khan",
    date: today(),
    notes: "Routine checkup",
    selectedTests: [
      {
        id: "TST001",
        name: "Complete Blood Count",
        category: "Hematology",
        specimen: "Blood",
        unit: "cells/µL",
        reference: "4,000 - 11,000",
        price: 450,
      },
      {
        id: "TST003",
        name: "Blood Glucose Fasting",
        category: "Biochemistry",
        specimen: "Blood",
        unit: "mg/dL",
        reference: "70 - 99",
        price: 120,
      },
    ],
  },
  {
    id: "PAT002",
    name: "Ayesha Begum",
    age: "28",
    gender: "Female",
    phone: "9000022222",
    email: "ayesha@example.com",
    address: "Secunderabad",
    branch: "North Branch",
    referral: "Self",
    date: today(),
    notes: "",
    selectedTests: [],
  },
  {
    id: "PAT003",
    name: "Rahul Kumar",
    age: "45",
    gender: "Male",
    phone: "9000033333",
    email: "rahul@example.com",
    address: "Uppal",
    branch: "East Branch",
    referral: "Dr. Priya Sharma",
    date: today(),
    notes: "Follow-up",
    selectedTests: [],
  },
];

const defaultReports = [
  {
    id: "REP001",
    patientId: "PAT001",
    patientName: "Mohammed Arif",
    doctorId: "DOC001",
    doctorName: "Dr. Ahmed Khan",
    date: today(),
    time: "10:30",
    status: "Completed",
    priority: "Normal",
    remarks: "Values within reference range.",
    technician: "Lab Technician",
    testResults: [
      {
        id: "TST001",
        name: "Complete Blood Count",
        category: "Hematology",
        specimen: "Blood",
        unit: "cells/µL",
        reference: "4,000 - 11,000",
        result: "7800",
      },
      {
        id: "TST003",
        name: "Blood Glucose Fasting",
        category: "Biochemistry",
        specimen: "Blood",
        unit: "mg/dL",
        reference: "70 - 99",
        result: "92",
      },
    ],
  },
  {
    id: "REP002",
    patientId: "PAT002",
    patientName: "Ayesha Begum",
    doctorId: "SELF",
    doctorName: "Self",
    date: today(),
    time: "11:45",
    status: "Pending",
    priority: "Urgent",
    remarks: "Review pending.",
    technician: "Lab Technician",
    testResults: [
      {
        id: "TST004",
        name: "Lipid Profile",
        category: "Biochemistry",
        specimen: "Blood",
        unit: "mg/dL",
        reference: "See report",
        result: "",
      },
      {
        id: "TST005",
        name: "Thyroid Profile",
        category: "Hormones",
        specimen: "Blood",
        unit: "mIU/L",
        reference: "See report",
        result: "",
      },
    ],
  },
];

const defaultBills = [
  {
    id: "BILL001",
    patientId: "PAT001",
    patientName: "Mohammed Arif",
    phone: "9000011111",
    date: today(),
    items: [
      {
        name: "Complete Blood Count",
        qty: 1,
        price: 450,
      },
      {
        name: "Blood Glucose Fasting",
        qty: 1,
        price: 120,
      },
    ],
    discount: 0,
    paid: 570,
    method: "UPI",
    status: "Paid",
  },
  {
    id: "BILL002",
    patientId: "PAT002",
    patientName: "Ayesha Begum",
    phone: "9000022222",
    date: today(),
    items: [
      {
        name: "Lipid Profile",
        qty: 1,
        price: 650,
      },
      {
        name: "Thyroid Profile",
        qty: 1,
        price: 750,
      },
    ],
    discount: 100,
    paid: 500,
    method: "Cash",
    status: "Partial",
  },
];

const defaultMessages = [
  {
    id: "MSG001",
    patientId: "PAT001",
    patientName: "Mohammed Arif",
    type: "WhatsApp",
    status: "Sent",
    message: "Your laboratory report is ready.",
    date: today(),
    time: "12:15",
  },
  {
    id: "MSG002",
    patientId: "PAT002",
    patientName: "Ayesha Begum",
    type: "Email",
    status: "Pending",
    message: "Reminder: your report is under processing.",
    date: today(),
    time: "13:00",
  },
];

/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeData() {
  const defaults = {
    [STORAGE.doctors]: defaultDoctors,
    [STORAGE.tests]: defaultTests,
    [STORAGE.branches]: defaultBranches,
    [STORAGE.users]: defaultUsers,
    [STORAGE.patients]: defaultPatients,
    [STORAGE.reports]: defaultReports,
    [STORAGE.bills]: defaultBills,
    [STORAGE.messages]: defaultMessages,
  };

  Object.entries(defaults).forEach(([key, value]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });

  if (!localStorage.getItem(STORAGE.settings)) {
    localStorage.setItem(
      STORAGE.settings,
      JSON.stringify({
        labName: "TAZ COMPANY",
        reportName: "TAZ DIAGNOSTIC",
        phone: "9000000000",
        email: "info@tazcompany.com",
        address: "Hyderabad",
        technicianName: "Lab Technician",
        currency: "INR",
      })
    );
  }
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/* =========================================================
   UI COMPONENTS
   ========================================================= */

function Button({
  children,
  onClick,
  type = "button",
  primary = false,
  danger = false,
  icon: Icon,
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${
        primary ? "btn-primary" : ""
      } ${danger ? "btn-danger" : ""}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

function Page({
  title,
  subtitle,
  actions,
  children,
}) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {actions && (
          <div className="page-header-actions">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

function Toolbar({
  search,
  setSearch,
  placeholder = "Search...",
  children,
}) {
  return (
    <div className="toolbar">
      <div className="toolbar-search">
        <div className="search-bar">
          <I.Search size={17} />
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder={placeholder}
          />
        </div>
      </div>

      {children && (
        <div className="toolbar-actions">
          {children}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ value }) {
  const normalized = String(
    value || ""
  ).toLowerCase();

  let cls = "status-pending";

  if (
    ["active", "paid", "completed", "sent", "normal"].includes(
      normalized
    )
  ) {
    cls = "status-active";
  }

  if (
    ["inactive", "cancelled", "failed"].includes(
      normalized
    )
  ) {
    cls = "status-inactive";
  }

  if (
    ["urgent", "high", "abnormal"].includes(
      normalized
    )
  ) {
    cls = "status-high";
  }

  return (
    <span className={`status-badge ${cls}`}>
      {value}
    </span>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
}) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal"
        style={
          wide
            ? { maxWidth: "950px" }
            : undefined
        }
      >
        <div className="modal-header">
          <h2>{title}</h2>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <I.X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SEARCH SELECT
   ========================================================= */

function SearchSelect({
  label,
  value,
  onChange,
  options,
  multiple = false,
  placeholder = "Select...",
  self = false,
}) {
  const ref = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value;

  useEffect(() => {
    const handler = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handler
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handler
      );
    };
  }, []);

  const filtered = options.filter((item) =>
    `${item.label} ${item.meta || ""} ${item.value}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const choose = (itemValue) => {
    if (multiple) {
      const exists =
        selected.includes(itemValue);

      const next = exists
        ? selected.filter(
            (x) => x !== itemValue
          )
        : [...selected, itemValue];

      onChange(next);
      return;
    }

    onChange(itemValue);
    setOpen(false);
    setQuery("");
  };

  const selectedLabel = multiple
    ? selected.length
      ? `${selected.length} selected`
      : placeholder
    : options.find(
        (x) => x.value === value
      )?.label || placeholder;

  return (
    <div
      className="form-group"
      ref={ref}
      style={{ position: "relative" }}
    >
      <label>{label}</label>

      <button
        type="button"
        className="search-select"
        onClick={() =>
          setOpen((current) => !current)
        }
      >
        <span
          className={
            selectedLabel === placeholder
              ? "placeholder"
              : ""
          }
        >
          {selectedLabel}
        </span>

        <I.ChevronDown size={17} />
      </button>

      {open && (
        <div className="search-menu">
          <div className="search-menu-input">
            <I.Search size={15} />

            <input
              autoFocus
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search..."
              onClick={(e) =>
                e.stopPropagation()
              }
            />
          </div>

          {self && (
            <button
              type="button"
              className={`search-option ${
                value === "SELF"
                  ? "search-option-selected"
                  : ""
              }`}
              onClick={() =>
                choose("SELF")
              }
            >
              <div>
                <strong>Self</strong>
                <small>Walk-in / Self referral</small>
              </div>

              {value === "SELF" && (
                <I.Check size={16} />
              )}
            </button>
          )}

          {filtered.map((item) => {
            const isSelected =
              multiple
                ? selected.includes(
                    item.value
                  )
                : value === item.value;

            return (
              <button
                key={item.value}
                type="button"
                className={`search-option ${
                  isSelected
                    ? "search-option-selected"
                    : ""
                }`}
                onClick={() =>
                  choose(item.value)
                }
              >
                <div>
                  <strong>
                    {item.label}
                  </strong>

                  {item.meta && (
                    <small>
                      {item.meta}
                    </small>
                  )}
                </div>

                {isSelected && (
                  <I.Check size={16} />
                )}
              </button>
            );
          })}

          {!filtered.length && (
            <div className="search-empty">
              No matching records
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {
  const patients = read(
    STORAGE.patients
  );
  const reports = read(
    STORAGE.reports
  );
  const bills = read(
    STORAGE.bills
  );
  const tests = read(
    STORAGE.tests
  );

  const todayPatients =
    patients.filter(
      (x) => x.date === today()
    ).length;

  const todayTests =
    reports
      .filter(
        (x) => x.date === today()
      )
      .reduce(
        (sum, x) =>
          sum +
          (x.testResults?.length || 0),
        0
      );

  const pendingReports =
    reports.filter(
      (x) => x.status !== "Completed"
    ).length;

  const completedReports =
    reports.filter(
      (x) => x.status === "Completed"
    ).length;

  const revenue = bills
    .filter(
      (x) => x.date === today()
    )
    .reduce(
      (sum, x) =>
        sum + Number(x.paid || 0),
      0
    );

  const stats = [
    [
      "Today's Patients",
      todayPatients,
      I.Users,
      "Registered patients",
    ],
    [
      "Today's Tests",
      todayTests,
      I.TestTube2,
      `${tests.length} tests in Test Master`,
    ],
    [
      "Pending Reports",
      pendingReports,
      I.Clock3,
      "Require technician action",
    ],
    [
      "Completed Reports",
      completedReports,
      I.CheckCircle2,
      "Reports completed",
    ],
    [
      "Today's Revenue",
      money(revenue),
      I.IndianRupee,
      "Total collection",
    ],
  ];

  return (
    <Page
      title="Dashboard"
      subtitle="Here's what is happening across your laboratory today."
    >
      <div className="card" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <I.CalendarDays
            size={18}
            color="#5b0a1a"
          />

          <b>Today</b>

          <span>
            {new Date().toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }
            )}
          </span>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map(
          ([
            title,
            value,
            Icon,
            description,
          ]) => (
            <div
              className="stat-card"
              key={title}
            >
              <div className="stat-icon">
                <Icon size={21} />
              </div>

              <div>
                <small>{title}</small>
                <strong>{value}</strong>
                <small>
                  {description}
                </small>
              </div>
            </div>
          )
        )}
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-card">
          <div className="dashboard-card-header">
            <h2>Recent Reports</h2>

            <Button
              onClick={() =>
                navigate("/reports")
              }
            >
              View All
            </Button>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Patient</th>
                  <th>Tests</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {reports
                  .slice(0, 5)
                  .map((report) => (
                    <tr key={report.id}>
                      <td>
                        <span className="table-primary">
                          {report.id}
                        </span>
                      </td>

                      <td>
                        {report.patientName}
                      </td>

                      <td>
                        {report.testResults
                          ?.length || 0}
                      </td>

                      <td>
                        <StatusBadge
                          value={
                            report.status
                          }
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card dashboard-card">
          <div className="dashboard-card-header">
            <h2>Quick Actions</h2>
          </div>

          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            <Button
              primary
              icon={I.UserPlus}
              onClick={() =>
                navigate(
                  "/patients/new"
                )
              }
            >
              Register Patient
            </Button>

            <Button
              icon={I.FileText}
              onClick={() =>
                navigate("/reports")
              }
            >
              Enter Report
            </Button>

            <Button
              icon={I.TestTube2}
              onClick={() =>
                navigate(
                  "/test-master"
                )
              }
            >
              Manage Test Master
            </Button>

            <Button
              icon={I.CreditCard}
              onClick={() =>
                navigate("/billing")
              }
            >
              Create Bill
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}

/* =========================================================
   PATIENT ENTRY
   ========================================================= */

function PatientEntry() {
  const doctors = read(
    STORAGE.doctors
  );
  const branches = read(
    STORAGE.branches
  );
  const tests = read(
    STORAGE.tests
  ).filter(
    (x) => x.status === "Active"
  );

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    branch: "",
    referral: "",
    notes: "",
  });

  const [selectedTests, setSelectedTests] =
    useState([]);

  const [testSearch, setTestSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const filteredTests = tests.filter(
    (test) =>
      `${test.id} ${test.name} ${test.category}`
        .toLowerCase()
        .includes(
          testSearch.toLowerCase()
        )
  );

  const doctorOptions = doctors.map(
    (doctor) => ({
      value: doctor.name,
      label: doctor.name,
      meta: doctor.specialization,
    })
  );

  const branchOptions =
    branches.map((branch) => ({
      value: branch.name,
      label: branch.name,
      meta: branch.address,
    }));

  const total = selectedTests.reduce(
    (sum, test) =>
      sum + Number(test.price || 0),
    0
  );

  const toggleTest = (test) => {
    setSelectedTests((current) => {
      const exists = current.some(
        (x) => x.id === test.id
      );

      if (exists) {
        return current.filter(
          (x) => x.id !== test.id
        );
      }

      return [
        ...current,
        {
          id: test.id,
          name: test.name,
          category: test.category,
          specimen: test.specimen,
          unit: test.unit,
          reference: test.reference,
          price: Number(test.price || 0),
        },
      ];
    });
  };

  const submit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage(
        "Please enter patient name."
      );
      return;
    }

    if (!form.phone.trim()) {
      setMessage(
        "Please enter patient phone number."
      );
      return;
    }

    if (!form.branch) {
      setMessage(
        "Please select a branch."
      );
      return;
    }

    const patients = read(
      STORAGE.patients
    );

    const patient = {
      ...form,
      id: nextId("PAT", patients),
      date: today(),
      selectedTests,
    };

    write(STORAGE.patients, [
      patient,
      ...patients,
    ]);

    setForm({
      name: "",
      age: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      branch: "",
      referral: "",
      notes: "",
    });

    setSelectedTests([]);
    setMessage(
      `Patient ${patient.id} registered successfully.`
    );
  };

  return (
    <Page
      title="Patient Entry"
      subtitle="Register a patient and select the required laboratory tests."
    >
      {message && (
        <div className="alert success-alert">
          <I.CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="entry-card">
          <div className="entry-card-header">
            <div>
              <h2>
                <I.UserPlus size={19} />
                Patient Information
              </h2>

              <p>
                Enter complete patient details.
              </p>
            </div>

            <span className="patient-id-badge">
              ID auto-generated
            </span>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                Patient Name
                <span className="required-star">
                  *
                </span>
              </label>

              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>

              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label>Age</label>

              <input
                type="number"
                value={form.age}
                onChange={(e) =>
                  setForm({
                    ...form,
                    age: e.target.value,
                  })
                }
                placeholder="Age"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>

              <select
                value={form.gender}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gender: e.target.value,
                  })
                }
              >
                <option value="">
                  Select gender
                </option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="Optional email"
              />
            </div>

            <SearchSelect
              label="Referred By"
              value={form.referral}
              onChange={(value) =>
                setForm({
                  ...form,
                  referral: value,
                })
              }
              options={doctorOptions}
              self
              placeholder="Select doctor / Self"
            />

            <SearchSelect
              label="Branch"
              value={form.branch}
              onChange={(value) =>
                setForm({
                  ...form,
                  branch: value,
                })
              }
              options={branchOptions}
              placeholder="Select branch"
            />

            <div className="form-group full">
              <label>Address</label>

              <textarea
                rows="3"
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
                placeholder="Patient address"
              />
            </div>
          </div>
        </div>

        {/* TEST SELECTION */}

        <div className="entry-card">
          <div className="entry-card-header">
            <div>
              <h2>
                <I.TestTube2 size={19} />
                Test Selection
              </h2>

              <p>
                Select the tests required for
                this patient.
              </p>
            </div>

            <span className="test-count-badge">
              {selectedTests.length} selected
            </span>
          </div>

          <div className="test-selection-layout">
            <div className="test-picker">
              <div className="test-search-box">
                <I.Search size={16} />

                <input
                  value={testSearch}
                  onChange={(e) =>
                    setTestSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search tests..."
                />
              </div>

              <div className="test-picker-list">
                {filteredTests.map(
                  (test) => {
                    const selected =
                      selectedTests.some(
                        (x) =>
                          x.id === test.id
                      );

                    return (
                      <button
                        key={test.id}
                        type="button"
                        className={`test-picker-item ${
                          selected
                            ? "test-picker-selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleTest(test)
                        }
                      >
                        <div className="test-picker-main">
                          <strong>
                            {test.name}
                          </strong>

                          <small>
                            {test.id} •{" "}
                            {test.category} •{" "}
                            {test.specimen}
                          </small>
                        </div>

                        <div className="test-picker-action">
                          {selected ? (
                            <I.Check
                              size={17}
                            />
                          ) : (
                            <I.Plus
                              size={17}
                            />
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="selected-tests">
              <div className="selected-tests-header">
                <div>
                  <b>
                    Selected Tests
                  </b>

                  <span>
                    {selectedTests.length} test(s)
                  </span>
                </div>
              </div>

              {selectedTests.length === 0 ? (
                <div className="selected-tests-empty">
                  <I.TestTube2
                    size={32}
                  />

                  <strong>
                    No tests selected
                  </strong>

                  <p>
                    Select tests from the
                    left side.
                  </p>
                </div>
              ) : (
                <>
                  <div className="selected-test-list">
                    {selectedTests.map(
                      (test, index) => (
                        <div
                          className="selected-test-row"
                          key={test.id}
                        >
                          <div className="selected-test-number">
                            {index + 1}
                          </div>

                          <div className="selected-test-info">
                            <strong>
                              {test.name}
                            </strong>

                            <span>
                              {test.category}
                            </span>

                            <small>
                              {test.unit} •{" "}
                              {test.reference}
                            </small>
                          </div>

                          <div className="selected-test-price">
                            {money(
                              test.price
                            )}
                          </div>

                          <button
                            type="button"
                            className="icon-btn danger"
                            onClick={() =>
                              toggleTest(test)
                            }
                          >
                            <I.Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  <div className="selected-tests-total">
                    <span>
                      Total Test Charges
                    </span>

                    <strong>
                      {money(total)}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="entry-card">
          <div className="form-group">
            <label>Notes</label>

            <textarea
              rows="3"
              value={form.notes}
              onChange={(e) =>
                setForm({
                  ...form,
                  notes: e.target.value,
                })
              }
              placeholder="Additional notes..."
            />
          </div>
        </div>

        <div className="entry-submit-card">
          <div>
            <strong>
              Ready to register patient?
            </strong>

            <p>
              {selectedTests.length} test(s)
              selected • {money(total)}
            </p>
          </div>

          <div className="entry-submit-actions">
            <Button
              type="button"
              onClick={() => {
                setForm({
                  name: "",
                  age: "",
                  gender: "",
                  phone: "",
                  email: "",
                  address: "",
                  branch: "",
                  referral: "",
                  notes: "",
                });
                setSelectedTests([]);
              }}
            >
              Clear
            </Button>

            <Button
              type="submit"
              primary
              icon={I.Save}
            >
              Save Patient
            </Button>
          </div>
        </div>
      </form>
    </Page>
  );
}

/* =========================================================
   PATIENTS
   ========================================================= */

function Patients() {
  const [patients, setPatients] =
    useState(
      read(STORAGE.patients)
    );

  const [search, setSearch] =
    useState("");

  const [selected, setSelected] =
    useState(null);

  useEffect(() => {
    const refresh = () =>
      setPatients(
        read(STORAGE.patients)
      );

    window.addEventListener(
      "taz-company-data",
      refresh
    );

    return () =>
      window.removeEventListener(
        "taz-company-data",
        refresh
      );
  }, []);

  const filtered = patients.filter(
    (patient) =>
      `${patient.id} ${patient.name} ${patient.phone} ${patient.email || ""}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  return (
    <Page
      title="Patients"
      subtitle="Patient registration history and records."
      actions={
        <Button
          primary
          icon={I.UserPlus}
          onClick={() =>
            navigate(
              "/patients/new"
            )
          }
        >
          New Patient
        </Button>
      }
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search patients by ID, name or phone..."
      />

      <div className="card table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Patient</th>
                <th>Age/Gender</th>
                <th>Phone</th>
                <th>Branch</th>
                <th>Referral</th>
                <th>Tests</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (patient) => (
                  <tr key={patient.id}>
                    <td>
                      <span className="table-primary">
                        {patient.id}
                      </span>
                    </td>

                    <td>
                      <b>
                        {patient.name}
                      </b>

                      {patient.email && (
                        <span className="table-secondary">
                          {patient.email}
                        </span>
                      )}
                    </td>

                    <td>
                      {patient.age || "-"} /{" "}
                      {patient.gender || "-"}
                    </td>

                    <td>
                      {patient.phone}
                    </td>

                    <td>
                      {patient.branch}
                    </td>

                    <td>
                      {patient.referral ||
                        "Self"}
                    </td>

                    <td>
                      {patient.selectedTests
                        ?.length || 0}
                    </td>

                    <td>
                      {patient.date}
                    </td>

                    <td>
                      <Button
                        onClick={() =>
                          setSelected(
                            patient
                          )
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <div className="empty-state">
            <I.Users size={35} />
            <strong>
              No patients found
            </strong>
            <p>
              Register a patient or change
              your search.
            </p>
          </div>
        )}
      </div>

      {selected && (
        <Modal
          title={`${selected.id} — ${selected.name}`}
          onClose={() =>
            setSelected(null)
          }
          wide
        >
          <div className="form-grid">
            <div className="form-group">
              <label>Patient ID</label>
              <input
                value={selected.id}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Patient Name</label>
              <input
                value={selected.name}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                value={selected.phone}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                value={selected.email || ""}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Branch</label>
              <input
                value={selected.branch}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Referred By</label>
              <input
                value={
                  selected.referral ||
                  "Self"
                }
                readOnly
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
            }}
          >
            <h3
              style={{
                color: "#5b0a1a",
              }}
            >
              Selected Tests
            </h3>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Category</th>
                    <th>Specimen</th>
                    <th>Unit</th>
                    <th>Price</th>
                  </tr>
                </thead>

                <tbody>
                  {(
                    selected.selectedTests ||
                    []
                  ).map((test) => (
                    <tr key={test.id}>
                      <td>
                        {test.name}
                      </td>
                      <td>
                        {test.category}
                      </td>
                      <td>
                        {test.specimen}
                      </td>
                      <td>
                        {test.unit}
                      </td>
                      <td>
                        {money(
                          test.price
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   DOCTORS
   ========================================================= */

function Doctors() {
  const [doctors, setDoctors] =
    useState(
      read(STORAGE.doctors)
    );

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState(null);

  const blank = {
    name: "",
    specialization: "",
    phone: "",
    email: "",
    clinic: "",
    address: "",
    status: "Active",
  };

  const filtered = doctors.filter(
    (doctor) =>
      `${doctor.id} ${doctor.name} ${doctor.specialization} ${doctor.phone}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  const saveDoctor = (event) => {
    event.preventDefault();

    const all = read(
      STORAGE.doctors
    );

    let updated;

    if (form.id) {
      updated = all.map((item) =>
        item.id === form.id
          ? form
          : item
      );
    } else {
      updated = [
        {
          ...form,
          id: nextId(
            "DOC",
            all
          ),
        },
        ...all,
      ];
    }

    write(
      STORAGE.doctors,
      updated
    );

    setDoctors(updated);
    setForm(null);
  };

  const deleteDoctor = (doctor) => {
    if (
      !window.confirm(
        `Delete ${doctor.name}?`
      )
    ) {
      return;
    }

    const updated = doctors.filter(
      (x) => x.id !== doctor.id
    );

    write(
      STORAGE.doctors,
      updated
    );

    setDoctors(updated);
  };

  return (
    <Page
      title="Doctors"
      subtitle="Manage referring doctors and specialists."
      actions={
        <Button
          primary
          icon={I.Plus}
          onClick={() =>
            setForm({
              ...blank,
            })
          }
        >
          Add Doctor
        </Button>
      }
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search doctors..."
      />

      <div className="card table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Clinic</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (doctor) => (
                  <tr key={doctor.id}>
                    <td>
                      <b>
                        {doctor.id}
                      </b>
                    </td>

                    <td>
                      <b>
                        {doctor.name}
                      </b>

                      <span className="table-secondary">
                        {doctor.email}
                      </span>
                    </td>

                    <td>
                      {doctor.specialization}
                    </td>

                    <td>
                      {doctor.phone}
                    </td>

                    <td>
                      {doctor.clinic}
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          doctor.status
                        }
                      />
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                        }}
                      >
                        <button
                          className="icon-btn"
                          onClick={() =>
                            setForm({
                              ...doctor,
                            })
                          }
                        >
                          <I.Pencil
                            size={15}
                          />
                        </button>

                        <button
                          className="icon-btn danger"
                          onClick={() =>
                            deleteDoctor(
                              doctor
                            )
                          }
                        >
                          <I.Trash2
                            size={15}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal
          title={
            form.id
              ? "Edit Doctor"
              : "Add Doctor"
          }
          onClose={() =>
            setForm(null)
          }
        >
          <form onSubmit={saveDoctor}>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  Doctor Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Specialization
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
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Clinic</label>
                <input
                  value={
                    form.clinic
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      clinic:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={
                    form.status
                  }
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

              <div className="form-group full">
                <label>Address</label>
                <textarea
                  rows="3"
                  value={
                    form.address
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div
              className="modal-footer"
              style={{
                margin: "20px -20px -20px",
              }}
            >
              <Button
                onClick={() =>
                  setForm(null)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                primary
                icon={I.Save}
              >
                Save Doctor
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   TEST MASTER
   ========================================================= */

function TestMaster() {
  const [tests, setTests] =
    useState(
      read(STORAGE.tests)
    );

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState(null);

  const blank = {
    name: "",
    category: "",
    specimen: "",
    unit: "",
    reference: "",
    price: "",
    status: "Active",
  };

  const filtered = tests.filter(
    (test) =>
      `${test.id} ${test.name} ${test.category} ${test.specimen}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  const saveTest = (event) => {
    event.preventDefault();

    const all = read(
      STORAGE.tests
    );

    const normalized = {
      ...form,
      price: Number(
        form.price || 0
      ),
    };

    const updated = form.id
      ? all.map((item) =>
          item.id === form.id
            ? normalized
            : item
        )
      : [
          {
            ...normalized,
            id: nextId(
              "TST",
              all
            ),
          },
          ...all,
        ];

    write(
      STORAGE.tests,
      updated
    );

    setTests(updated);
    setForm(null);
  };

  const toggleStatus = (test) => {
    const all = read(
      STORAGE.tests
    );

    const updated = all.map(
      (item) =>
        item.id === test.id
          ? {
              ...item,
              status:
                item.status ===
                "Active"
                  ? "Inactive"
                  : "Active",
            }
          : item
    );

    write(
      STORAGE.tests,
      updated
    );

    setTests(updated);
  };

  const deleteTest = (test) => {
    if (
      !window.confirm(
        `Delete ${test.name}?`
      )
    ) {
      return;
    }

    const updated =
      tests.filter(
        (x) => x.id !== test.id
      );

    write(
      STORAGE.tests,
      updated
    );

    setTests(updated);
  };

  return (
    <Page
      title="Test Master"
      subtitle="Maintain all laboratory tests, units, reference ranges and prices."
      actions={
        <Button
          primary
          icon={I.Plus}
          onClick={() =>
            setForm({
              ...blank,
            })
          }
        >
          Add Test
        </Button>
      }
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search tests..."
      />

      <div className="card table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Test Name</th>
                <th>Category</th>
                <th>Specimen</th>
                <th>Unit</th>
                <th>Reference Range</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (test) => (
                  <tr key={test.id}>
                    <td>
                      <b>
                        {test.id}
                      </b>
                    </td>

                    <td>
                      <b>
                        {test.name}
                      </b>
                    </td>

                    <td>
                      {test.category}
                    </td>

                    <td>
                      {test.specimen}
                    </td>

                    <td>
                      {test.unit}
                    </td>

                    <td>
                      {test.reference}
                    </td>

                    <td>
                      {money(
                        test.price
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          toggleStatus(
                            test
                          )
                        }
                        style={{
                          border: 0,
                          background:
                            "transparent",
                          padding: 0,
                        }}
                      >
                        <StatusBadge
                          value={
                            test.status
                          }
                        />
                      </button>
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                        }}
                      >
                        <button
                          className="icon-btn"
                          onClick={() =>
                            setForm({
                              ...test,
                            })
                          }
                        >
                          <I.Pencil
                            size={15}
                          />
                        </button>

                        <button
                          className="icon-btn danger"
                          onClick={() =>
                            deleteTest(
                              test
                            )
                          }
                        >
                          <I.Trash2
                            size={15}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal
          title={
            form.id
              ? "Edit Laboratory Test"
              : "Add Laboratory Test"
          }
          onClose={() =>
            setForm(null)
          }
        >
          <form onSubmit={saveTest}>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  Test Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Example: CBC"
                />
              </div>

              <div className="form-group">
                <label>
                  Category
                </label>
                <input
                  value={
                    form.category
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category:
                        e.target.value,
                    })
                  }
                  placeholder="Hematology"
                />
              </div>

              <div className="form-group">
                <label>
                  Specimen
                </label>
                <input
                  value={
                    form.specimen
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      specimen:
                        e.target.value,
                    })
                  }
                  placeholder="Blood"
                />
              </div>

              <div className="form-group">
                <label>Unit</label>
                <input
                  value={
                    form.unit
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unit:
                        e.target.value,
                    })
                  }
                  placeholder="mg/dL"
                />
              </div>

              <div className="form-group">
                <label>
                  Reference Range
                </label>
                <input
                  value={
                    form.reference
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reference:
                        e.target.value,
                    })
                  }
                  placeholder="70 - 99"
                />
              </div>

              <div className="form-group">
                <label>
                  Price
                </label>
                <input
                  type="number"
                  min="0"
                  value={
                    form.price
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={
                    form.status
                  }
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
            </div>

            <div
              className="modal-footer"
              style={{
                margin: "20px -20px -20px",
              }}
            >
              <Button
                onClick={() =>
                  setForm(null)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                primary
                icon={I.Save}
              >
                Save Test
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   TEST MANAGEMENT
   ========================================================= */

function TestManagement() {
  const tests = read(
    STORAGE.tests
  );

  const active = tests.filter(
    (x) => x.status === "Active"
  );

  const inactive = tests.filter(
    (x) => x.status !== "Active"
  );

  const categories = [
    ...new Set(
      tests.map((x) => x.category)
    ),
  ];

  return (
    <Page
      title="Test Management"
      subtitle="Operational view of laboratory services."
      actions={
        <Button
          primary
          icon={I.Plus}
          onClick={() =>
            navigate(
              "/test-master"
            )
          }
        >
          Manage Tests
        </Button>
      }
    >
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <I.TestTube2 />
          </div>

          <div>
            <small>
              Total Tests
            </small>
            <strong>
              {tests.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <I.CheckCircle2 />
          </div>

          <div>
            <small>
              Active Tests
            </small>
            <strong>
              {active.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <I.XCircle />
          </div>

          <div>
            <small>
              Inactive Tests
            </small>
            <strong>
              {inactive.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <I.Layers />
          </div>

          <div>
            <small>
              Categories
            </small>
            <strong>
              {categories.length}
            </strong>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="dashboard-card-header" style={{ padding: 20 }}>
          <h2>Available Laboratory Tests</h2>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Test</th>
                <th>Category</th>
                <th>Specimen</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {tests.map((test) => (
                <tr key={test.id}>
                  <td>{test.id}</td>
                  <td>
                    <b>{test.name}</b>
                  </td>
                  <td>
                    {test.category}
                  </td>
                  <td>
                    {test.specimen}
                  </td>
                  <td>
                    {money(test.price)}
                  </td>
                  <td>
                    <StatusBadge
                      value={
                        test.status
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

/* =========================================================
   REPORTS
   ========================================================= */

function Reports() {
  const patients = read(
    STORAGE.patients
  );

  const doctors = read(
    STORAGE.doctors
  );

  const tests = read(
    STORAGE.tests
  ).filter(
    (x) => x.status === "Active"
  );

  const settings = read(
    STORAGE.settings,
    {}
  );

  const [reports, setReports] =
    useState(
      read(STORAGE.reports)
    );

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState(null);

  const patientOptions =
    patients.map((patient) => ({
      value: patient.id,
      label: `${patient.id} — ${patient.name}`,
      meta: `${patient.phone} • ${patient.branch}`,
    }));

  const doctorOptions =
    doctors.map((doctor) => ({
      value: doctor.id,
      label: doctor.name,
      meta: doctor.specialization,
    }));

  const testOptions =
    tests.map((test) => ({
      value: test.id,
      label: test.name,
      meta: `${test.category} • ${test.unit}`,
    }));

  const filteredReports =
    reports.filter(
      (report) =>
        `${report.id} ${report.patientName} ${report.doctorName} ${report.status}`
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const openNewReport = () => {
    setForm({
      patientId: "",
      doctorId: "",
      testIds: [],
      date: today(),
      time: new Date()
        .toTimeString()
        .slice(0, 5),
      priority: "Normal",
      status: "Pending",
      remarks: "",
      technician:
        settings.technicianName ||
        "Lab Technician",
      testResults: [],
    });
  };

  const patient = patients.find(
    (x) =>
      x.id === form?.patientId
  );

  useEffect(() => {
    if (!form) return;

    if (
      form.testIds &&
      form.testIds.length
    ) {
      const resultTests =
        form.testIds.map(
          (testId) => {
            const test =
              tests.find(
                (x) =>
                  x.id === testId
              );

            const existing =
              form.testResults?.find(
                (x) =>
                  x.id === testId
              );

            return {
              id: test.id,
              name: test.name,
              category:
                test.category,
              specimen:
                test.specimen,
              unit: test.unit,
              reference:
                test.reference,
              result:
                existing?.result || "",
            };
          }
        );

      const same =
        JSON.stringify(
          resultTests
        ) ===
        JSON.stringify(
          form.testResults || []
        );

      if (!same) {
        setForm((current) => ({
          ...current,
          testResults:
            resultTests,
        }));
      }
    }
  }, [form?.testIds]);

  const saveReport = (event) => {
    event.preventDefault();

    if (!form.patientId) {
      alert(
        "Please select a patient."
      );
      return;
    }

    if (!form.testIds?.length) {
      alert(
        "Please select at least one test."
      );
      return;
    }

    const all = read(
      STORAGE.reports
    );

    const patientRecord =
      patients.find(
        (x) =>
          x.id ===
          form.patientId
      );

    const doctorRecord =
      form.doctorId === "SELF"
        ? null
        : doctors.find(
            (x) =>
              x.id ===
              form.doctorId
          );

    const report = {
      id:
        form.id ||
        nextId("REP", all),

      patientId:
        form.patientId,

      patientName:
        patientRecord?.name ||
        "",

      doctorId:
        form.doctorId || "SELF",

      doctorName:
        doctorRecord?.name ||
        "Self",

      date: form.date,
      time: form.time,

      status: form.status,

      priority:
        form.priority,

      remarks:
        form.remarks,

      technician:
        form.technician,

      testResults:
        form.testResults,
    };

    const updated = form.id
      ? all.map((item) =>
          item.id === form.id
            ? report
            : item
        )
      : [report, ...all];

    write(
      STORAGE.reports,
      updated
    );

    setReports(updated);
    setForm(null);
  };

  const updateResult = (
    testId,
    value
  ) => {
    setForm((current) => ({
      ...current,
      testResults:
        current.testResults.map(
          (test) =>
            test.id === testId
              ? {
                  ...test,
                  result: value,
                }
              : test
        ),
    }));
  };

  const printReport = (report) => {
    const html = createReportHTML(
      report,
      settings
    );

    const popup =
      window.open(
        "",
        "_blank"
      );

    if (!popup) {
      alert(
        "Please allow pop-ups to print the report."
      );
      return;
    }

    popup.document.write(html);
    popup.document.close();

    setTimeout(() => {
      popup.print();
    }, 500);
  };

  return (
    <Page
      title="Reports"
      subtitle="Enter, review, complete and print patient laboratory reports."
      actions={
        <Button
          primary
          icon={I.Plus}
          onClick={
            openNewReport
          }
        >
          New Report
        </Button>
      }
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search reports..."
      />

      <div className="card table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Tests</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.map(
                (report) => (
                  <tr key={report.id}>
                    <td>
                      <b>
                        {report.id}
                      </b>
                    </td>

                    <td>
                      <b>
                        {
                          report.patientName
                        }
                      </b>

                      <span className="table-secondary">
                        {
                          report.patientId
                        }
                      </span>
                    </td>

                    <td>
                      {
                        report.doctorName
                      }
                    </td>

                    <td>
                      {
                        report
                          .testResults
                          ?.length ||
                        0
                      }
                    </td>

                    <td>
                      {report.date}
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          report.priority
                        }
                      />
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          report.status
                        }
                      />
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                        }}
                      >
                        <button
                          className="icon-btn"
                          title="Edit"
                          onClick={() =>
                            setForm({
                              ...report,
                              testIds:
                                report.testResults?.map(
                                  (x) =>
                                    x.id
                                ) || [],
                            })
                          }
                        >
                          <I.Pencil
                            size={15}
                          />
                        </button>

                        <button
                          className="icon-btn"
                          title="Print"
                          onClick={() =>
                            printReport(
                              report
                            )
                          }
                        >
                          <I.Printer
                            size={15}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {!filteredReports.length && (
          <div className="empty-state">
            <I.FileText size={35} />

            <strong>
              No reports found
            </strong>

            <p>
              Create a new report to
              enter laboratory results.
            </p>
          </div>
        )}
      </div>

      {form && (
        <Modal
          title={
            form.id
              ? `Edit Report ${form.id}`
              : "Create Laboratory Report"
          }
          onClose={() =>
            setForm(null)
          }
          wide
        >
          <form onSubmit={saveReport}>
            <div className="form-grid">
              <SearchSelect
                label="Patient"
                value={
                  form.patientId
                }
                onChange={(value) =>
                  setForm({
                    ...form,
                    patientId:
                      value,
                  })
                }
                options={
                  patientOptions
                }
                placeholder="Search patient..."
              />

              <SearchSelect
                label="Doctor / Referral"
                value={
                  form.doctorId
                }
                onChange={(value) =>
                  setForm({
                    ...form,
                    doctorId:
                      value,
                  })
                }
                options={
                  doctorOptions
                }
                self
                placeholder="Select doctor / Self"
              />

              <div className="form-group">
                <label>
                  Report Date
                </label>

                <input
                  type="date"
                  value={
                    form.date
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Report Time
                </label>

                <input
                  type="time"
                  value={
                    form.time
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      time:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Priority
                </label>

                <select
                  value={
                    form.priority
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority:
                        e.target.value,
                    })
                  }
                >
                  <option>
                    Normal
                  </option>
                  <option>
                    Urgent
                  </option>
                  <option>
                    High
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Status
                </label>

                <select
                  value={
                    form.status
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status:
                        e.target.value,
                    })
                  }
                >
                  <option>
                    Pending
                  </option>
                  <option>
                    Processing
                  </option>
                  <option>
                    Completed
                  </option>
                </select>
              </div>

              <div className="form-group full">
                <SearchSelect
                  label="Tests"
                  value={
                    form.testIds
                  }
                  onChange={(value) =>
                    setForm({
                      ...form,
                      testIds:
                        value,
                    })
                  }
                  options={
                    testOptions
                  }
                  multiple
                  placeholder="Search and select tests..."
                />
              </div>
            </div>

            {patient && (
              <div
                className="info-box"
                style={{
                  marginTop: 18,
                }}
              >
                <I.User size={18} />

                <div>
                  <strong>
                    {patient.name}
                  </strong>

                  <p>
                    {patient.id} •{" "}
                    {patient.age ||
                      "-"}{" "}
                    years •{" "}
                    {patient.gender ||
                      "-"}{" "}
                    •{" "}
                    {patient.phone}
                  </p>
                </div>
              </div>
            )}

            <div
              className="entry-card"
              style={{
                marginTop: 20,
              }}
            >
              <div className="entry-card-header">
                <div>
                  <h2>
                    <I.FileText
                      size={18}
                    />
                    Test Results
                  </h2>

                  <p>
                    Enter results using the
                    Test Master reference data.
                  </p>
                </div>
              </div>

              {!form.testResults?.length ? (
                <div className="empty-state">
                  <I.TestTube2
                    size={30}
                  />

                  <strong>
                    No tests selected
                  </strong>

                  <p>
                    Select tests above to
                    enter results.
                  </p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Category</th>
                        <th>Specimen</th>
                        <th>Unit</th>
                        <th>Reference Range</th>
                        <th>Result</th>
                      </tr>
                    </thead>

                    <tbody>
                      {form.testResults.map(
                        (test) => (
                          <tr
                            key={test.id}
                          >
                            <td>
                              <b>
                                {
                                  test.name
                                }
                              </b>
                            </td>

                            <td>
                              {
                                test.category
                              }
                            </td>

                            <td>
                              {
                                test.specimen
                              }
                            </td>

                            <td>
                              {test.unit}
                            </td>

                            <td>
                              {
                                test.reference
                              }
                            </td>

                            <td>
                              <input
                                style={{
                                  width:
                                    "160px",
                                  border:
                                    "1px solid #ddd",
                                  borderRadius:
                                    "7px",
                                  padding:
                                    "8px",
                                }}
                                value={
                                  test.result
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateResult(
                                    test.id,
                                    e.target
                                      .value
                                  )
                                }
                                placeholder="Enter result"
                              />
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group full">
                <label>
                  Remarks
                </label>

                <textarea
                  rows="3"
                  value={
                    form.remarks
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      remarks:
                        e.target.value,
                    })
                  }
                  placeholder="Report remarks..."
                />
              </div>

              <div className="form-group">
                <label>
                  Technician
                </label>

                <input
                  value={
                    form.technician
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      technician:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <Button
                onClick={() =>
                  setForm(null)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                primary
                icon={I.Save}
              >
                Save Report
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   REPORT HTML
   ========================================================= */

function createReportHTML(
  report,
  settings
) {
  const qrData = encodeURIComponent(
    `TAZ DIAGNOSTIC|Report:${report.id}|Patient:${report.patientId}|${report.patientName}`
  );

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${qrData}`;

  const logoUrl =
    settings.logo ||
    "";

  const rows =
    report.testResults
      ?.map(
        (test) => `
          <tr>
            <td>${escapeHTML(
              test.name
            )}</td>
            <td>${escapeHTML(
              test.category
            )}</td>
            <td>${escapeHTML(
              test.specimen ||
                "-"
            )}</td>
            <td>${escapeHTML(
              test.result || "-"
            )}</td>
            <td>${escapeHTML(
              test.unit || "-"
            )}</td>
            <td>${escapeHTML(
              test.reference || "-"
            )}</td>
          </tr>
        `
      )
      .join("") || "";

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>TAZ DIAGNOSTIC - ${
    report.id
  }</title>

<style>

@page {
  size: A4;
  margin: 14mm;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  color: #171717;
  font-size: 11px;
}

.header {
  display: grid;
  grid-template-columns: 90px 1fr 90px;
  align-items: center;
  border-bottom: 3px solid #5b0a1a;
  padding-bottom: 12px;
}

.qr {
  width: 75px;
  height: 75px;
}

.logo {
  width: 75px;
  height: 75px;
  object-fit: contain;
  margin-left: auto;
}

.center {
  text-align: center;
}

.center h1 {
  margin: 0;
  color: #5b0a1a;
  font-size: 26px;
  letter-spacing: 1px;
}

.center h2 {
  margin: 4px 0;
  font-size: 12px;
}

.center p {
  margin: 0;
  color: #666;
  font-size: 9px;
}

.details {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid #ddd;
}

.detail {
  padding: 8px;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.detail:nth-child(4n) {
  border-right: 0;
}

.label {
  display: block;
  font-size: 8px;
  color: #777;
  text-transform: uppercase;
  margin-bottom: 3px;
}

.value {
  font-weight: bold;
}

.title {
  margin-top: 18px;
  padding: 8px;
  background: #5b0a1a;
  color: white;
  font-weight: bold;
  text-align: center;
  letter-spacing: .5px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0;
}

th {
  background: #f4e9ec;
  color: #3a0610;
  font-weight: bold;
}

th, td {
  border: 1px solid #ccc;
  padding: 7px;
  text-align: left;
}

.remarks {
  margin-top: 18px;
  border: 1px solid #ddd;
  padding: 10px;
}

.signatures {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  margin-top: 75px;
  page-break-inside: avoid;
}

.signature {
  text-align: center;
  border-top: 1px solid #444;
  padding-top: 7px;
}

.single {
  grid-template-columns: 1fr;
}

.single .signature {
  width: 250px;
  margin: auto;
}

.footer {
  margin-top: 25px;
  border-top: 1px solid #ddd;
  padding-top: 8px;
  text-align: center;
  color: #777;
  font-size: 8px;
}

tr {
  page-break-inside: avoid;
}

</style>
</head>

<body>

<div class="header">

<img class="qr" src="${qrUrl}" />

<div class="center">
<h1>TAZ DIAGNOSTIC</h1>
<h2>LABORATORY & DIAGNOSTIC CENTRE</h2>
<p>${escapeHTML(
    settings.address ||
      "Hyderabad"
  )} • ${escapeHTML(
    settings.phone ||
      ""
  )}</p>
<p>${escapeHTML(
    settings.email ||
      ""
  )}</p>
</div>

${
  logoUrl
    ? `<img class="logo" src="${escapeHTML(
        logoUrl
      )}" />`
    : `<div class="logo"></div>`
}

</div>

<div class="details">

<div class="detail">
<span class="label">Patient ID</span>
<span class="value">${escapeHTML(
    report.patientId
  )}</span>
</div>

<div class="detail">
<span class="label">Patient Name</span>
<span class="value">${escapeHTML(
    report.patientName
  )}</span>
</div>

<div class="detail">
<span class="label">Report ID</span>
<span class="value">${escapeHTML(
    report.id
  )}</span>
</div>

<div class="detail">
<span class="label">Report Date</span>
<span class="value">${escapeHTML(
    report.date
  )}</span>
</div>

<div class="detail">
<span class="label">Report Time</span>
<span class="value">${escapeHTML(
    report.time
  )}</span>
</div>

<div class="detail">
<span class="label">Referred By</span>
<span class="value">${escapeHTML(
    report.doctorName ||
      "Self"
  )}</span>
</div>

<div class="detail">
<span class="label">Status</span>
<span class="value">${escapeHTML(
    report.status
  )}</span>
</div>

<div class="detail">
<span class="label">Priority</span>
<span class="value">${escapeHTML(
    report.priority
  )}</span>
</div>

</div>

<div class="title">
LABORATORY TEST RESULTS
</div>

<table>

<thead>
<tr>
<th>Test Name</th>
<th>Category</th>
<th>Specimen</th>
<th>Result</th>
<th>Unit</th>
<th>Reference Range</th>
</tr>
</thead>

<tbody>
${rows}
</tbody>

</table>

${
  report.remarks
    ? `
<div class="remarks">
<strong>Remarks:</strong>
${escapeHTML(
  report.remarks
)}
</div>
`
    : ""
}

<div class="signatures ${
    report.doctorName &&
    report.doctorName !== "Self"
      ? ""
      : "single"
  }">

${
  report.doctorName &&
  report.doctorName !== "Self"
    ? `
<div class="signature">
<strong>Doctor / Pathologist</strong>
<br/>
${escapeHTML(
  report.doctorName
)}
</div>
`
    : ""
}

<div class="signature">
<strong>Laboratory Technician</strong>
<br/>
${escapeHTML(
  report.technician ||
    settings.technicianName ||
    "Lab Technician"
)}
</div>

</div>

<div class="footer">
This report is electronically generated by TAZ DIAGNOSTIC.
Please retain this report for your records.
</div>

</body>
</html>
`;
}

function escapeHTML(value) {
  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   MESSAGES
   ========================================================= */

function Messages() {
  const patients = read(
    STORAGE.patients
  );

  const [messages, setMessages] =
    useState(
      read(STORAGE.messages)
    );

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState(null);

  const filtered =
    messages.filter(
      (message) =>
        `${message.id} ${message.patientName} ${message.type} ${message.status}`
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const sendMessage = (event) => {
    event.preventDefault();

    const patient =
      patients.find(
        (x) =>
          x.id ===
          form.patientId
      );

    const all = read(
      STORAGE.messages
    );

    const message = {
      ...form,
      id: nextId(
        "MSG",
        all
      ),
      patientName:
        patient?.name || "",
      date: today(),
      time: new Date()
        .toTimeString()
        .slice(0, 5),
      status: "Sent",
    };

    const updated = [
      message,
      ...all,
    ];

    write(
      STORAGE.messages,
      updated
    );

    setMessages(updated);
    setForm(null);
  };

  const patientOptions =
    patients.map((patient) => ({
      value: patient.id,
      label: `${patient.id} — ${patient.name}`,
      meta: patient.phone,
    }));

  return (
    <Page
      title="Messages"
      subtitle="Patient communication, reminders and report notifications."
      actions={
        <Button
          primary
          icon={I.Send}
          onClick={() =>
            setForm({
              patientId: "",
              type: "WhatsApp",
              message: "",
            })
          }
        >
          New Message
        </Button>
      }
    >
      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search messages..."
      />

      <div className="card table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (message) => (
                  <tr key={message.id}>
                    <td>
                      <b>
                        {message.id}
                      </b>
                    </td>

                    <td>
                      {message.patientName}
                    </td>

                    <td>
                      {message.type}
                    </td>

                    <td>
                      {message.message}
                    </td>

                    <td>
                      {message.date}{" "}
                      {message.time}
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          message.status
                        }
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal
          title="Send Patient Message"
          onClose={() =>
            setForm(null)
          }
        >
          <form onSubmit={sendMessage}>
            <SearchSelect
              label="Patient"
              value={
                form.patientId
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  patientId:
                    value,
                })
              }
              options={
                patientOptions
              }
              placeholder="Search patient..."
            />

            <div
              className="form-group"
              style={{
                marginTop: 16,
              }}
            >
              <label>
                Message Type
              </label>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
              >
                <option>
                  WhatsApp
                </option>
                <option>
                  SMS
                </option>
                <option>
                  Email
                </option>
                <option>
                  Reminder
                </option>
              </select>
            </div>

            <div
              className="form-group"
              style={{
                marginTop: 16,
              }}
            >
              <label>
                Message
              </label>

              <textarea
                rows="5"
                required
                value={
                  form.message
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    message:
                      e.target.value,
                  })
                }
                placeholder="Enter message..."
              />
            </div>

            <div className="modal-footer">
              <Button
                onClick={() =>
                  setForm(null)
                }
              >
                Cancel
              </Button>

              <Button
                primary
                type="submit"
                icon={I.Send}
              >
                Send Message
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   BILLING
   ========================================================= */

function Billing() {
  const patients = read(
    STORAGE.patients
  );

  const tests = read(
    STORAGE.tests
  ).filter(
    (x) => x.status === "Active"
  );

  const [bills, setBills] =
    useState(
      read(STORAGE.bills)
    );

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState(null);

  const filtered = bills.filter(
    (bill) =>
      `${bill.id} ${bill.patientName} ${bill.phone} ${bill.status}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
  );

  const totalBilled =
    bills.reduce(
      (sum, bill) =>
        sum +
        calculateBillTotal(bill),
      0
    );

  const totalPaid =
    bills.reduce(
      (sum, bill) =>
        sum +
        Number(bill.paid || 0),
      0
    );

  const balance =
    totalBilled - totalPaid;

  const patientOptions =
    patients.map((patient) => ({
      value: patient.id,
      label: `${patient.id} — ${patient.name}`,
      meta: patient.phone,
    }));

  const openBill = () => {
    setForm({
      patientId: "",
      items: [],
      discount: 0,
      paid: 0,
      method: "Cash",
    });
  };

  const addItem = (test) => {
    const exists =
      form.items.some(
        (item) =>
          item.testId === test.id
      );

    if (exists) return;

    setForm({
      ...form,
      items: [
        ...form.items,
        {
          testId: test.id,
          name: test.name,
          qty: 1,
          price: Number(
            test.price || 0
          ),
        },
      ],
    });
  };

  const removeItem = (
    testId
  ) => {
    setForm({
      ...form,
      items:
        form.items.filter(
          (item) =>
            item.testId !==
            testId
        ),
    });
  };

  const subtotal =
    form?.items?.reduce(
      (sum, item) =>
        sum +
        Number(item.qty || 0) *
          Number(
            item.price || 0
          ),
      0
    ) || 0;

  const billTotal = Math.max(
    0,
    subtotal -
      Number(
        form?.discount || 0
      )
  );

  const saveBill = (event) => {
    event.preventDefault();

    const patient =
      patients.find(
        (x) =>
          x.id ===
          form.patientId
      );

    if (!patient) {
      alert(
        "Please select a patient."
      );
      return;
    }

    if (!form.items.length) {
      alert(
        "Please add at least one test."
      );
      return;
    }

    const paid = Number(
      form.paid || 0
    );

    const status =
      paid >= billTotal
        ? "Paid"
        : paid > 0
        ? "Partial"
        : "Pending";

    const all = read(
      STORAGE.bills
    );

    const bill = {
      ...form,
      id: nextId(
        "BILL",
        all
      ),
      patientName:
        patient.name,
      phone:
        patient.phone,
      date: today(),
      total: billTotal,
      status,
    };

    const updated = [
      bill,
      ...all,
    ];

    write(
      STORAGE.bills,
      updated
    );

    setBills(updated);
    setForm(null);
  };

  return (
    <Page
      title="Billing"
      subtitle="Patient billing, collections and payment history."
      actions={
        <Button
          primary
          icon={I.Plus}
          onClick={openBill}
        >
          New Bill
        </Button>
      }
    >
      <div className="billing-summary">
        <div className="billing-total">
          <span>Total Billed</span>
          <strong>
            {money(totalBilled)}
          </strong>
        </div>

        <div className="billing-total">
          <span>Total Collected</span>
          <strong>
            {money(totalPaid)}
          </strong>
        </div>

        <div className="billing-total">
          <span>Outstanding</span>
          <strong>
            {money(balance)}
          </strong>
        </div>

        <div className="billing-total">
          <span>Total Bills</span>
          <strong>
            {bills.length}
          </strong>
        </div>
      </div>

      <Toolbar
        search={search}
        setSearch={setSearch}
        placeholder="Search bills..."
      />

      <div className="card table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (bill) => {
                  const total =
                    calculateBillTotal(
                      bill
                    );

                  const remaining =
                    total -
                    Number(
                      bill.paid || 0
                    );

                  return (
                    <tr
                      key={bill.id}
                    >
                      <td>
                        <b>
                          {bill.id}
                        </b>
                      </td>

                      <td>
                        <b>
                          {
                            bill.patientName
                          }
                        </b>

                        <span className="table-secondary">
                          {bill.phone}
                        </span>
                      </td>

                      <td>
                        {bill.date}
                      </td>

                      <td>
                        {
                          bill.items
                            ?.length
                        }
                      </td>

                      <td>
                        {money(total)}
                      </td>

                      <td>
                        {money(
                          bill.paid
                        )}
                      </td>

                      <td>
                        {money(
                          remaining
                        )}
                      </td>

                      <td>
                        {bill.method}
                      </td>

                      <td>
                        <StatusBadge
                          value={
                            bill.status
                          }
                        />
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal
          title="Create Bill"
          onClose={() =>
            setForm(null)
          }
          wide
        >
          <form onSubmit={saveBill}>
            <SearchSelect
              label="Patient"
              value={
                form.patientId
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  patientId:
                    value,
                })
              }
              options={
                patientOptions
              }
              placeholder="Search patient..."
            />

            <div
              style={{
                marginTop: 20,
              }}
            >
              <h3
                style={{
                  color:
                    "#5b0a1a",
                }}
              >
                Add Tests
              </h3>

              <div
                style={{
                  display: "flex",
                  flexWrap:
                    "wrap",
                  gap: 8,
                }}
              >
                {tests.map(
                  (test) => (
                    <Button
                      key={
                        test.id
                      }
                      onClick={() =>
                        addItem(
                          test
                        )
                      }
                    >
                      <I.Plus
                        size={14}
                      />
                      {test.name}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
              }}
            >
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {form.items.map(
                      (item) => (
                        <tr
                          key={
                            item.testId
                          }
                        >
                          <td>
                            {item.name}
                          </td>

                          <td>
                            <input
                              type="number"
                              min="1"
                              value={
                                item.qty
                              }
                              style={{
                                width: 70,
                              }}
                              onChange={(
                                e
                              ) =>
                                setForm({
                                  ...form,
                                  items:
                                    form.items.map(
                                      (
                                        x
                                      ) =>
                                        x.testId ===
                                        item.testId
                                          ? {
                                              ...x,
                                              qty: Number(
                                                e
                                                  .target
                                                  .value
                                              ),
                                            }
                                          : x
                                    ),
                                })
                              }
                            />
                          </td>

                          <td>
                            {money(
                              item.price
                            )}
                          </td>

                          <td>
                            {money(
                              Number(
                                item.qty
                              ) *
                                Number(
                                  item.price
                                )
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="icon-btn danger"
                              onClick={() =>
                                removeItem(
                                  item.testId
                                )
                              }
                            >
                              <I.Trash2
                                size={
                                  15
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div
              className="form-grid"
              style={{
                marginTop: 20,
              }}
            >
              <div className="form-group">
                <label>
                  Discount
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    form.discount
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discount:
                        Number(
                          e.target
                            .value
                        ),
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Amount Paid
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    form.paid
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paid:
                        Number(
                          e.target
                            .value
                        ),
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Payment Method
                </label>

                <select
                  value={
                    form.method
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      method:
                        e.target.value,
                    })
                  }
                >
                  <option>
                    Cash
                  </option>
                  <option>
                    UPI
                  </option>
                  <option>
                    Card
                  </option>
                  <option>
                    Bank Transfer
                  </option>
                </select>
              </div>

              <div
                className="info-box"
                style={{
                  marginTop: 0,
                }}
              >
                <div>
                  <div>
                    Subtotal:{" "}
                    <b>
                      {money(
                        subtotal
                      )}
                    </b>
                  </div>

                  <div>
                    Total:{" "}
                    <b>
                      {money(
                        billTotal
                      )}
                    </b>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <Button
                onClick={() =>
                  setForm(null)
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                primary
                icon={I.Save}
              >
                Save Bill
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

function calculateBillTotal(
  bill
) {
  const subtotal =
    bill.items?.reduce(
      (sum, item) =>
        sum +
        Number(item.qty || 0) *
          Number(
            item.price || 0
          ),
      0
    ) || 0;

  return Math.max(
    0,
    subtotal -
      Number(bill.discount || 0)
  );
}

/* =========================================================
   USERS
   ========================================================= */

function UsersPage() {
  const [users, setUsers] =
    useState(
      read(STORAGE.users)
    );

  const [form, setForm] =
    useState(null);

  const blank = {
    name: "",
    username: "",
    password: "",
    role: "Lab Technician",
    status: "Active",
  };

  const saveUser = (event) => {
    event.preventDefault();

    const all = read(
      STORAGE.users
    );

    const updated = form.id
      ? all.map((item) =>
          item.id === form.id
            ? form
            : item
        )
      : [
          {
            ...form,
            id: nextId(
              "USR",
              all
            ),
          },
          ...all,
        ];

    write(
      STORAGE.users,
      updated
    );

    setUsers(updated);
    setForm(null);
  };

  const toggle = (user) => {
    const updated =
      users.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status:
                item.status ===
                "Active"
                  ? "Inactive"
                  : "Active",
            }
          : item
      );

    write(
      STORAGE.users,
      updated
    );

    setUsers(updated);
  };

  return (
    <Page
      title="Users & Roles"
      subtitle="Manage application users and access roles."
      actions={
        <Button
          primary
          icon={I.Plus}
          onClick={() =>
            setForm({
              ...blank,
            })
          }
        >
          Add User
        </Button>
      }
    >
      <div className="card table-card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map(
                (user) => (
                  <tr key={user.id}>
                    <td>
                      {user.id}
                    </td>

                    <td>
                      <b>
                        {user.name}
                      </b>
                    </td>

                    <td>
                      {user.username}
                    </td>

                    <td>
                      {user.role}
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          user.status
                        }
                      />
                    </td>

                    <td>
                      <div
                        style={{
                          display:
                            "flex",
                          gap: 6,
                        }}
                      >
                        <button
                          className="icon-btn"
                          onClick={() =>
                            setForm({
                              ...user,
                            })
                          }
                        >
                          <I.Pencil
                            size={15}
                          />
                        </button>

                        <Button
                          onClick={() =>
                            toggle(
                              user
                            )
                          }
                        >
                          {user.status ===
                          "Active"
                            ? "Deactivate"
                            : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {form && (
        <Modal
          title={
            form.id
              ? "Edit User"
              : "Add User"
          }
          onClose={() =>
            setForm(null)
          }
        >
          <form onSubmit={saveUser}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Username
                </label>
                <input
                  required
                  value={
                    form.username
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      username:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Password
                </label>
                <input
                  type="password"
                  required={!form.id}
                  value={
                    form.password
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={
                    form.role
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role:
                        e.target.value,
                    })
                  }
                >
                  <option>
                    Administrator
                  </option>
                  <option>
                    Lab Technician
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={
                    form.status
                  }
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
            </div>

            <div className="modal-footer">
              <Button
                onClick={() =>
                  setForm(null)
                }
              >
                Cancel
              </Button>

              <Button
                primary
                type="submit"
                icon={I.Save}
              >
                Save User
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   ANALYTICS
   ========================================================= */

function Analytics() {
  const patients = read(
    STORAGE.patients
  );

  const reports = read(
    STORAGE.reports
  );

  const bills = read(
    STORAGE.bills
  );

  const tests = read(
    STORAGE.tests
  );

  const completed =
    reports.filter(
      (x) =>
        x.status ===
        "Completed"
    ).length;

  const pending =
    reports.length -
    completed;

  const billed =
    bills.reduce(
      (sum, bill) =>
        sum +
        calculateBillTotal(
          bill
        ),
      0
    );

  const collected =
    bills.reduce(
      (sum, bill) =>
        sum +
        Number(bill.paid || 0),
      0
    );

  const rate = reports.length
    ? Math.round(
        (completed /
          reports.length) *
          100
      )
    : 0;

  const collectionRate =
    billed
      ? Math.round(
          (collected /
            billed) *
            100
        )
      : 0;

  return (
    <Page
      title="Analytics"
      subtitle="Operational statistics for patients, reports and billing."
    >
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <I.Users />
          </div>
          <div>
            <small>Patients</small>
            <strong>
              {patients.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <I.FileText />
          </div>
          <div>
            <small>Reports</small>
            <strong>
              {reports.length}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <I.IndianRupee />
          </div>
          <div>
            <small>Billed</small>
            <strong>
              {money(billed)}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <I.Wallet />
          </div>
          <div>
            <small>Collected</small>
            <strong>
              {money(collected)}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <I.TestTube2 />
          </div>
          <div>
            <small>Tests Master</small>
            <strong>
              {tests.length}
            </strong>
          </div>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{
          gridTemplateColumns:
            "1fr 1fr",
        }}
      >
        <div className="card dashboard-card">
          <div className="dashboard-card-header">
            <h2>
              Report Completion
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gap: 18,
            }}
          >
            <MetricBar
              label="Completed"
              value={completed}
              percent={rate}
            />

            <MetricBar
              label="Pending"
              value={pending}
              percent={
                100 - rate
              }
            />
          </div>
        </div>

        <div className="card dashboard-card">
          <div className="dashboard-card-header">
            <h2>
              Collection
            </h2>
          </div>

          <MetricBar
            label="Collection Rate"
            value={`${collectionRate}%`}
            percent={
              collectionRate
            }
          />

          <div
            className="info-box"
            style={{
              marginTop: 20,
            }}
          >
            <I.BarChart3 size={18} />

            <div>
              <strong>
                Daily review
              </strong>

              <p>
                Total billed:{" "}
                {money(billed)}
                <br />
                Total collected:{" "}
                {money(collected)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}

function MetricBar({
  label,
  value,
  percent,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          marginBottom: 7,
        }}
      >
        <span>{label}</span>
        <b>{value}</b>
      </div>

      <div
        style={{
          height: 9,
          borderRadius: 20,
          background:
            "#eee",
          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(
              100,
              Math.max(
                0,
                percent
              )
            )}%`,
            background:
              "#5b0a1a",
            borderRadius:
              20,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   BRANCHES
   ========================================================= */

function Branches() {
  const [branches, setBranches] =
    useState(
      read(STORAGE.branches)
    );

  const [form, setForm] =
    useState(null);

  const blank = {
    name: "",
    address: "",
    phone: "",
    status: "Active",
  };

  const saveBranch = (event) => {
    event.preventDefault();

    const all = read(
      STORAGE.branches
    );

    const updated = form.id
      ? all.map((item) =>
          item.id === form.id
            ? form
            : item
        )
      : [
          {
            ...form,
            id: nextId(
              "BR",
              all
            ),
          },
          ...all,
        ];

    write(
      STORAGE.branches,
      updated
    );

    setBranches(updated);
    setForm(null);
  };

  return (
    <Page
      title="Branches"
      subtitle="Manage laboratory branch locations."
      actions={
        <Button
          primary
          icon={I.Plus}
          onClick={() =>
            setForm({
              ...blank,
            })
          }
        >
          Add Branch
        </Button>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0,1fr))",
          gap: 16,
        }}
      >
        {branches.map(
          (branch) => (
            <div
              className="card"
              key={branch.id}
              style={{
                padding: 20,
              }}
            >
              <div className="stat-icon">
                <I.Building2 />
              </div>

              <h3
                style={{
                  color:
                    "#5b0a1a",
                }}
              >
                {branch.name}
              </h3>

              <p>
                {branch.address}
              </p>

              <p>
                {branch.phone}
              </p>

              <StatusBadge
                value={
                  branch.status
                }
              />

              <div
                style={{
                  marginTop: 15,
                }}
              >
                <Button
                  icon={I.Pencil}
                  onClick={() =>
                    setForm({
                      ...branch,
                    })
                  }
                >
                  Edit
                </Button>
              </div>
            </div>
          )
        )}
      </div>

      {form && (
        <Modal
          title={
            form.id
              ? "Edit Branch"
              : "Add Branch"
          }
          onClose={() =>
            setForm(null)
          }
        >
          <form onSubmit={saveBranch}>
            <div className="form-grid">
              <div className="form-group">
                <label>
                  Branch Name
                </label>

                <input
                  required
                  value={
                    form.name
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Phone</label>

                <input
                  value={
                    form.phone
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group full">
                <label>Address</label>

                <textarea
                  rows="3"
                  value={
                    form.address
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      address:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Status</label>

                <select
                  value={
                    form.status
                  }
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
            </div>

            <div className="modal-footer">
              <Button
                onClick={() =>
                  setForm(null)
                }
              >
                Cancel
              </Button>

              <Button
                primary
                type="submit"
                icon={I.Save}
              >
                Save Branch
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   SETTINGS
   ========================================================= */

function Settings() {
  const [settings, setSettings] =
    useState(
      read(
        STORAGE.settings,
        {}
      )
    );

  const [message, setMessage] =
    useState("");

  const update = (
    key,
    value
  ) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const saveSettings = (
    event
  ) => {
    event.preventDefault();

    write(
      STORAGE.settings,
      settings
    );

    setMessage(
      "Settings saved successfully."
    );
  };

  const backup = () => {
    const data = {};

    Object.entries(
      STORAGE
    ).forEach(
      ([name, key]) => {
        if (
          name !==
          "session"
        ) {
          data[key] =
            read(key);
        }
      }
    );

    const blob =
      new Blob(
        [
          JSON.stringify(
            data,
            null,
            2
          ),
        ],
        {
          type: "application/json",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;
    link.download =
      `taz-company-backup-${today()}.json`;

    link.click();

    URL.revokeObjectURL(
      url
    );
  };

  const reset = () => {
    const confirmed =
      window.confirm(
        "Reset TAZ COMPANY demo data? This will remove your current local records."
      );

    if (!confirmed) {
      return;
    }

    Object.values(
      STORAGE
    ).forEach((key) => {
      if (
        key !==
        STORAGE.session
      ) {
        localStorage.removeItem(
          key
        );
      }
    });

    initializeData();

    window.location.reload();
  };

  return (
    <Page
      title="Settings"
      subtitle="Laboratory profile, report defaults and data controls."
    >
      <form
        className="settings-card"
        onSubmit={
          saveSettings
        }
      >
        <div className="settings-card-header">
          <div className="settings-icon">
            <I.Settings />
          </div>

          <div>
            <h2>
              Laboratory Information
            </h2>

            <p>
              These details are used
              throughout the system.
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>
              Application Name
            </label>

            <input
              value={
                settings.labName ||
                ""
              }
              onChange={(e) =>
                update(
                  "labName",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>
              Report Branding
            </label>

            <input
              value={
                settings.reportName ||
                "TAZ DIAGNOSTIC"
              }
              onChange={(e) =>
                update(
                  "reportName",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Phone</label>

            <input
              value={
                settings.phone ||
                ""
              }
              onChange={(e) =>
                update(
                  "phone",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              value={
                settings.email ||
                ""
              }
              onChange={(e) =>
                update(
                  "email",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>
              Technician Name
            </label>

            <input
              value={
                settings.technicianName ||
                ""
              }
              onChange={(e) =>
                update(
                  "technicianName",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group full">
            <label>
              Laboratory Address
            </label>

            <textarea
              rows="3"
              value={
                settings.address ||
                ""
              }
              onChange={(e) =>
                update(
                  "address",
                  e.target.value
                )
              }
            />
          </div>
        </div>

        {message && (
          <div
            className="alert success-alert"
            style={{
              marginTop: 18,
            }}
          >
            <I.CheckCircle2
              size={18}
            />
            {message}
          </div>
        )}

        <div className="settings-bottom-save">
          <Button
            type="submit"
            primary
            icon={I.Save}
          >
            Save Settings
          </Button>
        </div>
      </form>

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon">
            <I.DatabaseBackup />
          </div>

          <div>
            <h2>
              Data Backup
            </h2>

            <p>
              Download your browser
              data as a JSON backup.
            </p>
          </div>
        </div>

        <Button
          primary
          icon={I.Download}
          onClick={backup}
        >
          Download Backup
        </Button>
      </div>

      <div
        className="settings-card"
        style={{
          borderColor:
            "#f0d2d2",
        }}
      >
        <div className="settings-card-header">
          <div className="settings-icon">
            <I.AlertTriangle />
          </div>

          <div>
            <h2>
              Reset Demo Data
            </h2>

            <p>
              Restore the original sample
              laboratory records.
            </p>
          </div>
        </div>

        <Button
          danger
          icon={I.RotateCcw}
          onClick={reset}
        >
          Reset Demo Data
        </Button>
      </div>
    </Page>
  );
}

/* =========================================================
   LOGIN
   ========================================================= */

function Login({
  onLogin,
}) {
  const [username, setUsername] =
    useState("admin");

  const [password, setPassword] =
    useState("admin123");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const submit = (event) => {
    event.preventDefault();

    const users = read(
      STORAGE.users,
      defaultUsers
    );

    const user = users.find(
      (item) =>
        item.username ===
          username.trim() &&
        item.password ===
          password &&
        item.status === "Active"
    );

    if (!user) {
      setError(
        "Invalid username or password."
      );
      return;
    }

    onLogin(user);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          TAZ
        </div>

        <h1>
          TAZ COMPANY
        </h1>

        <p>
          Laboratory Management
          Software
        </p>

        {error && (
          <div className="alert error-alert">
            <I.AlertCircle
              size={17}
            />
            {error}
          </div>
        )}

        <form
          onSubmit={submit}
        >
          <div className="form-group">
            <label>
              Username
            </label>

            <input
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="Enter username"
            />
          </div>

          <div
            className="form-group"
            style={{
              marginTop: 16,
            }}
          >
            <label>
              Password
            </label>

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <input
                style={{
                  paddingRight: 45,
                }}
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={
                  password
                }
                onChange={(e) =>
                  setPassword(
                    e.target
                      .value
                  )
                }
                placeholder="Enter password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position:
                    "absolute",
                  right: 10,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: 0,
                  background:
                    "transparent",
                }}
              >
                {showPassword ? (
                  <I.EyeOff
                    size={18}
                  />
                ) : (
                  <I.Eye
                    size={18}
                  />
                )}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-large"
            style={{
              width: "100%",
              marginTop: 22,
            }}
            type="submit"
          >
            Login
          </button>
        </form>

        <div className="login-demo">
          <strong>
            Demo Credentials
          </strong>

          <div>
            Administrator:
            <b>
              {" "}
              admin / admin123
            </b>
          </div>

          <div>
            Lab Technician:
            <b>
              {" "}
              technician / tech123
            </b>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
   ========================================================= */

const MENU = [
  [
    "/dashboard",
    "Dashboard",
    I.LayoutDashboard,
  ],
  [
    "/patients/new",
    "Patient Entry",
    I.UserPlus,
  ],
  [
    "/patients",
    "Patients",
    I.Users,
  ],
  [
    "/doctors",
    "Doctors",
    I.Stethoscope,
  ],
  [
    "/tests",
    "Test Management",
    I.FlaskConical,
  ],
  [
    "/test-master",
    "Test Master",
    I.TestTube2,
  ],
  [
    "/reports",
    "Reports",
    I.FileText,
  ],
  [
    "/messages",
    "Messages",
    I.MessageSquare,
  ],
  [
    "/billing",
    "Billing",
    I.CreditCard,
  ],
  [
    "/analytics",
    "Analytics",
    I.BarChart3,
  ],
  [
    "/branches",
    "Branches",
    I.Building2,
  ],
  [
    "/users",
    "Users",
    I.UserCog,
  ],
  [
    "/settings",
    "Settings",
    I.Settings,
  ],
];

/* =========================================================
   APP LAYOUT
   ========================================================= */

function Layout({
  user,
  path,
  children,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  const currentMenu =
    MENU.find(
      (item) =>
        item[0] === path
    );

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${
          mobileOpen
            ? "open"
            : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            TAZ
          </div>

          <div className="sidebar-brand-text">
            <strong>
              TAZ COMPANY
            </strong>

            <span>
              Laboratory Management
            </span>
          </div>

          <button
            className="icon-btn"
            style={{
              display:
                "none",
              marginLeft:
                "auto",
              background:
                "rgba(255,255,255,.1)",
              color: "white",
            }}
            onClick={() =>
              setMobileOpen(
                false
              )
            }
          >
            <I.X size={17} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">
            Main Menu
          </div>

          {MENU.map(
            ([
              route,
              label,
              Icon,
            ]) => (
              <button
                key={route}
                className={
                  path === route
                    ? "active"
                    : ""
                }
                onClick={() =>
                  navigate(route)
                }
              >
                <Icon size={17} />
                <span>
                  {label}
                </span>
              </button>
            )
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="user-avatar">
              {(
                user.name ||
                "U"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user.name}
              </strong>

              <small>
                {user.role}
              </small>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={
              onLogout
            }
          >
            <I.LogOut
              size={16}
            />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              onClick={() =>
                setMobileOpen(
                  true
                )
              }
            >
              <I.Menu size={20} />
            </button>

            <div className="breadcrumb">
              TAZ COMPANY

              <span
                style={{
                  margin:
                    "0 7px",
                }}
              >
                /
              </span>

              <strong>
                {currentMenu?.[1] ||
                  "Dashboard"}
              </strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-user">
              <div className="topbar-avatar">
                {(
                  user.name ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user.name}
                </strong>

                <span
                  style={{
                    display:
                      "block",
                    color:
                      "#777",
                    fontSize:
                      11,
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

/* =========================================================
   ROUTES
   ========================================================= */

const ROUTES = {
  "/dashboard": Dashboard,
  "/patients/new": PatientEntry,
  "/patients": Patients,
  "/doctors": Doctors,
  "/tests": TestManagement,
  "/test-master": TestMaster,
  "/reports": Reports,
  "/messages": Messages,
  "/billing": Billing,
  "/analytics": Analytics,
  "/branches": Branches,
  "/users": UsersPage,
  "/settings": Settings,
};

/* =========================================================
   APP
   ========================================================= */

export default function App() {
  const [initialized, setInitialized] =
    useState(false);

  const [user, setUser] =
    useState(() =>
      read(
        STORAGE.session,
        null
      )
    );

  const [path, setPath] =
    useState(
      window.location.pathname ||
        "/dashboard"
    );

  useEffect(() => {
    initializeData();
    setInitialized(true);
  }, []);

  useEffect(() => {
    const handleNavigation =
      () => {
        setPath(
          window.location.pathname ||
            "/dashboard"
        );
      };

    window.addEventListener(
      "popstate",
      handleNavigation
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handleNavigation
      );
    };
  }, []);

  const login = (loggedUser) => {
    localStorage.setItem(
      STORAGE.session,
      JSON.stringify(
        loggedUser
      )
    );

    setUser(loggedUser);

    navigate(
      "/dashboard"
    );
  };

  const logout = () => {
    localStorage.removeItem(
      STORAGE.session
    );

    setUser(null);

    navigate(
      "/dashboard"
    );
  };

  if (!initialized) {
    return null;
  }

  if (!user) {
    return (
      <Login
        onLogin={login}
      />
    );
  }

  const CurrentPage =
    ROUTES[path] ||
    Dashboard;

  return (
    <Layout
      user={user}
      path={path}
      onLogout={logout}
    >
      <CurrentPage />
    </Layout>
  );
}