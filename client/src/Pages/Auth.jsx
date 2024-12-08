import React, { useContext, useState } from "react";
import authImage from "../assets/authImage.jpeg";
import { toast } from "react-hot-toast";
import { login, signup } from "../utils/api.js";

import { AppContext } from "../utils/contextAPI.js";
import { Loader } from "lucide-react";

const Auth = () => {
	const { setLogin } = useContext(AppContext);

	const [isLogin, setIsLogin] = useState(true);
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		name: "",
	});

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Form validation
		if (!isLogin) {
			// Signup validation
			if (formData.password !== formData.confirmPassword) {
				toast.error("Passwords don't match");
				return;
			}

			// Additional validation for signup fields
			if (!formData.email || !formData.password || !formData.name) {
				toast.error("Please fill in all fields");
				return;
			}
		} else {
			// Login validation
			if (!formData.email || !formData.password) {
				toast.error("Please enter email and password");
				return;
			}
		}

		// Prepare data based on login/signup mode
		const data = isLogin
			? {
					email: formData.email,
					password: formData.password,
			  }
			: {
					email: formData.email,
					password: formData.password,
					name: formData.name,
					confirmPassword: formData.confirmPassword,
					accountType: isAdmin ? "admin" : "consumer",
			  };

		// Loading toast
		const loadingToast = toast.loading(
			isLogin ? "Logging in..." : "Creating your account..."
		);

		try {
			// Set loading state
			setLoading(true);

			// Perform login or signup
			const result = isLogin ? await login(data) : await signup(data);

			// Handle signup response
			if (!isLogin) {
				// If signup is successful, switch to login mode
				toast.success("Account created successfully! Please log in.");
				setIsLogin(true);
				return;
			}

			setLogin(result.data);
		} catch (error) {
			// Error handling
			const errorMessage =
				error.response?.data?.message || "Something went wrong";
			toast.error(errorMessage);
			console.error("Authentication Error:", error);
		} finally {
			// Reset loading state and dismiss loading toast
			setLoading(false);
			toast.dismiss(loadingToast);

			// Clear form data
			setFormData({
				email: "",
				password: "",
				confirmPassword: "",
				name: "",
			});
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="flex flex-col items-center space-y-4">
					<Loader className="animate-spin h-12 w-12 text-blue-500" />
					<div className="text-lg text-gray-500">
						Loading your routine...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className=" h-screen mt-16 flex flex-col md:flex-row">
			{/* Left Section */}
			<div className="w-full md:w-1/2 p-4 md:p-8 flex flex-col relative">
				<div className="flex flex-col sm:flex-row justify-between items-center mb-8">
					<div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-0">
						RoutinePro
					</div>

					{/* Role Toggle - Moved inside the header for mobile */}
					<div className="flex items-center bg-gray-100 rounded-full p-1">
						<button
							onClick={() => setIsAdmin(false)}
							className={`px-4 py-2 rounded-full transition-all duration-300 ${
								!isAdmin
									? "bg-white shadow-md text-purple-600"
									: "text-gray-600"
							}`}
						>
							User
						</button>
						<button
							onClick={() => setIsAdmin(true)}
							className={`px-4 py-2 rounded-full transition-all duration-300 ${
								isAdmin
									? "bg-white shadow-md text-purple-600"
									: "text-gray-600"
							}`}
						>
							Admin
						</button>
					</div>
				</div>

				<div className="max-w-md w-full mx-auto space-y-8">
					<div>
						<h2 className="text-3xl font-bold text-center md:text-left">
							{isLogin ? "Welcome back!" : "Create an account"}
						</h2>
						<p className="mt-2 text-gray-600 text-center md:text-left">
							{isLogin
								? "Please enter your details to access your account"
								: "Start managing your daily routines effectively"}
						</p>
					</div>

					<div className="flex justify-center">
						<div className="bg-gray-100 p-1 rounded-full">
							<button
								onClick={() => setIsLogin(true)}
								className={`px-6 py-2 rounded-full transition-all duration-300 ${
									isLogin
										? "bg-white shadow-md text-purple-600"
										: "text-gray-600"
								}`}
							>
								Login
							</button>
							<button
								onClick={() => setIsLogin(false)}
								className={`px-6 py-2 rounded-full transition-all duration-300 ${
									!isLogin
										? "bg-white shadow-md text-purple-600"
										: "text-gray-600"
								}`}
							>
								Sign Up
							</button>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="mt-8 space-y-6">
						{!isLogin && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Full Name
								</label>
								<input
									type="text"
									required
									className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
									placeholder="Enter your full name"
									value={formData.name}
									onChange={(e) =>
										setFormData({
											...formData,
											name: e.target.value,
										})
									}
								/>
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Email address
							</label>
							<input
								type="email"
								required
								className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
								placeholder="Enter your email"
								value={formData.email}
								onChange={(e) =>
									setFormData({
										...formData,
										email: e.target.value,
									})
								}
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Password
							</label>
							<input
								type="password"
								required
								className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
								placeholder="Enter your password"
								value={formData.password}
								onChange={(e) =>
									setFormData({
										...formData,
										password: e.target.value,
									})
								}
							/>
						</div>

						{!isLogin && (
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Confirm Password
								</label>
								<input
									type="password"
									required
									className="mt-1 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-300"
									placeholder="Confirm your password"
									value={formData.confirmPassword}
									onChange={(e) =>
										setFormData({
											...formData,
											confirmPassword: e.target.value,
										})
									}
								/>
							</div>
						)}

						<div>
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 relative overflow-hidden"
							>
								{loading ? (
									<div className="w-6 h-6 border-2  border-white border-t-transparent rounded-full animate-spin" />
								) : (
									<span>
										{isLogin ? "Sign in" : "Create account"}
									</span>
								)}
								{loading && (
									<div className="absolute inset-0 bg-white backdrop-blur-sm" />
								)}
							</button>
						</div>
					</form>
				</div>
			</div>

			{/* Right Section */}
			<div className=" hidden md:flex md:w-1/2 bg-purple-50 p-8 flex-col justify-center items-center">
				<img
					src={authImage}
					alt="Routine Management"
					className="w-96 h-auto mb-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
				/>
				<h3 className="text-2xl font-bold text-center mb-4">
					Streamline Your Daily Routines
				</h3>
				<p className="text-gray-600 text-center max-w-md">
					RoutinePro helps you organize and optimize your daily
					activities. Whether you're a busy professional or someone
					looking to build better habits, we've got you covered with
					smart routine management tools.
				</p>
			</div>
		</div>
	);
};

export default Auth;
