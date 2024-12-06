import axios from 'axios';

const BASE_AUTH = 'http://localhost:4000/api/v1/auth';
const BASE_ADMIN = 'http://localhost:4000/api/v1/admin';
const BASE_USER = 'http://localhost:4000/api/v1/user';
const BASE_PUBLIC = 'http://localhost:4000/api/v1';

// Create a reusable Axios instance
export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication APIs
export const login = (data) => api.post(`${BASE_AUTH}/login`, data);
export const signup = (data) => api.post(`${BASE_AUTH}/signup`, data);
export const getUserDetails = () => api.get(`${BASE_AUTH}/getUserDetails`);

// Admin APIs
export const createRoutine = (data) => api.post(`${BASE_ADMIN}/createRoutine`, data);
export const updateRoutine = (id, data) => api.put(`${BASE_ADMIN}/routines/updateRoutine/${id}`, data);
export const deleteRoutine = (id) => api.delete(`${BASE_ADMIN}/routines/deleteRoutine/${id}`);
export const getAdminRoutineProgressSummary = () => api.get(`${BASE_ADMIN}/routine/getAdminRoutineProgressSummary`);
export const getAllRoutines = () => api.get(`${BASE_PUBLIC}/getAllRoutines`);

// User APIs
export const joinRoutine = (routineId) => api.post(`${BASE_USER}/routine/joinRoutine/${routineId}`);
export const getRoutineProgress = (routineId) => api.get(`${BASE_USER}/routines/getRoutineProgress/${routineId}`);
export const getAllRoutineProgress = () => api.get(`${BASE_USER}/routines/getAllRoutineProgress`);
export const changeCompletionStatus = (routineId, weekId, dayId, status) =>
  api.post(`${BASE_USER}/routine/${routineId}/${weekId}/${dayId}/${status}`);

// Public APIs
export const getRoutine = (routineId) => api.get(`${BASE_PUBLIC}/getRoutine/${routineId}`);
