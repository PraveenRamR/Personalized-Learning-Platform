import { api } from './apiClient';

export async function login(username: string, password: string) {
  const res = await api.post("/token/", { username, password });
  return res.data;
}

export async function register(userData: {
  username: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}) {
  const res = await api.post("/users/register/", userData);
  return res.data;
}

export async function getProfile(token: string) {
  const res = await api.get("/profiles/me/", { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return res.data;
}

export async function updateProfile(token: string, data: any) {
  const res = await api.patch("/profiles/me/", data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return res.data;
}
