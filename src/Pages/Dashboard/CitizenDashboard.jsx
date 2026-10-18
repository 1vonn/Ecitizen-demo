import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiFileText,
  FiFilter,
  FiImage,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUploadCloud,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import {
  PRIORITY_LEVELS,
  REQUEST_STATUSES,
  SERVICE_CATEGORIES,
  calculateAnalytics,
  compressImageFile,
  createServiceRequest,
  fetchServiceRequests,
} from "../../lib/database";
import "./CitizenDashboard.css";

function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCategory = searchParams.get("category") || "";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [createdNotice, setCreatedNotice] = useState(null);
  const [copiedRef, setCopiedRef] = useState("");
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  const [form, setForm] = useState({
    category: SERVICE_CATEGORIES.includes(preselectedCategory)
      ? preselectedCategory
      : SERVICE_CATEGORIES[0],
    title: "",
    location: "",
    priority: "Medium",
    description: "",
    imageUrl: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchServiceRequests();
      setRequests(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchServiceRequests()
      .then((data) => {
        if (active) {
          setRequests(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const handleImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file);
      if (typeof compressedDataUrl === "string") {
        setForm((prev) => ({ ...prev, imageUrl: compressedDataUrl }));
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setForm((prev) => ({ ...prev, imageUrl: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!user) {
      navigate("/login?redirect=/dashboard");
      return;
    }

    if (!form.location.trim() || !form.description.trim()) {
      setSubmitError("Please provide both the location and a description.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createServiceRequest({
        user,
        title: form.title,
        category: form.category,
        location: form.location,
        description: form.description,
        imageUrl: form.imageUrl,
        priority: form.priority,
      });

      setCreatedNotice(created);
      setRequests((prev) => [
        created,
        ...prev.filter((item) => item.id !== created.id),
      ]);
      setForm({
        category: SERVICE_CATEGORIES[0],
        title: "",
        location: "",
        priority: "Medium",
        description: "",
        imageUrl: "",
      });
      await loadData();
    } catch (err) {
      setSubmitError(
        err?.message || "Could not submit your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayedRequests = useMemo(() => {
    return requests.filter((req) => {
      if (showOnlyMine && user) {
        const matchesUser =
          req.citizenId === user.id ||
          (user.email &&
            req.citizenEmail?.toLowerCase() === user.email.toLowerCase());
        if (!matchesUser) return false;
      }

      if (statusFilter !== "All" && req.status !== statusFilter) {
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
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [requests, showOnlyMine, user, statusFilter, searchQuery]);

  const analytics = useMemo(() => calculateAnalytics(requests), [requests]);

  const getStepNumber = (status) => {
    if (status === "Resolved") return 3;
    if (status === "In Progress") return 2;
    return 1;
  };

  const handleCopyRef = (ref) => {
    navigator.clipboard?.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(""), 2000);
  };

  return (
    <section className="citizen-dashboard">
      <div className="dashboard-container">
        {/* Top Welcome & Role Banner */}
        <div className="dashboard-hero">
          <div className="dashboard-hero-text">
            <span className="dashboard-eyebrow">
              <span className="eyebrow-pulse" />
              CITIZEN SERVICE REQUEST PORTAL
            </span>
            <h1>
              {user
                ? `Welcome, ${user.fullName?.split(" ")[0] || "Citizen"}`
                : "Submit & Track Public Service Requests"}
            </h1>
            <p>
              Report community issues such as broken streetlights, water supply
              interruptions, or garbage collection, and follow every stage from{" "}
              <strong>Pending</strong> to <strong>In Progress</strong> to{" "}
              <strong>Resolved</strong>.
            </p>
          </div>

          <div className="dashboard-hero-actions">
            {user ? (
              <div className="user-status-card">
                <div className="user-status-top">
                  <span className="user-avatar-lg">
                    {(user.fullName || "C").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <strong>{user.fullName}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>
                {user.role === "admin" && (
                  <div className="user-status-links">
                    <Link to="/admin" className="switch-portal-link">
                      <FiShield /> Open Admin Dashboard
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="guest-prompt-card">
                <p>Sign in or create an account to submit a service request.</p>
                <div className="guest-prompt-btns">
                  <Link to="/login" className="guest-btn primary">
                    <FiUser /> Sign In
                  </Link>
                  <Link to="/register" className="guest-btn secondary">
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Basic Analytics Row (Open vs Resolved Cases) */}
        <div className="analytics-strip">
          <div className="analytics-card">
            <div className="analytics-icon purple">
              <FiFileText />
            </div>
            <div>
              <span>Total Requests</span>
              <strong>{analytics.total}</strong>
              <small>All logged cases</small>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon orange">
              <FiAlertCircle />
            </div>
            <div>
              <span>Open Cases</span>
              <strong>{analytics.open}</strong>
              <small>
                {analytics.pending} Pending • {analytics.inProgress} In Progress
              </small>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon blue">
              <FiClock />
            </div>
            <div>
              <span>In Progress</span>
              <strong>{analytics.inProgress}</strong>
              <small>Assigned to county teams</small>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon green">
              <FiCheckCircle />
            </div>
            <div>
              <span>Resolved Cases</span>
              <strong>{analytics.resolved}</strong>
              <small>{analytics.resolutionRate}% resolution rate</small>
            </div>
          </div>
        </div>

        {/* Confirmation Banner when a request is submitted */}
        {createdNotice && (
          <div className="submission-success-banner" role="status">
            <div className="banner-left">
              <span className="banner-check">
                <FiCheckCircle />
              </span>
              <div>
                <h4>Service Request Submitted Successfully!</h4>
                <p>
                  Your tracking reference number is{" "}
                  <strong>{createdNotice.referenceNumber}</strong>. Keep this
                  reference to track status updates.
                </p>
              </div>
            </div>
            <div className="banner-actions">
              <button
                type="button"
                className="banner-btn"
                onClick={() => handleCopyRef(createdNotice.referenceNumber)}
              >
                <FiCopy />
                {copiedRef === createdNotice.referenceNumber
                  ? "Copied!"
                  : "Copy Reference"}
              </button>
              <Link
                to={`/track-request?ref=${createdNotice.referenceNumber}`}
                className="banner-btn primary"
              >
                Track Status <FiArrowRight />
              </Link>
              <button
                type="button"
                className="banner-close"
                onClick={() => setCreatedNotice(null)}
                aria-label="Dismiss notification"
              >
                <FiX />
              </button>
            </div>
          </div>
        )}

        {/* Two-Column Main Layout: Submit Request Form + Live Request Feed */}
        <div className="dashboard-main-grid">
          {/* Left Column: Submit Service Request Form */}
          <div className="submit-request-card" id="submit-request-form">
            <div className="card-header">
              <span className="card-eyebrow">NEW SERVICE REQUEST</span>
              <h2>Submit a Public Service Request</h2>
              <p>
                Provide the issue category, location, description, and an
                optional photo for faster resolution.
              </p>
            </div>

            {submitError && (
              <div
                style={{
                  background: "#fff2f2",
                  border: "1px solid #ffd6d6",
                  color: "#b42318",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
                role="alert"
              >
                {submitError}
              </div>
            )}

            <form className="request-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="req-category">Service Category *</label>
                <select
                  id="req-category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="req-title">Issue Summary / Title</label>
                  <input
                    id="req-title"
                    type="text"
                    placeholder="e.g. Broken streetlight near bus stage"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="req-priority">Urgency / Priority</label>
                  <select
                    id="req-priority"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                  >
                    {PRIORITY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="req-location">Location / Landmark *</label>
                <div className="input-with-icon">
                  <FiMapPin />
                  <input
                    id="req-location"
                    type="text"
                    required
                    placeholder="Street, estate, ward, or nearest landmark"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="req-description">Detailed Description *</label>
                <textarea
                  id="req-description"
                  rows={4}
                  required
                  placeholder="Describe the issue clearly so the county maintenance or service team can take action..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* Optional Image Upload or URL */}
              <div className="form-group">
                <label>Attach Photo / Evidence (Optional)</label>
                <div className="image-upload-Zone">
                  <label htmlFor="req-image-file" className="file-upload-label">
                    <FiUploadCloud />
                    <div>
                      <strong>Upload an image from your device</strong>
                      <span>PNG, JPG or WEBP (optional)</span>
                    </div>
                    <input
                      id="req-image-file"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                    />
                  </label>

                  <div className="image-url-input">
                    <FiCamera />
                    <input
                      type="text"
                      placeholder="Or paste an image URL (https://...)"
                      value={
                        form.imageUrl.startsWith("data:") ? "" : form.imageUrl
                      }
                      onChange={(e) =>
                        setForm({ ...form, imageUrl: e.target.value })
                      }
                    />
                  </div>

                  {form.imageUrl && (
                    <div className="image-preview-box">
                      <img
                        src={form.imageUrl}
                        alt="Request attachment preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => setForm({ ...form, imageUrl: "" })}
                      >
                        <FiX /> Remove photo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="submit-request-btn"
                disabled={submitting}
              >
                <FiPlus />
                <span>
                  {submitting ? "Submitting Request..." : "Submit Service Request"}
                </span>
                <FiArrowRight />
              </button>
            </form>
          </div>

          {/* Right Column: Service Requests & Live Status Tracker */}
          <div className="requests-feed-card">
            <div className="feed-header">
              <div>
                <span className="card-eyebrow">LIVE STATUS TRACKING</span>
                <h2>Submitted Service Requests</h2>
              </div>

              <div className="feed-header-controls">
                {user && (
                  <button
                    type="button"
                    className={`mine-toggle-btn ${showOnlyMine ? "active" : ""}`}
                    onClick={() => setShowOnlyMine(!showOnlyMine)}
                  >
                    <FiUser />
                    {showOnlyMine
                      ? "Showing My Requests"
                      : "All Submitted Requests"}
                  </button>
                )}

                <button
                  type="button"
                  className="refresh-btn"
                  onClick={loadData}
                  title="Refresh requests"
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>

            {/* Search & Status Filters */}
            <div className="feed-filters">
              <div className="feed-search">
                <FiSearch />
                <input
                  type="search"
                  placeholder="Search by reference #, category, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="status-pills" role="tablist">
                {["All", ...REQUEST_STATUSES].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`status-pill-btn ${
                      statusFilter === st ? "active" : ""
                    }`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Request Cards List */}
            {loading ? (
              <div className="feed-empty">
                <p>Loading service requests from database...</p>
              </div>
            ) : displayedRequests.length === 0 ? (
              <div className="feed-empty">
                <FiFilter />
                <h3>No service requests yet</h3>
                <p>
                  Use the form on the left to submit your first public service
                  request. It will appear here immediately with its tracking
                  reference number.
                </p>
              </div>
            ) : (
              <div className="citizen-request-list">
                {displayedRequests.map((req) => {
                  const stepNum = getStepNumber(req.status);
                  const isExpanded = selectedRequest === req.id;

                  return (
                    <article className="citizen-request-item" key={req.id}>
                      <div className="req-item-top">
                        <div className="req-ref-group">
                          <span className="req-ref-badge">
                            #{req.referenceNumber}
                          </span>
                          <button
                            type="button"
                            className="copy-ref-inline"
                            onClick={() => handleCopyRef(req.referenceNumber)}
                            title="Copy reference number"
                          >
                            <FiCopy />
                            {copiedRef === req.referenceNumber ? "Copied" : ""}
                          </button>
                          <span className="req-cat-tag">{req.category}</span>
                          <span
                            className={`req-priority-tag priority-${(
                              req.priority || "Medium"
                            ).toLowerCase()}`}
                          >
                            {req.priority || "Medium"}
                          </span>
                        </div>

                        <span
                          className={`req-status-badge status-${req.status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          <span className="status-dot" />
                          {req.status}
                        </span>
                      </div>

                      <h3 className="req-item-title">
                        {req.title || `${req.category} - ${req.location}`}
                      </h3>
                      <p className="req-item-desc">{req.description}</p>

                      <div className="req-item-meta">
                        <span>
                          <FiMapPin /> {req.location}
                        </span>
                        <span>•</span>
                        <span>
                          Submitted{" "}
                          {new Date(req.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {req.imageUrl && (
                          <>
                            <span>•</span>
                            <span className="has-photo-tag">
                              <FiImage /> Photo attached
                            </span>
                          </>
                        )}
                      </div>

                      {/* 3-Stage Status Progress Bar (Pending -> In Progress -> Resolved) */}
                      <div className="req-stage-tracker">
                        <div className="stage-steps">
                          {REQUEST_STATUSES.map((stageName, index) => {
                            const stageIdx = index + 1;
                            const done = stageIdx <= stepNum;
                            const active = stageIdx === stepNum;
                            return (
                              <div
                                key={stageName}
                                className={`stage-node ${
                                  done ? "done" : ""
                                } ${active ? "active" : ""}`}
                              >
                                <span className="stage-circle">
                                  {done ? "✓" : stageIdx}
                                </span>
                                <span className="stage-label">{stageName}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {req.adminNote && (
                        <div className="req-admin-note">
                          <strong>Official Update:</strong> {req.adminNote}
                        </div>
                      )}

                      <div className="req-item-footer">
                        <button
                          type="button"
                          className="req-details-toggle"
                          onClick={() =>
                            setSelectedRequest(isExpanded ? null : req.id)
                          }
                        >
                          {isExpanded
                            ? "Hide timeline & photo"
                            : "View timeline & details"}
                        </button>

                        <Link
                          to={`/track-request?ref=${req.referenceNumber}`}
                          className="req-track-link"
                        >
                          Open in Tracker <FiArrowRight />
                        </Link>
                      </div>

                      {isExpanded && (
                        <div className="req-expanded-drawer">
                          {req.imageUrl && (
                            <div className="req-attached-image">
                              <img
                                src={req.imageUrl}
                                alt={req.title || req.category}
                              />
                            </div>
                          )}

                          <div className="req-history-timeline">
                            <h4>Status History</h4>
                            <ul>
                              {(req.history || []).map((h, i) => (
                                <li key={h.id || i}>
                                  <span className="hist-dot" />
                                  <div>
                                    <strong>{h.status}</strong>
                                    <small>
                                      {new Date(h.createdAt).toLocaleString()}
                                    </small>
                                    {h.note && <p>{h.note}</p>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CitizenDashboard;
