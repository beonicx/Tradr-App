// Environment configuration
// This file reads from .env at build time via react-native-dotenv

import { API_BASE_URL as ENV_API_URL, SOCKET_URL as ENV_SOCKET_URL } from '@env';

// Default values for fallback
const DEFAULT_API_BASE_URL = 'http://10.0.2.2:5003/api'; // Android emulator default
const DEFAULT_SOCKET_URL = 'http://10.0.2.2:5003'; // Android emulator default

// Use environment variables or fall back to defaults
export const API_BASE_URL = ENV_API_URL || DEFAULT_API_BASE_URL;
export const SOCKET_URL = ENV_SOCKET_URL || DEFAULT_SOCKET_URL;

// Platform-specific adjustments
// For iOS simulator, you might need to change to localhost
// For physical devices, you need to use your computer's IP address
