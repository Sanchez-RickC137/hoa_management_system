# Summit Ridge HOA Management System

Summit Ridge HOA Management System is a comprehensive web application designed to streamline homeowner association management. The platform provides a user-friendly interface for managing HOA operations, including payments, documents, announcements, and communications between board members and residents.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started with Create React App](#getting-started-with-create-react-app)
- [Dependencies](#dependencies)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Support](#support)
- [License](#license)

## Features

### User Management
- Role-based access control (Residents, Board Members)
- Secure authentication and authorization
- Profile and contact information management
- Email notification preferences

### Financial Management
- Online payment processing
- Payment history tracking
- Credit card management
- Assessment and fine management

### Communication Tools
- Announcements and events management
- Direct messaging system
- Document sharing
- Community surveys

### Board Member Features
- Violation management
- Assessment creation
- Board member role management
- Document control

### Additional Features
- Mobile-responsive design
- Dark/Light theme support
- Real-time updates
- Secure data handling

## Tech Stack

### Frontend
- React 18.3.1
- React Router DOM 6.27.0
- Tailwind CSS
- Lucide React (Icons)
- Recharts (Data visualization)

### Backend
- Node.js/Express
- MySQL 8.0+
- JWT Authentication
- SendGrid (Email services)

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14+ recommended)
- npm (v6+ recommended)
- MySQL (v8.0+ recommended)
- Git

## Installation

1. **Clone the Repository**
```bash
git clone https://github.com/Sanchez-RickC137/hoa_management_system
cd hoa-management-system
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=hoa_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
```

4. **Database Setup**
```bash
# Log into MySQL
mysql -u root -p

# Create database
CREATE DATABASE hoa_management;

# Create user and grant privileges
CREATE USER 'hoa_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON hoa_management.* TO 'hoa_user'@'localhost';
FLUSH PRIVILEGES;
```

5. **Initial Data Load**
```bash
# Run database migrations
node server/config/migrations.js

# Load initial data
node server/services/initialDataLoad.js
```

## Available Scripts

In the project directory, you can run:

#### `npm start`
Runs the app in development mode on [http://localhost:3000](http://localhost:3000)

#### `npm run server`
Runs the backend server on [http://localhost:5000](http://localhost:5000)

#### `npm run dev`
Runs both frontend and backend concurrently

#### `npm test`
Launches the test runner

#### `npm run build`
Builds the app for production

## Dependencies

### Core Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.27.0",
  "express": "^4.21.1",
  "mysql2": "^3.11.3",
  "axios": "^1.7.7"
}
```

### Authentication & Security
```json
{
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "express-rate-limit": "^7.4.1",
  "cors": "^2.8.5"
}
```

### UI & Visualization
```json
{
  "lucide-react": "^0.453.0",
  "recharts": "^2.13.0",
  "@emotion/react": "^11.13.3",
  "@emotion/styled": "^11.13.0"
}
```

## Project Structure
```
hoa-management/
├── public/            # Static files
├── src/
│   ├── assets/        # Images and static assets
│   ├── components/    # React components
│   ├── contexts/      # Context providers
│   ├── pages/         # Page components
│   └── services/      # API services
├── server/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── services/      # Business logic
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - Register new user
- `POST /api/forgot-password` - Password reset request
- `POST /api/reset-password` - Complete password reset
- `POST /api/verify-registration` - Verify new registration

### User Management
- `GET /api/profile` - Get user profile
- `PUT /api/owner/personal-info` - Update personal information
- `PUT /api/owner/contact-info` - Update contact information
- `PUT /api/owner/notification-preferences` - Update notification preferences

### Financial Operations
- `GET /api/account-details` - Get account details
- `POST /api/payments` - Process payment
- `GET /api/payments/history` - Get payment history
- `GET /api/cards/:accountId` - Get saved cards
- `POST /api/cards/:accountId` - Add new card

### Documents & Communications
- `GET /api/documents` - Get documents
- `POST /api/documents` - Upload document
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement

### Board Member Operations
- `GET /api/board-members/roles` - Get board member roles
- `POST /api/violations` - Issue violation
- `POST /api/assessments/issue` - Issue assessment
- `GET /api/verify-board-member` - Verify board member status

## Contributing

Contributions are welcome! Please follow our branch naming convention:
- `feature/` for new features
- `bugfix/` for bug fixes
- `hotfix/` for critical fixes
- `release/` for release branches

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify MySQL service is running
   - Check database credentials in .env
   - Confirm database exists and user has proper permissions

2. **Authentication Issues**
   - Clear browser cache and local storage
   - Verify JWT token expiration
   - Check user permissions

## Support

For support:
1. Check the documentation
2. Contact your HOA administrator
3. Submit an issue through the proper channels

## License

This project is licensed under the MIT License - see the LICENSE file for details.