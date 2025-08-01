import {
  ExclusiveOffer,
  Testimonial,
  RoomCommonData,
  User,
  Hotel,
  Room,
  Booking,
  DashboardData,
} from "../types";

// Cities
export const CITIES = ["Dubai", "Singapore", "New York", "London"];

// Exclusive Offers Data
export const EXCLUSIVE_OFFERS: ExclusiveOffer[] = [
  {
    _id: 1,
    title: "Summer Escape Package",
    description: "Enjoy a complimentary night and daily breakfast",
    priceOff: 25,
    expiryDate: "Aug 31",
    image: "/src/assets/exclusiveOfferCardImg1.png",
  },
  {
    _id: 2,
    title: "Romantic Getaway",
    description: "Special couples package including spa treatment",
    priceOff: 20,
    expiryDate: "Sep 20",
    image: "/src/assets/exclusiveOfferCardImg2.png",
  },
  {
    _id: 3,
    title: "Luxury Retreat",
    description:
      "Book 60 days in advance and save on your stay at any of our luxury properties worldwide.",
    priceOff: 30,
    expiryDate: "Sep 25",
    image: "/src/assets/exclusiveOfferCardImg3.png",
  },
];

// Testimonials Data
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Emma Rodriguez",
    address: "Barcelona, Spain",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    rating: 5,
    review:
      "I've used many booking platforms before, but none compare to the personalized experience and attention to detail that QuickStay provides.",
  },
  {
    id: 2,
    name: "Liam Johnson",
    address: "New York, USA",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
    rating: 4,
    review:
      "QuickStay exceeded my expectations. The booking process was seamless, and the hotels were absolutely top-notch. Highly recommended!",
  },
  {
    id: 3,
    name: "Sophia Lee",
    address: "Seoul, South Korea",
    image:
      "https://images.unsplash.com/photo-1701615004837-40d8573b6652?q=80&w=200",
    rating: 5,
    review:
      "Amazing service! I always find the best luxury accommodations through QuickStay. Their recommendations never disappoint!",
  },
];

// Room Common Data
export const ROOM_COMMON_DATA: RoomCommonData[] = [
  {
    icon: "/src/assets/homeIcon.svg",
    title: "Clean & Safe Stay",
    description: "A well-maintained and hygienic space just for you.",
  },
  {
    icon: "/src/assets/badgeIcon.svg",
    title: "Enhanced Cleaning",
    description: "This host follows Staybnb's strict cleaning standards.",
  },
  {
    icon: "/src/assets/locationFilledIcon.svg",
    title: "Excellent Location",
    description: "90% of guests rated the location 5 stars.",
  },
  {
    icon: "/src/assets/heartIcon.svg",
    title: "Smooth Check-In",
    description: "100% of guests gave check-in a 5-star rating.",
  },
];

// Mock Data (for development)
export const MOCK_USER: User = {
  _id: "user_2unqyL4diJFP1E3pIBnasc7w8hP",
  username: "Great Stack",
  email: "user.greatstack@gmail.com",
  image:
    "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJ2N2c5YVpSSEFVYVUxbmVYZ2JkSVVuWnFzWSJ9",
  role: "hotelOwner",
  createdAt: "2025-03-25T09:29:16.367Z",
  updatedAt: "2025-04-10T06:34:48.719Z",
  __v: 1,
  recentSearchedCities: ["New York"],
};

export const MOCK_HOTEL: Hotel = {
  _id: "67f76393197ac559e4089b72",
  name: "Urbanza Suites",
  address: "Main Road  123 Street , 23 Colony",
  contact: "+0123456789",
  owner: MOCK_USER,
  city: "New York",
  createdAt: "2025-04-10T06:22:11.663Z",
  updatedAt: "2025-04-10T06:22:11.663Z",
  __v: 0,
};

export const MOCK_ROOMS: Room[] = [
  {
    _id: "67f7647c197ac559e4089b96",
    hotel: MOCK_HOTEL,
    roomType: "Double Bed",
    pricePerNight: 399,
    amenities: ["Room Service", "Mountain View", "Pool Access"],
    images: [
      "/src/assets/roomImg1.png",
      "/src/assets/roomImg2.png",
      "/src/assets/roomImg3.png",
      "/src/assets/roomImg4.png",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:26:04.013Z",
    updatedAt: "2025-04-10T06:26:04.013Z",
    __v: 0,
  },
  {
    _id: "67f76452197ac559e4089b8e",
    hotel: MOCK_HOTEL,
    roomType: "Double Bed",
    pricePerNight: 299,
    amenities: ["Room Service", "Mountain View", "Pool Access"],
    images: [
      "/src/assets/roomImg2.png",
      "/src/assets/roomImg3.png",
      "/src/assets/roomImg4.png",
      "/src/assets/roomImg1.png",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:25:22.593Z",
    updatedAt: "2025-04-10T06:25:22.593Z",
    __v: 0,
  },
  {
    _id: "67f76406197ac559e4089b82",
    hotel: MOCK_HOTEL,
    roomType: "Double Bed",
    pricePerNight: 249,
    amenities: ["Free WiFi", "Free Breakfast", "Room Service"],
    images: [
      "/src/assets/roomImg3.png",
      "/src/assets/roomImg4.png",
      "/src/assets/roomImg1.png",
      "/src/assets/roomImg2.png",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:24:06.285Z",
    updatedAt: "2025-04-10T06:24:06.285Z",
    __v: 0,
  },
  {
    _id: "67f763d8197ac559e4089b7a",
    hotel: MOCK_HOTEL,
    roomType: "Single Bed",
    pricePerNight: 199,
    amenities: ["Free WiFi", "Room Service", "Pool Access"],
    images: [
      "/src/assets/roomImg4.png",
      "/src/assets/roomImg1.png",
      "/src/assets/roomImg2.png",
      "/src/assets/roomImg3.png",
    ],
    isAvailable: true,
    createdAt: "2025-04-10T06:23:20.252Z",
    updatedAt: "2025-04-10T06:23:20.252Z",
    __v: 0,
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    _id: "67f76839994a731e97d3b8ce",
    user: MOCK_USER,
    room: MOCK_ROOMS[1],
    hotel: MOCK_HOTEL,
    checkInDate: "2025-04-30T00:00:00.000Z",
    checkOutDate: "2025-05-01T00:00:00.000Z",
    totalPrice: 299,
    guests: 1,
    status: "pending",
    paymentMethod: "Stripe",
    isPaid: true,
    createdAt: "2025-04-10T06:42:01.529Z",
    updatedAt: "2025-04-10T06:43:54.520Z",
    __v: 0,
  },
  {
    _id: "67f76829994a731e97d3b8c3",
    user: MOCK_USER,
    room: MOCK_ROOMS[0],
    hotel: MOCK_HOTEL,
    checkInDate: "2025-04-27T00:00:00.000Z",
    checkOutDate: "2025-04-28T00:00:00.000Z",
    totalPrice: 399,
    guests: 1,
    status: "pending",
    paymentMethod: "Pay At Hotel",
    isPaid: false,
    createdAt: "2025-04-10T06:41:45.873Z",
    updatedAt: "2025-04-10T06:41:45.873Z",
    __v: 0,
  },
  {
    _id: "67f76810994a731e97d3b8b4",
    user: MOCK_USER,
    room: MOCK_ROOMS[3],
    hotel: MOCK_HOTEL,
    checkInDate: "2025-04-11T00:00:00.000Z",
    checkOutDate: "2025-04-12T00:00:00.000Z",
    totalPrice: 199,
    guests: 1,
    status: "pending",
    paymentMethod: "Pay At Hotel",
    isPaid: false,
    createdAt: "2025-04-10T06:41:20.501Z",
    updatedAt: "2025-04-10T06:41:20.501Z",
    __v: 0,
  },
];

export const MOCK_DASHBOARD_DATA: DashboardData = {
  totalBookings: 3,
  totalRevenue: 897,
  bookings: MOCK_BOOKINGS,
};
