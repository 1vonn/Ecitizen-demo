import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import Home from "./Pages/Home page/Home/Home";
import Services from "./Pages/Service/ServicePage";
import Tracker from "./Pages/Home page/Tracker/Tracker";
import AuthPage from "./Pages/Auth/AuthPage";
import CitizenDashboard from "./Pages/Dashboard/CitizenDashboard";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AboutPage from "./Pages/About/AboutPage";
import "./App.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <div className="app-root">
        <Header />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/track-request" element={<Tracker />} />
            <Route path="/login" element={<AuthPage initialMode="signin" />} />
            <Route
              path="/register"
              element={<AuthPage initialMode="signup" />}
            />
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path="/submit-request" element={<CitizenDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
