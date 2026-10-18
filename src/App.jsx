
import { Routes, Route } from "react-router-dom";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import Home from "./Pages/Home page/Home/Home";
import Services from "./Pages/Service/ServicePage";

function App() {
  return (
    <>
      <Header />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
           <Route path="/services" element={<Services />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
