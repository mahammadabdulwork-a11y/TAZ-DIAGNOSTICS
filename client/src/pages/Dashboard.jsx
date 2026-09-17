import React from "react";
import {
  Users,
  FlaskConical,
  Clock3,
  CircleCheck,
  IndianRupee,
  UserPlus,
  FilePlus2,
  ReceiptText,
  Eye,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  Activity,
  Stethoscope,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

const stats = [
  {
    title: "Today's Patients",
    value: "28",
    change: "18%",
    description: "Compared with yesterday",
    icon: Users,
    type: "positive",
  },
  {
    title: "Today's Tests",
    value: "76",
    change: "12%",
    description: "Tests processed today",
    icon: FlaskConical,
    type: "positive",
  },
  {
    title: "Pending Reports",
    value: "14",
    change: "5%",
    description: "Require technician action",
    icon: Clock3,
    type: "warning",
  },
  {
    title: "Completed Reports",
    value: "62",
    change: "20%",
    description: "Reports completed today",
    icon: CircleCheck,
    type: "positive",
  },
  {
    title: "Today's Revenue",
    value: "₹28,450",
    change: "15%",
    description: "Total collection today",
    icon: IndianRupee,
    type: "positive",
  },
];

const revenueData = [
  { day: "Mon", value: 12000 },
  { day: "Tue", value: 17500 },
  { day: "Wed", value: 14000 },
  { day: "Thu", value: 22000 },
  { day: "Fri", value: 19000 },
  { day: "Sat", value: 27000 },
  { day: "Sun", value: 24000 },
];

const recentReports = [
  {
    id: "REP00156",
    patient: "Abdul Rahman",
    test: "Complete Blood Count",
    doctor: "Dr. Ahmed Khan",
    status: "Completed",
    date: "01 Sep 2026",
  },
  {
    id: "REP00155",
    patient: "Sana Parveen",
    test: "Lipid Profile",
    doctor: "Dr. Priya Sharma",
    status: "Completed",
    date: "01 Sep 2026",
  },
  {
    id: "REP00154",
    patient: "Imran Khan",
    test: "Blood Sugar - Fasting",
    doctor: "Dr. Syed Rahman",
    status: "Pending",
    date: "01 Sep 2026",
  },
  {
    id: "REP00153",
    patient: "Ayesha Begum",
    test: "Liver Function Test",
    doctor: "Dr. Ahmed Khan",
    status: "Completed",
    date: "31 Aug 2026",
  },
];

const quickActions = [
  {
    title: "New Patient",
    description: "Register patient",
    icon: UserPlus,
    path: "/patients/new",
  },
  {
    title: "New Report",
    description: "Create test report",
    icon: FilePlus2,
    path: "/reports/new",
  },
  {
    title: "New Billing",
    description: "Create invoice",
    icon: ReceiptText,
    path: "/billing/new",
  },
  {
    title: "View Reports",
    description: "Open reports",
    icon: Eye,
    path: "/reports",
  },
];

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-top">
        <div className={`dashboard-stat-icon ${item.type}`}>
          <Icon size={22} strokeWidth={2} />
        </div>

        <div className={`dashboard-stat-change ${item.type}`}>
          <ArrowUpRight size={15} />
          {item.change}
        </div>
      </div>

      <div className="dashboard-stat-title">{item.title}</div>

      <div className="dashboard-stat-value">{item.value}</div>

      <div className="dashboard-stat-description">
        {item.description}
      </div>
    </div>
  );
}

function QuickAction({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      className="dashboard-quick-action"
      onClick={() => onNavigate(item.path)}
    >
      <div className="dashboard-quick-icon">
        <Icon size={21} />
      </div>

      <div className="dashboard-quick-content">
        <strong>{item.title}</strong>
        <span>{item.description}</span>
      </div>

      <ArrowUpRight
        className="dashboard-quick-arrow"
        size={18}
      />
    </button>
  );
}

export default function Dashboard() {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handleNavigate = (path) => {
    window.history.pushState({}, "", path);

    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const maxRevenue = Math.max(...revenueData.map((item) => item.value));

  return (
    <div className="dashboard-page">

      {/* ================= HEADER ================= */}

      <div className="dashboard-heading">

        <div>
          <div className="dashboard-eyebrow">
            TAZ DIAGNOSTIC MANAGEMENT
          </div>

          <h1>Good evening, Admin</h1>

          <p>
            Here's what's happening across your diagnostic
            laboratory today.
          </p>
        </div>

        <div className="dashboard-date-card">
          <CalendarDays size={18} />

          <div>
            <span>Today</span>
            <strong>{formattedDate}</strong>
          </div>
        </div>

      </div>

      {/* ================= STAT CARDS ================= */}

      <div className="dashboard-stats-grid">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            item={item}
          />
        ))}
      </div>

      {/* ================= MAIN GRID ================= */}

      <div className="dashboard-main-grid">

        {/* ================= REVENUE ================= */}

        <section className="dashboard-card revenue-card">

          <div className="dashboard-card-header">

            <div>
              <h2>Revenue Overview</h2>

              <p>
                Business performance for this week
              </p>
            </div>

            <select
              className="dashboard-select"
              defaultValue="week"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

          </div>

          <div className="revenue-summary">

            <div>
              <span>Total Revenue</span>

              <div className="revenue-total-row">
                <strong>₹1,42,680</strong>

                <span className="revenue-growth">
                  <TrendingUp size={15} />
                  15.4%
                </span>
              </div>
            </div>

          </div>

          <div className="revenue-chart">

            <div className="chart-y-axis">
              <span>30K</span>
              <span>20K</span>
              <span>10K</span>
              <span>0</span>
            </div>

            <div className="chart-area">

              <div className="chart-grid-line line-30" />
              <div className="chart-grid-line line-20" />
              <div className="chart-grid-line line-10" />
              <div className="chart-grid-line line-0" />

              <div className="chart-bars">

                {revenueData.map((item) => {
                  const height =
                    (item.value / maxRevenue) * 100;

                  return (
                    <div
                      className="chart-column"
                      key={item.day}
                    >
                      <div className="chart-value">
                        ₹{Math.round(item.value / 1000)}K
                      </div>

                      <div
                        className={`chart-bar ${
                          item.day === "Thu"
                            ? "active"
                            : ""
                        }`}
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <span>{item.day}</span>
                    </div>
                  );
                })}

              </div>

            </div>
          </div>

        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="dashboard-card quick-actions-card">

          <div className="dashboard-card-header">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Frequently used operations
              </p>
            </div>
          </div>

          <div className="quick-actions-grid">

            {quickActions.map((item) => (
              <QuickAction
                key={item.title}
                item={item}
                onNavigate={handleNavigate}
              />
            ))}

          </div>

        </section>

      </div>

      {/* ================= LOWER GRID ================= */}

      <div className="dashboard-lower-grid">

        {/* ================= RECENT REPORTS ================= */}

        <section className="dashboard-card recent-reports-card">

          <div className="dashboard-card-header">

            <div>
              <h2>Recent Reports</h2>

              <p>
                Latest laboratory reports
              </p>
            </div>

            <button
              type="button"
              className="dashboard-view-all"
              onClick={() => handleNavigate("/reports")}
            >
              View all
              <ArrowUpRight size={16} />
            </button>

          </div>

          <div className="reports-table-wrapper">

            <table className="dashboard-table">

              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Patient</th>
                  <th>Test</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>

                {recentReports.map((report) => (
                  <tr key={report.id}>

                    <td>
                      <strong className="report-id">
                        {report.id}
                      </strong>
                    </td>

                    <td>
                      <div className="patient-cell">
                        <div className="patient-avatar">
                          {report.patient
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span>{report.patient}</span>
                      </div>
                    </td>

                    <td>{report.test}</td>

                    <td>{report.doctor}</td>

                    <td>
                      <span
                        className={`report-status ${
                          report.status === "Completed"
                            ? "completed"
                            : "pending"
                        }`}
                      >
                        <span className="status-dot" />
                        {report.status}
                      </span>
                    </td>

                    <td>{report.date}</td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </section>

        {/* ================= LAB SUMMARY ================= */}

        <section className="dashboard-card lab-summary-card">

          <div className="dashboard-card-header">

            <div>
              <h2>Laboratory Summary</h2>

              <p>
                Current laboratory activity
              </p>
            </div>

          </div>

          <div className="lab-summary-list">

            <div className="lab-summary-item">

              <div className="lab-summary-icon">
                <Users size={20} />
              </div>

              <div className="lab-summary-info">
                <strong>28</strong>
                <span>Patients today</span>
              </div>

              <div className="lab-summary-percent">
                +18%
              </div>

            </div>

            <div className="lab-summary-item">

              <div className="lab-summary-icon">
                <FlaskConical size={20} />
              </div>

              <div className="lab-summary-info">
                <strong>76</strong>
                <span>Tests processed</span>
              </div>

              <div className="lab-summary-percent">
                +12%
              </div>

            </div>

            <div className="lab-summary-item warning">

              <div className="lab-summary-icon">
                <Clock3 size={20} />
              </div>

              <div className="lab-summary-info">
                <strong>14</strong>
                <span>Pending reports</span>
              </div>

              <div className="lab-summary-percent warning">
                Action
              </div>

            </div>

            <div className="lab-summary-item">

              <div className="lab-summary-icon">
                <CircleCheck size={20} />
              </div>

              <div className="lab-summary-info">
                <strong>62</strong>
                <span>Completed reports</span>
              </div>

              <div className="lab-summary-percent">
                +20%
              </div>

            </div>

          </div>

        </section>

      </div>

      {/* ================= BOTTOM CARDS ================= */}

      <div className="dashboard-bottom-grid">

        <div className="dashboard-mini-card">

          <div className="mini-card-icon">
            <Stethoscope size={22} />
          </div>

          <div>
            <span>Active Doctors</span>
            <strong>18</strong>
          </div>

          <ArrowUpRight size={18} />

        </div>

        <div className="dashboard-mini-card">

          <div className="mini-card-icon">
            <ClipboardList size={22} />
          </div>

          <div>
            <span>Available Tests</span>
            <strong>124</strong>
          </div>

          <ArrowUpRight size={18} />

        </div>

        <div className="dashboard-mini-card">

          <div className="mini-card-icon">
            <Activity size={22} />
          </div>

          <div>
            <span>Lab Efficiency</span>
            <strong>94.8%</strong>
          </div>

          <ArrowUpRight size={18} />

        </div>

        <div className="dashboard-mini-card alert">

          <div className="mini-card-icon">
            <AlertCircle size={22} />
          </div>

          <div>
            <span>Pending Actions</span>
            <strong>14</strong>
          </div>

          <ArrowUpRight size={18} />

        </div>

      </div>

    </div>
  );
}