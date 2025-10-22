# ChandPur-Shop
ChandPur-Shop is a modern eCommerce website built with React for the frontend and Laravel for the backend. Connected securely using Laravel Sanctum, it ensures smooth authentication and data flow. The site offers a fast, user-friendly shopping experience with easy product browsing and secure order management.


# React Frontend with Laravel Backend Authentication

This project demonstrates a complete authentication system with React frontend and Laravel backend.

## Project Structure
```
Project/
├── fontend/          # React frontend application
│   ├── src/
│   │   ├── components/     # Login, Register, Dashboard components
│   │   ├── contexts/       # Authentication context
│   │   ├── services/       # API service
│   │   └── ...
│   └── ...
└── server/           # Laravel backend application
    ├── app/
    │   ├── Http/
    │   │   └── Controllers/
    │   │       └── AuthController.php
    │   └── Models/
    │       └── User.php
    ├── routes/
    │   ├── api.php         # API routes for authentication
    │   └── web.php         # Web routes
    └── ...
```

## Features
- User Registration
- User Login
- Protected Dashboard
- User Logout
- Token-based Authentication with Laravel Sanctum
- CSRF Protection

## Prerequisites
- PHP 8.2+
- Composer
- Node.js 16+
- npm

## Installation

### Backend (Laravel)
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Copy and configure the environment file:
   ```bash
   cp .env.example .env
   ```

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Install Laravel Sanctum:
   ```bash
   composer require laravel/sanctum
   ```

6. Publish Sanctum configuration:
   ```bash
   php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
   ```

7. Run database migrations:
   ```bash
   php artisan migrate
   ```

### Frontend (React)
1. Navigate to the frontend directory:
   ```bash
   cd fontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Install required packages:
   ```bash
   npm install react-router-dom axios
   ```

## Running the Application

### Start the Laravel Backend
```bash
cd server
php artisan serve
```
The backend will be available at http://127.0.0.1:8000

### Start the React Frontend
```bash
cd fontend
npm run dev
```
The frontend will be available at http://localhost:5173 (or another port if 5174 is in use)

## Usage
1. Open your browser and navigate to the frontend URL
2. Register a new account or login with existing credentials
3. After successful authentication, you'll be redirected to the dashboard
4. Use the logout button to end your session

## API Endpoints
- `POST /api/register` - Register a new user
- `POST /api/login` - Authenticate a user
- `POST /api/logout` - Logout the current user
- `GET /api/user` - Get authenticated user details

## Security
- CSRF protection is enabled
- Passwords are hashed using Laravel's built-in hashing
- API authentication uses Laravel Sanctum tokens
- CORS is configured to allow requests from the frontend domain

## Troubleshooting
1. If you encounter CORS issues, check the `config/cors.php` file
2. If authentication fails, ensure Sanctum is properly configured in `config/sanctum.php`
3. Make sure both servers are running on the correct ports