import api from "./axiosConfig";

const fetchDashboardData = async () => {
	return await api.get("/dashboard/get");
};

export { fetchDashboardData };