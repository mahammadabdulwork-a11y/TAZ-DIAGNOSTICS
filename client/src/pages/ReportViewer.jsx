import React, { useMemo, useState } from "react";
import {
  Printer,
  Download,
  Search,
  Plus,
  X,
  Save,
  FileText,
  UserRound,
  Stethoscope,
  TestTube2,
  CalendarDays,
  Phone,
  MapPin,
  CheckCircle2,
  ChevronDown,
  Trash2,
  Eye,
  RotateCcw,
} from "lucide-react";

const doctors = [
  {
    id: "DOC001",
    name: "Dr. Ahmed Khan",
    qualification: "MBBS, MD",
    specialization: "General Medicine",
  },
  {
    id: "DOC002",
    name: "Dr. Priya Sharma",
    qualification: "MBBS, MD",
    specialization: "Internal Medicine",
  },
  {
    id: "DOC003",
    name: "Dr. Ravi Kumar",
    qualification: "MBBS, DNB",
    specialization: "Pathology",
  },
  {
    id: "DOC004",
    name: "Dr. Fatima Rahman",
    qualification: "MBBS, MD",
    specialization: "Gynecology",
  },
];

const patients = [
  {
    id: "TAZ0001",
    name: "Mohammed Ahmed",
    age: 42,
    gender: "Male",
    phone: "9000000001",
    dob: "1984-04-12",
    bloodGroup: "B+",
    address: "Hyderabad, Telangana",
  },
  {
    id: "TAZ0002",
    name: "Ayesha Begum",
    age: 35,
    gender: "Female",
    phone: "9000000002",
    dob: "1991-01-22",
    bloodGroup: "O+",
    address: "Hyderabad, Telangana",
  },
  {
    id: "TAZ0003",
    name: "Rahul Kumar",
    age: 28,
    gender: "Male",
    phone: "9000000003",
    dob: "1998-06-17",
    bloodGroup: "A+",
    address: "Secunderabad, Telangana",
  },
  {
    id: "TAZ0004",
    name: "Fatima Khan",
    age: 51,
    gender: "Female",
    phone: "9000000004",
    dob: "1975-03-09",
    bloodGroup: "AB+",
    address: "Hyderabad, Telangana",
  },
];

const testMaster = [
  {
    id: "TST001",
    name: "Hemoglobin",
    shortName: "Hb",
    category: "Hematology",
    unit: "g/dL",
    maleRange: "13.0 - 17.0",
    femaleRange: "12.0 - 15.0",
    childRange: "11.0 - 14.0",
  },
  {
    id: "TST002",
    name: "Total Leukocyte Count",
    shortName: "TLC",
    category: "Hematology",
    unit: "cells/µL",
    maleRange: "4,000 - 11,000",
    femaleRange: "4,000 - 11,000",
    childRange: "5,000 - 15,000",
  },
  {
    id: "TST003",
    name: "Platelet Count",
    shortName: "PLT",
    category: "Hematology",
    unit: "lakhs/µL",
    maleRange: "1.5 - 4.5",
    femaleRange: "1.5 - 4.5",
    childRange: "1.5 - 4.5",
  },
  {
    id: "TST004",
    name: "Fasting Blood Glucose",
    shortName: "FBS",
    category: "Biochemistry",
    unit: "mg/dL",
    maleRange: "70 - 100",
    femaleRange: "70 - 100",
    childRange: "70 - 100",
  },
  {
    id: "TST005",
    name: "Post Prandial Blood Glucose",
    shortName: "PPBS",
    category: "Biochemistry",
    unit: "mg/dL",
    maleRange: "Less than 140",
    femaleRange: "Less than 140",
    childRange: "Less than 140",
  },
  {
    id: "TST006",
    name: "Creatinine",
    shortName: "CREA",
    category: "Biochemistry",
    unit: "mg/dL",
    maleRange: "0.7 - 1.3",
    femaleRange: "0.6 - 1.1",
    childRange: "0.3 - 0.7",
  },
  {
    id: "TST007",
    name: "Total Cholesterol",
    shortName: "TC",
    category: "Lipid Profile",
    unit: "mg/dL",
    maleRange: "Less than 200",
    femaleRange: "Less than 200",
    childRange: "Less than 170",
  },
  {
    id: "TST008",
    name: "TSH",
    shortName: "TSH",
    category: "Hormones",
    unit: "µIU/mL",
    maleRange: "0.4 - 4.0",
    femaleRange: "0.4 - 4.0",
    childRange: "0.7 - 6.4",
  },
  {
    id: "TST009",
    name: "Alanine Transaminase",
    shortName: "ALT / SGPT",
    category: "Liver Function",
    unit: "U/L",
    maleRange: "7 - 56",
    femaleRange: "7 - 45",
    childRange: "10 - 40",
  },
  {
    id: "TST010",
    name: "Aspartate Transaminase",
    shortName: "AST / SGOT",
    category: "Liver Function",
    unit: "U/L",
    maleRange: "10 - 40",
    femaleRange: "9 - 32",
    childRange: "15 - 55",
  },
];

const initialReports = [
  {
    id: "RPT20260001",
    patientId: "TAZ0001",
    patientName: "Mohammed Ahmed",
    doctorId: "DOC001",
    doctorName: "Dr. Ahmed Khan",
    date: "2026-08-30",
    status: "Completed",
    tests: [
      {
        testId: "TST001",
        name: "Hemoglobin",
        result: "14.2",
        unit: "g/dL",
        range: "13.0 - 17.0",
      },
      {
        testId: "TST002",
        name: "Total Leukocyte Count",
        result: "7600",
        unit: "cells/µL",
        range: "4,000 - 11,000",
      },
    ],
  },
];

const emptyReport = {
  patientId: "",
  doctorId: "",
  tests: [],
  clinicalNotes: "",
};

function ReportViewer() {
  const [reports, setReports] =
    useState(initialReports);

  const [report, setReport] =
    useState(emptyReport);

  const [selectedReport, setSelectedReport] =
    useState(null);

  const [showCreate, setShowCreate] =
    useState(false);

  const [showPreview, setShowPreview] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [resultDrafts, setResultDrafts] =
    useState({});

  const selectedPatient = useMemo(
    () =>
      patients.find(
        (patient) =>
          patient.id ===
          report.patientId
      ),
    [report.patientId]
  );

  const selectedDoctor = useMemo(
    () =>
      doctors.find(
        (doctor) =>
          doctor.id ===
          report.doctorId
      ),
    [report.doctorId]
  );

  const filteredReports =
    reports.filter((item) => {
      const query =
        search.toLowerCase();

      return (
        item.id
          .toLowerCase()
          .includes(query) ||
        item.patientName
          .toLowerCase()
          .includes(query) ||
        item.doctorName
          .toLowerCase()
          .includes(query)
      );
    });

  const openCreate = () => {
    setReport(emptyReport);
    setResultDrafts({});
    setShowCreate(true);
  };

  const closeCreate = () => {
    setShowCreate(false);
    setReport(emptyReport);
    setResultDrafts({});
  };

  const selectPatient = (patientId) => {
    setReport((current) => ({
      ...current,
      patientId,
    }));
  };

  const selectDoctor = (doctorId) => {
    setReport((current) => ({
      ...current,
      doctorId,
    }));
  };

  const addTest = (testId) => {
    const test =
      testMaster.find(
        (item) =>
          item.id === testId
      );

    if (!test) {
      return;
    }

    if (
      report.tests.some(
        (item) =>
          item.testId === test.id
      )
    ) {
      return;
    }

    const gender =
      selectedPatient?.gender;

    let range =
      test.maleRange;

    if (gender === "Female") {
      range =
        test.femaleRange;
    }

    if (
      selectedPatient &&
      selectedPatient.age < 18
    ) {
      range =
        test.childRange;
    }

    setReport((current) => ({
      ...current,
      tests: [
        ...current.tests,
        {
          testId: test.id,
          name: test.name,
          shortName:
            test.shortName,
          category:
            test.category,
          result: "",
          unit: test.unit,
          range,
        },
      ],
    }));

    setResultDrafts((current) => ({
      ...current,
      [test.id]: "",
    }));
  };

  const removeTest = (testId) => {
    setReport((current) => ({
      ...current,
      tests: current.tests.filter(
        (item) =>
          item.testId !== testId
      ),
    }));

    setResultDrafts((current) => {
      const next = {
        ...current,
      };

      delete next[testId];

      return next;
    });
  };

  const updateResult = (
    testId,
    value
  ) => {
    setResultDrafts((current) => ({
      ...current,
      [testId]: value,
    }));

    setReport((current) => ({
      ...current,
      tests: current.tests.map(
        (item) =>
          item.testId === testId
            ? {
                ...item,
                result: value,
              }
            : item
      ),
    }));
  };

  const saveReport = () => {
    if (!selectedPatient) {
      return;
    }

    if (report.tests.length === 0) {
      return;
    }

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const newReport = {
      id: `RPT${Date.now()}`,
      patientId:
        selectedPatient.id,
      patientName:
        selectedPatient.name,
      doctorId:
        selectedDoctor?.id || "",
      doctorName:
        selectedDoctor?.name ||
        "",
      date: today,
      status: "Completed",
      tests: report.tests,
      clinicalNotes:
        report.clinicalNotes,
    };

    setReports((current) => [
      newReport,
      ...current,
    ]);

    setSelectedReport(
      newReport
    );

    setShowCreate(false);
    setShowPreview(true);
  };

  const previewReport = (item) => {
    setSelectedReport(item);
    setShowPreview(true);
  };

  const printReport = () => {
    window.print();
  };

  const getRangeForPatient = (
    test,
    patient
  ) => {
    if (
      patient &&
      patient.age < 18
    ) {
      return test.childRange;
    }

    if (
      patient &&
      patient.gender ===
        "Female"
    ) {
      return test.femaleRange;
    }

    return test.maleRange;
  };

  return (
    <div className="reports-page">

      {/* HEADER */}

      <div className="page-header">

        <div className="page-header-text">

          <span className="page-eyebrow">
            DIAGNOSTIC REPORTING
          </span>

          <h1>
            Reports
          </h1>

          <p>
            Create, review and print professional
            TAZ Diagnostic laboratory reports.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={openCreate}
        >
          <Plus size={18} />
          New Report
        </button>

      </div>

      {/* REPORT STATS */}

      <div className="report-stat-grid">

        <div className="report-stat-card">

          <div className="report-stat-icon">
            <FileText size={20} />
          </div>

          <div>

            <span>
              Total Reports
            </span>

            <strong>
              {reports.length}
            </strong>

          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>

            <span>
              Completed
            </span>

            <strong>
              {
                reports.filter(
                  (item) =>
                    item.status ===
                    "Completed"
                ).length
              }
            </strong>

          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon">
            <TestTube2 size={20} />
          </div>

          <div>

            <span>
              Tests Reported
            </span>

            <strong>
              {reports.reduce(
                (total, item) =>
                  total +
                  item.tests.length,
                0
              )}
            </strong>

          </div>

        </div>

        <div className="report-stat-card">

          <div className="report-stat-icon">
            <UserRound size={20} />
          </div>

          <div>

            <span>
              Patients
            </span>

            <strong>
              {
                new Set(
                  reports.map(
                    (item) =>
                      item.patientId
                  )
                ).size
              }
            </strong>

          </div>

        </div>

      </div>

      {/* SEARCH */}

      <div className="reports-toolbar">

        <div className="reports-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search report ID, patient or doctor..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

      </div>

      {/* REPORT LIST */}

      <div className="reports-list-card">

        <div className="reports-list-header">

          <div>

            <span>
              REPORT REGISTER
            </span>

            <h2>
              Laboratory Reports
            </h2>

          </div>

          <span>
            {filteredReports.length} reports
          </span>

        </div>

        <div className="reports-table-wrapper">

          <table className="reports-table">

            <thead>

              <tr>
                <th>Report</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Tests</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {filteredReports.map(
                (item) => (

                  <tr key={item.id}>

                    <td>

                      <div className="report-id-cell">

                        <div className="report-id-icon">
                          <FileText
                            size={16}
                          />
                        </div>

                        <div>

                          <strong>
                            {item.id}
                          </strong>

                          <span>
                            Diagnostic Report
                          </span>

                        </div>

                      </div>

                    </td>

                    <td>

                      <div className="report-patient-cell">

                        <div className="small-avatar">
                          {item.patientName
                            .charAt(0)}
                        </div>

                        <span>
                          {item.patientName}
                        </span>

                      </div>

                    </td>

                    <td>
                      {item.doctorName ||
                        "Self / Walk-in"}
                    </td>

                    <td>

                      <span className="report-date">

                        <CalendarDays
                          size={14}
                        />

                        {formatDate(
                          item.date
                        )}

                      </span>

                    </td>

                    <td>
                      {item.tests.length}
                    </td>

                    <td>

                      <span className="report-status">
                        <span />
                        {item.status}
                      </span>

                    </td>

                    <td>

                      <button
                        className="report-view-button"
                        onClick={() =>
                          previewReport(
                            item
                          )
                        }
                      >
                        <Eye size={15} />
                        View
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

          {filteredReports.length ===
            0 && (

            <div className="reports-empty">

              <FileText size={36} />

              <h3>
                No reports found
              </h3>

              <p>
                Create a new laboratory report
                to get started.
              </p>

              <button
                className="primary-button"
                onClick={openCreate}
              >
                <Plus size={16} />
                New Report
              </button>

            </div>

          )}

        </div>

      </div>

      {/* CREATE REPORT */}

      {showCreate && (

        <div className="modal-overlay">

          <div className="report-create-modal">

            <div className="modal-header">

              <div>

                <span>
                  TAZ DIAGNOSTIC
                </span>

                <h2>
                  Create Laboratory Report
                </h2>

              </div>

              <button
                className="modal-close"
                onClick={closeCreate}
              >
                <X size={20} />
              </button>

            </div>

            <div className="report-create-body">

              {/* PATIENT */}

              <div className="report-create-section">

                <div className="report-section-heading">

                  <div className="report-section-icon">
                    <UserRound
                      size={18}
                    />
                  </div>

                  <div>

                    <span>
                      PATIENT INFORMATION
                    </span>

                    <h3>
                      Select Patient
                    </h3>

                  </div>

                </div>

                <div className="report-select-wrapper">

                  <UserRound
                    size={17}
                  />

                  <select
                    value={
                      report.patientId
                    }
                    onChange={(event) =>
                      selectPatient(
                        event.target
                          .value
                      )
                    }
                  >

                    <option value="">
                      Select patient...
                    </option>

                    {patients.map(
                      (patient) => (
                        <option
                          key={
                            patient.id
                          }
                          value={
                            patient.id
                          }
                        >
                          {patient.id} —{" "}
                          {patient.name}
                        </option>
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={16}
                  />

                </div>

                {selectedPatient && (

                  <div className="selected-patient-card">

                    <div className="selected-patient-avatar">
                      {selectedPatient.name
                        .charAt(0)}
                    </div>

                    <div>

                      <strong>
                        {
                          selectedPatient.name
                        }
                      </strong>

                      <span>
                        {
                          selectedPatient.id
                        }{" "}
                        •{" "}
                        {
                          selectedPatient.age
                        }{" "}
                        yrs •{" "}
                        {
                          selectedPatient.gender
                        }{" "}
                        •{" "}
                        {
                          selectedPatient.bloodGroup
                        }
                      </span>

                      <small>
                        <Phone size={12} />
                        {
                          selectedPatient.phone
                        }
                      </small>

                    </div>

                  </div>

                )}

              </div>

              {/* DOCTOR */}

              <div className="report-create-section">

                <div className="report-section-heading">

                  <div className="report-section-icon">
                    <Stethoscope
                      size={18}
                    />
                  </div>

                  <div>

                    <span>
                      REFERRING DOCTOR
                    </span>

                    <h3>
                      Select Doctor
                    </h3>

                  </div>

                </div>

                <div className="report-select-wrapper">

                  <Stethoscope
                    size={17}
                  />

                  <select
                    value={
                      report.doctorId
                    }
                    onChange={(event) =>
                      selectDoctor(
                        event.target
                          .value
                      )
                    }
                  >

                    <option value="">
                      No Doctor / Walk-in
                    </option>

                    {doctors.map(
                      (doctor) => (
                        <option
                          key={
                            doctor.id
                          }
                          value={
                            doctor.id
                          }
                        >
                          {doctor.name} —{" "}
                          {
                            doctor.specialization
                          }
                        </option>
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={16}
                  />

                </div>

                {selectedDoctor && (

                  <div className="selected-doctor-card">

                    <div className="selected-doctor-icon">
                      <Stethoscope
                        size={18}
                      />
                    </div>

                    <div>

                      <strong>
                        {
                          selectedDoctor.name
                        }
                      </strong>

                      <span>
                        {
                          selectedDoctor.qualification
                        }
                      </span>

                      <small>
                        {
                          selectedDoctor.specialization
                        }
                      </small>

                    </div>

                  </div>

                )}

              </div>

              {/* TESTS */}

              <div className="report-create-section">

                <div className="report-section-heading">

                  <div className="report-section-icon">
                    <TestTube2
                      size={18}
                    />
                  </div>

                  <div>

                    <span>
                      INVESTIGATIONS
                    </span>

                    <h3>
                      Add Tests & Enter Results
                    </h3>

                  </div>

                </div>

                <div className="report-test-add">

                  <select
                    defaultValue=""
                    onChange={(event) => {
                      if (
                        event.target
                          .value
                      ) {
                        addTest(
                          event.target
                            .value
                        );

                        event.target.value =
                          "";
                      }
                    }}
                  >

                    <option value="">
                      + Select test to add...
                    </option>

                    {testMaster.map(
                      (test) => (
                        <option
                          key={
                            test.id
                          }
                          value={
                            test.id
                          }
                        >
                          {test.name} (
                          {
                            test.shortName
                          }
                          )
                        </option>
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={16}
                  />

                </div>

                {report.tests.length >
                0 ? (

                  <div className="report-entry-table">

                    <div className="report-entry-header">

                      <span>
                        TEST NAME
                      </span>

                      <span>
                        RESULT
                      </span>

                      <span>
                        UNIT
                      </span>

                      <span>
                        REFERENCE RANGE
                      </span>

                      <span />

                    </div>

                    {report.tests.map(
                      (test) => (

                        <div
                          className="report-entry-row"
                          key={
                            test.testId
                          }
                        >

                          <div className="report-test-name">

                            <strong>
                              {test.name}
                            </strong>

                            <span>
                              {
                                test.category
                              }
                            </span>

                          </div>

                          <input
                            type="text"
                            placeholder="Enter result"
                            value={
                              resultDrafts[
                                test
                                  .testId
                              ] ||
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              updateResult(
                                test.testId,
                                event
                                  .target
                                  .value
                              )
                            }
                          />

                          <span className="report-unit">
                            {test.unit}
                          </span>

                          <span className="report-range">
                            {test.range}
                          </span>

                          <button
                            className="remove-test-button"
                            onClick={() =>
                              removeTest(
                                test.testId
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />
                          </button>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="report-no-tests">

                    <TestTube2
                      size={28}
                    />

                    <strong>
                      No tests added
                    </strong>

                    <span>
                      Select tests from the
                      dropdown above.
                    </span>

                  </div>

                )}

              </div>

              {/* NOTES */}

              <div className="report-create-section">

                <div className="report-section-heading">

                  <div className="report-section-icon">
                    <FileText
                      size={18}
                    />
                  </div>

                  <div>

                    <span>
                      ADDITIONAL INFORMATION
                    </span>

                    <h3>
                      Clinical Notes
                    </h3>

                  </div>

                </div>

                <textarea
                  className="report-notes"
                  rows="4"
                  placeholder="Enter clinical notes, comments or observations..."
                  value={
                    report.clinicalNotes
                  }
                  onChange={(event) =>
                    setReport(
                      (current) => ({
                        ...current,
                        clinicalNotes:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                />

              </div>

            </div>

            {/* FOOTER */}

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={closeCreate}
              >
                Cancel
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  setShowPreview(true)
                }
                disabled={
                  !selectedPatient ||
                  report.tests.length ===
                    0
                }
              >
                <Eye size={16} />
                Preview
              </button>

              <button
                className="primary-button"
                onClick={saveReport}
                disabled={
                  !selectedPatient ||
                  report.tests.length ===
                    0
                }
              >
                <Save size={17} />
                Save Report
              </button>

            </div>

          </div>

        </div>

      )}

      {/* PRINTABLE REPORT */}

      {showPreview &&
        selectedReport && (

        <div className="report-preview-overlay">

          <div className="report-preview-toolbar">

            <div>

              <span>
                REPORT PREVIEW
              </span>

              <strong>
                {selectedReport.id}
              </strong>

            </div>

            <div className="report-preview-actions">

              <button
                className="secondary-button"
                onClick={() =>
                  setShowPreview(false)
                }
              >
                <X size={16} />
                Close
              </button>

              <button
                className="secondary-button"
                onClick={() =>
                  window.location.reload()
                }
              >
                <RotateCcw size={16} />
                Reset
              </button>

              <button
                className="primary-button"
                onClick={printReport}
              >
                <Printer size={17} />
                Print Report
              </button>

              <button
                className="primary-button"
                onClick={printReport}
              >
                <Download size={17} />
                PDF / Save
              </button>

            </div>

          </div>

          <div className="print-report">

            {/* REPORT HEADER */}

            <div className="print-report-header">

              <div className="print-brand">

                <div className="print-logo">
                  TAZ
                </div>

                <div>

                  <h1>
                    TAZ DIAGNOSTIC
                  </h1>

                  <span>
                    ADVANCED DIAGNOSTIC &
                    LABORATORY CENTRE
                  </span>

                </div>

              </div>

              <div className="print-report-title">

                <span>
                  LABORATORY REPORT
                </span>

                <strong>
                  {selectedReport.id}
                </strong>

              </div>

            </div>

            <div className="print-accent-line" />

            {/* PATIENT INFORMATION */}

            <div className="print-section">

              <div className="print-section-title">
                <span>
                  PATIENT INFORMATION
                </span>
              </div>

              <div className="print-patient-grid">

                <PrintInfo
                  label="Patient Name"
                  value={
                    selectedReport.patientName
                  }
                />

                <PrintInfo
                  label="Patient ID"
                  value={
                    selectedReport.patientId
                  }
                />

                <PrintInfo
                  label="Report Date"
                  value={formatDate(
                    selectedReport.date
                  )}
                />

                <PrintInfo
                  label="Referring Doctor"
                  value={
                    selectedReport.doctorName ||
                    "Self / Walk-in"
                  }
                />

              </div>

              {(() => {
                const patient =
                  patients.find(
                    (item) =>
                      item.id ===
                      selectedReport.patientId
                  );

                if (!patient) {
                  return null;
                }

                return (
                  <div className="print-patient-secondary">

                    <span>
                      Age:{" "}
                      <strong>
                        {patient.age}
                      </strong>
                    </span>

                    <span>
                      Gender:{" "}
                      <strong>
                        {patient.gender}
                      </strong>
                    </span>

                    <span>
                      Blood Group:{" "}
                      <strong>
                        {patient.bloodGroup}
                      </strong>
                    </span>

                    <span>
                      Mobile:{" "}
                      <strong>
                        {patient.phone}
                      </strong>
                    </span>

                  </div>
                );
              })()}

            </div>

            {/* TEST RESULTS */}

            <div className="print-section">

              <div className="print-section-title">
                <span>
                  LABORATORY INVESTIGATIONS
                </span>

                <small>
                  Results with biological reference
                  intervals
                </small>
              </div>

              <table className="print-results-table">

                <thead>

                  <tr>

                    <th>
                      TEST NAME
                    </th>

                    <th>
                      RESULT
                    </th>

                    <th>
                      UNIT
                    </th>

                    <th>
                      REFERENCE RANGE
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {selectedReport.tests.map(
                    (test) => (

                      <tr
                        key={
                          test.testId
                        }
                      >

                        <td>

                          <strong>
                            {test.name}
                          </strong>

                          <span>
                            {
                              test.shortName
                            }
                          </span>

                        </td>

                        <td>

                          <strong className="print-result-value">
                            {test.result ||
                              "—"}
                          </strong>

                        </td>

                        <td>
                          {test.unit}
                        </td>

                        <td>
                          {test.range}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* NOTES */}

            {selectedReport.clinicalNotes && (

              <div className="print-notes-section">

                <strong>
                  Clinical Notes
                </strong>

                <p>
                  {
                    selectedReport.clinicalNotes
                  }
                </p>

              </div>

            )}

            {/* REPORT NOTE */}

            <div className="print-report-note">

              <div>
                <CheckCircle2
                  size={15}
                />
              </div>

              <p>
                Results should be interpreted
                in conjunction with clinical
                findings and medical history.
                Reference ranges may vary
                according to laboratory method,
                age and sex.
              </p>

            </div>

            {/* SIGNATURES */}

            <div className="print-signatures">

              {selectedReport.doctorName ? (

                <div className="signature-block">

                  <div className="signature-space" />

                  <div className="signature-line" />

                  <strong>
                    {selectedReport.doctorName}
                  </strong>

                  <span>
                    Referring Doctor
                  </span>

                </div>

              ) : (

                <div className="signature-block empty-signature" />

              )}

              <div className="signature-block">

                <div className="signature-space" />

                <div className="signature-line" />

                <strong>
                  Laboratory Technician
                </strong>

                <span>
                  Authorized Signatory
                </span>

              </div>

            </div>

            {/* FOOTER */}

            <div className="print-report-footer">

              <div>

                <strong>
                  TAZ DIAGNOSTIC
                </strong>

                <span>
                  Trusted • Accurate • Advanced
                </span>

              </div>

              <div>

                <span>
                  This is a computer-generated
                  laboratory report.
                </span>

                <span>
                  Report ID:{" "}
                  {selectedReport.id}
                </span>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

function PrintInfo({
  label,
  value,
}) {
  return (
    <div className="print-info">

      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>

    </div>
  );
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const value =
    new Date(date);

  if (
    Number.isNaN(
      value.getTime()
    )
  ) {
    return date;
  }

  return value.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default ReportViewer;