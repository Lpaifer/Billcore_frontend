import { apiBaseUrl } from "./appConfig";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

interface ApiErrorResponse {
  message?: string;
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    if (payload.message && payload.message.trim().length > 0) {
      return payload.message;
    }
  } catch {
    // Keep fallback message when body is not JSON.
  }

  return `Falha na requisição (${response.status}).`;
}

async function postJson<TRequest, TResponse>(path: string, body: TRequest): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return (await response.json()) as TResponse;
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  return postJson<LoginRequest, AuthResponse>("/api/v1/auth/login", request);
}

export async function register(request: RegisterRequest): Promise<AuthUser> {
  return postJson<RegisterRequest, AuthUser>("/api/v1/users/register", request);
}
