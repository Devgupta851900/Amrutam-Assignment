import { useContext } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { AppContext } from "../utils/contextAPI";
import { NavLink } from "react-router-dom";

const Navbar = () => {
	const { token, logout, role } = useContext(AppContext);

	const user = JSON.parse(localStorage.getItem("user"));

	return (
		<div className="bg-blue-600 shadow-md p-4 flex justify-between items-center text-white fixed w-full top-0 z-10">
			{/* Left - User Information */}
			{token && (
				<div className="flex items-center gap-4">
					<div className="flex flex-col">
						<span className="font-semibold">{user?.name}</span>
						<span className="text-sm text-gray-200">
							{user?.email}
						</span>
					</div>
				</div>
			)}

			{/* Center - Brand Name */}
			<NavLink to={role === "admin" ? "/admin" : "/user"}>
				<h1 className="text-xl mx-auto font-bold tracking-wide">
					RoutinePro
				</h1>
			</NavLink>

			{/* Right - Logout Icon */}
			{token && (
				<AiOutlineLogout
					className="text-2xl cursor-pointer hover:text-gray-200"
					onClick={() => {
						logout();
					}}
				/>
			)}
		</div>
	);
};

export default Navbar;
