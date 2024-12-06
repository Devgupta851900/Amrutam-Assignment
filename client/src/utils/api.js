import axios from "axios";
const BASE_AUTH = "http://localhost:4000/api/v1/auth";
const BASE_ADMIN = "http://localhost:4000/api/v1/admin";
const BASE_USER = "http://localhost:4000/api/v1/user";
const BASE_PUBLIC = "http://localhost:4000/api/v1";

// Create a reusable Axios instance
export const api = axios.create({
	baseURL: "http://localhost:4000/api/v1",
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor to add token to requests
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor to handle errors
api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Handle unauthorized errors (token expired, etc.)
		if (error.response && error.response.status === 401) {
			// Clear local storage and redirect to login
			localStorage.removeItem("token");
			localStorage.removeItem("role");
			localStorage.removeItem("user");
			window.location.href = "/auth";
		}
		return Promise.reject(error);
	}
);

// Authentication APIs
export const login = (data) => api.post(`${BASE_AUTH}/login`, data); // done
export const signup = (data) => api.post(`${BASE_AUTH}/signup`, data); // done
export const getUserDetails = () => api.get(`${BASE_AUTH}/getUserDetails`); // done

// Admin APIs
export const createRoutine = (data) =>
	api.post(`${BASE_ADMIN}/createRoutine`, data); // done
export const deleteRoutine = (id) =>
	api.delete(`${BASE_ADMIN}/routines/deleteRoutine/${id}`); // done

export const updateRoutine = (id, data) =>
	api.put(`${BASE_ADMIN}/routines/updateRoutine/${id}`, data);

export const addWeekToRoutine = (id, data) =>
	api.put(`${BASE_ADMIN}/routines/addWeek/${id}`, data);
export const deleteWeekFromRoutine = (id, weekId) =>
	api.delete(`${BASE_ADMIN}/routines/deleteWeek/${id}/${weekId}`);
export const updateWeek = (id, weekId, data) =>
	api.put(`${BASE_ADMIN}/routines/updateWeek/${id}/${weekId}`, data);
export const updateDay = (id, weekId, dayId, data) =>
	api.put(`${BASE_ADMIN}/routines/updateDay/${id}/${weekId}/${dayId}`, data);

export const getRoutineUserProgress = (id) =>
	api.get(`${BASE_ADMIN}/routine/getAllUserProgresses/${id}`); // done
export const getAdminRoutineProgressSummary = () =>
	api.get(`${BASE_ADMIN}/routine/getAdminRoutineProgressSummary`); // done

// User APIs
export const joinRoutine = (routineId) =>
	api.post(`${BASE_USER}/routine/joinRoutine/${routineId}`); // done
export const getRoutineProgress = (routineId) =>
	api.get(`${BASE_USER}/routines/getRoutineProgress/${routineId}`); // done
export const getAllRoutineProgress = () =>
	api.get(`${BASE_USER}/routines/getAllRoutineProgress`); // done
export const changeCompletionStatus = (routineId, weekId, dayId) =>
	api.post(`${BASE_USER}/routine/${routineId}/${weekId}/${dayId}/true`); // done

// Public APIs
export const getRoutine = (routineId) =>
	api.get(`${BASE_PUBLIC}/getRoutine/${routineId}`); // done
export const getAllRoutines = () => api.get(`${BASE_PUBLIC}/getAllRoutines`); // done
