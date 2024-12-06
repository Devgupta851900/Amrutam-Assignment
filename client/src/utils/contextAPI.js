/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
	getAllRoutineProgress,
	getAllRoutines,
	getAdminRoutineProgressSummary,
} from "../utils/api";

// Create AppContext
export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [role, setRole] = useState(null);
	const [userRoutines, setUserRoutines] = useState([]);
	const [suggestedRoutines, setSuggestedRoutines] = useState([]);
	const [adminRoutineProgressSummary, setAdminRoutineProgressSummary] =
		useState([]);
	const [loading, setLoading] = useState(false);

	const allSuggestedRoutines = useRef([]);

	// Sync token and role from localStorage when the component mounts
	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedRole = localStorage.getItem("role");
		const storedUser = JSON.parse(localStorage.getItem("user"));

		if (storedToken) setToken(storedToken);
		if (storedRole) setRole(storedRole);
		if (storedUser) setUser(storedUser);

		setLoading(true);

		if (
			storedUser &&
			storedRole === "admin" &&
			adminRoutineProgressSummary.length === 0
		) {
			fetchAdminData(); // Only fetch admin data if it's not already fetched
		} else if (storedUser && storedRole !== "admin") {
			fetchAllRoutines(storedUser); // Fetch user-specific data
		}

		setLoading(false);
	}, []);

	// Fetch routines and update userRoutines and suggestedRoutines
	const fetchAllRoutines = async (currentUser) => {
		try {
			const routinesResponse = await getAllRoutines();
			allSuggestedRoutines.current =
				routinesResponse.data?.routines || [];

			const progressResponse = await getAllRoutineProgress();
			const userRoutineProgress =
				progressResponse.data?.routinesProgress || [];

			setUserRoutines(userRoutineProgress);
			processRoutines(currentUser, userRoutineProgress);
		} catch (error) {
			console.error("Error fetching routines:", error);
		}
	};

	// Fetch admin-specific data
	const fetchAdminData = async () => {
		try {
			const response = await getAdminRoutineProgressSummary();
			setAdminRoutineProgressSummary(
				response.data.routineProgressSummary
			);
		} catch (error) {
			console.error("Error fetching admin data:", error);
		}
	};

	// Process routines to filter suggested routines
	const processRoutines = (currentUser, userRoutineProgress) => {
		if (!currentUser || !currentUser.routines) return;

		const userRoutineIds = new Set(currentUser.routines);
		const filteredSuggestedRoutines = allSuggestedRoutines.current.filter(
			(routine) => !userRoutineIds.has(routine._id)
		);

		setSuggestedRoutines(filteredSuggestedRoutines);
	};

	// Function to log in a user
	const setLogin = async (userData) => {
		const { token } = userData;
		const role = jwtDecode(token).role;

		localStorage.setItem("token", token);
		localStorage.setItem("role", role);
		localStorage.setItem("user", JSON.stringify(userData.user));

		setUser(userData.user);
		setToken(token);
		setRole(role);

		if (role === "admin") {
			await fetchAdminData();
			navigate("/admin");
		} else {
			await fetchAllRoutines(userData.user);
			navigate("/user");
		}
	};

	// Function to log out a user
	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("role");
		localStorage.removeItem("user");

		setUser(null);
		setToken(null);
		setRole(null);
		setUserRoutines([]);
		setSuggestedRoutines([]);
		setAdminRoutineProgressSummary([]);

		navigate("/auth");
	};

	// Provide the context to children
	return (
		<AppContext.Provider
			value={{
				user,
				token,
				role,
				userRoutines,
				suggestedRoutines,
				adminRoutineProgressSummary,
				loading,
				setLoading,
				setRole,
				setToken,
				setUser,
				setLogin,
				logout,
				fetchAllRoutines,
				fetchAdminData,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
