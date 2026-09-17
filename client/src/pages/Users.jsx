import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  UserCog,
  ShieldCheck,
  ShieldOff,
  X,
  Check,
  Lock,
  Mail,
  Phone,
  KeyRound,
  Users as UsersIcon,
} from "lucide-react";

const STORAGE_KEY = "taz_company_users";

const DEFAULT_USERS = [
  {
    id: "USR001",
    name: "Administrator",
    username: "admin",
    password: "admin123",
    role: "Administrator",
    phone: "",
    email: "",
    status: "Active",
    permissions: [
      "Dashboard",
      "Patient Entry",
      "Patients",
      "Doctors",
      "Test Management",
      "Test Master",
      "Reports",
      "Messages",
      "Users",
      "Billing",
      "Analytics",
      "Settings",
    ],
    createdAt: "2026-01-01",
  },
  {
    id: "USR002",
    name: "Lab Technician",
    username: "technician",
    password: "tech123",
    role: "Lab Technician",
    phone: "",
    email: "",
    status: "Active",
    permissions: [
      "Dashboard",
      "Patient Entry",
      "Patients",
      "Doctors",
      "Test Management",
      "Test Master",
      "Reports",
      "Messages",
    ],
    createdAt: "2026-01-01",
  },
];

const ALL_PERMISSIONS = [
  "Dashboard",
  "Patient Entry",
  "Patients",
  "Doctors",
  "Test Management",
  "Test Master",
  "Reports",
  "Messages",
  "Users",
  "Billing",
  "Analytics",
  "Settings",
];

const emptyForm = {
  id: "",
  name: "",
  username: "",
  password: "",
  role: "Lab Technician",
  phone: "",
  email: "",
  status: "Active",
  permissions: [
    "Dashboard",
    "Patient Entry",
    "Patients",
    "Reports",
  ],
};

function loadUsers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }

    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

function generateUserId(users) {
  const numbers = users
    .map((user) => Number(String(user.id || "").replace(/\D/g, "")))
    .filter((number) => Number.isFinite(number));

  const next = numbers.length ? Math.max(...numbers) + 1 : 1;

  return `USR${String(next).padStart(3, "0")}`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Users() {
  const [users, setUsers] = useState(loadUsers);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showView, setShowView] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const stats = useMemo(() => {
    const total = users.length;

    const active = users.filter(
      (user) => user.status === "Active"
    ).length;

    const inactive = users.filter(
      (user) => user.status === "Inactive"
    ).length;

    const administrators = users.filter(
      (user) => user.role === "Administrator"
    ).length;

    const technicians = users.filter(
      (user) => user.role === "Lab Technician"
    ).length;

    return {
      total,
      active,
      inactive,
      administrators,
      technicians,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !value ||
        user.id?.toLowerCase().includes(value) ||
        user.name?.toLowerCase().includes(value) ||
        user.username?.toLowerCase().includes(value) ||
        user.role?.toLowerCase().includes(value) ||
        user.email?.toLowerCase().includes(value) ||
        user.phone?.toLowerCase().includes(value);

      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  function openAddModal() {
    setModalMode("add");

    setForm({
      ...emptyForm,
      id: generateUserId(users),
      permissions: [
        "Dashboard",
        "Patient Entry",
        "Patients",
        "Reports",
      ],
    });

    setShowPassword(false);
    setShowModal(true);
  }

  function openEditModal(user) {
    setModalMode("edit");

    setForm({
      ...user,
      permissions: Array.isArray(user.permissions)
        ? [...user.permissions]
        : [],
    });

    setShowPassword(false);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setShowPassword(false);
    setForm(emptyForm);
  }

  function openView(user) {
    setSelectedUser(user);
    setShowView(true);
  }

  function closeView() {
    setSelectedUser(null);
    setShowView(false);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleRoleChange(event) {
    const role = event.target.value;

    let permissions = form.permissions;

    if (role === "Administrator") {
      permissions = [...ALL_PERMISSIONS];
    } else if (role === "Lab Technician") {
      permissions = [
        "Dashboard",
        "Patient Entry",
        "Patients",
        "Doctors",
        "Test Management",
        "Test Master",
        "Reports",
        "Messages",
      ];
    }

    setForm((previous) => ({
      ...previous,
      role,
      permissions,
    }));
  }

  function togglePermission(permission) {
    setForm((previous) => {
      const exists = previous.permissions.includes(permission);

      return {
        ...previous,
        permissions: exists
          ? previous.permissions.filter(
              (item) => item !== permission
            )
          : [...previous.permissions, permission],
      };
    });
  }

  function selectAllPermissions() {
    setForm((previous) => ({
      ...previous,
      permissions: [...ALL_PERMISSIONS],
    }));
  }

  function clearPermissions() {
    setForm((previous) => ({
      ...previous,
      permissions: [],
    }));
  }

  function validateForm() {
    if (!form.name.trim()) {
      alert("Please enter user name.");
      return false;
    }

    if (!form.username.trim()) {
      alert("Please enter username.");
      return false;
    }

    if (modalMode === "add" && !form.password.trim()) {
      alert("Please enter password.");
      return false;
    }

    if (form.password.length > 0 && form.password.length < 4) {
      alert("Password must contain at least 4 characters.");
      return false;
    }

    const duplicateUsername = users.some(
      (user) =>
        user.username.toLowerCase() ===
          form.username.trim().toLowerCase() &&
        user.id !== form.id
    );

    if (duplicateUsername) {
      alert("Username already exists. Please choose another username.");
      return false;
    }

    if (form.permissions.length === 0) {
      alert("Please select at least one permission.");
      return false;
    }

    return true;
  }

  function saveUser(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    setTimeout(() => {
      if (modalMode === "add") {
        const newUser = {
          ...form,
          id: form.id || generateUserId(users),
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          createdAt: new Date().toISOString(),
        };

        setUsers((previous) => [...previous, newUser]);
      } else {
        setUsers((previous) =>
          previous.map((user) =>
            user.id === form.id
              ? {
                  ...user,
                  ...form,
                  name: form.name.trim(),
                  username: form.username.trim(),
                  email: form.email.trim(),
                  phone: form.phone.trim(),
                }
              : user
          )
        );
      }

      setSaving(false);
      closeModal();
    }, 250);
  }

  function toggleUserStatus(user) {
    const newStatus =
      user.status === "Active" ? "Inactive" : "Active";

    setUsers((previous) =>
      previous.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );
  }

  function deleteUser(user) {
    if (user.username === "admin") {
      alert("The main Administrator account cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Delete user "${user.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setUsers((previous) =>
      previous.filter((item) => item.id !== user.id)
    );
  }

  function resetUsers() {
    const confirmed = window.confirm(
      "Reset users to the default TAZ COMPANY users?"
    );

    if (!confirmed) return;

    setUsers(DEFAULT_USERS);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_USERS)
    );
  }

  function exportUsers() {
    const headers = [
      "User ID",
      "Name",
      "Username",
      "Role",
      "Phone",
      "Email",
      "Status",
      "Permissions",
      "Created Date",
    ];

    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.username,
      user.role,
      user.phone || "",
      user.email || "",
      user.status,
      (user.permissions || []).join(" | "),
      formatDate(user.createdAt),
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "taz-company-users.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="users-page">
      <style>{`
        .users-page {
          padding: 28px 30px 40px;
          color: #3a0610;
          min-height: calc(100vh - 100px);
          box-sizing: border-box;
        }

        .users-page *,
        .users-page *::before,
        .users-page *::after {
          box-sizing: border-box;
        }

        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .users-title {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          color: #3a0610;
        }

        .users-subtitle {
          margin: 7px 0 0;
          color: #8b7480;
          font-size: 14px;
        }

        .users-actions {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .users-btn {
          border: 1px solid #ead9de;
          background: #fff;
          color: #5b0a1a;
          min-height: 42px;
          padding: 0 15px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: .18s ease;
        }

        .users-btn:hover {
          border-color: #8b1730;
          transform: translateY(-1px);
        }

        .users-btn.primary {
          color: #fff;
          background: #7b0d22;
          border-color: #7b0d22;
        }

        .users-btn.primary:hover {
          background: #5b0a1a;
        }

        .users-btn.danger {
          color: #b42318;
        }

        .users-btn.small {
          min-height: 34px;
          padding: 0 10px;
          font-size: 12px;
        }

        .users-stats {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .user-stat {
          background: #fff;
          border: 1px solid #eadde1;
          border-radius: 13px;
          padding: 17px;
          box-shadow: 0 5px 20px rgba(91, 10, 26, .035);
        }

        .user-stat-label {
          color: #8b7480;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .user-stat-value {
          color: #3a0610;
          font-size: 24px;
          line-height: 1;
          font-weight: 800;
        }

        .users-toolbar {
          background: #fff;
          border: 1px solid #eadde1;
          border-radius: 13px;
          padding: 15px;
          margin-bottom: 15px;
          display: grid;
          grid-template-columns: minmax(260px, 1fr) 180px 180px auto;
          gap: 10px;
        }

        .users-search {
          height: 43px;
          border: 1px solid #e5d4da;
          border-radius: 9px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          background: #fff;
        }

        .users-search svg {
          color: #9b7b85;
          flex: 0 0 auto;
        }

        .users-search input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: none;
          padding: 0 10px;
          font-size: 13px;
          color: #3a0610;
          background: transparent;
        }

        .users-filter {
          height: 43px;
          border: 1px solid #e5d4da;
          border-radius: 9px;
          padding: 0 11px;
          outline: none;
          background: #fff;
          color: #4c3038;
          font-size: 13px;
          cursor: pointer;
        }

        .users-table-card {
          background: #fff;
          border: 1px solid #eadde1;
          border-radius: 13px;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(91, 10, 26, .035);
        }

        .users-table-wrap {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
        }

        .users-table th {
          background: #fcf7f8;
          color: #80656e;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .35px;
          text-align: left;
          padding: 14px 14px;
          border-bottom: 1px solid #eadde1;
          white-space: nowrap;
        }

        .users-table td {
          padding: 14px;
          border-bottom: 1px solid #f0e5e8;
          font-size: 13px;
          color: #513740;
          vertical-align: middle;
        }

        .users-table tr:last-child td {
          border-bottom: 0;
        }

        .users-table tbody tr:hover {
          background: #fffafb;
        }

        .user-id {
          color: #7b0d22;
          font-weight: 800;
        }

        .user-name {
          font-weight: 800;
          color: #3a0610;
        }

        .user-username {
          color: #967983;
          font-size: 12px;
          margin-top: 3px;
        }

        .role-badge,
        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .role-admin {
          background: #f7e6eb;
          color: #7b0d22;
        }

        .role-tech {
          background: #eeeaf7;
          color: #594274;
        }

        .status-active {
          background: #e9f8ef;
          color: #147a42;
        }

        .status-inactive {
          background: #f4e8ea;
          color: #8b3545;
        }

        .permission-count {
          color: #6d525c;
          font-size: 12px;
          font-weight: 700;
        }

        .user-row-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .icon-action {
          width: 33px;
          height: 33px;
          border-radius: 8px;
          border: 1px solid #ead9de;
          background: #fff;
          color: #6f2737;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .icon-action:hover {
          border-color: #8b1730;
          background: #fff7f8;
        }

        .icon-action.delete {
          color: #b42318;
        }

        .empty-users {
          padding: 65px 20px;
          text-align: center;
          color: #957b84;
        }

        .empty-users svg {
          margin-bottom: 10px;
          color: #c8aeb6;
        }

        .empty-users h3 {
          margin: 0 0 6px;
          color: #5c3d46;
        }

        .empty-users p {
          margin: 0;
          font-size: 13px;
        }

        .users-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(36, 4, 12, .58);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }

        .users-modal {
          width: min(850px, 100%);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 25px 80px rgba(38, 3, 12, .28);
        }

        .users-modal.large {
          width: min(920px, 100%);
        }

        .users-modal-head {
          min-height: 70px;
          padding: 18px 22px;
          border-bottom: 1px solid #eadde1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 2;
        }

        .users-modal-title {
          margin: 0;
          color: #5b0a1a;
          font-size: 19px;
          font-weight: 800;
        }

        .users-modal-close {
          width: 36px;
          height: 36px;
          border: 0;
          background: #f8e9ed;
          color: #7b0d22;
          border-radius: 9px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .users-modal-body {
          padding: 22px;
        }

        .users-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .users-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .users-field.full {
          grid-column: 1 / -1;
        }

        .users-field label {
          color: #51343d;
          font-size: 12px;
          font-weight: 800;
        }

        .users-field input,
        .users-field select {
          width: 100%;
          height: 43px;
          border: 1px solid #dfcfd5;
          border-radius: 9px;
          outline: none;
          padding: 0 12px;
          color: #3a0610;
          background: #fff;
          font-size: 13px;
        }

        .users-field textarea {
          width: 100%;
          min-height: 90px;
          resize: vertical;
          border: 1px solid #dfcfd5;
          border-radius: 9px;
          outline: none;
          padding: 11px 12px;
          color: #3a0610;
          background: #fff;
          font-size: 13px;
        }

        .users-field input:focus,
        .users-field select:focus,
        .users-field textarea:focus {
          border-color: #8b1730;
          box-shadow: 0 0 0 3px rgba(139, 23, 48, .08);
        }

        .password-wrap {
          position: relative;
        }

        .password-wrap input {
          padding-right: 43px;
        }

        .password-eye {
          position: absolute;
          right: 7px;
          top: 5px;
          width: 33px;
          height: 33px;
          border: 0;
          background: transparent;
          color: #8d717a;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .field-help {
          color: #9b8089;
          font-size: 11px;
          line-height: 1.4;
        }

        .permission-box {
          border: 1px solid #e6d7dc;
          border-radius: 11px;
          overflow: hidden;
        }

        .permission-head {
          padding: 11px 13px;
          background: #fcf7f8;
          border-bottom: 1px solid #e6d7dc;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .permission-head strong {
          font-size: 12px;
          color: #5b0a1a;
        }

        .permission-actions {
          display: flex;
          gap: 6px;
        }

        .permission-link {
          border: 0;
          background: transparent;
          color: #7b0d22;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        .permission-list {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          padding: 14px;
          gap: 9px;
        }

        .permission-item {
          min-height: 40px;
          border: 1px solid #eadde1;
          border-radius: 8px;
          padding: 7px 9px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          background: #fff;
        }

        .permission-item.selected {
          background: #fff4f6;
          border-color: #c98b99;
        }

        .permission-item input {
          width: 16px;
          height: 16px;
          accent-color: #7b0d22;
          cursor: pointer;
        }

        .permission-item span {
          color: #51343d;
          font-size: 12px;
          font-weight: 700;
        }

        .users-modal-footer {
          padding: 16px 22px;
          border-top: 1px solid #eadde1;
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          position: sticky;
          bottom: 0;
          background: #fff;
          z-index: 2;
        }

        .view-user-top {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 5px 0 22px;
        }

        .view-user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #f7e5ea;
          color: #7b0d22;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 900;
        }

        .view-user-name {
          font-size: 21px;
          font-weight: 800;
          color: #3a0610;
        }

        .view-user-role {
          margin-top: 5px;
          color: #8d737c;
          font-size: 13px;
        }

        .view-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
          margin-bottom: 20px;
        }

        .view-info {
          border: 1px solid #eadde1;
          border-radius: 10px;
          padding: 12px;
        }

        .view-info-label {
          color: #947b84;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .4px;
          margin-bottom: 5px;
        }

        .view-info-value {
          color: #4d3039;
          font-size: 13px;
          font-weight: 700;
          word-break: break-word;
        }

        .view-section-title {
          margin: 0 0 10px;
          color: #5b0a1a;
          font-size: 14px;
          font-weight: 800;
        }

        .view-permissions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .view-permission {
          background: #f8edf0;
          color: #6f2334;
          border-radius: 999px;
          padding: 6px 9px;
          font-size: 11px;
          font-weight: 800;
        }

        @media (max-width: 1100px) {
          .users-stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .users-toolbar {
            grid-template-columns: 1fr 1fr;
          }

          .permission-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .users-page {
            padding: 18px 14px 30px;
          }

          .users-header {
            flex-direction: column;
          }

          .users-actions {
            width: 100%;
          }

          .users-btn {
            flex: 1;
          }

          .users-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .users-toolbar {
            grid-template-columns: 1fr;
          }

          .users-form-grid,
          .view-info-grid {
            grid-template-columns: 1fr;
          }

          .users-field.full {
            grid-column: auto;
          }

          .permission-list {
            grid-template-columns: 1fr;
          }

          .permission-head {
            align-items: flex-start;
            flex-direction: column;
          }

          .users-modal-body {
            padding: 16px;
          }

          .users-modal-head,
          .users-modal-footer {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>

      <div className="users-header">
        <div>
          <h1 className="users-title">User Management</h1>
          <p className="users-subtitle">
            Manage administrators, lab technicians, access and permissions.
          </p>
        </div>

        <div className="users-actions">
          <button
            type="button"
            className="users-btn"
            onClick={resetUsers}
          >
            <RefreshCw size={15} />
            Reset
          </button>

          <button
            type="button"
            className="users-btn"
            onClick={exportUsers}
          >
            Export CSV
          </button>

          <button
            type="button"
            className="users-btn primary"
            onClick={openAddModal}
          >
            <Plus size={17} />
            Add User
          </button>
        </div>
      </div>

      <div className="users-stats">
        <div className="user-stat">
          <div className="user-stat-label">Total Users</div>
          <div className="user-stat-value">{stats.total}</div>
        </div>

        <div className="user-stat">
          <div className="user-stat-label">Active Users</div>
          <div className="user-stat-value">{stats.active}</div>
        </div>

        <div className="user-stat">
          <div className="user-stat-label">Inactive Users</div>
          <div className="user-stat-value">{stats.inactive}</div>
        </div>

        <div className="user-stat">
          <div className="user-stat-label">Administrators</div>
          <div className="user-stat-value">{stats.administrators}</div>
        </div>

        <div className="user-stat">
          <div className="user-stat-label">Lab Technicians</div>
          <div className="user-stat-value">{stats.technicians}</div>
        </div>
      </div>

      <div className="users-toolbar">
        <div className="users-search">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, username, role, phone or email..."
          />
        </div>

        <select
          className="users-filter"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Administrator">Administrator</option>
          <option value="Lab Technician">Lab Technician</option>
        </select>

        <select
          className="users-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          type="button"
          className="users-btn"
          onClick={() => {
            setSearch("");
            setRoleFilter("All");
            setStatusFilter("All");
          }}
        >
          Clear
        </button>
      </div>

      <div className="users-table-card">
        {filteredUsers.length === 0 ? (
          <div className="empty-users">
            <UsersIcon size={42} />
            <h3>No users found</h3>
            <p>Try changing your search or filter.</p>
          </div>
        ) : (
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="user-id">
                        {user.id}
                      </span>
                    </td>

                    <td>
                      <div className="user-name">
                        {user.name}
                      </div>

                      <div className="user-username">
                        @{user.username}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`role-badge ${
                          user.role === "Administrator"
                            ? "role-admin"
                            : "role-tech"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <div>{user.phone || "-"}</div>
                      <div className="user-username">
                        {user.email || "No email"}
                      </div>
                    </td>

                    <td>
                      <span className="permission-count">
                        {user.permissions?.length || 0} modules
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          user.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>{formatDate(user.createdAt)}</td>

                    <td>
                      <div className="user-row-actions">
                        <button
                          type="button"
                          className="icon-action"
                          title="View"
                          onClick={() => openView(user)}
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          type="button"
                          className="icon-action"
                          title="Edit"
                          onClick={() => openEditModal(user)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          className="icon-action"
                          title={
                            user.status === "Active"
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() =>
                            toggleUserStatus(user)
                          }
                        >
                          {user.status === "Active" ? (
                            <ShieldOff size={15} />
                          ) : (
                            <ShieldCheck size={15} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="icon-action delete"
                          title="Delete"
                          onClick={() => deleteUser(user)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="users-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="users-modal large">
            <div className="users-modal-head">
              <h2 className="users-modal-title">
                {modalMode === "add"
                  ? "Add New User"
                  : "Edit User"}
              </h2>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeModal}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveUser}>
              <div className="users-modal-body">
                <div className="users-form-grid">
                  <div className="users-field">
                    <label>User ID</label>

                    <input
                      type="text"
                      value={form.id}
                      readOnly
                      style={{
                        background: "#f8f2f4",
                        color: "#856a74",
                      }}
                    />
                  </div>

                  <div className="users-field">
                    <label>Status</label>

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="users-field">
                    <label>User Name *</label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="users-field">
                    <label>Role *</label>

                    <select
                      name="role"
                      value={form.role}
                      onChange={handleRoleChange}
                    >
                      <option value="Administrator">
                        Administrator
                      </option>

                      <option value="Lab Technician">
                        Lab Technician
                      </option>
                    </select>
                  </div>

                  <div className="users-field">
                    <label>Username *</label>

                    <input
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Enter login username"
                      autoComplete="off"
                    />
                  </div>

                  <div className="users-field">
                    <label>Password {modalMode === "add" ? "*" : ""}</label>

                    <div className="password-wrap">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder={
                          modalMode === "edit"
                            ? "Leave blank to keep current password"
                            : "Enter password"
                        }
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="password-eye"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    <span className="field-help">
                      Minimum 4 characters.
                    </span>
                  </div>

                  <div className="users-field">
                    <label>Phone</label>

                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Optional phone number"
                    />
                  </div>

                  <div className="users-field">
                    <label>Email</label>

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Optional email"
                    />
                  </div>

                  <div className="users-field full">
                    <div className="permission-box">
                      <div className="permission-head">
                        <strong>
                          Module Permissions
                        </strong>

                        <div className="permission-actions">
                          <button
                            type="button"
                            className="permission-link"
                            onClick={selectAllPermissions}
                          >
                            Select All
                          </button>

                          <button
                            type="button"
                            className="permission-link"
                            onClick={clearPermissions}
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      <div className="permission-list">
                        {ALL_PERMISSIONS.map((permission) => {
                          const selected =
                            form.permissions.includes(permission);

                          return (
                            <label
                              key={permission}
                              className={`permission-item ${
                                selected ? "selected" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  togglePermission(permission)
                                }
                              />

                              <span>{permission}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="users-modal-footer">
                <button
                  type="button"
                  className="users-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="users-btn primary"
                  disabled={saving}
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check size={16} />
                      {modalMode === "add"
                        ? "Create User"
                        : "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showView && selectedUser && (
        <div
          className="users-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeView();
            }
          }}
        >
          <div className="users-modal">
            <div className="users-modal-head">
              <h2 className="users-modal-title">
                User Details
              </h2>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeView}
              >
                <X size={18} />
              </button>
            </div>

            <div className="users-modal-body">
              <div className="view-user-top">
                <div className="view-user-avatar">
                  {selectedUser.name
                    ?.charAt(0)
                    .toUpperCase() || "U"}
                </div>

                <div>
                  <div className="view-user-name">
                    {selectedUser.name}
                  </div>

                  <div className="view-user-role">
                    {selectedUser.role}
                  </div>
                </div>
              </div>

              <div className="view-info-grid">
                <div className="view-info">
                  <div className="view-info-label">
                    User ID
                  </div>

                  <div className="view-info-value">
                    {selectedUser.id}
                  </div>
                </div>

                <div className="view-info">
                  <div className="view-info-label">
                    Username
                  </div>

                  <div className="view-info-value">
                    @{selectedUser.username}
                  </div>
                </div>

                <div className="view-info">
                  <div className="view-info-label">
                    Phone
                  </div>

                  <div className="view-info-value">
                    {selectedUser.phone || "Not provided"}
                  </div>
                </div>

                <div className="view-info">
                  <div className="view-info-label">
                    Email
                  </div>

                  <div className="view-info-value">
                    {selectedUser.email || "Not provided"}
                  </div>
                </div>

                <div className="view-info">
                  <div className="view-info-label">
                    Status
                  </div>

                  <div className="view-info-value">
                    {selectedUser.status}
                  </div>
                </div>

                <div className="view-info">
                  <div className="view-info-label">
                    Created
                  </div>

                  <div className="view-info-value">
                    {formatDate(selectedUser.createdAt)}
                  </div>
                </div>
              </div>

              <h3 className="view-section-title">
                Module Permissions
              </h3>

              <div className="view-permissions">
                {(selectedUser.permissions || []).map(
                  (permission) => (
                    <span
                      className="view-permission"
                      key={permission}
                    >
                      {permission}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="users-modal-footer">
              <button
                type="button"
                className="users-btn"
                onClick={closeView}
              >
                Close
              </button>

              <button
                type="button"
                className="users-btn primary"
                onClick={() => {
                  closeView();
                  openEditModal(selectedUser);
                }}
              >
                <Pencil size={15} />
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}