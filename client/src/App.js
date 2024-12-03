import { Route, Routes } from "react-router-dom";
import Auth from "./Pages/Auth";
import UserDashboard from "./Pages/UserDashboard";

function App() {
	return (
		<div className="">
			<Routes>
				<Route path={"/auth"} element={<Auth />} />
				<Route path={"/user/dashboard"} element={<UserDashboard />} />
			</Routes>
		</div>
	);
}

export default App;
