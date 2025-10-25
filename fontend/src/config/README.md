# API Configuration

This directory contains the centralized API configuration for the frontend application.

## Structure

- `apiConfig.js` - Centralized configuration file containing all API endpoints and settings
- `../services/api.js` - Main API service that uses this configuration

## Benefits

1. **Single Source of Truth**: All API configuration is in one place
2. **Easy Maintenance**: Changes to API endpoints or base URLs only need to be made in one location
3. **Consistency**: All API calls follow the same configuration
4. **Environment Ready**: Easy to adapt for different environments (development, staging, production)

## Usage

The API configuration is automatically used by the API service. All components should import API functions from `../services/api.js` rather than making direct HTTP calls.

Example:
```javascript
import { login, register } from '../services/api';

// Use the imported functions
const result = await login(email, password);
```