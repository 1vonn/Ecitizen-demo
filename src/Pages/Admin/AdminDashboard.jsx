import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiExternalLink,
  FiFileText,
  FiImage,
  FiLock,
  FiMapPin,
  FiPieChart,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  REQUEST_STATUSES,
  SERVICE_CATEGORIES,
  calculateAnalytics,
  fetchServiceRequests,
  updateServiceRequestStatus,
} from "../../lib/database";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user, authLoading, signOut } = useAuth();
  const isVerifiedAdmin = Boolean(user && user.role === "admin");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRequest, setActiveRequest] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("Pending");
  const [savingId, setSavingId] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const loadAllRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchServiceRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVerifiedAdmin) {
      loadAllRequests();
    } else {
      setRequests([]);
      setLoading(false);
    }
  }, [isVerifiedAdmin]);

  const analytics = useMemo(() => calculateAnalytics(requests), [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== "All" && req.status !== statusFilter) return false;
      if (categoryFilter !== "All" && req.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hay = [
          req.referenceNumber,
          req.title,
          req.category,
          req.location,
          req.description,
          req.citizenName,
          req.citizenEmail,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, statusFilter, categoryFilter, searchQuery]);

  if (authLoading) {
    return (
      <section className="admin-dashboard">
        <div className="admin-container">
          <div className="admin-empty-state">
            <p>Verifying administrator credentials...</p>
          </div>
        </div>
      </section>
    );
  }

  // Strictly block access unless the user is logged in and verified as an admin
  if (!isVerifiedAdmin) {
    return (
      <section className="admin-dashboard">
        <div className="admin-container">
          <div
            style={{
              maxWidth: "520px",
              margin: "48px auto",
              background: "#ffffff",
              border: "1px solid #e6e0f8",
              borderRadius: "24px",
              padding: "40px 32px",
              textAlign: "center",
              boxShadow: "0 18px 50px rgba(48, 32, 95, 0.08)",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #4a2fa2, #6945ce)",
                color: "#ffffff",
                display: "grid",
                placeItems: "center",
                fontSize: "26px",
                margin: "0 auto 18px",
              }}
            >
              <FiLock />
            </div>

            <span className="panel-kicker">RESTRICTED PORTAL</span>
            <h2
              style={{
                margin: "6px 0 10px",
                color: "#211747",
                fontSize: "24px",
                fontWeight: 800,
              }}
            >
              Administrator Login Required
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                color: "#655d78",
                fontSize: "14px",
                lineHeight: 1.65,
              }}
            >
              {user
                ? `You are currently signed in as ${user.fullName} (Citizen account). Only verified County Administrators can access the Admin Dashboard.`
                : "Please sign in with an authorized County Administrator account to access case management and analytics."}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 20px",
                      borderRadius: "12px",
                      background: "#f5f1ff",
                      border: "1px solid #dfd7f5",
                      color: "#4a2fa2",
                      fontWeight: 700,
                      fontSize: "13.5px",
                      textDecoration: "none",
                    }}
                  >
                    <FiUser /> Go to Citizen Portal
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 20px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #4a2fa2, #6945ce)",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "13.5px",
                      cursor: "pointer",
                    }}
                  >
                    Sign In with Admin Account <FiArrowRight />
                  </button>
                </>
              ) : (
                <Link
                  to="/login?redirect=/admin"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 22px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #4a2fa2, #6945ce)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    textDecoration: "none",
                  }}
                >
                  Sign In as Administrator <FiArrowRight />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3200);
  };

  const handleQuickStatusChange = async (req, nextStatus) => {
    setSavingId(req.id);
    try {
      const updated = await updateServiceRequestStatus({
        requestId: req.id,
        status: nextStatus,
        adminNote:
          req.adminNote ||
          `Status updated to ${nextStatus} by ${
            user?.fullName || "County Admin"
          }.`,
        adminUser: user,
      });

      setRequests((prev) =>
        prev.map((item) => (item.id === req.id ? updated || item : item))
      );
      if (activeRequest?.id === req.id && updated) {
        setActiveRequest(updated);
        setStatusDraft(updated.status);
      }
      showToast(
        `Request #${req.referenceNumber} updated to "${nextStatus}".`
      );
    } finally {
      setSavingId("");
    }
  };

  const openManageModal = (req) => {
    setActiveRequest(req);
    setStatusDraft(req.status);
    setNoteDraft(req.adminNote || "");
  };

  const handleSaveModal = async (event) => {
    event.preventDefault();
    if (!activeRequest) return;

    setSavingId(activeRequest.id);
    try {
      const updated = await updateServiceRequestStatus({
        requestId: activeRequest.id,
        status: statusDraft,
        adminNote: noteDraft,
        adminUser: user,
      });

      setRequests((prev) =>
        prev.map((item) =>
          item.id === activeRequest.id ? updated || item : item
        )
      );
      showToast(
        `Saved updates for #${activeRequest.referenceNumber} (${statusDraft}).`
      );
      setActiveRequest(null);
    } finally {
      setSavingId("");
    }
  };

  const openPercent =
    analytics.total > 0
      ? Math.round((analytics.open / analytics.total) * 100)
      : 0;
  const resolvedPercent =
    analytics.total > 0
      ? Math.round((analytics.resolved / analytics.total) * 100)
      : 0;

  return (
    <section className="admin-dashboard">
      <div className="admin-container">
        {/* Top Admin Header */}
        <div className="admin-header-banner">
          <div>
            <span className="admin-eyebrow">
              <FiShield /> COUNTY SERVICE OPERATIONS &amp; ANALYTICS
            </span>
            <h1>Admin Control &amp; Case Management Dashboard</h1>
            <p>
              Monitor open vs. resolved public service requests, assign teams,
              and update request statuses from <strong>Pending</strong> →{" "}
              <strong>In Progress</strong> → <strong>Resolved</strong>.
            </p>
          </div>

          <div className="admin-header-right">
            <div className="admin-badge-box">
              <span className="admin-badge-dot" />
              <div>
                <strong>{user.fullName}</strong>
                <small>Verified Admin Officer</small>
              </div>
            </div>

            <Link to="/dashboard" className="citizen-view-btn">
              <FiUser /> Citizen View
            </Link>
          </div>
        </div>

        {toastMessage && (
          <div className="admin-toast" role="status">
            <FiCheckCircle />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Basic Analytics Section: Open vs Resolved Cases */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="kpi-top">
              <span>Total Service Requests</span>
              <div className="kpi-icon purple">
                <FiFileText />
              </div>
            </div>
            <strong>{analytics.total}</strong>
            <small>All citizen submissions</small>
          </div>

          <div className="admin-kpi-card highlight-open">
            <div className="kpi-top">
              <span>Open Cases (Active)</span>
              <div className="kpi-icon orange">
                <FiAlertCircle />
              </div>
            </div>
            <strong>{analytics.open}</strong>
            <small>
              {analytics.pending} Pending • {analytics.inProgress} In Progress (
              {openPercent}%)
            </small>
          </div>

          <div className="admin-kpi-card highlight-resolved">
            <div className="kpi-top">
              <span>Resolved Cases</span>
              <div className="kpi-icon green">
                <FiCheckCircle />
              </div>
            </div>
            <strong>{analytics.resolved}</strong>
            <small>{resolvedPercent}% of all reported issues</small>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-top">
              <span>Pending Action</span>
              <div className="kpi-icon blue">
                <FiClock />
              </div>
            </div>
            <strong>{analytics.pending}</strong>
            <small>Awaiting initial officer dispatch</small>
          </div>
        </div>

        {/* Visual Analytics Panels: Open vs Resolved Comparison & Category Breakdown */}
        <div className="admin-analytics-panels">
          <div className="analytics-panel">
            <div className="panel-head">
              <div>
                <span className="panel-kicker">CASE RESOLUTION ANALYTICS</span>
                <h3>Open vs. Resolved Cases Overview</h3>
              </div>
              <FiPieChart className="panel-head-icon" />
            </div>

            <div className="open-resolved-comparison">
              <div className="comparison-numbers">
                <div className="comp-stat open">
                  <span className="comp-dot open" />
                  <div>
                    <strong>{analytics.open} Open</strong>
                    <small>{openPercent}% of total</small>
                  </div>
                </div>

                <div className="comp-stat resolved">
                  <span className="comp-dot resolved" />
                  <div>
                    <strong>{analytics.resolved} Resolved</strong>
                    <small>{resolvedPercent}% of total</small>
                  </div>
                </div>
              </div>

              <div
                className="stacked-bar"
                aria-label="Open versus resolved cases bar"
              >
                <div
                  className="stacked-segment pending"
                  style={{
                    width: `${
                      analytics.total
                        ? (analytics.pending / analytics.total) * 100
                        : 0
                    }%`,
                  }}
                  title={`Pending: ${analytics.pending}`}
                />
                <div
                  className="stacked-segment in-progress"
                  style={{
                    width: `${
                      analytics.total
                        ? (analytics.inProgress / analytics.total) * 100
                        : 0
                    }%`,
                  }}
                  title={`In Progress: ${analytics.inProgress}`}
                />
                <div
                  className="stacked-segment resolved"
                  style={{
                    width: `${
                      analytics.total
                        ? (analytics.resolved / analytics.total) * 100
                        : 0
                    }%`,
                  }}
                  title={`Resolved: ${analytics.resolved}`}
                />
              </div>

              <div className="status-breakdown-list">
                <div className="breakdown-row">
                  <span className="b-label">
                    <i className="dot pending" /> Pending (New)
                  </span>
                  <strong>{analytics.pending} cases</strong>
                </div>
                <div className="breakdown-row">
                  <span className="b-label">
                    <i className="dot in-progress" /> In Progress (Assigned)
                  </span>
                  <strong>{analytics.inProgress} cases</strong>
                </div>
                <div className="breakdown-row">
                  <span className="b-label">
                    <i className="dot resolved" /> Resolved (Closed)
                  </span>
                  <strong>{analytics.resolved} cases</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-panel">
            <div className="panel-head">
              <div>
                <span className="panel-kicker">DEPARTMENT WORKLOAD</span>
                <h3>Requests by Service Category</h3>
              </div>
              <FiBarChart2 className="panel-head-icon" />
            </div>

            {analytics.byCategory.length === 0 ? (
              <p style={{ color: "#777087", fontSize: "13.5px" }}>
                Category breakdown will appear here as citizens submit service
                requests.
              </p>
            ) : (
              <div className="category-bars">
                {analytics.byCategory.map((item) => {
                  const widthPct =
                    analytics.total > 0
                      ? Math.max(
                          12,
                          Math.round((item.total / analytics.total) * 100)
                        )
                      : 0;
                  return (
                    <div className="cat-bar-item" key={item.category}>
                      <div className="cat-bar-top">
                        <strong>{item.category}</strong>
                        <span>
                          {item.open} open • {item.resolved} resolved (Total:{" "}
                          {item.total})
                        </span>
                      </div>
                      <div className="cat-bar-track">
                        <div
                          className="cat-bar-fill"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Service Requests Management Table */}
        <div className="admin-table-card">
          <div className="table-card-header">
            <div>
              <span className="panel-kicker">CITIZEN REQUEST QUEUE</span>
              <h2>Manage Service Requests &amp; Statuses</h2>
            </div>

            <button
              type="button"
              className="admin-refresh-btn"
              onClick={loadAllRequests}
            >
              <FiRefreshCw /> Refresh Queue
            </button>
          </div>

          {/* Filter Bar */}
          <div className="admin-filters-bar">
            <div className="admin-search-box">
              <FiSearch />
              <input
                type="search"
                placeholder="Search by reference #, citizen name, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-filter-group">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="All">All Categories</option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="admin-status-tabs">
                {["All", ...REQUEST_STATUSES].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`admin-status-tab ${
                      statusFilter === st ? "active" : ""
                    }`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Requests List / Table */}
          {loading ? (
            <div className="admin-empty-state">
              <p>Loading service requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="admin-empty-state">
              <FiActivity />
              <h3>No service requests in the queue yet</h3>
              <p>
                Submitted citizen requests will appear here for status
                management.
              </p>
            </div>
          ) : (
            <div className="admin-requests-table-wrap">
              <table className="admin-requests-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Category &amp; Issue</th>
                    <th>Citizen &amp; Location</th>
                    <th>Current Status</th>
                    <th>Quick Status Update (Pending → In Progress → Resolved)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <span className="table-ref-badge">
                          #{req.referenceNumber}
                        </span>
                        <small className="table-date">
                          {new Date(req.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </small>
                      </td>

                      <td>
                        <div className="table-issue-cell">
                          <div className="issue-badges">
                            <span className="issue-cat">{req.category}</span>
                            <span
                              className={`issue-prio prio-${(
                                req.priority || "Medium"
                              ).toLowerCase()}`}
                            >
                              {req.priority || "Medium"}
                            </span>
                            {req.imageUrl && (
                              <span
                                className="issue-photo-pill"
                                title="Photo attached"
                              >
                                <FiImage /> Photo
                              </span>
                            )}
                          </div>
                          <strong>
                            {req.title || `${req.category} Request`}
                          </strong>
                          <p>{req.description}</p>
                          {req.adminNote && (
                            <small className="table-admin-note">
                              Note: {req.adminNote}
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="table-citizen-cell">
                          <strong>{req.citizenName || "Citizen"}</strong>
                          <span>
                            <FiMapPin /> {req.location}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`table-status-pill status-${req.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          <i />
                          {req.status}
                        </span>
                      </td>

                      <td>
                        <div className="quick-status-buttons">
                          {REQUEST_STATUSES.map((statusOption) => (
                            <button
                              key={statusOption}
                              type="button"
                              disabled={
                                req.status === statusOption ||
                                savingId === req.id
                              }
                              className={`quick-status-btn ${
                                req.status === statusOption ? "current" : ""
                              }`}
                              onClick={() =>
                                handleQuickStatusChange(req, statusOption)
                              }
                            >
                              {statusOption}
                            </button>
                          ))}
                        </div>
                      </td>

                      <td>
                        <div className="table-action-btns">
                          <button
                            type="button"
                            className="manage-case-btn"
                            onClick={() => openManageModal(req)}
                          >
                            <FiEdit3 /> Manage
                          </button>
                          <Link
                            to={`/track-request?ref=${req.referenceNumber}`}
                            className="view-tracker-link"
                            title="View in Public Tracker"
                          >
                            <FiExternalLink />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Detailed Case Review & Admin Note */}
      {activeRequest && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setActiveRequest(null)
          }
        >
          <div className="admin-modal" role="dialog" aria-modal="true">
            <div className="admin-modal-header">
              <div>
                <span className="panel-kicker">
                  CASE #{activeRequest.referenceNumber}
                </span>
                <h3>{activeRequest.title || activeRequest.category}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveRequest(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="modal-info-grid">
                <div>
                  <small>Category</small>
                  <strong>{activeRequest.category}</strong>
                </div>
                <div>
                  <small>Citizen</small>
                  <strong>{activeRequest.citizenName || "Citizen"}</strong>
                </div>
                <div>
                  <small>Location</small>
                  <strong>{activeRequest.location}</strong>
                </div>
                <div>
                  <small>Priority</small>
                  <strong>{activeRequest.priority || "Medium"}</strong>
                </div>
              </div>

              <div className="modal-description-box">
                <small>Citizen Description</small>
                <p>{activeRequest.description}</p>
              </div>

              {activeRequest.imageUrl && (
                <div className="modal-image-preview">
                  <small>Attached Evidence Photo</small>
                  <img
                    src={activeRequest.imageUrl}
                    alt={activeRequest.title || "Request attachment"}
                  />
                </div>
              )}

              <form className="modal-update-form" onSubmit={handleSaveModal}>
                <div className="modal-form-field">
                  <label>Update Request Status</label>
                  <div className="modal-status-selector">
                    {REQUEST_STATUSES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`modal-status-opt ${
                          statusDraft === st ? "selected" : ""
                        }`}
                        onClick={() => setStatusDraft(st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-form-field">
                  <label htmlFor="admin-note-input">
                    Official Admin Note / Resolution Update
                  </label>
                  <textarea
                    id="admin-note-input"
                    rows={3}
                    placeholder="Add dispatch details, technician notes, or resolution confirmation visible to the citizen..."
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setActiveRequest(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-save-btn"
                    disabled={savingId === activeRequest.id}
                  >
                    {savingId === activeRequest.id
                      ? "Saving..."
                      : "Save Status & Update Citizen"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminDashboard;
