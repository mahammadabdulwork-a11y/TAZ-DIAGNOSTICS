import React, { useMemo } from "react";
import {
  BarChart3,
  Users,
  FlaskConical,
  FileText,
  IndianRupee,
  TrendingUp,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Activity,
  CalendarDays,
} from "lucide-react";

const PATIENTS_KEY = "taz_company_patients";
const TESTS_KEY = "taz_company_tests";
const REPORTS_KEY = "taz_company_reports";
const BILLS_KEY = "taz_company_bills";

function readStorage(key) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return [];

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getDate(item) {
  return (
    item?.date ||
    item?.createdAt ||
    item?.createdDate ||
    item?.reportDate ||
    item?.billDate ||
    ""
  );
}

function isToday(value) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function monthName(index) {
  return new Date(2026, index, 1).toLocaleString("en-IN", {
    month: "short",
  });
}

function getAmount(bill) {
  return Number(
    bill?.total ??
      bill?.grandTotal ??
      bill?.netTotal ??
      bill?.amount ??
      0
  );
}

export default function Analytics() {
  const patients = useMemo(
    () => readStorage(PATIENTS_KEY),
    []
  );

  const tests = useMemo(
    () => readStorage(TESTS_KEY),
    []
  );

  const reports = useMemo(
    () => readStorage(REPORTS_KEY),
    []
  );

  const bills = useMemo(
    () => readStorage(BILLS_KEY),
    []
  );

  const statistics = useMemo(() => {
    const todayPatients = patients.filter((patient) =>
      isToday(getDate(patient))
    ).length;

    const todayTests = tests.filter((test) =>
      isToday(getDate(test))
    ).length;

    const completedReports = reports.filter((report) =>
      ["completed", "complete", "verified", "final"]
        .includes(String(report.status || "").toLowerCase())
    ).length;

    const pendingReports = reports.filter((report) =>
      ["pending", "draft", "processing", "in progress"]
        .includes(String(report.status || "").toLowerCase())
    ).length;

    const urgentReports = reports.filter((report) =>
      String(report.priority || "").toLowerCase() === "urgent"
    ).length;

    const totalRevenue = bills.reduce(
      (sum, bill) => sum + getAmount(bill),
      0
    );

    const todayRevenue = bills
      .filter((bill) => isToday(getDate(bill)))
      .reduce((sum, bill) => sum + getAmount(bill), 0);

    const paidRevenue = bills
      .filter(
        (bill) =>
          String(bill.status || "").toLowerCase() === "paid"
      )
      .reduce((sum, bill) => sum + getAmount(bill), 0);

    return {
      todayPatients,
      todayTests,
      completedReports,
      pendingReports,
      urgentReports,
      totalRevenue,
      todayRevenue,
      paidRevenue,
    };
  }, [patients, tests, reports, bills]);

  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return Array.from({ length: 12 }, (_, index) => {
      const patientCount = patients.filter((patient) => {
        const date = new Date(getDate(patient));

        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === currentYear &&
          date.getMonth() === index
        );
      }).length;

      const reportCount = reports.filter((report) => {
        const date = new Date(getDate(report));

        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === currentYear &&
          date.getMonth() === index
        );
      }).length;

      const revenue = bills
        .filter((bill) => {
          const date = new Date(getDate(bill));

          return (
            !Number.isNaN(date.getTime()) &&
            date.getFullYear() === currentYear &&
            date.getMonth() === index
          );
        })
        .reduce((sum, bill) => sum + getAmount(bill), 0);

      return {
        month: monthName(index),
        patients: patientCount,
        reports: reportCount,
        revenue,
      };
    });
  }, [patients, reports, bills]);

  const maxPatients = Math.max(
    ...monthlyData.map((item) => item.patients),
    1
  );

  const maxReports = Math.max(
    ...monthlyData.map((item) => item.reports),
    1
  );

  const maxRevenue = Math.max(
    ...monthlyData.map((item) => item.revenue),
    1
  );

  const genderStats = useMemo(() => {
    const male = patients.filter(
      (patient) =>
        String(
          patient.gender ||
            patient.sex ||
            ""
        ).toLowerCase() === "male"
    ).length;

    const female = patients.filter(
      (patient) =>
        String(
          patient.gender ||
            patient.sex ||
            ""
        ).toLowerCase() === "female"
    ).length;

    const other = Math.max(
      patients.length - male - female,
      0
    );

    return {
      male,
      female,
      other,
    };
  }, [patients]);

  const ageStats = useMemo(() => {
    let below18 = 0;
    let age18to30 = 0;
    let age31to50 = 0;
    let age51to70 = 0;
    let above70 = 0;

    patients.forEach((patient) => {
      const age = Number(patient.age);

      if (!Number.isFinite(age)) return;

      if (age < 18) below18++;
      else if (age <= 30) age18to30++;
      else if (age <= 50) age31to50++;
      else if (age <= 70) age51to70++;
      else above70++;
    });

    return [
      {
        label: "Below 18",
        value: below18,
      },
      {
        label: "18 - 30",
        value: age18to30,
      },
      {
        label: "31 - 50",
        value: age31to50,
      },
      {
        label: "51 - 70",
        value: age51to70,
      },
      {
        label: "Above 70",
        value: above70,
      },
    ];
  }, [patients]);

  const topTests = useMemo(() => {
    const counts = {};

    tests.forEach((test) => {
      const name =
        test.testName ||
        test.name ||
        test.test ||
        "Unknown Test";

      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [tests]);

  const maxTopTest = Math.max(
    ...topTests.map((item) => item.count),
    1
  );

  return (
    <div className="analytics-page">
      <style>{`
        .analytics-page {
          min-height: calc(100vh - 90px);
          padding: 28px 30px 45px;
          color: #3a0610;
          background: #fdfafb;
        }

        .analytics-page *,
        .analytics-page *::before,
        .analytics-page *::after {
          box-sizing: border-box;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .analytics-title {
          margin: 0;
          color: #3a0610;
          font-size: 28px;
          font-weight: 800;
        }

        .analytics-subtitle {
          margin: 7px 0 0;
          color: #927983;
          font-size: 14px;
        }

        .analytics-period {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #eadde1;
          background: #fff;
          border-radius: 9px;
          padding: 10px 13px;
          color: #6f5360;
          font-size: 12px;
          font-weight: 700;
        }

        .analytics-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 18px;
        }

        .analytics-stat {
          background: #fff;
          border: 1px solid #eadde1;
          border-radius: 13px;
          padding: 18px;
          min-height: 126px;
          box-shadow: 0 5px 22px rgba(91,10,26,.035);
        }

        .analytics-stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .analytics-stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8e8ed;
          color: #7b0d22;
        }

        .analytics-stat-label {
          color: #927983;
          font-size: 12px;
          font-weight: 700;
        }

        .analytics-stat-value {
          margin-top: 13px;
          color: #3a0610;
          font-size: 26px;
          font-weight: 850;
          line-height: 1;
        }

        .analytics-stat-note {
          margin-top: 8px;
          color: #a08890;
          font-size: 11px;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
          gap: 18px;
          margin-bottom: 18px;
        }

        .analytics-card {
          background: #fff;
          border: 1px solid #eadde1;
          border-radius: 13px;
          padding: 19px;
          box-shadow: 0 5px 22px rgba(91,10,26,.035);
          min-width: 0;
        }

        .analytics-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 20px;
        }

        .analytics-card-title {
          margin: 0;
          color: #4b2934;
          font-size: 15px;
          font-weight: 800;
        }

        .analytics-card-subtitle {
          margin: 5px 0 0;
          color: #9b828a;
          font-size: 11px;
        }

        .analytics-chart {
          height: 270px;
          display: flex;
          align-items: flex-end;
          gap: 9px;
          padding: 10px 4px 0;
          border-bottom: 1px solid #eadde1;
        }

        .analytics-bar-group {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          min-width: 0;
        }

        .analytics-bar-value {
          color: #7b0d22;
          font-size: 9px;
          font-weight: 800;
          margin-bottom: 5px;
          min-height: 12px;
        }

        .analytics-bar {
          width: min(35px, 70%);
          min-height: 3px;
          border-radius: 6px 6px 0 0;
          background: #7b0d22;
          transition: height .25s ease;
        }

        .analytics-bar-label {
          margin-top: 8px;
          color: #8f737c;
          font-size: 10px;
          font-weight: 700;
        }

        .revenue-bars {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .revenue-row {
          display: grid;
          grid-template-columns: 36px 1fr 80px;
          gap: 10px;
          align-items: center;
        }

        .revenue-month {
          color: #816871;
          font-size: 11px;
          font-weight: 800;
        }

        .revenue-track {
          height: 9px;
          background: #f3e8eb;
          border-radius: 999px;
          overflow: hidden;
        }

        .revenue-fill {
          height: 100%;
          border-radius: 999px;
          background: #8b1730;
        }

        .revenue-value {
          text-align: right;
          color: #4d3039;
          font-size: 11px;
          font-weight: 800;
        }

        .mini-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
        }

        .mini-box {
          border: 1px solid #eadde1;
          border-radius: 10px;
          padding: 13px;
        }

        .mini-box-label {
          color: #927983;
          font-size: 11px;
          font-weight: 700;
        }

        .mini-box-value {
          margin-top: 7px;
          color: #4b2934;
          font-size: 20px;
          font-weight: 850;
        }

        .progress-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .progress-row {
          display: grid;
          grid-template-columns: 100px 1fr 38px;
          gap: 9px;
          align-items: center;
        }

        .progress-label {
          color: #684b55;
          font-size: 11px;
          font-weight: 700;
        }

        .progress-track {
          height: 9px;
          background: #f3e9ec;
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #7b0d22;
          border-radius: 999px;
        }

        .progress-value {
          color: #6d4c57;
          text-align: right;
          font-size: 11px;
          font-weight: 800;
        }

        .top-tests {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .top-test-row {
          display: grid;
          grid-template-columns: 150px 1fr 35px;
          gap: 10px;
          align-items: center;
        }

        .top-test-name {
          color: #654650;
          font-size: 11px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .top-test-track {
          height: 10px;
          background: #f3e9ec;
          border-radius: 999px;
          overflow: hidden;
        }

        .top-test-fill {
          height: 100%;
          background: #8b1730;
          border-radius: 999px;
        }

        .top-test-number {
          text-align: right;
          color: #5b0a1a;
          font-size: 11px;
          font-weight: 850;
        }

        .analytics-empty {
          padding: 35px 15px;
          text-align: center;
          color: #9b818a;
          font-size: 12px;
        }

        .analytics-empty svg {
          color: #cdb6bd;
          margin-bottom: 8px;
        }

        .analytics-footer-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 11px 0;
          border-bottom: 1px solid #f0e6e9;
        }

        .summary-line:last-child {
          border-bottom: 0;
        }

        .summary-line span:first-child {
          color: #8b737c;
          font-size: 12px;
        }

        .summary-line span:last-child {
          color: #4d3039;
          font-size: 12px;
          font-weight: 800;
        }

        @media (max-width: 1100px) {
          .analytics-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .analytics-grid,
          .analytics-footer-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .analytics-page {
            padding: 18px 14px 30px;
          }

          .analytics-header {
            flex-direction: column;
          }

          .analytics-stat-grid {
            grid-template-columns: 1fr;
          }

          .analytics-chart {
            gap: 4px;
          }

          .revenue-row {
            grid-template-columns: 32px 1fr 65px;
          }

          .top-test-row {
            grid-template-columns: 105px 1fr 28px;
          }

          .progress-row {
            grid-template-columns: 80px 1fr 28px;
          }
        }
      `}</style>

      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">
            Analytics
          </h1>

          <p className="analytics-subtitle">
            Laboratory performance, patient activity and revenue overview.
          </p>
        </div>

        <div className="analytics-period">
          <CalendarDays size={15} />
          Current Year
        </div>
      </div>

      <div className="analytics-stat-grid">
        <div className="analytics-stat">
          <div className="analytics-stat-top">
            <div className="analytics-stat-label">
              Total Patients
            </div>

            <div className="analytics-stat-icon">
              <Users size={19} />
            </div>
          </div>

          <div className="analytics-stat-value">
            {patients.length}
          </div>

          <div className="analytics-stat-note">
            {statistics.todayPatients} registered today
          </div>
        </div>

        <div className="analytics-stat">
          <div className="analytics-stat-top">
            <div className="analytics-stat-label">
              Total Tests
            </div>

            <div className="analytics-stat-icon">
              <FlaskConical size={19} />
            </div>
          </div>

          <div className="analytics-stat-value">
            {tests.length}
          </div>

          <div className="analytics-stat-note">
            {statistics.todayTests} entered today
          </div>
        </div>

        <div className="analytics-stat">
          <div className="analytics-stat-top">
            <div className="analytics-stat-label">
              Reports
            </div>

            <div className="analytics-stat-icon">
              <FileText size={19} />
            </div>
          </div>

          <div className="analytics-stat-value">
            {reports.length}
          </div>

          <div className="analytics-stat-note">
            {statistics.completedReports} completed
          </div>
        </div>

        <div className="analytics-stat">
          <div className="analytics-stat-top">
            <div className="analytics-stat-label">
              Total Revenue
            </div>

            <div className="analytics-stat-icon">
              <IndianRupee size={19} />
            </div>
          </div>

          <div className="analytics-stat-value">
            ₹{statistics.totalRevenue.toLocaleString("en-IN")}
          </div>

          <div className="analytics-stat-note">
            ₹{statistics.todayRevenue.toLocaleString("en-IN")} today
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h2 className="analytics-card-title">
                Patient Activity
              </h2>

              <p className="analytics-card-subtitle">
                Monthly patient registrations
              </p>
            </div>

            <TrendingUp size={18} color="#7b0d22" />
          </div>

          <div className="analytics-chart">
            {monthlyData.map((item) => {
              const height =
                item.patients > 0
                  ? Math.max(
                      (item.patients / maxPatients) * 190,
                      5
                    )
                  : 3;

              return (
                <div
                  className="analytics-bar-group"
                  key={item.month}
                >
                  <div className="analytics-bar-value">
                    {item.patients || ""}
                  </div>

                  <div
                    className="analytics-bar"
                    style={{
                      height: `${height}px`,
                    }}
                  />

                  <div className="analytics-bar-label">
                    {item.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h2 className="analytics-card-title">
                Report Status
              </h2>

              <p className="analytics-card-subtitle">
                Current report workflow
              </p>
            </div>

            <Activity size={18} color="#7b0d22" />
          </div>

          <div className="mini-grid">
            <div className="mini-box">
              <div className="mini-box-label">
                Completed
              </div>

              <div className="mini-box-value">
                {statistics.completedReports}
              </div>
            </div>

            <div className="mini-box">
              <div className="mini-box-label">
                Pending
              </div>

              <div className="mini-box-value">
                {statistics.pendingReports}
              </div>
            </div>

            <div className="mini-box">
              <div className="mini-box-label">
                Urgent
              </div>

              <div className="mini-box-value">
                {statistics.urgentReports}
              </div>
            </div>

            <div className="mini-box">
              <div className="mini-box-label">
                Total
              </div>

              <div className="mini-box-value">
                {reports.length}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div className="progress-list">
              <div className="progress-row">
                <div className="progress-label">
                  Completed
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        reports.length
                          ? (statistics.completedReports /
                              reports.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="progress-value">
                  {reports.length
                    ? Math.round(
                        (statistics.completedReports /
                          reports.length) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>

              <div className="progress-row">
                <div className="progress-label">
                  Pending
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        reports.length
                          ? (statistics.pendingReports /
                              reports.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="progress-value">
                  {reports.length
                    ? Math.round(
                        (statistics.pendingReports /
                          reports.length) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h2 className="analytics-card-title">
                Revenue Overview
              </h2>

              <p className="analytics-card-subtitle">
                Monthly billing revenue
              </p>
            </div>

            <IndianRupee size={18} color="#7b0d22" />
          </div>

          {bills.length === 0 ? (
            <div className="analytics-empty">
              <IndianRupee size={30} />
              <div>
                No billing data available yet.
              </div>
            </div>
          ) : (
            <div className="revenue-bars">
              {monthlyData.map((item) => (
                <div
                  className="revenue-row"
                  key={item.month}
                >
                  <div className="revenue-month">
                    {item.month}
                  </div>

                  <div className="revenue-track">
                    <div
                      className="revenue-fill"
                      style={{
                        width: `${
                          item.revenue
                            ? (item.revenue /
                                maxRevenue) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="revenue-value">
                    ₹
                    {item.revenue.toLocaleString(
                      "en-IN"
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h2 className="analytics-card-title">
                Patient Demographics
              </h2>

              <p className="analytics-card-subtitle">
                Gender distribution
              </p>
            </div>

            <Users size={18} color="#7b0d22" />
          </div>

          <div className="progress-list">
            <div className="progress-row">
              <div className="progress-label">
                Male
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      patients.length
                        ? (genderStats.male /
                            patients.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="progress-value">
                {genderStats.male}
              </div>
            </div>

            <div className="progress-row">
              <div className="progress-label">
                Female
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      patients.length
                        ? (genderStats.female /
                            patients.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="progress-value">
                {genderStats.female}
              </div>
            </div>

            <div className="progress-row">
              <div className="progress-label">
                Other
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      patients.length
                        ? (genderStats.other /
                            patients.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="progress-value">
                {genderStats.other}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-footer-grid">
        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h2 className="analytics-card-title">
                Age Groups
              </h2>

              <p className="analytics-card-subtitle">
                Patient age distribution
              </p>
            </div>

            <Users size={18} color="#7b0d22" />
          </div>

          <div className="progress-list">
            {ageStats.map((item) => (
              <div
                className="progress-row"
                key={item.label}
              >
                <div className="progress-label">
                  {item.label}
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        patients.length
                          ? (item.value /
                              patients.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="progress-value">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h2 className="analytics-card-title">
                Most Used Tests
              </h2>

              <p className="analytics-card-subtitle">
                Test activity overview
              </p>
            </div>

            <FlaskConical size={18} color="#7b0d22" />
          </div>

          {topTests.length === 0 ? (
            <div className="analytics-empty">
              <FlaskConical size={30} />
              <div>
                No test entries available yet.
              </div>
            </div>
          ) : (
            <div className="top-tests">
              {topTests.map((item) => (
                <div
                  className="top-test-row"
                  key={item.name}
                >
                  <div
                    className="top-test-name"
                    title={item.name}
                  >
                    {item.name}
                  </div>

                  <div className="top-test-track">
                    <div
                      className="top-test-fill"
                      style={{
                        width: `${
                          (item.count /
                            maxTopTest) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="top-test-number">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="analytics-card">
          <div className="analytics-card-head">
            <div>
              <h2 className="analytics-card-title">
                Financial Summary
              </h2>

              <p className="analytics-card-subtitle">
                Billing overview
              </p>
            </div>

            <BarChart3 size={18} color="#7b0d22" />
          </div>

          <div>
            <div className="summary-line">
              <span>Total Bills</span>
              <span>{bills.length}</span>
            </div>

            <div className="summary-line">
              <span>Total Revenue</span>
              <span>
                ₹
                {statistics.totalRevenue.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            <div className="summary-line">
              <span>Paid Revenue</span>
              <span>
                ₹
                {statistics.paidRevenue.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            <div className="summary-line">
              <span>Today's Revenue</span>
              <span>
                ₹
                {statistics.todayRevenue.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>

            <div className="summary-line">
              <span>Today Patients</span>
              <span>
                {statistics.todayPatients}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "none",
        }}
      >
        <CheckCircle2 />
        <Clock3 />
        <AlertTriangle />
      </div>
    </div>
  );
}