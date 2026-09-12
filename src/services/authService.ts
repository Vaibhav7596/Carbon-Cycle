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

const API_BASE_URL = 'http://localhost:5000/api';

export async function registerApi(data: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  organizationType?: string;
  location?: string;
  role?: string;
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
    console.warn('[Auth Service Warning]: Backend unavailable, using client session fallback.');
    const assignedRole = data.role === 'facility_operator' ? 'facility_operator' : 'generator';
    const mockUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email.toLowerCase(),
      role: assignedRole,
      organizationName: data.organizationName,
      organizationType: data.organizationType || (assignedRole === 'facility_operator' ? 'Conversion Facility Operator' : 'Agricultural Enterprise'),
      location: data.location || 'Gandhinagar, Gujarat',
    };
    return {
      success: true,
      token: `demo_jwt_token_${Date.now()}`,
      user: mockUser,
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
      return { success: false, message: json.message || 'Invalid credentials' };
    }
    return json;
  } catch (err: any) {
    console.warn('[Auth Service Warning]: Backend unavailable, using client session fallback.');
    const isAdmin = data.email.includes('admin');
    const isFacility = data.email.includes('facility');

    const role: AuthUser['role'] = isAdmin ? 'admin' : isFacility ? 'facility_operator' : 'generator';

    const mockUser: AuthUser = {
      id: isAdmin ? 'usr-admin-001' : isFacility ? 'usr-fac-001' : 'usr-gen-001',
      name: isAdmin ? 'Admin Controller' : isFacility ? 'Suresh Kumar' : 'Vaibhav Patel',
      email: data.email.toLowerCase(),
      role,
      organizationName: isAdmin ? 'CarbonCycle Admin' : isFacility ? 'Gujarat EcoChar Pyrolysis Center' : 'Gandhinagar Farmers Co-op',
      organizationType: isAdmin ? 'Network Administrator' : isFacility ? 'Conversion Facility Operator' : 'Agricultural Enterprise',
      location: 'Gandhinagar, Gujarat',
    };
    return {
      success: true,
      token: `demo_jwt_token_${Date.now()}`,
      user: mockUser,
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
    return { success: false, message: 'Server unreachable' };
  }
}
