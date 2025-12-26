# PropertyShare Pro

A production-ready full-stack property management platform with role-based access control, analytics dashboard, and comprehensive property management features.

## 🚀 Features

- **Role-Based Access Control**: Admin and Employee roles with different permissions
- **Property Management**: Full CRUD operations with advanced search and filtering
- **Analytics Dashboard**: Real-time statistics with interactive charts
- **User Management**: Admin can manage employees, toggle status, and reset passwords
- **Activity Tracking**: Logs all uploads, edits, deletes, and logins
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication

### Frontend
- Next.js
- Tailwind CSS
- TanStack Query (React Query)
- Recharts
- Axios

## 📋 Prerequisites

- Node.js (v20 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
cd d:/Property-Pro
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables

# Seed the database with demo data
node src/seed.js

# Start the backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies (already done)
npm install

# Start the frontend development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔐 Demo Credentials

### Admin Account
- **Username**: `admin@propertyshare`
- **Password**: `Admin@123`
- **Access**: Full access to all features including user management

### Employee Accounts
- **Username**: `john.doe` | **Password**: `Employee@123`
- **Username**: `jane.smith` | **Password**: `Employee@123`
- **Access**: Can manage properties, view personal analytics

## 📁 Project Structure

```
Property-Pro/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth & RBAC middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── seed.js          # Database seed script
│   │   └── server.js        # Express server
│   ├── .env                 # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── ui/          # Base UI components
    │   │   └── layout/      # Layout components
    │   ├── context/         # React context (Auth)
    │   ├── lib/             # Utilities & API client
    │   ├── pages/           # Page components
    │   ├── types/           # TypeScript types
    │   └── App.tsx          # Main app component
    ├── .env                 # Environment variables
    └── package.json
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Properties
- `GET /api/properties` - List properties (with search & filters)
- `POST /api/properties` - Create property
- `GET /api/properties/:id` - Get single property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Users (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/toggle-status` - Toggle user status
- `POST /api/users/:id/reset-password` - Reset password

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/daily-uploads` - Daily upload chart data
- `GET /api/analytics/weekly-trends` - Weekly trend chart data
- `GET /api/analytics/employee/:id/activity` - Employee activity

## 🎨 Features Overview

### Dashboard
- Total properties count
- Daily and weekly upload statistics
- Role-specific data (Admin sees all, Employee sees own)

### Property Management
- Advanced search (property name, location)
- Multi-filter support:
  - Area Zone (North, South, East, West, Central, Suburban)
  - Property Type (Apartment, Villa, Office, Shop, etc.)
  - Employee (Admin only)
  - Rent Range (min-max)
- Edit and delete with permission checks

### Property Features Checklist
- Parking
- Gym
- Security
- Swimming Pool
- Balcony
- Clubhouse
- Power Backup
- Lift
- Intercom
- Gas Pipeline
- Wi-Fi
- Garden
- Playground
- CCTV
- Water Supply

### User Management (Admin)
- Add new employees
- Edit employee details
- Toggle Active/Inactive status
- Reset passwords
- Delete employees
- View activity statistics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control
- Token expiration (7 days default)
- Secure HTTP-only practices


## 📊 Database Schema

### Users Collection
- username, email, password (hashed)
- role (ADMIN | EMPLOYEE)
- status (ACTIVE | INACTIVE)
- timestamps

### Properties Collection
- propertyName, type, location, areaZone
- rentAmount, securityDeposit, maintenanceCharges
- features (15 boolean flags)
- uploadedBy (User reference)
- isActive (soft delete)
- timestamps

### Activities Collection
- userId, action (LOGIN | UPLOAD | EDIT | DELETE)
- propertyId (optional)
- metadata (property name snapshot)
- timestamp

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Implementing image upload for properties
- Adding email notifications
- Implementing password reset via email

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

Built as a production-ready demonstration of modern full-stack development practices.

---

**Happy Property Managing! 🏠**
