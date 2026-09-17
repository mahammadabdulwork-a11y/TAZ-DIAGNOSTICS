import React, { useEffect, useRef, useState } from "react";
import {
  UserPlus,
  Search,
  ChevronDown,
  X,
  FlaskConical,
  Trash2,
  Save,
  RotateCcw,
} from "lucide-react";

const PATIENT_KEY = "taz_company_patients";
const TEST_KEY = "taz_company_test_master";
const DOCTOR_KEY = "taz_company_doctors";

const DEFAULT_TESTS = [
  {
    id: "TEST001",
    code: "CBC",
    name: "Complete Blood Count",
    category: "Hematology",
    specimen: "Blood",
    unit: "Various",
    referenceRange: "See individual parameters",
    price: 350,
    status: "Active",
  },
  {
    id: "TEST002",
    code: "HB",
    name: "Hemoglobin",
    category: "Hematology",
    specimen: "Blood",
    unit: "g/dL",
    referenceRange: "Male: 13-17 | Female: 12-15",
    price: 150,
    status: "Active",
  },
  {
    id: "TEST003",
    code: "WBC",
    name: "White Blood Cell Count",
    category: "Hematology",
    specimen: "Blood",
    unit: "cells/µL",
    referenceRange: "4,000-11,000",
    price: 180,
    status: "Active",
  },
  {
    id: "TEST004",
    code: "RBS",
    name: "Random Blood Sugar",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "mg/dL",
    referenceRange: "70-140",
    price: 120,
    status: "Active",
  },
  {
    id: "TEST005",
    code: "FBS",
    name: "Fasting Blood Sugar",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "mg/dL",
    referenceRange: "70-100",
    price: 120,
    status: "Active",
  },
  {
    id: "TEST006",
    code: "PPBS",
    name: "Post Prandial Blood Sugar",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "mg/dL",
    referenceRange: "Less than 140",
    price: 120,
    status: "Active",
  },
  {
    id: "TEST007",
    code: "HBA1C",
    name: "HbA1c",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "%",
    referenceRange: "Normal: <5.7",
    price: 450,
    status: "Active",
  },
  {
    id: "TEST008",
    code: "LFT",
    name: "Liver Function Test",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "Various",
    referenceRange: "See individual parameters",
    price: 650,
    status: "Active",
  },
  {
    id: "TEST009",
    code: "KFT",
    name: "Kidney Function Test",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "Various",
    referenceRange: "See individual parameters",
    price: 650,
    status: "Active",
  },
  {
    id: "TEST010",
    code: "LIPID",
    name: "Lipid Profile",
    category: "Biochemistry",
    specimen: "Blood",
    unit: "mg/dL",
    referenceRange: "See individual parameters",
    price: 550,
    status: "Active",
  },
  {
    id: "TEST011",
    code: "TSH",
    name: "Thyroid Stimulating Hormone",
    category: "Hormones",
    specimen: "Blood",
    unit: "µIU/mL",
    referenceRange: "0.4-4.0",
    price: 350,
    status: "Active",
  },
  {
    id: "TEST012",
    code: "T3",
    name: "Triiodothyronine",
    category: "Hormones",
    specimen: "Blood",
    unit: "ng/mL",
    referenceRange: "0.8-2.0",
    price: 300,
    status: "Active",
  },
  {
    id: "TEST013",
    code: "T4",
    name: "Thyroxine",
    category: "Hormones",
    specimen: "Blood",
    unit: "µg/dL",
    referenceRange: "5-12",
    price: 300,
    status: "Active",
  },
  {
    id: "TEST014",
    code: "URINE",
    name: "Urine Routine Examination",
    category: "Clinical Pathology",
    specimen: "Urine",
    unit: "Various",
    referenceRange: "Normal",
    price: 200,
    status: "Active",
  },
  {
    id: "TEST015",
    code: "CRP",
    name: "C-Reactive Protein",
    category: "Immunology",
    specimen: "Blood",
    unit: "mg/L",
    referenceRange: "<5",
    price: 400,
    status: "Active",
  },
];

function loadTests() {
  const keys = [
    TEST_KEY,
    "taz_company_tests",
    "taz_company_testmaster",
    "taz_tests",
  ];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);

      if (raw) {
        const data = JSON.parse(raw);

        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(TEST_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // ignore
    }
  }

  localStorage.setItem(TEST_KEY, JSON.stringify(DEFAULT_TESTS));
  return DEFAULT_TESTS;
}

function loadDoctors() {
  try {
    const data = JSON.parse(
      localStorage.getItem(DOCTOR_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function loadPatients() {
  try {
    const data = JSON.parse(
      localStorage.getItem(PATIENT_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function generatePatientId() {
  const patients = loadPatients();

  const nums = patients
    .map((p) => Number(String(p.id || "").replace(/\D/g, "")))
    .filter(Boolean);

  const next = nums.length ? Math.max(...nums) + 1 : 1;

  return `PAT${String(next).padStart(3, "0")}`;
}

export default function PatientEntry() {
  const [tests, setTests] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    id: generatePatientId(),
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    referredBy: "",
    branch: "Main Branch",
    tests: [],
  });

  const [doctorOpen, setDoctorOpen] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");

  const [testOpen, setTestOpen] = useState(false);
  const [testSearch, setTestSearch] = useState("");

  const doctorRef = useRef(null);
  const testRef = useRef(null);

  useEffect(() => {
    setTests(loadTests());
    setDoctors(loadDoctors());

    const outside = (event) => {
      if (
        doctorRef.current &&
        !doctorRef.current.contains(event.target)
      ) {
        setDoctorOpen(false);
      }

      if (
        testRef.current &&
        !testRef.current.contains(event.target)
      ) {
        setTestOpen(false);
      }
    };

    document.addEventListener("mousedown", outside);

    return () => {
      document.removeEventListener("mousedown", outside);
    };
  }, []);

  const activeTests = tests.filter(
    (test) => test.status !== "Inactive"
  );

  const filteredDoctors = doctors.filter((doctor) => {
    const q = doctorSearch.toLowerCase();

    return (
      !q ||
      String(doctor.name || "").toLowerCase().includes(q) ||
      String(doctor.specialization || "")
        .toLowerCase()
        .includes(q)
    );
  });

  const filteredTests = activeTests.filter((test) => {
    const q = testSearch.toLowerCase();

    return (
      !q ||
      String(test.name || "").toLowerCase().includes(q) ||
      String(test.code || "").toLowerCase().includes(q) ||
      String(test.category || "").toLowerCase().includes(q)
    );
  });

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectDoctor = (doctor) => {
    update("referredBy", doctor);
    setDoctorSearch("");
    setDoctorOpen(false);
  };

  const selectSelf = () => {
    update("referredBy", {
      id: "SELF",
      name: "Self",
      specialization: "Self Referral",
    });

    setDoctorSearch("");
    setDoctorOpen(false);
  };

  const removeDoctor = () => {
    update("referredBy", "");
  };

  const addTest = (test) => {
    const alreadyAdded = form.tests.some(
      (item) => item.id === test.id
    );

    if (alreadyAdded) {
      setTestOpen(false);
      setTestSearch("");
      return;
    }

    update("tests", [
      ...form.tests,
      {
        id: test.id,
        code: test.code,
        name: test.name,
        category: test.category,
        specimen: test.specimen,
        unit: test.unit,
        referenceRange: test.referenceRange,
        price: Number(test.price || 0),
        result: "",
        status: "Pending",
      },
    ]);

    setTestSearch("");
    setTestOpen(false);
  };

  const removeTest = (testId) => {
    update(
      "tests",
      form.tests.filter((test) => test.id !== testId)
    );
  };

  const clearForm = () => {
    setForm({
      id: generatePatientId(),
      name: "",
      age: "",
      gender: "Male",
      phone: "",
      email: "",
      address: "",
      referredBy: "",
      branch: "Main Branch",
      tests: [],
    });

    setDoctorSearch("");
    setTestSearch("");
    setDoctorOpen(false);
    setTestOpen(false);
  };

  const savePatient = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter patient name.");
      return;
    }

    if (!form.phone.trim()) {
      alert("Please enter patient phone number.");
      return;
    }

    if (form.tests.length === 0) {
      alert("Please select at least one test for this patient.");
      return;
    }

    const patients = loadPatients();

    const patient = {
      ...form,
      id: form.id || generatePatientId(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      age: form.age,
      address: form.address.trim(),
      referredBy: form.referredBy
        ? {
            id: form.referredBy.id || "",
            name: form.referredBy.name || "",
            specialization:
              form.referredBy.specialization || "",
          }
        : "",
      tests: form.tests,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...patients, patient];

    localStorage.setItem(
      PATIENT_KEY,
      JSON.stringify(updated)
    );

    alert(
      `Patient saved successfully.\nPatient ID: ${patient.id}\nTests Added: ${patient.tests.length}`
    );

    clearForm();
  };

  return (
    <div className="pe-page">
      <form onSubmit={savePatient}>
        <div className="pe-card">
          <div className="pe-title">
            <div>
              <h1>Patient Entry</h1>
              <p>
                Register a patient and assign laboratory tests.
              </p>
            </div>

            <span className="pe-auto">AUTO ID</span>
          </div>

          <div className="pe-section">
            <div className="pe-section-head">
              <div>
                <h2>Patient Information</h2>
                <p>Patient ID will be generated automatically.</p>
              </div>
            </div>

            <div className="pe-grid">
              <label>
                Patient ID
                <input value={form.id} readOnly />
              </label>

              <label>
                Patient Name *
                <input
                  value={form.name}
                  onChange={(e) =>
                    update("name", e.target.value)
                  }
                  placeholder="Enter patient name"
                />
              </label>

              <label>
                Age
                <input
                  type="number"
                  min="0"
                  value={form.age}
                  onChange={(e) =>
                    update("age", e.target.value)
                  }
                  placeholder="Age"
                />
              </label>

              <label>
                Gender
                <select
                  value={form.gender}
                  onChange={(e) =>
                    update("gender", e.target.value)
                  }
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Phone *
                <input
                  value={form.phone}
                  onChange={(e) =>
                    update("phone", e.target.value)
                  }
                  placeholder="10 digit mobile number"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    update("email", e.target.value)
                  }
                  placeholder="Optional email"
                />
              </label>

              <label className="pe-full">
                Address
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    update("address", e.target.value)
                  }
                  placeholder="Patient address"
                />
              </label>
            </div>
          </div>

          <div className="pe-section">
            <div className="pe-grid">
              <label>
                Referred By Doctor
                <div className="pe-dropdown" ref={doctorRef}>
                  <button
                    type="button"
                    className="pe-select-button"
                    onClick={() =>
                      setDoctorOpen((prev) => !prev)
                    }
                  >
                    <span>
                      {form.referredBy
                        ? form.referredBy.name
                        : "Search doctor or choose Self"}
                    </span>

                    {form.referredBy ? (
                      <X
                        size={17}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDoctor();
                        }}
                      />
                    ) : (
                      <ChevronDown size={17} />
                    )}
                  </button>

                  {doctorOpen && (
                    <div className="pe-dropdown-menu">
                      <div className="pe-dropdown-search">
                        <Search size={16} />
                        <input
                          autoFocus
                          value={doctorSearch}
                          onChange={(e) =>
                            setDoctorSearch(e.target.value)
                          }
                          placeholder="Search doctor..."
                        />
                      </div>

                      <button
                        type="button"
                        className="pe-option self"
                        onClick={selectSelf}
                      >
                        <UserPlus size={16} />
                        Self
                      </button>

                      {filteredDoctors.map((doctor) => (
                        <button
                          type="button"
                          className="pe-option"
                          key={doctor.id}
                          onClick={() => selectDoctor(doctor)}
                        >
                          <div>
                            <strong>{doctor.name}</strong>
                            <small>
                              {doctor.specialization || ""}
                            </small>
                          </div>
                        </button>
                      ))}

                      {filteredDoctors.length === 0 && (
                        <div className="pe-no-results">
                          No doctors found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </label>

              <label>
                Branch
                <select
                  value={form.branch}
                  onChange={(e) =>
                    update("branch", e.target.value)
                  }
                >
                  <option>Main Branch</option>
                  <option>Branch 2</option>
                  <option>Branch 3</option>
                  <option>Branch 4</option>
                </select>
              </label>
            </div>
          </div>

          {/* TEST SECTION */}
          <div className="pe-section test-section">
            <div className="pe-section-head test-heading">
              <div>
                <h2>
                  <FlaskConical size={21} />
                  Laboratory Tests
                </h2>
                <p>
                  Select the tests required for this patient.
                </p>
              </div>

              <span className="test-count">
                {form.tests.length} Test
                {form.tests.length !== 1 ? "s" : ""} Selected
              </span>
            </div>

            <div className="test-picker" ref={testRef}>
              <button
                type="button"
                className="test-picker-button"
                onClick={() => setTestOpen((prev) => !prev)}
              >
                <div>
                  <Search size={18} />
                  <span>
                    {testOpen
                      ? "Search and select a laboratory test..."
                      : "Click here to select laboratory tests"}
                  </span>
                </div>

                <ChevronDown size={18} />
              </button>

              {testOpen && (
                <div className="test-dropdown">
                  <div className="test-search">
                    <Search size={17} />
                    <input
                      autoFocus
                      value={testSearch}
                      onChange={(e) =>
                        setTestSearch(e.target.value)
                      }
                      placeholder="Search test by name, code or category..."
                    />
                  </div>

                  {filteredTests.map((test) => {
                    const alreadySelected = form.tests.some(
                      (item) => item.id === test.id
                    );

                    return (
                      <button
                        type="button"
                        key={test.id}
                        className={`test-option ${
                          alreadySelected ? "selected" : ""
                        }`}
                        onClick={() => addTest(test)}
                      >
                        <div className="test-option-main">
                          <strong>{test.name}</strong>

                          <span>
                            {test.code} • {test.category}
                          </span>
                        </div>

                        <div className="test-option-meta">
                          <span>{test.unit || "—"}</span>
                          <b>
                            ₹
                            {Number(
                              test.price || 0
                            ).toLocaleString()}
                          </b>
                        </div>
                      </button>
                    );
                  })}

                  {filteredTests.length === 0 && (
                    <div className="test-no-results">
                      <FlaskConical size={25} />
                      <strong>No matching tests</strong>
                      <span>
                        Add tests from Test Master first.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {form.tests.length > 0 ? (
              <div className="selected-tests">
                <div className="selected-tests-head">
                  <strong>Selected Tests</strong>
                  <span>
                    {form.tests.length} assigned
                  </span>
                </div>

                {form.tests.map((test, index) => (
                  <div className="selected-test" key={test.id}>
                    <div className="selected-number">
                      {index + 1}
                    </div>

                    <div className="selected-info">
                      <strong>{test.name}</strong>

                      <div className="selected-details">
                        <span>
                          Code: {test.code || "-"}
                        </span>

                        <span>
                          Category: {test.category || "-"}
                        </span>

                        <span>
                          Specimen: {test.specimen || "-"}
                        </span>

                        <span>
                          Unit: {test.unit || "-"}
                        </span>

                        <span>
                          Reference:{" "}
                          {test.referenceRange || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="selected-price">
                      ₹{Number(test.price || 0).toLocaleString()}
                    </div>

                    <button
                      type="button"
                      className="remove-test"
                      onClick={() => removeTest(test.id)}
                      title="Remove test"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}

                <div className="test-total">
                  <span>Total Test Charges</span>
                  <strong>
                    ₹
                    {form.tests
                      .reduce(
                        (sum, test) =>
                          sum + Number(test.price || 0),
                        0
                      )
                      .toLocaleString()}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="no-tests-selected">
                <FlaskConical size={32} />
                <strong>No tests selected</strong>
                <span>
                  Use the button above to assign tests to this
                  patient.
                </span>
              </div>
            )}
          </div>

          <div className="pe-footer">
            <button
              type="button"
              className="pe-clear"
              onClick={clearForm}
            >
              <RotateCcw size={17} />
              Clear
            </button>

            <button type="submit" className="pe-save">
              <Save size={17} />
              Save Patient
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .pe-page {
          padding: 28px;
          color: #3a0610;
        }

        .pe-card {
          background: white;
          border: 1px solid #eadde0;
          border-radius: 16px;
          overflow: visible;
        }

        .pe-title {
          padding: 25px 28px;
          border-bottom: 1px solid #eee3e5;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pe-title h1 {
          margin: 0 0 5px;
          font-size: 26px;
        }

        .pe-title p {
          margin: 0;
          color: #876f76;
          font-size: 13px;
        }

        .pe-auto {
          background: #f8e9ed;
          color: #7b0c25;
          padding: 7px 12px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 800;
        }

        .pe-section {
          padding: 25px 28px;
          border-bottom: 1px solid #eee3e5;
        }

        .pe-section-head {
          margin-bottom: 20px;
        }

        .pe-section-head h2 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .pe-section-head p {
          margin: 0;
          color: #876f76;
          font-size: 13px;
        }

        .pe-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .pe-grid label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-size: 13px;
          font-weight: 700;
        }

        .pe-full {
          grid-column: 1 / -1;
        }

        .pe-grid input,
        .pe-grid select,
        .pe-grid textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dfcdd2;
          border-radius: 9px;
          padding: 12px 14px;
          outline: none;
          color: #3a0610;
          background: white;
          font-size: 14px;
        }

        .pe-grid input,
        .pe-grid select {
          height: 46px;
        }

        .pe-grid textarea {
          min-height: 82px;
          resize: vertical;
        }

        .pe-grid input:focus,
        .pe-grid select:focus,
        .pe-grid textarea:focus {
          border-color: #8b1730;
          box-shadow: 0 0 0 3px #f8e9ed;
        }

        .pe-grid input[readonly] {
          background: #f8f3f4;
          color: #8b747b;
        }

        .pe-dropdown {
          position: relative;
        }

        .pe-select-button {
          height: 46px;
          width: 100%;
          background: white;
          border: 1px solid #dfcdd2;
          border-radius: 9px;
          padding: 0 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #3a0610;
          cursor: pointer;
          text-align: left;
        }

        .pe-dropdown-menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e1d1d5;
          border-radius: 10px;
          box-shadow: 0 15px 40px rgba(54, 7, 16, .16);
          z-index: 500;
          overflow: hidden;
        }

        .pe-dropdown-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-bottom: 1px solid #eee3e5;
        }

        .pe-dropdown-search input {
          height: 38px;
          border: 0;
          outline: 0;
          padding: 0;
          box-shadow: none;
        }

        .pe-option {
          width: 100%;
          border: 0;
          background: white;
          padding: 11px 14px;
          text-align: left;
          cursor: pointer;
          color: #3a0610;
        }

        .pe-option:hover {
          background: #fbf1f3;
        }

        .pe-option strong,
        .pe-option small {
          display: block;
        }

        .pe-option small {
          margin-top: 3px;
          color: #8b747b;
        }

        .pe-option.self {
          color: #7b0c25;
          font-weight: 700;
          border-bottom: 1px solid #eee3e5;
        }

        .pe-no-results {
          padding: 18px;
          text-align: center;
          color: #8b747b;
        }

        .test-section {
          background: #fffdfd;
          position: relative;
          z-index: 2;
        }

        .test-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .test-heading h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #5b0a1a;
        }

        .test-count {
          background: #f8e9ed;
          color: #7b0c25;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .test-picker {
          position: relative;
        }

        .test-picker-button {
          width: 100%;
          height: 52px;
          background: white;
          border: 1.5px solid #cfaeb7;
          border-radius: 10px;
          padding: 0 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          color: #6f5960;
        }

        .test-picker-button:hover {
          border-color: #8b1730;
        }

        .test-picker-button > div {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .test-picker-button svg {
          color: #7b0c25;
        }

        .test-dropdown {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 6px);
          background: white;
          border: 1px solid #decdd1;
          border-radius: 10px;
          box-shadow: 0 20px 50px rgba(49, 6, 14, .2);
          z-index: 1000;
          overflow: hidden;
          max-height: 380px;
          overflow-y: auto;
        }

        .test-search {
          position: sticky;
          top: 0;
          z-index: 2;
          background: white;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px;
          border-bottom: 1px solid #eee3e5;
        }

        .test-search svg {
          color: #8b1730;
        }

        .test-search input {
          flex: 1;
          height: 38px;
          border: 0;
          outline: 0;
          padding: 0;
          color: #3a0610;
        }

        .test-option {
          width: 100%;
          border: 0;
          border-bottom: 1px solid #f1e7e9;
          background: white;
          padding: 13px 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          color: #3a0610;
        }

        .test-option:hover {
          background: #fbf0f2;
        }

        .test-option.selected {
          background: #f8e9ed;
        }

        .test-option-main strong {
          display: block;
          font-size: 14px;
        }

        .test-option-main span {
          display: block;
          color: #8a747b;
          font-size: 11px;
          margin-top: 4px;
        }

        .test-option-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          color: #765e65;
          font-size: 12px;
        }

        .test-option-meta b {
          color: #5b0a1a;
        }

        .test-no-results {
          padding: 35px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          color: #8a747b;
        }

        .test-no-results svg {
          color: #8b1730;
        }

        .selected-tests {
          margin-top: 18px;
          border: 1px solid #eadde0;
          border-radius: 11px;
          overflow: hidden;
          background: white;
        }

        .selected-tests-head {
          padding: 13px 15px;
          display: flex;
          justify-content: space-between;
          background: #fbf5f6;
          border-bottom: 1px solid #eadde0;
        }

        .selected-tests-head span {
          color: #8a747b;
          font-size: 12px;
        }

        .selected-test {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px;
          border-bottom: 1px solid #eee5e7;
        }

        .selected-number {
          width: 31px;
          height: 31px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #f8e9ed;
          color: #7b0c25;
          font-weight: 800;
          font-size: 12px;
          flex-shrink: 0;
        }

        .selected-info {
          flex: 1;
          min-width: 0;
        }

        .selected-info > strong {
          display: block;
          margin-bottom: 6px;
        }

        .selected-details {
          display: flex;
          flex-wrap: wrap;
          gap: 7px 15px;
          color: #806a70;
          font-size: 11px;
        }

        .selected-price {
          font-weight: 800;
          color: #5b0a1a;
        }

        .remove-test {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 7px;
          background: #faecef;
          color: #a21a34;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .test-total {
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 18px;
          background: #fffafb;
        }

        .test-total span {
          color: #806a70;
          font-size: 13px;
        }

        .test-total strong {
          font-size: 18px;
          color: #5b0a1a;
        }

        .no-tests-selected {
          margin-top: 18px;
          padding: 35px;
          border: 1px dashed #d9c2c8;
          border-radius: 11px;
          background: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          color: #816b72;
          text-align: center;
        }

        .no-tests-selected svg {
          color: #8b1730;
        }

        .no-tests-selected strong {
          color: #5b0a1a;
        }

        .pe-footer {
          padding: 20px 28px;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          background: #fff;
        }

        .pe-clear,
        .pe-save {
          border: 0;
          border-radius: 9px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          cursor: pointer;
        }

        .pe-clear {
          background: #f3e9eb;
          color: #5b0a1a;
        }

        .pe-save {
          background: #7b0c25;
          color: white;
        }

        .pe-save:hover {
          background: #5b0a1a;
        }

        @media (max-width: 850px) {
          .pe-page {
            padding: 15px;
          }

          .pe-grid {
            grid-template-columns: 1fr;
          }

          .pe-full {
            grid-column: auto;
          }

          .test-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .selected-test {
            align-items: flex-start;
          }

          .selected-details {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}