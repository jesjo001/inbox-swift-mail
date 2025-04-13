
import axios from 'axios';

const BASE_URL = 'https://mailserver-j9yk.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session timeout or unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) => 
    api.post('/api/auth/login', { email, password }),
  
  register: (email: string, password: string, firstName: string, lastName: string) =>
    api.post('/api/auth/register', { email, password, firstName, lastName }),
  
  getCurrentUser: () => 
    api.get('/api/auth/me'),
  
  logout: () => 
    api.post('/api/auth/logout')
};

export const messagesApi = {
  getAllMessages: () => 
    api.get('/api/messages'),
  
  getMessageById: (id: string) => 
    api.get(`/api/messages/${id}`),
  
  sendMessage: (recipientId: string, subject: string, content: string) =>
    api.post('/api/messages', { recipientId, subject, content }),
  
  markAsRead: (id: string) => 
    api.put(`/api/messages/${id}/read`),
  
  deleteMessage: (id: string) => 
    api.delete(`/api/messages/${id}`),
  
  getStats: () => 
    api.get('/api/messages/stats')
};
