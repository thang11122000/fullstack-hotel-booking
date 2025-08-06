import { assets } from "../../assets";
import { exclusiveOffers } from "../../assets/assets";
import Title from "../../components/Title";

const ExclusiveOffers = () => {
  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 pt-20 pb-30">
      <div className="flex flex-col md:flex-row items-center justify-between w-full ">
        <Title
          align="left"
          font="font-playfair"
          title="Exclusive Offers"
          subTitle="Take advantage of our limited-time offers and special packages to enhance your stay and create unforgettable memories."
        ></Title>
        <button className="group flex items-center gap-2 font-medium cursor-pointer max-md:mt-12">
          View All Offers
          <img
            className="group-hover:translate-x-1 transition-all"
            alt="arrow-icon"
            src={assets.arrowIcon}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {exclusiveOffers.map((offer) => (
          <div
            key={offer._id}
            className="group relative flex flex-col items-start justify-between gap-1 pt-12 md:pt-18 px-4 rounded-xl text-white bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: `url(${offer.image})` }}
          >
            <p className="px-3 py-1 absolute top-4 left-4 text-xs bg-white text-gray-800 font-medium rounded-full">
              {offer.priceOff}
            </p>
            <div>
              <p className="text-2xl font-medium font-playfair">
                {offer.title}
              </p>
              <p>{offer.description}</p>
              <p className="text-xs text-white/70 mt-3">{offer.expiryDate}</p>
            </div>
            <button className="flex items-center gap-2 font-medium cursor-pointer mt-4 mb-5">
              View Offers
              <img
                className="invert group-hover:translate-x-1 transition-all"
                alt="arrow-icon"
                src="data:image/svg+xml,%3csvg%20width='15'%20height='11'%20viewBox='0%200%2015%2011'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M0.999912%205.5L14.0908%205.5'%20stroke='%23000'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3cpath%20d='M8.94796%201L14.0908%205.5L8.94796%2010'%20stroke='%23000'%20stroke-width='1.5'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExclusiveOffers;
