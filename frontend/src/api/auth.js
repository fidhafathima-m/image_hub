import axiosInstance from "./axiosInstance"

export const authAPI = {
    register: async (userData) => {
        const response = await axiosInstance.post("/auth/register", userData);
        return response.data
    },
    login: async(credentials) => {
        const response = await axiosInstance.post("/auth/login", credentials);
        return response.data
    },
    forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axiosInstance.post('/auth/reset-password', { 
      token, 
      password 
    });
    return response.data;
  },
}