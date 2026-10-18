
import Hero from "../Hero/Hero";
import Services from "../Services/Service";
import Tracker from "../Tracker/Tracker";
import HowItWorks from "../HowItWorks/HowItWorks";
// import TrackRequest from "./TrackRequest/TrackRequest";
// import HowItWorks from "./HowItWorks/HowItWorks";
// import WhyChooseUs from "./WhyChooseUs/WhyChooseUs";

function Home() {
  return (
    <section className="home">
      <Hero />
      <Services/>
      <Tracker/>
      <HowItWorks/>
      {/* <Services />
      <TrackRequest />
      <HowItWorks />
      <WhyChooseUs /> */}
    </section>
  );
}

export default Home;
