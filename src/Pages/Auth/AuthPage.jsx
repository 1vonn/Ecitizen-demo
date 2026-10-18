import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "./AuthPage.css";

function AuthPage({ initialMode = "signin" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";

  const { user, signIn, signUp } = useAuth();

  const [mode, setMode] = useState(
    location.pathname === "/register" ? "signup" : initialMode
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (location.pathname === "/register") {
      setMode("signup");
    } else if (location.pathname === "/login") {
      setMode("signin");
    }
    setErrorMsg("");
    setSuccessMsg("");
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        navigate(user.role === "admin" ? "/admin" : "/dashboard", {
          replace: true,
        });
      }
    }
  }, [user, navigate, redirectTo]);

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setErrorMsg("");
    setSuccessMsg("");
    navigate(nextMode === "signup" ? "/register" : "/login", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (mode === "signup") {
      if (!form.fullName.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (form.password.length < 6) {
        setErrorMsg("Password must be at least 6 characters long.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setErrorMsg("Passwords do not match. Please check and try again.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const { user: signedInUser, error } = await signIn({
          email: form.email,
          password: form.password,
        });

        if (error) {
          setErrorMsg(error);
        } else if (signedInUser) {
          navigate(
            redirectTo || (signedInUser.role === "admin" ? "/admin" : "/dashboard")
          );
        }
      } else {
        const { user: createdUser, error } = await signUp({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          nationalId: form.nationalId,
          role: "citizen",
          password: form.password,
        });

        if (error) {
          setErrorMsg(error);
        } else if (createdUser) {
          setSuccessMsg("Account created! Redirecting to your portal...");
          navigate(redirectTo || "/dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        {/* Left Visual & Benefits Column */}
        <div className="auth-info-panel">
          <div className="auth-badge">
            <span className="auth-badge-dot" />
            HUDUMACONNECT PUBLIC SERVICE PORTAL
          </div>

          <h1>
            Public Service Requests,
            <span> Connected &amp; Transparent.</span>
          </h1>

          <p className="auth-lead">
            Create an account or sign in to report community issues—such as
            broken streetlights, water leaks, or garbage collection—and track
            your request status from submission to resolution.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">01</div>
              <div>
                <h3>Submit Service Requests</h3>
                <p>
                  Choose a service category, provide the location and
                  description, and attach an optional photo.
                </p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">02</div>
              <div>
                <h3>Real-Time Status Tracking</h3>
                <p>
                  Follow your request from <strong>Pending</strong> →{" "}
                  <strong>In Progress</strong> → <strong>Resolved</strong> with
                  your unique reference number.
                </p>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">03</div>
              <div>
                <h3>Transparent Updates</h3>
                <p>
                  Receive official progress notes and resolution updates
                  directly on your service request timeline.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-card">
          <div className="auth-card-top">
            <span className="auth-card-eyebrow">
              {mode === "signin" ? "WELCOME BACK" : "GET STARTED"}
            </span>
            <h2>
              {mode === "signin"
                ? "Sign in to your account"
                : "Create your citizen account"}
            </h2>
            <p>
              {mode === "signin"
                ? "Sign in to submit and track your public service requests."
                : "Register in seconds to submit and track public service requests."}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signin"}
              className={`auth-tab ${mode === "signin" ? "active" : ""}`}
              onClick={() => handleModeChange("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => handleModeChange("signup")}
            >
              Create Account (Sign Up)
            </button>
          </div>

          {errorMsg && (
            <div className="auth-alert auth-alert-error" role="alert">
              <span>!</span>
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert auth-alert-success" role="status">
              <FiCheckCircle />
              <p>{successMsg}</p>
            </div>
          )}

          <form className="auth-form-fields" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <div className="auth-field">
                  <label htmlFor="fullName">Full Name *</label>
                  <div className="auth-input-wrap">
                    <FiUser className="auth-input-icon" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="auth-field-row">
                  <div className="auth-field">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="auth-input-wrap">
                      <FiPhone className="auth-input-icon" />
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+254 712 345 678"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="nationalId">National ID (Optional)</label>
                    <div className="auth-input-wrap">
                      <FiShield className="auth-input-icon" />
                      <input
                        id="nationalId"
                        type="text"
                        placeholder="ID or Passport No."
                        value={form.nationalId}
                        onChange={(e) =>
                          setForm({ ...form, nationalId: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="auth-field">
              <label htmlFor="email">Email Address *</label>
              <div className="auth-input-wrap">
                <FiMail className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password *</label>
              <div className="auth-input-wrap">
                <FiLock className="auth-input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="auth-input-wrap">
                  <FiLock className="auth-input-icon" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                  ? "Sign In to Portal"
                  : "Create Account"}
              </span>
              <FiArrowRight />
            </button>
          </form>

          <p className="auth-footer-text">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account yet?{" "}
                <Link to="/register">Sign up here</Link>
              </>
            ) : (
              <>
                Already have an account? <Link to="/login">Sign in here</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

export default AuthPage;
