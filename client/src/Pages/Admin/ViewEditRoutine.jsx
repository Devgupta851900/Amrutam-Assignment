/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, User, Clock } from "lucide-react";
import UnifiedModal from "../../components/UnifiedRoutineModal"; // Reusable Modal for Add/Edit actions
import { useLocation, useNavigate } from "react-router-dom";
import {
	getRoutine,
	addWeekToRoutine,
	deleteWeekFromRoutine,
} from "../../utils/api";
import { produce } from "immer";

const ViewEditRoutine = () => {
	const navigate = useNavigate();
	const [routine, setRoutine] = useState();
	const [openWeeks, setOpenWeeks] = useState({});
	const [openDays, setOpenDays] = useState({});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState("");
	const [modalData, setModalData] = useState(null);

	const location = useLocation();
	const routineId = location.pathname.split("/").at(-1);

	const fetchRoutine = async () => {
		try {
			const response = await getRoutine(routineId);
			setRoutine(response.data.routine);
		} catch (error) {
			console.error(error);
		} finally {
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

	return (
		<div className="container mx-auto pt-24 px-4 py-8 max-w-7xl">
			{/* Back Button */}
			<button
				onClick={() => navigate(-1)}
				className="mb-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg shadow-md"
			>
				Back
			</button>

			{/* Routine Header */}
			{routine && (
				<div className="bg-white shadow-xl rounded-xl overflow-hidden">
					{/* Header Section */}
					<div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white flex justify-between items-center">
						<div>
							<img
								alt="routineImage"
								src={routine.image}
								className="object-contain h-[400px] aspect-auto"
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
							<div className="space-x-4">
								<button
									onClick={() =>
										handleOpenModal("routine", {
											title: routine.title,
											description: routine.description,
											routineId: routineId,
										})
									}
									className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition text-white font-bold rounded-lg shadow-lg"
								>
									Edit Routine Header
								</button>
							</div>
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
											src={
												week.weekImage ||
												"https://via.placeholder.com/350"
											}
											alt={`Week ${index + 1}`}
											className="h-10 w-10 object-contain "
										/>
										<span>
											Week {index + 1}: {week.weekTitle}
										</span>
									</h2>
									<div className="flex items-center space-x-2">
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
										{openWeeks[index] ? (
											<ChevronUp className="h-6 w-6 text-blue-600" />
										) : (
											<ChevronDown className="h-6 w-6 text-blue-600" />
										)}
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
													<div className="flex items-center space-x-2">
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
																}
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
