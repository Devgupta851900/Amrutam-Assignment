import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoutineUserProgress } from "../../utils/api";

const RoutineProgressSummary = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [routineData, setRoutineData] = useState(null);
	const [loading, setLoading] = useState(true);

	// Extract routineId from location.pathname
	const routineId = location.pathname.split("/").pop();

	const [isWeeklyProgressOpen, setIsWeeklyProgressOpen] = useState(false);

	// Toggle Weekly Progress dropdown
	const toggleWeeklyProgress = () => {
		setIsWeeklyProgressOpen(!isWeeklyProgressOpen);
	};
	useEffect(() => {
		const fetchRoutineProgress = async () => {
			try {
				setLoading(true);
				const response = await getRoutineUserProgress(routineId);
				setRoutineData(response.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching routine progress:", error);
				setLoading(false);
			}
		};

		fetchRoutineProgress();
	}, [routineId]);

	if (!routineData) {
		return <p className="text-center mt-10">No data available.</p>;
	}

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-pulse text-2xl text-gray-500">
					Loading your routine...
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
			<div className="container mx-auto pt-20 px-4 md:px-8 lg:px-16">
				{/* Back Button */}
				<button
					onClick={() => navigate(-1)}
					className="mb-4 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md"
				>
					Back
				</button>

				{/* Header Section */}
				<div className="flex flex-col items-center mb-12">
					<div className="relative w-48 h-48 mb-6">
						<div className="absolute inset-0 bg-indigo-100 rounded-2xl rotate-3 transform transition-transform duration-300 group-hover:rotate-6" />
						<img
							src={
								routineData.routineImage ||
								"/api/placeholder/300/300"
							}
							alt={routineData.routineTitle}
							className="relative w-full h-full object-fill rounded-2xl shadow-lg 
                       transform transition-all duration-300 hover:scale-105"
						/>
					</div>

					<h1
						className="text-4xl font-bold text-gray-800 text-center mb-4 
                       bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500"
					>
						{routineData.routineTitle}
					</h1>

					<p className="text-gray-600 text-center max-w-2xl mb-4 leading-relaxed">
						{routineData.routineDescription}
					</p>

					<div
						className="inline-flex items-center px-6 py-2 bg-indigo-50 text-indigo-600 
                        rounded-full font-medium transform transition-all duration-300 
                        hover:shadow-md hover:-translate-y-0.5"
					>
						Duration: {routineData.routineDuration} weeks
					</div>
				</div>

				{/* User Progress Section */}
				<h2
					className="text-3xl font-bold text-gray-800 mb-8 
                     bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900"
				>
					User Progress
				</h2>

				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{routineData.usersProgress.map((user) => (
						<div
							key={user.userId}
							className="group bg-white backdrop-blur-sm bg-opacity-90 rounded-2xl p-6 
                       shadow-sm hover:shadow-xl transition-all duration-300 
                       transform hover:-translate-y-1"
						>
							{/* User Header */}
							<h3
								className="text-xl font-bold text-gray-800 mb-1 
                          group-hover:text-indigo-600 transition-colors duration-300"
							>
								{user.userName}
							</h3>

							<p className="text-sm text-gray-500 mb-6">
								{user.userEmail}
							</p>

							{/* Overall Progress */}
							<div className="mb-6">
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm font-medium text-gray-600">
										Overall Progress
									</span>
									<span className="text-sm font-bold text-indigo-600">
										{user.overallProgressPercentage}%
									</span>
								</div>

								<div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
									<div
										className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 
                             transition-all duration-700 ease-out"
										style={{
											width: `${user.overallProgressPercentage}%`,
										}}
									>
										<div className="absolute inset-0 bg-white/20 animate-pulse" />
									</div>
								</div>
							</div>

							{/* Weekly Progress Section */}
							<div className="space-y-4">
								<button
									onClick={toggleWeeklyProgress}
									className="w-full flex items-center justify-between text-gray-700 
                           hover:text-indigo-600 transition-colors duration-300"
								>
									<span className="text-lg font-semibold">
										Weekly Progress
									</span>
									<span
										className={`transform transition-transform duration-300 
                                ${isWeeklyProgressOpen ? "rotate-180" : ""}`}
									>
										▼
									</span>
								</button>

								<div
									className={`space-y-4 transition-all duration-500 ease-in-out 
                              ${
									isWeeklyProgressOpen
										? "opacity-100"
										: "opacity-0 h-0 overflow-hidden"
								}`}
								>
									{user.weeklyProgress.map((week) => (
										<div
											key={week.weekNumber}
											className="space-y-2"
										>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">
													Week {week.weekNumber}
												</span>
												<span className="text-sm font-medium text-gray-700">
													{week.completedDays}/
													{week.totalDays} days
												</span>
											</div>

											<div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
												<div
													className="absolute top-0 left-0 h-full bg-blue-400 
                                   transition-all duration-500 ease-out"
													style={{
														width: `${week.weekProgressPercentage}%`,
													}}
												>
													<div className="absolute inset-0 bg-white/20 animate-pulse" />
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default RoutineProgressSummary;
