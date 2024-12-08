import { useContext } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { AppContext } from "../utils/contextAPI";
import { NavLink } from "react-router-dom";

const Navbar = () => {
	const { token, logout, role } = useContext(AppContext);

	// const user = JSON.parse(localStorage.getItem("user"));

	return (
		<nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg p-4 fixed w-full top-0 z-50 h-16 flex justify-center ">
			<div className="max-w-7xl w-full mx-auto flex justify-between items-center">
				{/* Center - Brand Name with Enhanced Design */}
				<NavLink
					to={role === "admin" ? "/admin" : "/user"}
					className="group"
				>
					<h1 className="text-2xl font-bold tracking-wider  text-white relative px-4 py-1">
						RoutinePro
						{/* Animated Underline */}
						<div className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/50 group-hover:w-full transition-all duration-300" />
					</h1>
				</NavLink>

				{/* Right - Enhanced Logout Button */}
				{token && (
					<div onClick={logout} className="relative group">
						<button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition-all duration-300">
							<AiOutlineLogout className="text-xl text-white" />
							<span className="text-white text-sm font-medium hidden md:inline">
								Logout
							</span>
						</button>

						{/* Hover Effect Circle */}
						<div className="absolute inset-0 rounded-full bg-white/5 scale-0 group-hover:scale-100 transition-transform duration-300" />
					</div>
				)}
			</div>

			{/* Bottom Border Line */}
			<div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
		</nav>
	);
};

export default Navbar;
