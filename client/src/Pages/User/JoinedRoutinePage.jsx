/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState, useRef } from "react";
import {
	getRoutine,
	getRoutineProgress,
	changeCompletionStatus,
} from "../../utils/api";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, User, ChevronDown, ChevronUp, Pause, Play } from "lucide-react";
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
			{/* Overall Progress Display */}
			<div className="mb-6 bg-gray-100 p-4 rounded-lg">
				<h2 className="text-xl font-bold mb-2">Overall Progress</h2>
				<div className="w-full bg-gray-300 rounded-full h-4">
					<div
						className="bg-blue-600 h-4 rounded-full"
						style={{
							width: `${routineProgress.overallProgress.progressPercentage}%`,
						}}
					></div>
				</div>
				<p className="mt-2 text-gray-600">
					{routineProgress.overallProgress.completedDays} /{" "}
					{routineProgress.overallProgress.totalDays} Days Completed
				</p>
			</div>

			<button
				onClick={() => navigate(-1)}
				className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md"
			>
				Back
			</button>

			{routine && (
				<div className="bg-white shadow-xl rounded-xl overflow-hidden">
					{/* Header Section (remains the same) */}
					<div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white flex justify-between items-center">
						<div>
							<img
								alt="routineImage"
								src={routine.image}
								className="object-contain h-[400px] aspect-auto "
							/>
						</div>
						{/* Header content remains the same */}
						<div className="absolute inset-0 bg-black opacity-50"></div>
						<div className="relative flex justify-between items-center w-full p-8">
							<div>
								<h1 className="text-4xl font-extrabold mb-2">
									{routine.title}
								</h1>
								<div className="text-xl font-semibold">
									{routine.description}
								</div>
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
						</div>
					</div>

					{/* Weeks Breakdown */}
					<div className="p-6">
						{routine.data.weeks.map((week, weekIndex) => {
							const weekProgress =
								routineProgress.weekProgress[weekIndex];
							return (
								<div
									key={weekIndex}
									className="mb-6 border rounded-lg shadow-md"
								>
									{/* Week Header */}
									<div
										className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-100 to-purple-100 cursor-pointer"
										onClick={() => toggleWeek(weekIndex)}
									>
										<h2 className="text-xl font-bold flex items-center space-x-3">
											<img
												src={week.weekImage}
												alt={`Week ${weekIndex + 1}`}
												className="h-10 w-10 object-cover rounded-full"
											/>
											<span>
												Week {weekIndex + 1}:{" "}
												{week.weekTitle}
											</span>
											<span className="text-sm text-gray-600 ml-2">
												(
												{
													weekProgress.weekCompletionPercentage
												}
												% Complete)
											</span>
										</h2>
										{openWeeks[weekIndex] ? (
											<ChevronUp className="h-6 w-6 text-blue-600" />
										) : (
											<ChevronDown className="h-6 w-6 text-blue-600" />
										)}
									</div>

									{/* Week Content */}
									<div
										className={`transition-all duration-300 ease-in-out overflow-hidden ${
											openWeeks[weekIndex]
												? "max-h-screen"
												: "max-h-0"
										}`}
									>
										<div className="p-4 bg-white space-y-4">
											<p className="text-gray-600">
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
														className={`border rounded-lg ${
															isDayCompleted
																? "opacity-50"
																: ""
														}`}
													>
														{/* Day Header */}
														<div
															className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer"
															onClick={() =>
																toggleDay(
																	weekIndex,
																	dayIndex
																)
															}
														>
															<div>
																<span className="font-semibold">
																	Day{" "}
																	{dayIndex +
																		1}
																</span>
																: {day.dayTitle}
																{isDayCompleted && (
																	<span className="ml-2 text-green-600 text-sm">
																		Completed
																	</span>
																)}
															</div>
															{openDays[
																`${weekIndex}-${dayIndex}`
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
																	`${weekIndex}-${dayIndex}`
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
																			day
																				.task
																				.taskName
																		}
																	</p>
																	<p className="text-sm text-gray-500">
																		{
																			day
																				.task
																				.taskDescription
																		}
																	</p>
																	<p className="text-sm text-gray-500">
																		Duration:{" "}
																		{
																			day
																				.task
																				.taskDuration
																		}
																	</p>
																</div>
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
																	className={`bg-black py-2 px-4 text-white rounded-md ${
																		isDayCompleted
																			? "opacity-50 cursor-not-allowed"
																			: ""
																	}`}
																>
																	{isDayCompleted
																		? "Completed"
																		: "Mark as Completed"}
																</button>
																{!isDayCompleted && (
																	<TaskTimer
																		duration={
																			180
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
																<div className="flex items-center space-x-4">
																	<img
																		src={
																			day
																				.task
																				.productImage ||
																			"https://rukminim2.flixcart.com/image/612/612/xif0q/hair-oil/i/n/c/-original-imagt8ekcf22wvxa.jpeg?q=70"
																		}
																		alt="Product"
																		className="h-20 w-20 object-contain rounded shadow-sm"
																	/>
																	<a
																		href={
																			day
																				.task
																				.productLink
																		}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="text-blue-600 hover:underline font-semibold"
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
