import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const ticketsApi = {
  list: (params = {}) => api.get("/tickets", { params }),
  get: (ticketId) => api.get(`/tickets/${ticketId}`),
  create: (data) => api.post("/tickets", data),
  update: (ticketId, data) => api.put(`/tickets/${ticketId}`, data),
  delete: (ticketId) => api.delete(`/tickets/${ticketId}`),
  stats: () => api.get("/tickets/stats"),
};

export default api;
