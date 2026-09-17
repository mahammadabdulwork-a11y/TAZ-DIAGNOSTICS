import React, { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  Send,
  Share2,
  X,
} from "lucide-react";

const KEY = "taz_company_messages";

function readMessages() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function nextId(items) {
  let max = 0;

  items.forEach((x) => {
    const n = Number(String(x.id || "").replace(/\D/g, ""));
    if (n > max) max = n;
  });

  return `MSG${String(max + 1).padStart(4, "0")}`;
}

export default function Messages() {
  const [messages, setMessages] = useState(readMessages);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const blank = {
    patientId: "",
    patientName: "",
    phone: "",
    email: "",
    type: "SMS",
    status: "Pending",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    message: "",
  };

  const [form, setForm] = useState(blank);

  const refresh = () => {
    setMessages(readMessages());

    try {
      setPatients(
        JSON.parse(
          localStorage.getItem("taz_company_patients") || "[]"
        )
      );
    } catch {}
  };

  useEffect(() => {
    refresh();

    const handler = () => refresh();

    window.addEventListener("storage", handler);
    window.addEventListener("focus", handler);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("focus", handler);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return messages.filter((m) => {
      const searchMatch =
        !q ||
        [
          m.id,
          m.patientId,
          m.patientName,
          m.phone,
          m.email,
          m.message,
          m.type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const typeMatch = type === "All" || m.type === type;
      const statusMatch =
        status === "All" || m.status === status;

      return searchMatch && typeMatch && statusMatch;
    });
  }, [messages, search, type, status]);

  const patientChange = (id) => {
    const p = patients.find(
      (x) => (x.id || x.patientId) === id
    );

    setForm({
      ...form,
      patientId: id,
      patientName: p?.name || p?.patientName || "",
      phone: p?.phone || "",
      email: p?.email || "",
    });
  };

  const save = () => {
    if (!form.patientId || !form.message.trim()) {
      alert("Please select patient and enter message.");
      return;
    }

    let updated;

    if (form.id) {
      updated = messages.map((m) =>
        m.id === form.id ? { ...form } : m
      );
    } else {
      updated = [
        {
          ...form,
          id: nextId(messages),
          createdAt: new Date().toISOString(),
        },
        ...messages,
      ];
    }

    setMessages(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setModal(null);
    setForm(blank);
  };

  const sendMessage = (m) => {
    const updated = messages.map((x) =>
      x.id === m.id
        ? {
            ...x,
            status: "Sent",
            sentAt: new Date().toISOString(),
          }
        : x
    );

    setMessages(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  };

  const remove = (m) => {
    if (!window.confirm(`Delete ${m.id}?`)) return;

    const updated = messages.filter((x) => x.id !== m.id);

    setMessages(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  };

  const share = async (m) => {
    const text = `TAZ DIAGNOSTIC
Patient: ${m.patientName}
Type: ${m.type}

${m.message}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "TAZ Diagnostic Message",
          text,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert("Message copied.");
    }
  };

  return (
    <div className="messages-page">
      <style>{`
        .messages-page {
          padding:28px;
          background:#f8f5f6;
          min-height:calc(100vh - 72px);
        }

        .messages-head {
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:20px;
        }

        .messages-title {
          display:flex;
          gap:14px;
          align-items:center;
        }

        .messages-icon {
          width:52px;
          height:52px;
          border-radius:14px;
          background:#f8e9ed;
          color:#700b22;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .messages-title h1 {
          margin:0;
          color:#4e0818;
          font-size:25px;
        }

        .messages-title p {
          margin:4px 0 0;
          color:#8c7d82;
          font-size:13px;
        }

        .messages-actions {
          display:flex;
          gap:9px;
        }

        .msg-btn {
          height:42px;
          padding:0 15px;
          border-radius:8px;
          border:1px solid #dfd2d6;
          background:white;
          color:#670b20;
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:7px;
          font-weight:700;
        }

        .msg-btn.primary {
          background:#700b22;
          color:white;
          border-color:#700b22;
        }

        .msg-stats {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:14px;
          margin-bottom:16px;
        }

        .msg-stat {
          background:white;
          border:1px solid #eadde1;
          border-radius:13px;
          padding:17px;
        }

        .msg-stat span {
          color:#8d7e83;
          font-size:12px;
        }

        .msg-stat strong {
          display:block;
          color:#4d0818;
          font-size:24px;
          margin-top:4px;
        }

        .msg-toolbar {
          background:white;
          border:1px solid #eadde1;
          border-radius:13px;
          padding:13px;
          display:grid;
          grid-template-columns:1fr 150px 150px;
          gap:10px;
          margin-bottom:15px;
        }

        .msg-search {
          display:flex;
          align-items:center;
          gap:8px;
          border:1px solid #ddd0d5;
          border-radius:8px;
          padding:0 12px;
        }

        .msg-search input {
          width:100%;
          height:42px;
          border:none;
          outline:none;
        }

        .msg-toolbar select {
          border:1px solid #ddd0d5;
          border-radius:8px;
          padding:0 10px;
          background:white;
        }

        .msg-card {
          background:white;
          border:1px solid #eadde1;
          border-radius:13px;
          overflow:hidden;
        }

        .msg-table {
          width:100%;
          border-collapse:collapse;
        }

        .msg-table th {
          background:#fbf8f9;
          color:#74666c;
          font-size:11px;
          padding:13px;
          text-align:left;
        }

        .msg-table td {
          padding:14px 13px;
          border-top:1px solid #eee5e8;
          font-size:13px;
        }

        .msg-id {
          color:#670a20;
          font-weight:800;
        }

        .msg-patient {
          color:#520819;
          font-weight:800;
        }

        .msg-sub {
          color:#95868b;
          font-size:11px;
          margin-top:3px;
        }

        .msg-badge {
          padding:5px 9px;
          border-radius:20px;
          background:#f8e8ec;
          color:#700b22;
          font-size:10px;
          font-weight:800;
        }

        .msg-badge.sent {
          background:#e5f5ea;
          color:#23723e;
        }

        .msg-action {
          width:33px;
          height:33px;
          border:1px solid #e0d4d8;
          background:white;
          color:#6b0b21;
          border-radius:7px;
          cursor:pointer;
          margin-right:4px;
        }

        .empty-message {
          text-align:center;
          padding:80px 20px;
          color:#928389;
        }

        .empty-message svg {
          color:#760d24;
        }

        .modal-bg {
          position:fixed;
          inset:0;
          background:rgba(30,0,8,.48);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:1000;
          padding:20px;
        }

        .msg-modal {
          width:min(680px,100%);
          max-height:90vh;
          overflow:auto;
          background:white;
          border-radius:16px;
        }

        .modal-head {
          padding:18px 20px;
          border-bottom:1px solid #eee4e7;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .modal-head h2 {
          margin:0;
          color:#520819;
        }

        .close {
          width:34px;
          height:34px;
          border:none;
          background:#f8e9ed;
          color:#700b22;
          border-radius:7px;
          cursor:pointer;
        }

        .msg-form {
          padding:20px;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
        }

        .msg-field.full {
          grid-column:1/-1;
        }

        .msg-field label {
          display:block;
          font-size:12px;
          font-weight:700;
          color:#5e5156;
          margin-bottom:6px;
        }

        .msg-field input,
        .msg-field select,
        .msg-field textarea {
          width:100%;
          box-sizing:border-box;
          border:1px solid #ddd0d5;
          border-radius:8px;
          padding:10px;
          outline:none;
          font-family:inherit;
        }

        .msg-field textarea {
          min-height:120px;
          resize:vertical;
        }

        .msg-footer {
          border-top:1px solid #eee4e7;
          padding:15px 20px;
          display:flex;
          justify-content:flex-end;
          gap:10px;
        }

        @media(max-width:900px) {
          .msg-stats {
            grid-template-columns:1fr 1fr;
          }

          .msg-toolbar {
            grid-template-columns:1fr;
          }

          .msg-card {
            overflow-x:auto;
          }

          .msg-table {
            min-width:1000px;
          }
        }

        @media(max-width:650px) {
          .messages-page {
            padding:15px;
          }

          .messages-head {
            flex-direction:column;
            align-items:flex-start;
            gap:15px;
          }

          .msg-form {
            grid-template-columns:1fr;
          }

          .msg-field.full {
            grid-column:auto;
          }
        }
      `}</style>

      <div className="messages-head">
        <div className="messages-title">
          <div className="messages-icon">
            <MessageSquare size={27} />
          </div>

          <div>
            <h1>Messages</h1>
            <p>Patient reminders and laboratory notifications</p>
          </div>
        </div>

        <div className="messages-actions">
          <button className="msg-btn" onClick={refresh}>
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="msg-btn primary"
            onClick={() => {
              setForm(blank);
              setModal("form");
            }}
          >
            <Plus size={16} />
            New Message
          </button>
        </div>
      </div>

      <div className="msg-stats">
        <div className="msg-stat">
          <span>Total</span>
          <strong>{messages.length}</strong>
        </div>

        <div className="msg-stat">
          <span>Sent</span>
          <strong>
            {messages.filter((m) => m.status === "Sent").length}
          </strong>
        </div>

        <div className="msg-stat">
          <span>Pending</span>
          <strong>
            {messages.filter((m) => m.status === "Pending").length}
          </strong>
        </div>

        <div className="msg-stat">
          <span>Failed</span>
          <strong>
            {messages.filter((m) => m.status === "Failed").length}
          </strong>
        </div>
      </div>

      <div className="msg-toolbar">
        <div className="msg-search">
          <Search size={18} color="#8c7d82" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, message, phone or email..."
          />
        </div>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>All</option>
          <option>SMS</option>
          <option>WhatsApp</option>
          <option>Email</option>
          <option>Reminder</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          <option>Sent</option>
          <option>Pending</option>
          <option>Failed</option>
        </select>
      </div>

      <div className="msg-card">
        {filtered.length === 0 ? (
          <div className="empty-message">
            <MessageSquare size={50} />
            <h3>No message history available</h3>
            <p>
              Patient messages and reminders will appear here after creation.
            </p>

            <button
              className="msg-btn primary"
              onClick={() => {
                setForm(blank);
                setModal("form");
              }}
              style={{ margin: "15px auto" }}
            >
              <Plus size={16} />
              Create Message
            </button>
          </div>
        ) : (
          <table className="msg-table">
            <thead>
              <tr>
                <th>MESSAGE</th>
                <th>PATIENT</th>
                <th>TYPE</th>
                <th>MESSAGE CONTENT</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="msg-id">{m.id}</div>
                  </td>

                  <td>
                    <div className="msg-patient">
                      {m.patientName || "-"}
                    </div>
                    <div className="msg-sub">{m.patientId}</div>
                  </td>

                  <td>{m.type}</td>

                  <td style={{ maxWidth: 300 }}>
                    {m.message || "-"}
                  </td>

                  <td>
                    {m.date || "-"}
                    <div className="msg-sub">{m.time || ""}</div>
                  </td>

                  <td>
                    <span
                      className={`msg-badge ${
                        m.status === "Sent" ? "sent" : ""
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="msg-action"
                      onClick={() => {
                        setSelected(m);
                        setModal("view");
                      }}
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      className="msg-action"
                      onClick={() => {
                        setForm({ ...blank, ...m });
                        setModal("form");
                      }}
                    >
                      <Pencil size={15} />
                    </button>

                    {m.status !== "Sent" && (
                      <button
                        className="msg-action"
                        onClick={() => sendMessage(m)}
                      >
                        <Send size={15} />
                      </button>
                    )}

                    <button
                      className="msg-action"
                      onClick={() => share(m)}
                    >
                      <Share2 size={15} />
                    </button>

                    <button
                      className="msg-action"
                      onClick={() => remove(m)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === "form" && (
        <div className="modal-bg" onMouseDown={() => setModal(null)}>
          <div
            className="msg-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>{form.id ? "Edit Message" : "New Message"}</h2>

              <button
                className="close"
                onClick={() => setModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="msg-form">
              <div className="msg-field full">
                <label>Patient *</label>

                <select
                  value={form.patientId}
                  onChange={(e) =>
                    patientChange(e.target.value)
                  }
                >
                  <option value="">Select patient</option>

                  {patients.map((p) => {
                    const id = p.id || p.patientId;
                    const name = p.name || p.patientName || id;

                    return (
                      <option key={id} value={id}>
                        {id} - {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="msg-field">
                <label>Phone</label>
                <input value={form.phone} readOnly />
              </div>

              <div className="msg-field">
                <label>Email</label>
                <input value={form.email} readOnly />
              </div>

              <div className="msg-field">
                <label>Message Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      type: e.target.value,
                    })
                  }
                >
                  <option>SMS</option>
                  <option>WhatsApp</option>
                  <option>Email</option>
                  <option>Reminder</option>
                </select>
              </div>

              <div className="msg-field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                >
                  <option>Pending</option>
                  <option>Sent</option>
                  <option>Failed</option>
                </select>
              </div>

              <div className="msg-field">
                <label>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="msg-field">
                <label>Time</label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      time: e.target.value,
                    })
                  }
                />
              </div>

              <div className="msg-field full">
                <label>Message *</label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                  placeholder="Enter message..."
                />
              </div>
            </div>

            <div className="msg-footer">
              <button
                className="msg-btn"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>

              <button
                className="msg-btn primary"
                onClick={save}
              >
                Save Message
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "view" && selected && (
        <div className="modal-bg" onMouseDown={() => setModal(null)}>
          <div
            className="msg-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>Message Details</h2>

              <button
                className="close"
                onClick={() => setModal(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="msg-form">
              <div className="msg-field">
                <label>Message ID</label>
                <input value={selected.id} readOnly />
              </div>

              <div className="msg-field">
                <label>Patient</label>
                <input value={selected.patientName} readOnly />
              </div>

              <div className="msg-field">
                <label>Type</label>
                <input value={selected.type} readOnly />
              </div>

              <div className="msg-field">
                <label>Status</label>
                <input value={selected.status} readOnly />
              </div>

              <div className="msg-field full">
                <label>Message</label>
                <textarea value={selected.message} readOnly />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}