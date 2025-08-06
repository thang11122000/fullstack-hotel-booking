# 🏨 Hotel Booking Client

Modern React frontend application for the hotel booking platform, built with TypeScript, Vite, and Tailwind CSS.

## 🏗️ Architecture

### Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive design
- **Routing**: React Router DOM for client-side navigation
- **Authentication**: Clerk for secure user management
- **HTTP Client**: Axios for API communication
- **State Management**: React Context API with custom hooks
- **Notifications**: React Hot Toast for user feedback
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

### Key Features

#### 🎨 User Interface

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Components**: Reusable UI components with TypeScript
- **Smooth Navigation**: React Router with protected routes
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: User-friendly error messages and fallbacks

#### 🔐 Authentication & Authorization

- **Clerk Integration**: Secure authentication with social logins
- **Protected Routes**: Role-based access control
- **User Profiles**: Profile management and preferences
- **Session Management**: Automatic token refresh and logout

#### 🏨 Hotel Booking Features

- **Hotel Search**: Advanced filtering and search capabilities
- **Room Browsing**: Detailed room information with image galleries
- **Booking System**: Intuitive booking flow with date selection
- **Booking Management**: View and manage personal bookings
- **Owner Dashboard**: Hotel and room management for owners

#### ⚡ Performance & UX

- **Fast Loading**: Vite for instant development and optimized builds
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **Caching**: Efficient API response caching
- **Offline Support**: Service worker for basic offline functionality

## 🛠️ Installation

### Prerequisites

```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Environment Configuration

Create `.env` file with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

# Application Settings
VITE_APP_NAME=Hotel Booking
VITE_APP_VERSION=1.0.0

# Development Settings
VITE_DEV_MODE=true
VITE_LOG_LEVEL=debug
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

Starts the development server with hot module replacement at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `dist/` directory

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing

### Other Commands

```bash
# Linting
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues automatically

# Type Checking
npm run type-check        # Run TypeScript compiler check

# Code Formatting
npm run format            # Format code with Prettier
npm run format:check      # Check code formatting
```

## 📁 Project Structure

```
client/
├── public/                    # Static assets
│   ├── favicon.svg
│   └── vite.svg
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Basic UI components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   ├── Navbar.tsx
│   │   └── HotelReg.tsx
│   ├── pages/                # Page components
│   │   ├── home/             # Home page components
│   │   │   ├── Home.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── FeaturedDestination.tsx
│   │   │   ├── RecommendedHotels.tsx
│   │   │   ├── ExclusiveOffers.tsx
│   │   │   ├── Testimonial.tsx
│   │   │   ├── NewLetter.tsx
│   │   │   └── Footer.tsx
│   │   ├── rooms/            # Room-related pages
│   │   │   ├── AllRooms.tsx
│   │   │   ├── RoomDetails.tsx
│   │   │   └── MyBooking.tsx
│   │   └── dashboard/        # Owner dashboard
│   │       ├── Layout.tsx
│   │       ├── DashBoard.tsx
│   │       ├── AddRoom.tsx
│   │       └── ListRoom.tsx
│   ├── context/              # React context providers
│   │   ├── AppContext.tsx
│   │   └── AuthContext.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useApi.ts
│   │   ├── useAuth.ts
│   │   └── useLocalStorage.ts
│   ├── services/             # API service functions
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── hotelService.ts
│   │   ├── roomService.ts
│   │   └── bookingService.ts
│   ├── types/                # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── api.ts
│   │   ├── user.ts
│   │   ├── hotel.ts
│   │   ├── room.ts
│   │   └── booking.ts
│   ├── utils/                # Utility functions
│   │   ├── helpers.ts
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── assets/               # Images, icons, etc.
│   ├── App.tsx               # Main App component
│   ├── main.tsx              # Application entry point
│   ├── index.css             # Global styles
│   └── vite-env.d.ts         # Vite type definitions
├── dist/                     # Production build output
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── eslint.config.js
├── .prettierrc
└── README.md
```

## 🎨 Component Architecture

### Page Components

#### Home Page (`/`)

- **Hero**: Main landing section with search functionality
- **FeaturedDestination**: Showcase popular destinations
- **RecommendedHotels**: Display recommended accommodations
- **ExclusiveOffers**: Special deals and promotions
- **Testimonial**: Customer reviews and feedback
- **Newsletter**: Email subscription component
- **Footer**: Site footer with links and information

#### Rooms Pages

- **AllRooms** (`/rooms`): Browse all available rooms with filters
- **RoomDetails** (`/rooms/:id`): Detailed room information and booking
- **MyBooking** (`/my-bookings`): User's booking history and management

#### Owner Dashboard (`/owner`)

- **Layout**: Dashboard layout with navigation
- **Dashboard**: Overview and analytics
- **AddRoom**: Form to add new rooms
- **ListRoom**: Manage existing rooms

### Reusable Components

```typescript
// Example component structure
interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Component logic
  return (
    // JSX
  );
};

export default Component;
```

## 🔧 API Integration

### API Service Structure

```typescript
// services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    return Promise.reject(error);
  }
);

export default api;
```

### Service Functions

```typescript
// services/hotelService.ts
import api from "./api";
import { Hotel, CreateHotelData } from "../types";

export const hotelService = {
  // Get all hotels
  getHotels: async (params?: any): Promise<Hotel[]> => {
    const response = await api.get("/hotels", { params });
    return response.data;
  },

  // Get hotel by ID
  getHotel: async (id: string): Promise<Hotel> => {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },

  // Create new hotel
  createHotel: async (data: CreateHotelData): Promise<Hotel> => {
    const response = await api.post("/hotels", data);
    return response.data;
  },

  // Update hotel
  updateHotel: async (id: string, data: Partial<Hotel>): Promise<Hotel> => {
    const response = await api.put(`/hotels/${id}`, data);
    return response.data;
  },

  // Delete hotel
  deleteHotel: async (id: string): Promise<void> => {
    await api.delete(`/hotels/${id}`);
  },
};
```

## 🎯 State Management

### Context API Usage

```typescript
// context/AppContext.tsx
interface AppContextType {
  user: User | null;
  hotels: Hotel[];
  loading: boolean;
  error: string | null;
  // Actions
  setUser: (user: User | null) => void;
  setHotels: (hotels: Hotel[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    hotels: [],
    loading: false,
    error: null,
  });

  // Context value
  const value = {
    ...state,
    setUser: (user: User | null) => setState(prev => ({ ...prev, user })),
    setHotels: (hotels: Hotel[]) => setState(prev => ({ ...prev, hotels })),
    setLoading: (loading: boolean) => setState(prev => ({ ...prev, loading })),
    setError: (error: string | null) => setState(prev => ({ ...prev, error })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
```

### Custom Hooks

```typescript
// hooks/useApi.ts
import { useState, useEffect } from "react";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useApi = <T>(
  apiFunction: () => Promise<T>,
  dependencies: any[] = []
): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};
```

## 🎨 Styling with Tailwind CSS

### Configuration

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        secondary: {
          50: "#f8fafc",
          500: "#64748b",
          600: "#475569",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
```

### Component Styling Examples

```typescript
// Responsive button component
const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', children, ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
```

## 🔐 Authentication with Clerk

### Setup

```typescript
// main.tsx
import { ClerkProvider } from '@clerk/clerk-react';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'guest' | 'owner';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isSignedIn, isLoaded, user } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (requiredRole && user?.publicMetadata?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Authentication Hooks

```typescript
// hooks/useAuth.ts
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

export const useAuth = () => {
  const { isSignedIn, isLoaded, signOut } = useClerkAuth();
  const { user } = useUser();

  const userRole = user?.publicMetadata?.role as "guest" | "owner" | undefined;

  return {
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          role: userRole,
        }
      : null,
    signOut,
  };
};
```

## 📱 Responsive Design

### Breakpoint Strategy

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops/desktops) */
xl: 1280px  /* Extra large devices (large laptops/desktops) */
2xl: 1536px /* 2X large devices (larger desktops) */
```

### Mobile-First Components

```typescript
// Responsive navigation example
const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img className="h-8 w-auto" src="/logo.svg" alt="Logo" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/rooms">Rooms</NavLink>
            <NavLink to="/bookings">My Bookings</NavLink>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <MobileNavLink to="/">Home</MobileNavLink>
              <MobileNavLink to="/rooms">Rooms</MobileNavLink>
              <MobileNavLink to="/bookings">My Bookings</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
```

## ⚡ Performance Optimization

### Code Splitting

```typescript
// Lazy loading pages
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/home/Home'));
const AllRooms = lazy(() => import('./pages/rooms/AllRooms'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));

// App component with Suspense
const App: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<AllRooms />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
};
```

### Image Optimization

```typescript
// Optimized image component
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
};
```

### Memoization

```typescript
// Memoized components for performance
import { memo, useMemo, useCallback } from 'react';

const RoomCard = memo<RoomCardProps>(({ room, onBook }) => {
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(room.price);
  }, [room.price]);

  const handleBooking = useCallback(() => {
    onBook(room.id);
  }, [room.id, onBook]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <OptimizedImage
        src={room.images[0]}
        alt={room.type}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{room.type}</h3>
        <p className="text-gray-600">{room.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-primary-600">
            {formattedPrice}/night
          </span>
          <button
            onClick={handleBooking}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
});
```

## 🧪 Testing

### Testing Setup

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

### Test Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

### Example Tests

```typescript
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByText('Secondary');
    expect(button).toHaveClass('bg-secondary-100');
  });
});
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
VITE_APP_NAME=Hotel Booking
VITE_DEV_MODE=false
```

### Static Hosting (Netlify/Vercel)

```json
// netlify.toml or vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:16-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding standards:
   - Use TypeScript for type safety
   - Follow ESLint and Prettier configurations
   - Write tests for new components
   - Use semantic commit messages
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style Guidelines

- Use functional components with hooks
- Implement proper TypeScript types
- Follow the established folder structure
- Use Tailwind CSS for styling
- Write meaningful component and variable names
- Add JSDoc comments for complex functions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
