/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { getRoutine, joinRoutine } from "../../utils/api";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, User, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { AppContext } from "../../utils/contextAPI";

const ViewRoutinePage = () => {
	const [routine, setRoutine] = useState(null);
	const [error, setError] = useState(null);
	const [openWeeks, setOpenWeeks] = useState({});
	const [openDays, setOpenDays] = useState({});

	const { fetchAllRoutines, setUser, loading, setLoading } =
		useContext(AppContext);

	const location = useLocation();
	const routineId = location.pathname.split("/").at(-1);

	const navigate = useNavigate();

	const fetchRoutine = async () => {
		try {
			setLoading(true);
			const response = await getRoutine(routineId);
			setRoutine(response.data.routine);
			setError(null);
		} catch (error) {
			console.error(error);
			setError("Failed to load routine. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRoutine();
	}, [location.pathname]);

	const toggleWeek = (index) => {
		setOpenWeeks((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	const toggleDay = (weekIndex, dayIndex) => {
		setOpenDays((prev) => ({
			...prev,
			[`${weekIndex}-${dayIndex}`]: !prev[`${weekIndex}-${dayIndex}`],
		}));
	};

	const handleJoin = async () => {
		try {
			// Make the API request to join the routine
			const result = await joinRoutine(routine._id);

			// Update `user` in context and localStorage
			const updatedUser = result.user;

			setUser(updatedUser);
			localStorage.setItem("user", JSON.stringify(updatedUser));

			// Refetch user routines and suggested routines
			await fetchAllRoutines(updatedUser);

			// Navigate to the joined routine's page
			navigate(`/user/routine/joined/${routine._id}`);

			toast.success("You have successfully joined the routine!");
		} catch (error) {
			console.error(
				"An error occurred while joining the routine:",
				error
			);
			toast.error(
				"An unexpected error occurred. Please try again later."
			);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-pulse text-2xl text-gray-500">
					Loading your routine...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg max-w-md mx-auto mt-10 text-center">
				{error}
			</div>
		);
	}

	return (
		<div className="container mx-auto pt-24 px-4 py-8 max-w-7xl">
			{/* Back Button */}
			<button
				onClick={() => navigate(-1)}
				className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md"
			>
				Back
			</button>

			{routine && (
				<div className="bg-white shadow-xl rounded-xl overflow-hidden">
					{/* Header Section */}
					<div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white flex justify-between items-center">
						<div>
							<img
								alt="routineImage"
								src={routine.image}
								className="object-contain h-[400px] aspect-auto "
							/>
						</div>
						{/* Overlay */}
						<div className="absolute inset-0 bg-black opacity-50"></div>

						{/* Content */}
						<div className="relative flex justify-between items-center w-full p-8">
							<div>
								<h1 className="text-4xl font-extrabold mb-2">
									{routine.title}
								</h1>
								<div className="flex items-center space-x-4 mt-3">
									<div className="flex items-center space-x-2">
										<User className="h-5 w-5" />
										<span>{routine.creator.name}</span>
									</div>
									<div className="flex items-center space-x-2">
										<Clock className="h-5 w-5" />
										<span>{routine.duration}</span>
									</div>
								</div>
							</div>
							<button
								onClick={handleJoin}
								className="px-6 py-2 bg-purple-700 hover:bg-purple-800 transition text-white font-bold rounded-lg shadow-lg"
							>
								Join Routine
							</button>
						</div>
					</div>

					{/* Weeks Breakdown */}
					<div className="p-6">
						{routine?.data?.weeks?.map((week, index) => (
							<div
								key={index}
								className="mb-6 border rounded-lg shadow-md"
							>
								{/* Week Header */}
								<div
									className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-100 to-purple-100 cursor-pointer"
									onClick={() => toggleWeek(index)}
								>
									<h2 className="text-xl font-bold flex items-center space-x-3">
										<img
											src={week.weekImage}
											alt={`Week ${index + 1}`}
											className="h-10 w-10 object-cover rounded-full"
										/>
										<span>
											Week {index + 1}: {week.weekTitle}
										</span>
									</h2>
									{openWeeks[index] ? (
										<ChevronUp className="h-6 w-6 text-blue-600" />
									) : (
										<ChevronDown className="h-6 w-6 text-blue-600" />
									)}
								</div>

								{/* Smooth Dropdown Content */}
								<div
									className={`transition-all duration-300 ease-in-out overflow-hidden ${
										openWeeks[index]
											? "max-h-screen"
											: "max-h-0"
									}`}
								>
									<div className="p-4 bg-white space-y-4">
										<p className="text-gray-600">
											{week.weekDescription}
										</p>
										{week.days.map((day, dayIndex) => (
											<div
												key={dayIndex}
												className="border rounded-lg"
											>
												{/* Day Header */}
												<div
													className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer"
													onClick={() =>
														toggleDay(
															index,
															dayIndex
														)
													}
												>
													<div>
														<span className="font-semibold">
															Day {dayIndex + 1}
														</span>
														: {day.dayTitle}
													</div>
													{openDays[
														`${index}-${dayIndex}`
													] ? (
														<ChevronUp className="h-5 w-5 text-gray-500" />
													) : (
														<ChevronDown className="h-5 w-5 text-gray-500" />
													)}
												</div>

												{/* Day Content */}
												<div
													className={`transition-all duration-300 ease-in-out overflow-hidden ${
														openDays[
															`${index}-${dayIndex}`
														]
															? "max-h-screen"
															: "max-h-0"
													}`}
												>
													<div className="p-4 space-y-3">
														<div className="space-y-2">
															<h4 className="font-medium text-gray-700">
																Task
															</h4>
															<p>
																{
																	day.task
																		.taskName
																}
															</p>
															<p className="text-sm text-gray-500">
																{
																	day.task
																		.taskDescription
																}
															</p>
															<p className="text-sm text-gray-500">
																Duration:{" "}
																{
																	day.task
																		.taskDuration
																}
															</p>
														</div>
														<div className="flex items-center space-x-4">
															<img
																src={
																	"https://rukminim2.flixcart.com/image/612/612/xif0q/hair-oil/i/n/c/-original-imagt8ekcf22wvxa.jpeg?q=70"
																}
																alt="Product"
																className="h-20 w-20 object-contain rounded shadow-sm"
															/>
															<a
																href={
																	day.task
																		.productLink
																}
																target="_blank"
																rel="noopener noreferrer"
																className="text-blue-600 hover:underline font-semibold"
															>
																{
																	day.task
																		.productName
																}
															</a>
														</div>
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
			)}
		</div>
	);
};

export default ViewRoutinePage;
