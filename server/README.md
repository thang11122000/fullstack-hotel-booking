# 🏨 Hotel Booking Server

High-performance Node.js backend for the hotel booking application with comprehensive REST API, authentication, and database management.

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js 16+ with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk integration with JWT
- **File Upload**: Cloudinary for image management
- **Security**: Helmet, CORS, Rate limiting, Input validation
- **Logging**: Winston with structured logging
- **Validation**: Express-validator with Joi schemas

### Key Features

#### 🔐 Authentication & Authorization

- Clerk integration for secure user management
- JWT token-based authentication
- Role-based access control (Guest/Owner)
- Webhook handling for user synchronization
- Session management and token refresh

#### 🗄️ Database Management

- MongoDB with Mongoose ODM
- Optimized schemas with proper indexing
- Connection pooling for performance
- Data validation and sanitization
- Automatic timestamps and soft deletes

#### ⚡ Performance & Security

- Rate limiting with configurable thresholds
- Request compression with Brotli support
- Security headers with Helmet
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Error handling with structured logging

#### 📊 Monitoring & Health Checks

- Health check endpoints
- Performance metrics collection
- Memory and CPU usage monitoring
- Request logging with unique IDs
- Error tracking and alerting

## 🛠️ Installation

### Prerequisites

```bash
Node.js >= 16.0.0
MongoDB >= 5.0
npm >= 8.0.0
```

### Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Environment Configuration

Create `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/hotel-booking

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security Settings
JWT_SECRET=your_super_secret_jwt_key_here
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=1000
AUTH_RATE_LIMIT_MAX=100

# Performance Settings
MAX_CONNECTIONS=50
REQUEST_TIMEOUT=30000
COMPRESSION_LEVEL=9
```

## 🚀 Running the Server

### Development Mode

```bash
npm run dev
```

Starts the server with hot reload using nodemon.

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Other Commands

```bash
# Linting
npm run lint
npm run lint:fix

# Testing
npm test

# Type checking
npx tsc --noEmit
```

## 📁 Project Structure

```
server/
├── src/
│   ├── controllers/          # Route controllers
│   │   ├── userController.ts
│   │   ├── hotelController.ts
│   │   ├── roomController.ts
│   │   ├── bookingController.ts
│   │   └── clerkWebhook.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── models/              # MongoDB models
│   │   ├── User.ts
│   │   ├── Hotel.ts
│   │   ├── Room.ts
│   │   └── Booking.ts
│   ├── routes/              # API routes
│   │   ├── userRouter.ts
│   │   ├── hotelRouter.ts
│   │   ├── roomRouter.ts
│   │   └── bookingRouter.ts
│   ├── services/            # Business logic
│   │   ├── userService.ts
│   │   ├── hotelService.ts
│   │   ├── roomService.ts
│   │   └── bookingService.ts
│   ├── validators/          # Input validation
│   │   ├── userValidator.ts
│   │   ├── hotelValidator.ts
│   │   ├── roomValidator.ts
│   │   └── bookingValidator.ts
│   ├── utils/               # Utility functions
│   │   ├── logger.ts
│   │   ├── helpers.ts
│   │   └── constants.ts
│   ├── lib/                 # External integrations
│   │   ├── mongo.ts
│   │   └── cloudinary.ts
│   ├── types/               # TypeScript definitions
│   │   └── index.ts
│   ├── app.ts               # Express app setup
│   └── index.ts             # Server entry point
├── dist/                    # Compiled JavaScript
├── logs/                    # Application logs
├── scripts/                 # Utility scripts
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## 🔧 API Documentation

### Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Endpoints

```http
GET    /api/user/profile          # Get user profile
PUT    /api/user/profile          # Update user profile
DELETE /api/user/profile          # Delete user account
```

### Hotel Endpoints

```http
GET    /api/hotels                # Get all hotels (with filters)
GET    /api/hotels/:id            # Get hotel by ID
POST   /api/hotels               # Create new hotel (Owner only)
PUT    /api/hotels/:id            # Update hotel (Owner only)
DELETE /api/hotels/:id            # Delete hotel (Owner only)
GET    /api/hotels/owner/my       # Get owner's hotels
```

### Room Endpoints

```http
GET    /api/rooms                 # Get all rooms (with filters)
GET    /api/rooms/:id             # Get room by ID
POST   /api/rooms                # Create new room (Owner only)
PUT    /api/rooms/:id             # Update room (Owner only)
DELETE /api/rooms/:id             # Delete room (Owner only)
GET    /api/rooms/hotel/:hotelId  # Get rooms by hotel
POST   /api/rooms/:id/images      # Upload room images
```

### Booking Endpoints

```http
GET    /api/bookings              # Get user's bookings
GET    /api/bookings/:id          # Get booking by ID
POST   /api/bookings             # Create new booking
PUT    /api/bookings/:id          # Update booking
DELETE /api/bookings/:id          # Cancel booking
GET    /api/bookings/owner/all    # Get owner's bookings
```

### Webhook Endpoints

```http
POST   /api/clerk/webhook         # Clerk user synchronization
```

### Health & Monitoring

```http
GET    /api/health                # System health check
GET    /api/metrics               # Performance metrics
```

## 🗄️ Database Schema

### User Model

```typescript
interface IUser {
  _id: ObjectId;
  clerkId: string; // Clerk user ID
  email: string; // User email (unique)
  firstName: string; // User first name
  lastName: string; // User last name
  profileImage?: string; // Profile image URL
  role: "guest" | "owner"; // User role
  createdAt: Date;
  updatedAt: Date;
}
```

### Hotel Model

```typescript
interface IHotel {
  _id: ObjectId;
  name: string; // Hotel name
  address: string; // Hotel address
  contact: string; // Contact phone number
  owner: ObjectId; // Reference to User
  city: string; // Hotel city
  createdAt: Date;
  updatedAt: Date;
}
```

### Room Model

```typescript
interface IRoom {
  _id: ObjectId;
  hotel: ObjectId; // Reference to Hotel
  roomNumber: string; // Room identifier
  type: string; // Room type (single, double, suite)
  price: number; // Price per night
  capacity: number; // Maximum occupancy
  amenities: string[]; // Room amenities
  images: string[]; // Room image URLs
  isAvailable: boolean; // Availability status
  description?: string; // Room description
  createdAt: Date;
  updatedAt: Date;
}
```

### Booking Model

```typescript
interface IBooking {
  _id: ObjectId;
  user: ObjectId; // Reference to User
  room: ObjectId; // Reference to Room
  hotel: ObjectId; // Reference to Hotel
  checkIn: Date; // Check-in date
  checkOut: Date; // Check-out date
  guests: number; // Number of guests
  totalAmount: number; // Total booking amount
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded";
  specialRequests?: string; // Guest special requests
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Indexes

```javascript
// User indexes
userSchema.index({ clerkId: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Hotel indexes
hotelSchema.index({ owner: 1 }, { unique: true });
hotelSchema.index({ city: 1, createdAt: -1 });
hotelSchema.index({ name: "text", address: "text", city: "text" });

// Room indexes
roomSchema.index({ hotel: 1 });
roomSchema.index({ hotel: 1, isAvailable: 1 });
roomSchema.index({ type: 1, price: 1 });
roomSchema.index({ price: 1 });

// Booking indexes
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ hotel: 1, status: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
```

## ⚡ Performance Configuration

### MongoDB Connection

```javascript
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 50, // Maximum connections
  minPoolSize: 5, // Minimum connections
  maxIdleTimeMS: 30000, // Close connections after 30s idle
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### Rate Limiting

```javascript
// General rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication rate limiting
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit auth attempts
  skipSuccessfulRequests: true,
});
```

### Compression

```javascript
app.use(
  compression({
    level: 9, // Maximum compression
    threshold: 1024, // Only compress files > 1KB
    brotli: {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
      },
    },
  })
);
```

## 📊 Monitoring

### Health Check Response

```json
{
  "status": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development",
  "worker": 12345,
  "uptime": 3600,
  "responseTime": "5ms",
  "memory": {
    "rss": "45MB",
    "heapUsed": "32MB",
    "heapTotal": "40MB",
    "external": "8MB"
  },
  "system": {
    "cpu": { "user": 1000000, "system": 500000 },
    "load": [0.5, 0.3, 0.2]
  }
}
```

### Metrics Endpoint

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "worker": 12345,
  "uptime": 3600,
  "memory": {
    "rss": 47185920,
    "heapUsed": 33554432,
    "heapTotal": 41943040,
    "external": 8388608
  },
  "cpu": { "user": 1000000, "system": 500000 },
  "system": {
    "load": [0.5, 0.3, 0.2],
    "freeMemory": 2147483648,
    "totalMemory": 8589934592
  },
  "connections": {
    "active": 25,
    "total": 1000
  }
}
```

## 🔒 Security Features

### Input Validation

```javascript
// Example validation schema
const hotelValidation = {
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().min(10).max(200).required(),
  contact: Joi.string()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .required(),
  city: Joi.string().min(2).max(50).required(),
};
```

### Error Handling

```javascript
// Centralized error handler
app.use((error, req, res, next) => {
  logger.error(`Error: ${error.message}`, {
    requestId: req.requestId,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: error.details,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set up Clerk production keys
- [ ] Configure Cloudinary for production
- [ ] Set secure JWT secret
- [ ] Configure CORS for production domains
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### Docker Deployment

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 5000

CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com

MONGODB_URI=mongodb+srv://...
CLERK_SECRET_KEY=sk_live_...
CLOUDINARY_CLOUD_NAME=your_production_cloud
```

## 🧪 Testing

### Running Tests

```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

### Test Structure

```
tests/
├── unit/                  # Unit tests
│   ├── controllers/
│   ├── services/
│   └── utils/
├── integration/           # Integration tests
│   ├── routes/
│   └── database/
└── fixtures/              # Test data
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Follow TypeScript and ESLint guidelines
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.
