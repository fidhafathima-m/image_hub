import axios from "axios";
import {API_URL} from "../utils/constants"

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
})

// add token to requests
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem("token");
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config
    },
    error => Promise.reject(error)
)

// token expiration
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if(error?.response?.status === 401 ) {
            return Promise.reject({ ...error, isUnauthorized: true });
        }
        return Promise.reject(error);
    }
)

export default axiosInstance