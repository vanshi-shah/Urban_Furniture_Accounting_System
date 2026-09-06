export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: 'no-store',
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    // Some endpoints might return 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const budgetApi = {
  getBudgets: () => apiFetch('/budgets'),
  createBudget: (data: any) => apiFetch('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  confirmBudget: (id: string) => apiFetch(`/budgets/${id}/confirm`, { method: 'PUT' }),
  reviseBudget: (id: string, data: any) => apiFetch(`/budgets/${id}/revise`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelBudget: (id: string) => apiFetch(`/budgets/${id}/cancel`, { method: 'PUT' }),
  completeBudget: (id: string) => apiFetch(`/budgets/${id}/complete`, { method: 'PUT' })
};
