import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getRoutineUserProgress } from "../../utils/api";

const RoutineProgressSummary = () => {
	const location = useLocation();
	const [routineData, setRoutineData] = useState(null);
	const [loading, setLoading] = useState(true);

	// Extract routineId from location.pathname
	const routineId = location.pathname.split("/").pop();

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

	if (loading) {
		return <p className="text-center mt-10">Loading...</p>;
	}

	if (!routineData) {
		return <p className="text-center mt-10">No data available.</p>;
	}

	return (
		<div className="container mx-auto pt-16 px-4 md:px-8 lg:px-16">
			<div className="flex flex-col items-center mb-8">
				<img
					src={
						routineData.routineImage ||
						"https://via.placeholder.com/300"
					}
					alt={routineData.routineTitle}
					className="w-48 h-48 object-cover rounded-lg mb-4"
				/>
				<h1 className="text-3xl font-bold text-gray-800">
					{routineData.routineTitle}
				</h1>
				<p className="text-gray-600 mt-2">
					{routineData.routineDescription}
				</p>
				<p className="text-indigo-500 font-medium mt-2">
					Duration: {routineData.routineDuration} weeks
				</p>
			</div>

			<h2 className="text-2xl font-semibold text-gray-700 mb-6">
				User Progress
			</h2>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{routineData.usersProgress.map((user) => (
					<div
						key={user.userId}
						className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
					>
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							{user.userName}
						</h3>
						<p className="text-sm text-gray-500">
							{user.userEmail}
						</p>
						<div className="mt-4">
							<p className="text-gray-600 text-sm font-medium mb-2">
								Overall Progress:{" "}
								<span className="text-indigo-500">
									{user.overallProgressPercentage}%
								</span>
							</p>
							<div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
								<div
									className="absolute top-0 left-0 h-full bg-blue-500"
									style={{
										width: `${user.overallProgressPercentage}%`,
									}}
								></div>
							</div>
						</div>
						<div className="mt-6">
							<h4 className="text-lg font-semibold text-gray-700 mb-2">
								Weekly Progress:
							</h4>
							{user.weeklyProgress.map((week) => (
								<div key={week.weekNumber} className="mb-4">
									<p className="text-sm text-gray-500 mb-1">
										Week {week.weekNumber}:{" "}
										<span className="text-gray-800">
											{week.completedDays}/
											{week.totalDays} days completed
										</span>
									</p>
									<div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
										<div
											className="absolute top-0 left-0 h-full bg-blue-500"
											style={{
												width: `${week.weekProgressPercentage}%`,
											}}
										></div>
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default RoutineProgressSummary;
