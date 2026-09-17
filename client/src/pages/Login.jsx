import React, { useState } from "react";
import {
  ShieldCheck,
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Microscope,
  Users,
  FileText,
  Stethoscope,
  BarChart3,
} from "lucide-react";

function Login({ onLogin }) {
  const [role, setRole] = useState("administrator");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const roleData = {
    administrator: {
      title: "Administrator",
      subtitle: "Full system access",
      placeholder: "Enter administrator username",
    },
    technician: {
      title: "Lab Technician",
      subtitle: "Laboratory operations",
      placeholder: "Enter technician username",
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    /*
      TEMPORARY LOGIN

      We will replace this later when you provide
      the real administrator and technician credentials.
    */

    const userData = {
      name:
        role === "administrator"
          ? username.trim()
          : username.trim(),
      username: username.trim(),
      role:
        role === "administrator"
          ? "Administrator"
          : "Lab Technician",
      access: role,
    };

    if (remember) {
      localStorage.setItem(
        "taz_company_remember",
        JSON.stringify({
          username: username.trim(),
          role,
        })
      );
    }

    onLogin(userData);
  };

  return (
    <div className="login-page">
      <section className="login-brand-section">
        <div className="login-brand-content">
          <div className="large-brand">
            <div className="large-brand-logo">T</div>

            <div>
              <h1>TAZ</h1>
              <h2>COMPANY</h2>
              <p>SMART BUSINESS MANAGEMENT</p>
            </div>
          </div>

          <div className="brand-tagline">
            <span>✦</span>
            ADVANCED BUSINESS MANAGEMENT
          </div>

          <h3>
            Smarter management
            <br />
            for modern businesses.
          </h3>

          <p className="brand-description">
            Manage your operations, customers, staff, reports and
            business performance efficiently from one secure platform.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <Users size={20} />
              </div>

              <div>
                <strong>Customer Management</strong>
                <span>Register and manage customer records</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FileText size={20} />
              </div>

              <div>
                <strong>Business Reports</strong>
                <span>Create, manage and view business reports</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <Stethoscope size={20} />
              </div>

              <div>
                <strong>Staff Management</strong>
                <span>Manage employees and operations</span>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <BarChart3 size={20} />
              </div>

              <div>
                <strong>Business Statistics</strong>
                <span>Monitor business performance</span>
              </div>
            </div>
          </div>

          <div className="login-copyright">
            © 2026 TAZ Company
          </div>
        </div>
      </section>

      <section className="login-form-section">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-card-logo">
              <Microscope size={30} />
            </div>

            <div>
              <h2>TAZ COMPANY</h2>
              <p>SECURE ACCESS</p>
            </div>
          </div>

          <div className="welcome-block">
            <h1>Welcome back</h1>

            <p>
              Sign in to continue to the TAZ Company management
              system.
            </p>
          </div>

          <div className="signin-label">SIGN IN AS</div>

          <div className="role-selector">
            <button
              type="button"
              className={`role-card ${
                role === "administrator" ? "selected" : ""
              }`}
              onClick={() => {
                setRole("administrator");
                setError("");
              }}
            >
              <div className="role-icon">
                <ShieldCheck size={22} />
              </div>

              <div className="role-text">
                <strong>Administrator</strong>
                <span>Full system access</span>
              </div>

              {role === "administrator" && (
                <CheckCircle2
                  className="role-check"
                  size={21}
                />
              )}
            </button>

            <button
              type="button"
              className={`role-card ${
                role === "technician" ? "selected" : ""
              }`}
              onClick={() => {
                setRole("technician");
                setError("");
              }}
            >
              <div className="role-icon">
                <UserRound size={22} />
              </div>

              <div className="role-text">
                <strong>Lab Technician</strong>
                <span>Laboratory operations</span>
              </div>

              {role === "technician" && (
                <CheckCircle2
                  className="role-check"
                  size={21}
                />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Username</label>

              <div className="input-wrapper">
                <UserRound size={19} />

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    roleData[role].placeholder
                  }
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label>Password</label>

                <button
                  type="button"
                  className="forgot-button"
                  onClick={() =>
                    alert(
                      "Password reset will be connected later."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="input-wrapper">
                <LockKeyhole size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <div className="remember-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(e.target.checked)
                  }
                />

                <span>Remember me</span>
              </label>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button type="submit" className="signin-button">
              <span>Sign in</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="secure-footer">
            <div>
              <LockKeyhole size={16} />
              <span>
                Secure access • Authorized users only
              </span>
            </div>

            <div>
              <Microscope size={16} />
              <span>TAZ Company</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;