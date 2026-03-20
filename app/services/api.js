import { reactive } from 'vue';

export const API_BASE = "http://localhost:8000/api";

export const shopState = reactive({
  cartCount: 0,
});

export async function api(path, options = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers = { 
    "Content-Type": "application/json", 
    "Accept": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
  
  const res = await fetch(`${API_BASE}${path}`, { 
    headers, 
    ...options,
    method: options.method || 'GET'
  });
  
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    }
    throw data;
  }
  return data;
}