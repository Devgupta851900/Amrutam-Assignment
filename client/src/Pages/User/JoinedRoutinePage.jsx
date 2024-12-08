/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState, useRef } from "react";
import {
	getRoutine,
	getRoutineProgress,
	changeCompletionStatus,
} from "../../utils/api";
import { useLocation, useNavigate } from "react-router-dom";
import {
	Clock,
	User,
	ChevronDown,
	ChevronUp,
	Pause,
	Play,
	Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import { AppContext } from "../../utils/contextAPI";

const TaskTimer = ({ duration = 180, onComplete, dayId }) => {
	const [timeLeft, setTimeLeft] = useState(duration);
	const [isRunning, setIsRunning] = useState(false);
	const timerRef = useRef(null);

	useEffect(() => {
		if (isRunning && timeLeft > 0) {
			timerRef.current = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(timerRef.current);
						setIsRunning(false);
						onComplete(dayId);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => clearInterval(timerRef.current);
	}, [isRunning, timeLeft, onComplete, dayId]);

	const toggleTimer = () => setIsRunning(!isRunning);

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${mins}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
	};

	const progressPercentage = () => {
		return ((duration - timeLeft) / duration) * 100;
	};

	return (
		<div className="mt-4 space-y-2">
			<div className="w-full bg-gray-200 rounded-full h-2.5">
				<div
					className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
					style={{ width: `${progressPercentage()}%` }}
				></div>
			</div>
			<div className="flex items-center justify-between">
				<div className="text-sm font-medium text-gray-500">
					{formatTime(timeLeft)}
				</div>
				<button
					onClick={toggleTimer}
					className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition"
				>
					{isRunning ? (
						<Pause className="h-5 w-5 text-blue-600" />
					) : (
						<Play className="h-5 w-5 text-blue-600" />
					)}
				</button>
			</div>
		</div>
	);
};

const JoinedRoutinePage = () => {
	const [routine, setRoutine] = useState(null);
	const [routineProgress, setRoutineProgress] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [openWeeks, setOpenWeeks] = useState({});
	const [openDays, setOpenDays] = useState({});

	const { setUser } = useContext(AppContext);

	const location = useLocation();
	const navigate = useNavigate();
	const routineId = location.pathname.split("/").at(-1);

	const fetchRoutineAndProgress = async () => {
		try {
			setLoading(true);
			const response = await getRoutine(routineId);
			const result = await getRoutineProgress(routineId);

			setRoutineProgress(result.data);
			setUser(response.user);
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
		fetchRoutineAndProgress();
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

	const markAsCompleted = async (weekIndex, dayIndex) => {
		// Store the previous state before making changes
		const previousRoutineProgress = { ...routineProgress };

		try {
			// Call the API to change completion status
			await changeCompletionStatus(
				routineId,
				weekIndex + 1,
				dayIndex + 1
			);

			// Update local state to reflect the change
			const updatedWeekProgress = [...routineProgress.weekProgress];
			updatedWeekProgress[weekIndex].dailyStatus[dayIndex] = {
				[dayIndex]: true,
			};

			// Recalculate week completion percentage
			const completedDays = updatedWeekProgress[
				weekIndex
			].dailyStatus.filter(
				(day) => Object.values(day)[0] === true
			).length;
			updatedWeekProgress[weekIndex].weekCompletionPercentage = (
				(completedDays /
					updatedWeekProgress[weekIndex].dailyStatus.length) *
				100
			).toFixed(2);

			// Update routine progress
			setRoutineProgress((prev) => ({
				...prev,
				weekProgress: updatedWeekProgress,
				overallProgress: {
					...prev.overallProgress,
					completedDays: prev.overallProgress.completedDays + 1,
					progressPercentage: (
						((prev.overallProgress.completedDays + 1) /
							prev.overallProgress.totalDays) *
						100
					).toFixed(2),
				},
			}));

			toast.success("Day marked as completed successfully!");
		} catch (error) {
			// Revert to previous state if an error occurs
			setRoutineProgress(previousRoutineProgress);

			toast.error("Failed to mark day as completed");
			console.error(error);
		}
	};

	const handleDayStatusUpdate = async (weekIndex, dayIndex) => {
		try {
			// Update local state to reflect the change
			const updatedWeekProgress = [...routineProgress.weekProgress];
			updatedWeekProgress[weekIndex].dailyStatus[dayIndex] = {
				[dayIndex]: true,
			};

			// Recalculate week completion percentage
			const completedDays = updatedWeekProgress[
				weekIndex
			].dailyStatus.filter(
				(day) => Object.values(day)[0] === true
			).length;
			updatedWeekProgress[weekIndex].weekCompletionPercentage = (
				(completedDays /
					updatedWeekProgress[weekIndex].dailyStatus.length) *
				100
			).toFixed(2);

			// Update routine progress
			setRoutineProgress((prev) => ({
				...prev,
				weekProgress: updatedWeekProgress,
				overallProgress: {
					...prev.overallProgress,
					completedDays: prev.overallProgress.completedDays + 1,
					progressPercentage: (
						((prev.overallProgress.completedDays + 1) /
							prev.overallProgress.totalDays) *
						100
					).toFixed(2),
				},
			}));

			toast.success("Day status updated successfully!");
		} catch (error) {
			toast.error("Failed to update day status");
			console.error(error);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader className="animate-spin h-12 w-12 text-blue-500" />
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
		<div className="container mx-auto px-4 py-20 max-w-7xl">
			<button
				onClick={() => navigate(-1)}
				className="mb-4 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md"
			>
				Back
			</button>

			{/* Overall Progress Display */}
			<div className="mb-6 bg-gray-100 p-3 sm:p-4 rounded-lg">
				<h2 className="text-lg sm:text-xl font-bold mb-2">
					Overall Progress
				</h2>
				<div className="w-full bg-gray-300 rounded-full h-3 sm:h-4">
					<div
						className="bg-blue-600 h-3 sm:h-4 rounded-full"
						style={{
							width: `${routineProgress.overallProgress.progressPercentage}%`,
						}}
					></div>
				</div>
				<p className="mt-2 text-sm sm:text-base text-gray-600">
					{routineProgress.overallProgress.completedDays} /{" "}
					{routineProgress.overallProgress.totalDays} Days Completed
				</p>
			</div>

			{routine && (
				<div className="bg-white shadow-xl rounded-xl overflow-hidden">
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
					<div className="p-3 sm:p-6">
						{routine.data.weeks.map((week, weekIndex) => {
							const weekProgress =
								routineProgress.weekProgress[weekIndex];
							return (
								<div
									key={weekIndex}
									className="mb-4 sm:mb-6 border rounded-lg shadow-md"
								>
									{/* Week Header */}
									<div
										className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-gradient-to-r from-blue-100 to-purple-100 cursor-pointer gap-3 sm:gap-0"
										onClick={() => toggleWeek(weekIndex)}
									>
										<h2 className="text-base sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
											<img
												src={week.weekImage}
												alt={`Week ${weekIndex + 1}`}
												className="h-12 sm:h-16 aspect-square object-cover rounded-full"
											/>
											<span className="flex-shrink">
												Week {weekIndex + 1}:{" "}
												{week.weekTitle}
											</span>
										</h2>
										<div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
											<div className="border border-gray-200 bg-gray-100 px-3 py-2 sm:px-4 rounded-lg flex-grow sm:flex-grow-0">
												<h2 className="text-xs sm:text-sm font-bold mb-1 sm:mb-2">
													Weekly Progress{" "}
													<span className="text-xs text-gray-600 ml-1 sm:ml-2">
														(
														{
															weekProgress.weekCompletionPercentage
														}
														% Complete)
													</span>
												</h2>
												<div className="w-full bg-gray-300 rounded-full h-1">
													<div
														className="bg-blue-600 h-1 rounded-full"
														style={{
															width: `${weekProgress.weekCompletionPercentage}%`,
														}}
													></div>
												</div>
												<p className="text-xs text-gray-600 mt-1">
													{weekProgress.completedDays}{" "}
													Days Completed
												</p>
											</div>
											{openWeeks[weekIndex] ? (
												<ChevronUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
											) : (
												<ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
											)}
										</div>
									</div>

									{/* Week Content */}
									<div
										className={`transition-all duration-300 ease-in-out overflow-hidden ${
											openWeeks[weekIndex]
												? "max-h-fit"
												: "max-h-0"
										}`}
									>
										<div className="p-3 sm:p-4 bg-white space-y-3 sm:space-y-4">
											<p className="text-sm sm:text-base text-gray-600">
												{week.weekDescription}
											</p>
											{week.days.map((day, dayIndex) => {
												const isDayCompleted =
													weekProgress.dailyStatus[
														dayIndex
													][dayIndex];
												return (
													<div
														key={dayIndex}
														className={`border rounded-lg shadow-sm ${
															isDayCompleted
																? "opacity-50"
																: ""
														}`}
													>
														{/* Day Header */}
														<div
															className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b cursor-pointer hover:bg-gray-100 transition-colors duration-200"
															onClick={() =>
																toggleDay(
																	weekIndex,
																	dayIndex
																)
															}
														>
															<div className="text-sm sm:text-base">
																<span className="font-medium text-gray-800">
																	Day{" "}
																	{dayIndex +
																		1}
																</span>
																<span className="text-gray-600">
																	:{" "}
																	{
																		day.dayTitle
																	}
																</span>
																{isDayCompleted && (
																	<span className="ml-2 text-emerald-600 text-xs sm:text-sm font-medium">
																		Completed
																	</span>
																)}
															</div>
															{openDays[
																`${weekIndex}-${dayIndex}`
															] ? (
																<ChevronUp className="h-5 w-5 text-gray-400" />
															) : (
																<ChevronDown className="h-5 w-5 text-gray-400" />
															)}
														</div>

														{/* Day Content */}
														<div
															className={`transition-all duration-300 ease-in-out overflow-hidden ${
																openDays[
																	`${weekIndex}-${dayIndex}`
																]
																	? "max-h-screen"
																	: "max-h-0"
															}`}
														>
															<div className="p-4 space-y-4">
																<div className="space-y-3">
																	<h4 className="font-medium text-gray-800 text-sm sm:text-base">
																		Task
																	</h4>
																	<p className="text-sm sm:text-base text-gray-700">
																		{
																			day
																				.task
																				.taskName
																		}
																	</p>
																	<p className="text-xs sm:text-sm text-gray-500">
																		{
																			day
																				.task
																				.taskDescription
																		}
																	</p>
																	<p className="text-xs sm:text-sm text-gray-500">
																		Duration:{" "}
																		{
																			day
																				.task
																				.taskDuration
																		}{" "}
																		Minutes
																	</p>
																</div>

																<div className="space-y-4">
																	<button
																		onClick={() =>
																			markAsCompleted(
																				weekIndex,
																				dayIndex
																			)
																		}
																		disabled={
																			isDayCompleted
																		}
																		className={` bg-black py-2 px-4 text-sm sm:text-base text-white rounded-md shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow ${
																			isDayCompleted
																				? "opacity-50 cursor-not-allowed"
																				: ""
																		} `}
																	>
																		{isDayCompleted
																			? "Completed"
																			: "Mark as Completed"}
																	</button>

																	{!isDayCompleted && (
																		<TaskTimer
																			duration={
																				day
																					.task
																					.taskDuration *
																				60
																			}
																			onComplete={() =>
																				handleDayStatusUpdate(
																					weekIndex,
																					dayIndex
																				)
																			}
																			dayId={`${weekIndex}-${dayIndex}`}
																		/>
																	)}
																</div>

																<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 p-3 rounded-lg">
																	<img
																		src={
																			day
																				.task
																				.productImage ||
																			"https://rukminim2.flixcart.com/image/612/612/xif0q/hair-oil/i/n/c/-original-imagt8ekcf22wvxa.jpeg?q=70"
																		}
																		alt="Product"
																		className="h-20 w-20 object-contain rounded-md shadow-sm bg-white p-2"
																	/>
																	<a
																		href={
																			day
																				.task
																				.productLink
																		}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors duration-200"
																	>
																		{
																			day
																				.task
																				.productName
																		}
																	</a>
																</div>
															</div>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

export default JoinedRoutinePage;
