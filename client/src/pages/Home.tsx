import Hero from "../components/Hero";
import FeaturedDestination from "../components/FeaturedDestination";
import ExclusiveOffers from "../components/ExclusiveOffers";
import Testimonial from "../components/Testimonial";
import NewLetter from "../components/NewLetter";
import Footer from "../components/Footer";
import RecommendedHotels from "../components/RecommendedHotels";

const Home = () => {
  return (
    <div>
      <Hero />
      <RecommendedHotels />
      <FeaturedDestination />
      <ExclusiveOffers />
      <Testimonial />
      <NewLetter />
      <Footer />
    </div>
  );
};

export default Home;
