/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
	getAllRoutineProgress,
	getAllRoutines,
	getAdminRoutineProgressSummary,
	getUserDetails,
} from "../utils/api";
import { toast } from "react-hot-toast";

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

	const fetchUserData = async () => {
		try {
			const response = await getUserDetails();
			const userData = response.data.user;
			setUser(userData);

			// Set role from token
			const storedToken = localStorage.getItem("token");
			if (storedToken) {
				const decodedToken = jwtDecode(storedToken);
				setRole(decodedToken.role);
			}

			return userData;
		} catch (error) {
			console.error("Error fetching user details:", error);
			logout();
			return null;
		}
	};

	// Only sync token and fetch user data when the component mounts
	const initializeApp = async () => {
		setLoading(true);
		const storedToken = localStorage.getItem("token");

		if (storedToken) {
			setToken(storedToken);
			const userData = await fetchUserData();

			if (userData) {
				const userRole = jwtDecode(storedToken).role;

				if (
					userRole === "admin" &&
					adminRoutineProgressSummary.length === 0
				) {
					await fetchAdminData();
				} else {
					await fetchAllRoutines(userData);
				}
			}
		}
		setLoading(false);
	};
	useEffect(() => {
		initializeApp();
	}, []);

	// Fetch routines and update userRoutines and suggestedRoutines
	const fetchAllRoutines = async (currentUser) => {
		setLoading(true);
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
		setLoading(false);
	};

	// Fetch admin-specific data
	const fetchAdminData = async () => {
		setLoading(true);
		try {
			const response = await getAdminRoutineProgressSummary();
			setAdminRoutineProgressSummary(
				response.data.routineProgressSummary
			);
		} catch (error) {
			console.error("Error fetching admin data:", error);
		}
		setLoading(false);
	};

	// Process routines to filter suggested routines
	const processRoutines = (currentUser, userRoutineProgress) => {
		setLoading(true);
		if (!currentUser || !currentUser.routines) return;

		const userRoutineIds = new Set(currentUser.routines);
		const filteredSuggestedRoutines = allSuggestedRoutines.current.filter(
			(routine) => !userRoutineIds.has(routine._id)
		);

		setSuggestedRoutines(filteredSuggestedRoutines);
		setLoading(false);
	};

	// Function to log in a user
	const setLogin = async (loginData) => {
		const { token } = loginData;

		// Only store token in localStorage
		localStorage.setItem("token", token);
		setToken(token);

		// Fetch fresh user details
		const userData = await fetchUserData();
		if (!userData) return;

		const userRole = jwtDecode(token).role;
		if (userRole === "admin") {
			await fetchAdminData();
			navigate("/admin");
		} else if (userRole === "consumer") {
			await fetchAllRoutines(userData);
			navigate("/user");
		} else {
			navigate("/auth");
		}
	};

	// Function to log out a user
	const logout = () => {
		// Only remove token from localStorage
		localStorage.removeItem("token");

		// Clear all state
		setUser(null);
		setToken(null);
		setRole(null);
		setUserRoutines([]);
		setSuggestedRoutines([]);
		setAdminRoutineProgressSummary([]);

		toast.success("User logged out successfully");

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
				fetchUserData,
				initializeApp,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
