import { Routes, Route, Navigate } from "react-router-dom";
import UserDashboard from "./pages/User/UserDashboard";
import { useContext } from "react";
import { AppContext } from "./utils/contextAPI";
import Navbar from "./components/Navbar";
import JoinedRoutinePage from "./pages/User/JoinedRoutinePage";
import ViewRoutinePage from "./pages/User/ViewRoutinePage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import RoutineProgressSummary from "./pages/Admin/RoutineProgressSummary";
import CreateRoutine from "./pages/Admin/CreateRoutine";
import ViewEditRoutine from "./pages/Admin/ViewEditRoutine";
import Auth from "./pages/Auth/Auth";

const App = () => {
	const { token, role } = useContext(AppContext);

	return (
		<div>
			<Navbar />
			<Routes>
				{!token && (
					<>
						<Route path="/auth" element={<Auth />} />
						<Route path="*" element={<Navigate to="/auth" />} />
					</>
				)}

				{/* Prevent logged-in users from accessing /auth */}
				<Route
					path="/auth"
					element={
						<Navigate to={role === "admin" ? "/admin" : "/user"} />
					}
				/>

				{/* Admin Routes */}
				{role === "admin" && (
					<>
						<Route path="/admin" element={<AdminDashboard />} />
						<Route
							path="/admin/routine/summary/:routineId"
							element={<RoutineProgressSummary />}
						/>
						<Route
							path="/admin/routine/create"
							element={<CreateRoutine />}
						/>
						<Route
							path="/admin/routine/view-edit/:routineId"
							element={<ViewEditRoutine />}
						/>
					</>
				)}

				{/* User Routes */}
				{role === "consumer" && (
					<>
						<Route path="/user" element={<UserDashboard />} />
						<Route
							path="/user/routine/joined/:routineId"
							element={<JoinedRoutinePage />}
						/>
						<Route
							path="/user/routine/view/:routineId"
							element={<ViewRoutinePage />}
						/>
					</>
				)}

				{/* Shared Route */}

				{/* Fallback Route */}
				<Route
					path="*"
					element={
						<Navigate to={role === "admin" ? "/admin" : "/user"} />
					}
				/>
			</Routes>
		</div>
	);
};

export default App;
