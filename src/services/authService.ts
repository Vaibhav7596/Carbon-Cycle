import { FacilityRegistrationProfile } from '../types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'generator' | 'facility_operator' | 'admin' | 'user';
  organizationName: string;
  organizationType: string;
  location: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

export const API_BASE_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api'
).replace(/\/+$/, '');

export async function registerApi(data: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  organizationType?: string;
  location?: string;
  role?: string;
  facilityProfile?: FacilityRegistrationProfile;
}): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || 'Registration failed' };
    }
    return json;
  } catch (err: any) {
    console.error('[Auth Service Error]: Registration failed due to network/server connection error:', err);
    return {
      success: false,
      message: 'Unable to connect to authentication server. Please check your connection or backend API URL.',
    };
  }
}

export async function loginApi(data: { email: string; password: string }): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || 'Invalid email or password' };
    }
    return json;
  } catch (err: any) {
    console.error('[Auth Service Error]: Login failed due to network/server connection error:', err);
    return {
      success: false,
      message: 'Unable to connect to authentication server. Please check your connection or backend API URL.',
    };
  }
}

export async function getMeApi(token: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || 'Session expired' };
    }
    return json;
  } catch (err) {
    console.error('[Auth Service Error]: Failed to reach server during session restoration:', err);
    return { success: false, message: 'Server unreachable' };
  }
}
