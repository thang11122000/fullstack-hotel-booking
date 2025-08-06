import { assets } from "../../assets";
import Title from "../../components/Title";

const NewLetter = () => {
  return (
    <div className="flex flex-col items-center max-w-5xl lg:w-full rounded-2xl px-4 py-12 md:py-16 mx-2 lg:mx-auto my-30 bg-gray-900 text-white">
      <Title
        title="Stay Inspired"
        subTitle="Join our newsletter and be the first to discover new destinations,
          exclusive offers, and travel inspiration."
      ></Title>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
        <input
          className="bg-white/10 px-4 py-2.5 border border-white/20 rounded outline-none max-w-66 w-full"
          placeholder="Enter your email"
          type="text"
        />
        <button className="flex items-center justify-center gap-2 group bg-black px-4 md:px-7 py-2.5 rounded active:scale-95 transition-all">
          Subscribe
          <img
            alt="arrow-icon"
            className="w-3.5 invert group-hover:translate-x-1 transition-all"
            src={assets.arrowIcon}
          />
        </button>
      </div>
      <p className="text-gray-500 mt-6 text-xs text-center">
        By subscribing, you agree to our Privacy Policy and consent to receive
        updates.
      </p>
    </div>
  );
};

export default NewLetter;
