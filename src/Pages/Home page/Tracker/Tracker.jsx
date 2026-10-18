import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchServiceRequests,
  findRequestByReference,
} from "../../../lib/database";
import "./Tracker.css";

function Tracker() {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [referenceNumber, setReferenceNumber] = useState(initialRef);
  const [requestStatus, setRequestStatus] = useState(null);
  const [recentReferences, setRecentReferences] = useState([]);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  const lookupReference = async (refToFind) => {
    const reference = (refToFind || "").trim().toUpperCase();

    if (!reference) {
      setError("Please enter your request reference number.");
      setRequestStatus(null);
      return;
    }

    setSearching(true);
    try {
      const found = await findRequestByReference(reference);
      if (found) {
        const statusMsg =
          found.adminNote ||
          (found.status === "Resolved"
            ? "Your service request has been resolved and closed."
            : found.status === "In Progress"
            ? "Your request is currently in progress with the assigned department."
            : "Your request has been received and is pending officer review.");

        setRequestStatus({
          reference: found.referenceNumber,
          service: `${found.category} (${found.location})`,
          title: found.title,
          description: found.description,
          imageUrl: found.imageUrl,
          status: found.status,
          message: statusMsg,
          date: new Date(
            found.updatedAt || found.createdAt
          ).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        });
        setError("");
      } else {
        setRequestStatus(null);
        setError(
          "No service request was found for that reference number. Please check the reference code issued when you submitted your request."
        );
      }
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests().then((all) => {
      const refs = all
        .map((r) => r.referenceNumber)
        .filter(Boolean)
        .slice(0, 6);
      setRecentReferences(refs);
    });
  }, []);

  useEffect(() => {
    if (initialRef) {
      lookupReference(initialRef);
    }
  }, [initialRef]);

  const handleTrackRequest = (event) => {
    event.preventDefault();
    lookupReference(referenceNumber);
  };

  const progressSteps = [
    {
      title: "Pending",
      description: "Your request has been logged and awaits assignment.",
    },
    {
      title: "In Progress",
      description: "County service team is actively working on your case.",
    },
    {
      title: "Resolved",
      description: "Issue has been addressed and verified.",
    },
  ];

  const getProgress = (status) => {
    if (status === "Resolved" || status === "Approved") return 3;
    if (status === "In Progress") return 2;
    return 1;
  };

  const tryExample = (reference) => {
    setReferenceNumber(reference);
    lookupReference(reference);
  };

  return (
    <section className="tracker-section" id="track-request">
      <div className="tracker-container">
        {/* Heading */}
        <div className="tracker-heading">
          <span className="tracker-eyebrow">
            <span className="tracker-eyebrow-dot"></span>
            REAL-TIME REQUEST TRACKING
          </span>

          <h2>
            Your request, <span>within reach.</span>
          </h2>

          <p>
            Stay up to date with your public service request. Enter your
            reference number to track its progress from{" "}
            <strong>Pending</strong> → <strong>In Progress</strong> →{" "}
            <strong>Resolved</strong>.
          </p>
        </div>

        {/* Tracking layout */}
        <div className="tracker-layout">
          <div className="tracker-card">
            <div className="tracker-card-header">
              <div className="tracker-symbol" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="m15.5 15.5 5 5" />
                  <path d="M10.5 7v3.5l2.5 1.5" />
                </svg>
              </div>

              <div>
                <h3>Check your request status</h3>
                <p>
                  Enter the reference number issued when you submitted your
                  service request.
                </p>
              </div>
            </div>

            <form className="tracker-form" onSubmit={handleTrackRequest}>
              <label htmlFor="referenceNumber">
                Request reference number
              </label>

              <div className="tracker-input-wrap">
                <span aria-hidden="true">#</span>

                <input
                  id="referenceNumber"
                  type="text"
                  placeholder="e.g. PSR2026001"
                  value={referenceNumber}
                  onChange={(event) => {
                    setReferenceNumber(event.target.value);
                    if (error) setError("");
                  }}
                  autoComplete="off"
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    error ? "tracker-error" : "tracker-help"
                  }
                />
              </div>

              <small id="tracker-help" className="tracker-help">
                Your reference number is unique to your submitted request.
              </small>

              <button
                type="submit"
                className="tracker-button"
                disabled={searching}
              >
                <span>{searching ? "Checking..." : "Check status"}</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>

            {error && (
              <div
                className="tracker-message tracker-error"
                id="tracker-error"
                role="alert"
              >
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}

            {requestStatus && (
              <div className="tracker-result" aria-live="polite">
                <div className="tracker-result-top">
                  <div>
                    <span className="tracker-result-label">
                      REFERENCE NUMBER
                    </span>
                    <h4>{requestStatus.reference}</h4>
                  </div>

                  <span
                    className={`tracker-status status-${requestStatus.status
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <span className="status-dot"></span>
                    {requestStatus.status}
                  </span>
                </div>

                <div className="tracker-result-details">
                  <div>
                    <span>Category &amp; Location</span>
                    <strong>{requestStatus.service}</strong>
                  </div>

                  <div>
                    <span>Last updated</span>
                    <strong>{requestStatus.date}</strong>
                  </div>
                </div>

                <div className="tracker-result-message">
                  <span className="result-message-icon" aria-hidden="true">
                    i
                  </span>
                  <p>{requestStatus.message}</p>
                </div>

                <div className="tracker-progress">
                  <div className="tracker-progress-heading">
                    <h4>Status progression</h4>
                    <span>
                      Stage {getProgress(requestStatus.status)} of 3
                    </span>
                  </div>

                  <div className="tracker-progress-bar">
                    <span
                      style={{
                        width: `${
                          (getProgress(requestStatus.status) / 3) * 100
                        }%`,
                      }}
                    ></span>
                  </div>

                  <div className="tracker-timeline">
                    {progressSteps.map((step, index) => {
                      const stepNumber = index + 1;
                      const completed =
                        stepNumber <= getProgress(requestStatus.status);
                      const current =
                        stepNumber === getProgress(requestStatus.status);

                      return (
                        <div
                          className={`timeline-step ${
                            completed ? "completed" : ""
                          } ${current ? "current" : ""}`}
                          key={step.title}
                        >
                          <div className="timeline-marker">
                            {completed ? "✓" : stepNumber}
                          </div>

                          <div className="timeline-copy">
                            <strong>{step.title}</strong>
                            <span>{step.description}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {recentReferences.length > 0 && (
              <div className="tracker-sample">
                <span>Your recent submitted references</span>

                <div className="tracker-sample-buttons">
                  {recentReferences.map((reference) => (
                    <button
                      key={reference}
                      type="button"
                      onClick={() => tryExample(reference)}
                    >
                      {reference}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Helpful side panel */}
          <aside className="tracker-side-panel">
            <div className="tracker-side-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            <span className="tracker-side-label">SIMPLE &amp; TRANSPARENT</span>

            <h3>Know where things stand.</h3>

            <p>
              Every submitted request receives a unique reference code and
              moves through three transparent stages:
            </p>

            <div className="tracker-benefit">
              <span className="benefit-check">1</span>
              <div>
                <strong>Pending</strong>
                <p>Request logged by citizen and queued for county officer review.</p>
              </div>
            </div>

            <div className="tracker-benefit">
              <span className="benefit-check">2</span>
              <div>
                <strong>In Progress</strong>
                <p>Assigned field team is actively addressing the reported issue.</p>
              </div>
            </div>

            <div className="tracker-benefit">
              <span className="benefit-check">✓</span>
              <div>
                <strong>Resolved</strong>
                <p>Issue resolved with official admin confirmation notes.</p>
              </div>
            </div>

            <div className="tracker-side-note">
              <span aria-hidden="true">+</span>
              <p>
                Need to report a new issue?{" "}
                <Link
                  to="/dashboard"
                  style={{ color: "#ffffff", fontWeight: 700 }}
                >
                  Submit a Service Request →
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Tracker;