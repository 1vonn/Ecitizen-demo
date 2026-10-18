import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiMapPin,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import "./AboutPage.css";

function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-container">
        <div className="about-hero">
          <span className="about-eyebrow">ABOUT HUDUMACONNECT</span>
          <h1>
            Modernizing Public Service Delivery,
            <span> One Request at a Time.</span>
          </h1>
          <p>
            HudumaConnect is a digital Public Service Request Portal designed to
            connect citizens with county service departments through accessible
            issue reporting, clear reference numbers, and transparent status
            tracking.
          </p>

          <div className="about-hero-actions">
            <Link to="/register" className="about-btn primary">
              Create Citizen Account <FiArrowRight />
            </Link>
            <Link to="/dashboard" className="about-btn secondary">
              Submit a Request
            </Link>
            <Link to="/track-request" className="about-btn secondary">
              Track a Request
            </Link>
          </div>
        </div>

        <div className="about-pillars-grid">
          <article className="about-pillar-card">
            <div className="pillar-icon">
              <FiUsers />
            </div>
            <h3>Citizen Registration &amp; Portal</h3>
            <p>
              Citizens can create a personal account and sign in to report
              public service issues across categories like Broken Streetlights,
              Water &amp; Sanitation, Garbage Collection, and Roads, complete
              with optional photo attachments.
            </p>
          </article>

          <article className="about-pillar-card">
            <div className="pillar-icon">
              <FiLayers />
            </div>
            <h3>Transparent Status Tracking</h3>
            <p>
              Every submitted request receives a unique reference code and
              progresses through three clear stages: <strong>Pending</strong> →{" "}
              <strong>In Progress</strong> → <strong>Resolved</strong>.
            </p>
          </article>

          <article className="about-pillar-card">
            <div className="pillar-icon">
              <FiMapPin />
            </div>
            <h3>Location-Based Reporting</h3>
            <p>
              Provide specific street names, wards, estates, or landmarks along
              with optional photos so field teams can locate and resolve
              community issues faster.
            </p>
          </article>

          <article className="about-pillar-card">
            <div className="pillar-icon">
              <FiClock />
            </div>
            <h3>Timely Official Updates</h3>
            <p>
              Follow real-time progress notes and resolution feedback from the
              relevant service department directly on your request timeline.
            </p>
          </article>
        </div>

        <div className="about-schema-banner">
          <div>
            <span className="about-eyebrow">OUR SERVICE COMMITMENT</span>
            <h2>Simple, Accessible &amp; Accountable</h2>
            <p>
              HudumaConnect brings essential public service requests into one
              central digital portal so citizens always know where their request
              stands.
            </p>
            <ul className="schema-highlights">
              <li>
                <FiCheckCircle />{" "}
                <span>
                  <strong>Easy Online Submission:</strong> Report neighbourhood
                  and municipal issues any time from your phone or computer.
                </span>
              </li>
              <li>
                <FiCheckCircle />{" "}
                <span>
                  <strong>Unique Reference Numbers:</strong> Every submission is
                  assigned a trackable reference code upon confirmation.
                </span>
              </li>
              <li>
                <FiCheckCircle />{" "}
                <span>
                  <strong>Clear Resolution Stages:</strong> Know immediately
                  whether your request is Pending, In Progress, or Resolved.
                </span>
              </li>
            </ul>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #2b1b5a, #4a2fa2)",
              color: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.14)",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "1.3px",
                marginBottom: "16px",
              }}
            >
              <FiShield /> CITIZEN SUPPORT
            </div>
            <h3 style={{ margin: "0 0 10px", fontSize: "22px" }}>
              Ready to submit or check a service request?
            </h3>
            <p
              style={{
                margin: "0 0 22px",
                color: "#dcd3fa",
                fontSize: "14px",
                lineHeight: 1.65,
              }}
            >
              Browse available public services, log a new community issue, or
              check the status of an existing reference number.
            </p>
            <Link
              to="/services"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 18px",
                borderRadius: "11px",
                background: "#ffffff",
                color: "#39217f",
                fontWeight: 700,
                fontSize: "13.5px",
                textDecoration: "none",
              }}
            >
              Explore Public Services <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPage;
