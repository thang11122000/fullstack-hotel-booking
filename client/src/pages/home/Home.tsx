import Hero from "./Hero";
import FeaturedDestination from "./FeaturedDestination";
import ExclusiveOffers from "./ExclusiveOffers";
import Testimonial from "./Testimonial";
import NewLetter from "./NewLetter";
import Footer from "./Footer";
import RecommendedHotels from "./RecommendedHotels";

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
