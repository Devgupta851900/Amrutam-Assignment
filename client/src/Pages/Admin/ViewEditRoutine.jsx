/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, User, Clock, Loader } from "lucide-react";
import UnifiedModal from "../../components/UnifiedRoutineModal"; // Reusable Modal for Add/Edit actions
import { useLocation, useNavigate } from "react-router-dom";
import {
	getRoutine,
	addWeekToRoutine,
	deleteWeekFromRoutine,
} from "../../utils/api";

const ViewEditRoutine = () => {
	const navigate = useNavigate();
	const [routine, setRoutine] = useState();
	const [openWeeks, setOpenWeeks] = useState({});
	const [openDays, setOpenDays] = useState({});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState("");
	const [modalData, setModalData] = useState(null);
	const [loading, setLoading] = useState(false);

	const location = useLocation();
	const routineId = location.pathname.split("/").at(-1);

	const fetchRoutine = async () => {
		try {
			setLoading(true);
			const response = await getRoutine(routineId);
			setRoutine(response.data.routine);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRoutine();
	}, []);

	// Toggle week collapse
	const toggleWeek = (weekIndex) => {
		setOpenWeeks((prev) => ({
			...prev,
			[weekIndex]: !prev[weekIndex],
		}));
	};

	// Toggle day collapse
	const toggleDay = (weekIndex, dayIndex) => {
		const key = `${weekIndex}-${dayIndex}`;
		setOpenDays((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	// Open modal for editing or adding
	const handleOpenModal = (mode, data = null) => {
		setModalMode(mode);
		setModalData(data);
		setIsModalOpen(true);
	};

	const addWeek = async () => {
		const data = {
			weekTitle: "",
			weekDescription: "",
			weekImage: null,
			weekImageUrl: null,
			days: Array.from({ length: 7 }, (_, index) => ({
				dayTitle: `Day ${index + 1} Title`,
				dayDescription: `Day ${index + 1} Description`,
				task: {
					taskName: "",
					taskDescription: "",
					taskDuration: "",
					productName: "",
					productImage: "",
					productLink: "",
				},
			})),
		};

		await addWeekToRoutine(routineId, data);

		await fetchRoutine();
	};

	const handleDelete = async (routineId, weekNumber) => {
		await deleteWeekFromRoutine(routineId, weekNumber);
		await fetchRoutine();
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

	return (
		<div className="container mx-auto pt-24 px-4 py-8 max-w-7xl">
			{/* Back Button */}
			<button
				onClick={() => navigate(-1)}
				className="mb-4 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md"
			>
				Back
			</button>

			{/* Routine Header */}
			{routine && (
				<div className="bg-white shadow-xl rounded-xl overflow-hidden">
					{/* Header Section */}
					<div className="relative bg-gradient-to-r h-[400px] from-blue-500 to-purple-600 text-white rounded-lg shadow-lg overflow-hidden">
						<div className="absolute inset-0">
							<img
								alt="routineImage"
								src={routine.image}
								className="object-cover h-full w-full blur-sm"
							/>
							<div className="absolute inset-0 bg-black bg-opacity-40"></div>
						</div>
						{/* Content */}
						<div className="relative w-[95%] max-h-[80%] bg-white bg-opacity-40 my-4 mx-auto rounded-lg text-gray-800 p-4 sm:p-6 md:p-8">
							<div className="text-center md:text-left">
								<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 sm:mb-4 text-shadow-lg">
									{routine.title}
								</h1>
								<p className="text-base sm:text-lg font-medium text-gray-600">
									{routine.description}
								</p>
								<div className="flex flex-row justify-center md:justify-start items-center gap-4 sm:gap-6 mt-4">
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
								<button
									onClick={() =>
										handleOpenModal("routine", {
											title: routine.title,
											description: routine.description,
											routineId: routineId,
										})
									}
									className="px-6 py-2 mt-2 bg-blue-600 hover:bg-blue-700 transition text-white font-bold rounded-lg shadow-lg"
								>
									Edit Routine Header
								</button>
							</div>
						</div>
					</div>

					{/* Weeks Breakdown */}
					<div className=" p-3 sm:p-6">
						{routine?.data?.weeks?.map((week, index) => (
							<div
								key={index}
								className="mb-4 sm:mb-6 border rounded-lg shadow-md"
							>
								{/* Week Header */}
								<div
									className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-gradient-to-r from-blue-100 to-purple-100 cursor-pointer gap-3 sm:gap-0"
									onClick={() => toggleWeek(index)}
								>
									<h2 className="text-base sm:text-xl font-bold flex items-center gap-2 sm:gap-3">
										<img
											src={
												week.weekImage ||
												"https://via.placeholder.com/350"
											}
											alt={`Week ${index + 1}`}
											className="h-12 sm:h-16 aspect-square object-cover rounded-full"
										/>
										<span className="flex-shrink">
											Week {index + 1}: {week.weekTitle}
										</span>
									</h2>
									<div className="flex items-center w-full sm:w-fit justify-between space-x-2">
										<div className="border w-fit border-gray-200  flex gap-2 px-3 py-3 sm:px-4 rounded-lg flex-grow sm:flex-grow-0">
											<button
												onClick={() =>
													handleOpenModal("week", {
														weekIndex: index + 1,
														title: week.weekTitle,
														description:
															week.weekDescription,
														routineId: routineId,
													})
												}
												className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
											>
												Edit
											</button>
											<button
												onClick={() => {
													handleDelete(
														routineId,
														index + 1
													);
												}}
												className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
											>
												Delete
											</button>
										</div>
										<div className=" w-fit">
											{openWeeks[index] ? (
												<ChevronUp className="h-6 w-6 text-blue-600" />
											) : (
												<ChevronDown className="h-6 w-6 text-blue-600" />
											)}
										</div>
									</div>
								</div>

								{/* Smooth Dropdown Content */}
								<div
									className={`transition-all duration-300 ease-in-out overflow-hidden ${
										openWeeks[index]
											? "max-h-screen"
											: "max-h-0"
									}`}
								>
									<div className="p-3 sm:p-4 bg-white space-y-3 sm:space-y-4">
										<p className="text-sm sm:text-base text-gray-600">
											{week.weekDescription}
										</p>
										{week.days.map((day, dayIndex) => (
											<div
												key={dayIndex}
												className="border rounded-lg"
											>
												{/* Day Header */}
												<div
													className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-100 cursor-pointer"
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
													<div className="flex justify-between w-full mt-1 sm:mt-0 sm:w-fit items-center space-x-2">
														<button
															onClick={() =>
																handleOpenModal(
																	"day",
																	{
																		routineId:
																			routineId,
																		dayIndex:
																			dayIndex +
																			1,
																		weekIndex:
																			index +
																			1,
																		title: day?.dayTitle,
																		description:
																			day?.dayDescription,
																		taskName:
																			day
																				.task
																				.taskName,
																		taskDescription:
																			day
																				.task
																				.taskDescription,
																		taskDuration:
																			day
																				.task
																				.taskDuration,
																		productName:
																			day
																				.task
																				.productName,
																		productLink:
																			day
																				.task
																				.productLink,
																	}
																)
															}
															className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md"
														>
															Edit
														</button>
														{openDays[
															`${index}-${dayIndex}`
														] ? (
															<ChevronUp className="h-5 w-5 text-gray-500" />
														) : (
															<ChevronDown className="h-5 w-5 text-gray-500" />
														)}
													</div>
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
																}{" "}
																Minutes
															</p>
														</div>
														<div className="flex items-center space-x-4">
															<img
																src={
																	day.task
																		.productImage ||
																	"https://via.placeholder.com/350"
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

						{/* Add Week Button */}
						<div className="mt-4">
							<button
								onClick={addWeek}
								className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
							>
								Add Week
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Unified Modal */}
			{isModalOpen && (
				<UnifiedModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					mode={modalMode}
					data={modalData}
					fetchRoutine={fetchRoutine}
				/>
			)}
		</div>
	);
};

export default ViewEditRoutine;
