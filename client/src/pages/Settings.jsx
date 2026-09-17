import React, { useEffect, useState } from "react";
import {
  Save,
  Building2,
  FileText,
  UserRound,
  Database,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const SETTINGS_KEY = "taz_company_settings";

const DEFAULT_SETTINGS = {
  laboratoryName: "TAZ DIAGNOSTIC",
  softwareName: "TAZ COMPANY",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  technicianName: "Lab Technician",
  reportFooter:
    "This report is generated electronically and is valid without a physical signature.",
  reportPrefix: "REP",
  patientPrefix: "PAT",
  billPrefix: "BILL",
  autoSaveReports: true,
  showQRCode: true,
  showLogo: true,
  showReferenceRange: true,
  showTechnicianSignature: true,
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (!saved) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <div className="settings-field">
      <label>{label}</label>

      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ToggleField({ label, description, value, onChange }) {
  return (
    <div className="settings-toggle-row">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className={`settings-switch ${value ? "active" : ""}`}
        onClick={() => onChange(!value)}
        aria-label={label}
      >
        <span />
      </button>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const styleId = "taz-settings-styles";

    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;

    style.innerHTML = `
      .settings-page {
        padding: 24px;
        max-width: 1250px;
        margin: 0 auto;
      }

      .settings-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 24px;
      }

      .settings-header h1 {
        margin: 0;
        color: #3A0610;
        font-size: 28px;
      }

      .settings-header p {
        margin: 6px 0 0;
        color: #777;
      }

      .settings-save-btn {
        border: none;
        background: #5B0A1A;
        color: white;
        padding: 12px 18px;
        border-radius: 9px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
      }

      .settings-save-btn:hover {
        background: #3A0610;
      }

      .settings-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      .settings-card {
        background: white;
        border: 1px solid #eadde1;
        border-radius: 14px;
        padding: 22px;
        box-shadow: 0 4px 18px rgba(91, 10, 26, 0.06);
      }

      .settings-card.full {
        grid-column: 1 / -1;
      }

      .settings-card-title {
        display: flex;
        align-items: center;
        gap: 11px;
        margin-bottom: 20px;
        padding-bottom: 14px;
        border-bottom: 1px solid #eee;
      }

      .settings-card-title svg {
        color: #5B0A1A;
      }

      .settings-card-title h2 {
        margin: 0;
        font-size: 18px;
        color: #3A0610;
      }

      .settings-card-title p {
        margin: 3px 0 0;
        color: #888;
        font-size: 13px;
      }

      .settings-form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .settings-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .settings-field.full-width {
        grid-column: 1 / -1;
      }

      .settings-field label {
        font-size: 13px;
        font-weight: 700;
        color: #4a4a4a;
      }

      .settings-field input,
      .settings-field textarea {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid #d9cbd0;
        border-radius: 8px;
        padding: 11px 12px;
        outline: none;
        background: #fff;
        font-size: 14px;
      }

      .settings-field textarea {
        min-height: 95px;
        resize: vertical;
        font-family: inherit;
      }

      .settings-field input:focus,
      .settings-field textarea:focus {
        border-color: #8B1730;
        box-shadow: 0 0 0 3px rgba(139, 23, 48, 0.08);
      }

      .settings-toggle-list {
        display: flex;
        flex-direction: column;
      }

      .settings-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
      }

      .settings-toggle-row:last-child {
        border-bottom: none;
      }

      .settings-toggle-row strong {
        color: #3A0610;
        font-size: 14px;
      }

      .settings-toggle-row p {
        margin: 4px 0 0;
        color: #888;
        font-size: 12px;
      }

      .settings-switch {
        width: 48px;
        height: 26px;
        border: none;
        border-radius: 20px;
        background: #d5d5d5;
        padding: 3px;
        cursor: pointer;
        flex-shrink: 0;
        transition: 0.2s;
      }

      .settings-switch span {
        display: block;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: 0.2s;
      }

      .settings-switch.active {
        background: #5B0A1A;
      }

      .settings-switch.active span {
        transform: translateX(22px);
      }

      .settings-data-actions {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }

      .settings-action-btn {
        border: 1px solid #e0d2d7;
        background: white;
        color: #3A0610;
        padding: 15px;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        font-weight: 700;
      }

      .settings-action-btn:hover {
        background: #fff6f8;
        border-color: #8B1730;
      }

      .settings-action-btn.danger {
        color: #a00020;
        border-color: #efc7d0;
      }

      .settings-message {
        margin-bottom: 18px;
        padding: 12px 15px;
        border-radius: 9px;
        background: #edf9f0;
        color: #1d7134;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
      }

      .settings-info {
        margin-top: 16px;
        padding: 13px;
        background: #fff8f9;
        border-left: 4px solid #8B1730;
        color: #5b3b43;
        border-radius: 5px;
        font-size: 13px;
        line-height: 1.5;
      }

      @media (max-width: 850px) {
        .settings-grid {
          grid-template-columns: 1fr;
        }

        .settings-card.full {
          grid-column: auto;
        }

        .settings-data-actions {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .settings-page {
          padding: 15px;
        }

        .settings-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .settings-form-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, []);

  const update = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    setSaved(true);
    setMessage("Settings saved successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const resetSettings = () => {
    const confirmed = window.confirm(
      "Reset all TAZ COMPANY settings to default values?"
    );

    if (!confirmed) return;

    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));

    setMessage("Settings restored to default.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const exportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      application: "TAZ COMPANY",
      settings: JSON.parse(
        localStorage.getItem(SETTINGS_KEY) ||
          JSON.stringify(DEFAULT_SETTINGS)
      ),
      localStorage: {
        doctors: localStorage.getItem("taz_company_doctors"),
        patients: localStorage.getItem("taz_company_patients"),
        tests: localStorage.getItem("taz_company_tests"),
        testMaster: localStorage.getItem("taz_company_test_master"),
        reports: localStorage.getItem("taz_company_reports"),
        bills: localStorage.getItem("taz_company_bills"),
        messages: localStorage.getItem("taz_company_messages"),
        users: localStorage.getItem("taz_company_users"),
        branches: localStorage.getItem("taz_company_branches"),
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `taz-company-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    a.click();

    URL.revokeObjectURL(url);

    setMessage("Backup exported successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const importData = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data || !data.localStorage) {
          throw new Error("Invalid backup");
        }

        if (data.settings) {
          localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify({
              ...DEFAULT_SETTINGS,
              ...data.settings,
            })
          );

          setSettings({
            ...DEFAULT_SETTINGS,
            ...data.settings,
          });
        }

        Object.entries(data.localStorage).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            localStorage.setItem(`taz_company_${key}`, value);
          }
        });

        setMessage(
          "Backup imported successfully. Refresh the application to load all data."
        );
      } catch {
        window.alert("Invalid TAZ COMPANY backup file.");
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const resetDemoData = () => {
    const confirmed = window.confirm(
      "This will remove saved TAZ COMPANY application data. Continue?"
    );

    if (!confirmed) return;

    const keys = [
      "taz_company_doctors",
      "taz_company_patients",
      "taz_company_tests",
      "taz_company_test_master",
      "taz_company_reports",
      "taz_company_bills",
      "taz_company_messages",
      "taz_company_users",
      "taz_company_branches",
    ];

    keys.forEach((key) => localStorage.removeItem(key));

    setMessage(
      "Application data was cleared. Refresh the page to reload default data."
    );

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Manage laboratory, reports, system preferences and data.</p>
        </div>

        <button className="settings-save-btn" onClick={saveSettings}>
          <Save size={18} />
          Save Settings
        </button>
      </div>

      {message && (
        <div className="settings-message">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <div className="settings-grid">
        {/* Laboratory */}
        <div className="settings-card">
          <div className="settings-card-title">
            <Building2 size={21} />

            <div>
              <h2>Laboratory Information</h2>
              <p>Information used throughout the application.</p>
            </div>
          </div>

          <div className="settings-form-grid">
            <InputField
              label="Laboratory / Report Name"
              value={settings.laboratoryName}
              onChange={(v) => update("laboratoryName", v)}
            />

            <InputField
              label="Software Name"
              value={settings.softwareName}
              onChange={(v) => update("softwareName", v)}
            />

            <InputField
              label="Phone"
              value={settings.phone}
              onChange={(v) => update("phone", v)}
              placeholder="+91 XXXXX XXXXX"
            />

            <InputField
              label="Email"
              value={settings.email}
              onChange={(v) => update("email", v)}
              type="email"
              placeholder="lab@example.com"
            />

            <InputField
              label="Address"
              value={settings.address}
              onChange={(v) => update("address", v)}
            />

            <InputField
              label="City"
              value={settings.city}
              onChange={(v) => update("city", v)}
            />

            <InputField
              label="State"
              value={settings.state}
              onChange={(v) => update("state", v)}
            />

            <InputField
              label="PIN Code"
              value={settings.pincode}
              onChange={(v) => update("pincode", v)}
            />
          </div>
        </div>

        {/* Report */}
        <div className="settings-card">
          <div className="settings-card-title">
            <FileText size={21} />

            <div>
              <h2>Report Settings</h2>
              <p>Configure patient report generation.</p>
            </div>
          </div>

          <div className="settings-form-grid">
            <InputField
              label="Report Number Prefix"
              value={settings.reportPrefix}
              onChange={(v) => update("reportPrefix", v)}
            />

            <InputField
              label="Patient ID Prefix"
              value={settings.patientPrefix}
              onChange={(v) => update("patientPrefix", v)}
            />

            <InputField
              label="Bill Number Prefix"
              value={settings.billPrefix}
              onChange={(v) => update("billPrefix", v)}
            />

            <InputField
              label="Default Technician"
              value={settings.technicianName}
              onChange={(v) => update("technicianName", v)}
            />

            <div className="settings-field full-width">
              <label>Report Footer</label>

              <textarea
                value={settings.reportFooter}
                onChange={(e) =>
                  update("reportFooter", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* User */}
        <div className="settings-card">
          <div className="settings-card-title">
            <UserRound size={21} />

            <div>
              <h2>Report Display</h2>
              <p>Choose what appears on patient reports.</p>
            </div>
          </div>

          <div className="settings-toggle-list">
            <ToggleField
              label="Show QR Code"
              description="Display the report verification QR code."
              value={settings.showQRCode}
              onChange={(v) => update("showQRCode", v)}
            />

            <ToggleField
              label="Show Laboratory Logo"
              description="Display the logo in the report header."
              value={settings.showLogo}
              onChange={(v) => update("showLogo", v)}
            />

            <ToggleField
              label="Show Reference Range"
              description="Display reference ranges beside test results."
              value={settings.showReferenceRange}
              onChange={(v) => update("showReferenceRange", v)}
            />

            <ToggleField
              label="Show Technician Signature"
              description="Include technician signature area."
              value={settings.showTechnicianSignature}
              onChange={(v) =>
                update("showTechnicianSignature", v)
              }
            />
          </div>
        </div>

        {/* Application */}
        <div className="settings-card">
          <div className="settings-card-title">
            <Database size={21} />

            <div>
              <h2>Application Preferences</h2>
              <p>General application behavior.</p>
            </div>
          </div>

          <div className="settings-toggle-list">
            <ToggleField
              label="Auto Save Reports"
              description="Save report changes automatically when supported."
              value={settings.autoSaveReports}
              onChange={(v) => update("autoSaveReports", v)}
            />
          </div>

          <div className="settings-info">
            <strong>Storage:</strong> This version stores application
            information in your browser's localStorage. Data is stored
            locally on this computer.
          </div>
        </div>

        {/* Backup */}
        <div className="settings-card full">
          <div className="settings-card-title">
            <Database size={21} />

            <div>
              <h2>Data Backup & Restore</h2>
              <p>Export or restore TAZ COMPANY application data.</p>
            </div>
          </div>

          <div className="settings-data-actions">
            <button
              className="settings-action-btn"
              onClick={exportData}
            >
              <Download size={18} />
              Export Backup
            </button>

            <label className="settings-action-btn">
              <Upload size={18} />
              Import Backup

              <input
                type="file"
                accept=".json,application/json"
                onChange={importData}
                style={{ display: "none" }}
              />
            </label>

            <button
              className="settings-action-btn"
              onClick={resetSettings}
            >
              <RotateCcw size={18} />
              Reset Settings
            </button>
          </div>

          <div className="settings-info">
            <AlertTriangle
              size={16}
              style={{ verticalAlign: "middle", marginRight: 6 }}
            />

            Before clearing application data, export a backup so that
            patients, doctors, tests, reports, bills and other records can
            be restored later.
          </div>
        </div>

        {/* Danger */}
        <div className="settings-card full">
          <div className="settings-card-title">
            <AlertTriangle size={21} />

            <div>
              <h2>Danger Zone</h2>
              <p>Use this only when resetting the application.</p>
            </div>
          </div>

          <button
            className="settings-action-btn danger"
            onClick={resetDemoData}
          >
            <RotateCcw size={18} />
            Clear Application Data
          </button>
        </div>
      </div>
    </div>
  );
}