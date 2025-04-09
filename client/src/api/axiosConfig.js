import axios from "axios";

const api = axios.create({
	baseURL: `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1`,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
	(config) => {
		// You can modify the request config here if needed
		return config;
	},
	(error) => {
		// Log the request if there's an error
		console.log("Request error:", error.request);
		return Promise.reject(error);
	}
);

// Response interceptor
api.interceptors.response.use(
	(response) => {
		// You can modify the response data here if needed
		return response;
	},
	(error) => {
		// Log the response data if there's an error
		if (error.response) {
			console.log("Response error:", error.response.data);
		} else {
			console.log("Error:", error.message);
		}
		return Promise.reject(error);
	}
);

export default api;
