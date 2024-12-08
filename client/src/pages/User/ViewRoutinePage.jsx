/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { getRoutine, joinRoutine } from "../../utils/api";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, User, ChevronDown, ChevronUp, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { AppContext } from "../../utils/contextAPI";

const ViewRoutinePage = () => {
	const [routine, setRoutine] = useState(null);
	const [error, setError] = useState(null);
	const [openWeeks, setOpenWeeks] = useState({});
	const [openDays, setOpenDays] = useState({});

	const { initializeApp, loading, setLoading } = useContext(AppContext);

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
			await joinRoutine(routine._id);

			// Refetch user routines and suggested routines
			await initializeApp();

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
				<div className="flex flex-col items-center space-y-4">
					<Loader className="animate-spin h-12 w-12 text-blue-500" />
					<div className="text-lg text-gray-500">
						Loading your routine...
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-lg max-w-md mx-auto mt-10 text-center">
				<div className="flex flex-col items-center">
					<div className="text-2xl font-bold mb-2">Error</div>
					<p>{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto min-h-screen pt-16 ">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Back Button */}
				<div className="flex justify-between ">
					<button
						onClick={() => navigate("/user")}
						className="mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md transition rounded-lg shadow-sm text-sm sm:text-base"
					>
						Home
					</button>
					<button
						onClick={handleJoin}
						className="mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 text-white  hover:bg-gray-200 hover:shadow-md transition rounded-lg shadow-sm text-sm sm:text-base"
					>
						Join
					</button>
				</div>

				{/* Routine Section */}
				{routine && (
					<div className="bg-white shadow-lg rounded-xl overflow-hidden">
						{/* Header Section */}
						<div className="relative bg-gradient-to-r h-[250px] sm:h-[300px] md:h-[400px] from-blue-500 to-purple-600 text-white rounded-lg shadow-lg overflow-hidden">
							<div className="absolute inset-0">
								<img
									alt="routineImage"
									src={routine.image}
									className="object-cover h-full w-full blur-sm"
								/>
								<div className="absolute inset-0 bg-black bg-opacity-40"></div>
							</div>
							{/* Content */}
							<div className="relative w-[95%] bg-white bg-opacity-40 my-4 mx-auto rounded-lg text-gray-800 p-4 sm:p-6 md:p-8">
								<div className="text-center md:text-left">
									<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-4 text-shadow-lg">
										{routine.title}
									</h1>
									<p className="text-base sm:text-lg font-medium text-gray-600">
										{routine.description}
									</p>
									<div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 sm:gap-6 mt-4">
										<div className="flex items-center gap-2">
											<User className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" />
											<span className="capitalize font-bold text-sm sm:text-base">
												{routine.creator.name}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-300" />
											<span className="font-bold text-sm sm:text-base">
												{routine.duration} Weeks
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Weeks Breakdown */}
						<div className="p-4 sm:p-6 md:p-8 bg-gray-50">
							{routine?.data?.weeks?.map((week, index) => (
								<div
									key={index}
									className="mb-6 bg-white shadow-md rounded-lg"
								>
									{/* Week Header */}
									<div
										className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gradient-to-r from-blue-100 to-purple-100 cursor-pointer gap-4 sm:gap-0"
										onClick={() => toggleWeek(index)}
									>
										<h2 className="text-lg sm:text-xl font-bold flex flex-col sm:flex-row items-start sm:items-center gap-4">
											<img
												src={week.weekImage}
												alt={`Week ${index + 1}`}
												className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-md"
											/>
											<span>
												Week {index + 1}:{" "}
												{week.weekTitle}
											</span>
										</h2>
										{openWeeks[index] ? (
											<ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
										) : (
											<ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
										)}
									</div>

									{/* Week Content */}
									<div
										className={`transition-all duration-300 ease-in-out overflow-hidden ${
											openWeeks[index]
												? "max-h-fit"
												: "max-h-0"
										}`}
									>
										<div className="p-4 bg-gray-50">
											<p className="text-gray-600 text-sm sm:text-base">
												{week.weekDescription}
											</p>
											{/* Days */}
											{week.days.map((day, dayIndex) => (
												<div
													key={dayIndex}
													className="mt-4 bg-white rounded-lg shadow"
												>
													{/* Day Header */}
													<div
														className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b cursor-pointer hover:bg-gray-100 transition-colors duration-200"
														onClick={() =>
															toggleDay(
																index,
																dayIndex
															)
														}
													>
														<span className="font-semibold text-sm sm:text-base">
															Day {dayIndex + 1}:{" "}
															{day.dayTitle}
														</span>
														{openDays[
															`${index}-${dayIndex}`
														] ? (
															<ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
														) : (
															<ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
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
														<div className="p-4 space-y-4">
															<h4 className="font-medium text-gray-800 text-sm sm:text-base">
																Task
															</h4>
															<p className="text-sm sm:text-base text-gray-700">
																{
																	day.task
																		.taskName
																}
															</p>
															<p className="text-sm sm:text-base text-gray-700">
																{
																	day.task
																		.taskDescription
																}
															</p>
															<p className="text-sm sm:text-base text-gray-700">
																Duration:{" "}
																{
																	day.task
																		.taskDuration
																}{" "}
																Minutes
															</p>
															<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 p-3 rounded-lg">
																<img
																	src={
																		day.task
																			.productImage ||
																		"https://rukminim2.flixcart.com/image/612/612/xif0q/hair-oil/i/n/c/-original-imagt8ekcf22wvxa.jpeg?q=70"
																	}
																	alt="Product"
																	className="h-20 w-20 object-contain rounded-md shadow-sm bg-white p-2"
																/>
																<a
																	href={
																		day.task
																			.productLink
																	}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors duration-200"
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
		</div>
	);
};

export default ViewRoutinePage;
