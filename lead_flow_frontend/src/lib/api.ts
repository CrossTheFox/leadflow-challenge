// src/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
}

// --- LEADS ---
export const getLeads = () => {
    return fetchAPI('/api/leads/');
};

export const getLead = (id: number) => {
    return fetchAPI(`/api/leads/${id}/`);
};

export const createLead = (data: any) => fetchAPI('/api/leads/', {
    method: 'POST',
    body: JSON.stringify(data),
});

// Update parcial para estado o asignación de vendedor
export const updateLead = (id: number, data: { status?: string; assigned_to?: number | null }) => 
    fetchAPI(`/api/leads/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }
);

// --- USUARIOS (Vendedores) ---
export const getUsers = () => {
    return fetchAPI('/api/users/');
};

// --- DASHBOARD ---
export const getDashboardStats = () => {
    return fetchAPI('/api/dashboard/stats/');
};