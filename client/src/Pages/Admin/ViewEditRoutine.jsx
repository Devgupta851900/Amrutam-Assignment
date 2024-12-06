import React, { useState, useEffect } from "react";
import { Pencil, Plus, Trash2, Save, X } from "lucide-react";
import {
	updateRoutine,
	addWeekToRoutine,
	deleteWeekFromRoutine,
	updateWeek,
	updateDay,
	getRoutine,
} from "../../utils/api"; // Assuming these are exported from your API file
import { useLocation } from "react-router-dom";

const ViewEditRoutine = () => {
	const [routine, setRoutine] = useState(null);
	const [editingStates, setEditingStates] = useState({
		header: false,
		weeks: {},
		days: {},
	});

	// Header editing
	const [editedHeader, setEditedHeader] = useState({
		title: "",
		description: "",
	});

	const location = useLocation();

	const routineId = location.pathname.split("/").at(-1);

	useEffect(() => {
		// Fetch the routine data when the component mounts
		const fetchRoutine = async () => {
			const response = await getRoutine(routineId);
			setRoutine(response.data.routine);
			setEditedHeader({
				title: response.data.title,
				description: response.data.description,
			});
		};
		fetchRoutine();
	}, [routineId]);

	const handleHeaderEdit = () => {
		setEditingStates((prev) => ({ ...prev, header: true }));
		setEditedHeader({
			title: routine.title,
			description: routine.description,
		});
	};

	const saveHeaderEdit = async () => {
		await updateRoutine(routineId, {
			title: editedHeader.title,
			description: editedHeader.description,
		});
		setRoutine((prev) => ({
			...prev,
			title: editedHeader.title,
			description: editedHeader.description,
		}));
		setEditingStates((prev) => ({ ...prev, header: false }));
	};

	// Week operations
	const addWeek = async () => {
		const newWeek = {
			weekTitle: "New Week",
			weekDescription: "New week description",
			days: Array(7)
				.fill()
				.map((_, idx) => ({
					dayNumber: idx + 1,
					dayTitle: "New Day",
					task: {
						taskName: "New Task",
						taskDescription: "New task description",
						taskDuration: 30,
						productName: "New Product",
						productImage: "default.jpg",
						productLink: "https://example.com",
					},
				})),
		};

		const response = await addWeekToRoutine(routineId, newWeek);
		setRoutine((prev) => ({
			...prev,
			data: {
				...prev.data,
				weeks: [...prev.data.weeks, response.data],
			},
		}));
	};

	const deleteWeek = async (weekIndex) => {
		const weekId = routine.data.weeks[weekIndex]._id;
		await deleteWeekFromRoutine(routineId, weekId);
		setRoutine((prev) => ({
			...prev,
			data: {
				...prev.data,
				weeks: prev.data.weeks.filter((_, idx) => idx !== weekIndex),
			},
		}));
	};

	const handleWeekEdit = (weekIndex) => {
		setEditingStates((prev) => ({
			...prev,
			weeks: { ...prev.weeks, [weekIndex]: true },
		}));
	};

	const saveWeekEdit = async (weekIndex, newTitle, newDescription) => {
		const weekId = routine.data.weeks[weekIndex]._id;
		await updateWeek(routineId, weekId, {
			weekTitle: newTitle,
			weekDescription: newDescription,
		});

		setRoutine((prev) => ({
			...prev,
			data: {
				...prev.data,
				weeks: prev.data.weeks.map((week, idx) =>
					idx === weekIndex
						? {
								...week,
								weekTitle: newTitle,
								weekDescription: newDescription,
						  }
						: week
				),
			},
		}));
		setEditingStates((prev) => ({
			...prev,
			weeks: { ...prev.weeks, [weekIndex]: false },
		}));
	};

	const handleDayEdit = (weekIndex, dayIndex) => {
		setEditingStates((prev) => ({
			...prev,
			days: { ...prev.days, [`${weekIndex}-${dayIndex}`]: true },
		}));
	};

	const saveDayEdit = async (weekIndex, dayIndex, updatedDay) => {
		const weekId = routine.data.weeks[weekIndex]._id;
		const dayId = routine.data.weeks[weekIndex].days[dayIndex]._id;

		await updateDay(routineId, weekId, dayId, updatedDay);

		setRoutine((prev) => ({
			...prev,
			data: {
				...prev.data,
				weeks: prev.data.weeks.map((week, wIdx) =>
					wIdx === weekIndex
						? {
								...week,
								days: week.days.map((day, dIdx) =>
									dIdx === dayIndex ? updatedDay : day
								),
						  }
						: week
				),
			},
		}));

		setEditingStates((prev) => ({
			...prev,
			days: { ...prev.days, [`${weekIndex}-${dayIndex}`]: false },
		}));
	};

	if (!routine) {
		return <div>Loading...</div>;
	}

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-8">
			{/* Header Section */}
			<div className="bg-white rounded-lg shadow-md p-6">
				{!editingStates.header ? (
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								{routine.title}
							</h1>
							<p className="mt-2 text-gray-600">
								{routine.description}
							</p>
						</div>
						<button
							onClick={handleHeaderEdit}
							className="p-2 text-gray-600 hover:text-blue-600"
						>
							<Pencil className="w-5 h-5" />
						</button>
					</div>
				) : (
					<div className="space-y-4">
						<input
							type="text"
							value={editedHeader.title}
							onChange={(e) =>
								setEditedHeader((prev) => ({
									...prev,
									title: e.target.value,
								}))
							}
							className="w-full p-2 border rounded"
						/>
						<textarea
							value={editedHeader.description}
							onChange={(e) =>
								setEditedHeader((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
							className="w-full p-2 border rounded"
						/>
						<div className="flex gap-2">
							<button
								onClick={saveHeaderEdit}
								className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
							>
								<Save className="w-4 h-4" />
							</button>
							<button
								onClick={() =>
									setEditingStates((prev) => ({
										...prev,
										header: false,
									}))
								}
								className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Weeks Section */}
			<div className="space-y-6">
				{routine.data.weeks.map((week, weekIndex) => (
					<div
						key={weekIndex}
						className="bg-white rounded-lg shadow-md p-6"
					>
						{/* Week Header */}
						<div className="border-b pb-4 mb-4">
							<div className="flex justify-between items-start">
								<div>
									<h2 className="text-xl font-semibold text-gray-900">
										Week {weekIndex + 1}: {week.weekTitle}
									</h2>
									<p className="mt-1 text-gray-600">
										{week.weekDescription}
									</p>
								</div>
								<div className="flex gap-2">
									<button
										onClick={() =>
											handleWeekEdit(weekIndex)
										}
										className="p-2 text-gray-600 hover:text-blue-600"
									>
										<Pencil className="w-5 h-5" />
									</button>
									<button
										onClick={() => deleteWeek(weekIndex)}
										className="p-2 text-gray-600 hover:text-red-600"
									>
										<Trash2 className="w-5 h-5" />
									</button>
								</div>
							</div>
						</div>

						{/* Days List */}
						<div className="space-y-4">
							{week.days.map((day, dayIndex) => (
								<div
									key={dayIndex}
									className="border rounded-lg p-4"
								>
									{editingStates.days[
										`${weekIndex}-${dayIndex}`
									] ? (
										<div className="space-y-4">
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Day Title
												</label>
												<input
													type="text"
													value={day.dayTitle}
													onChange={(e) => {
														const updatedDay = {
															...day,
															dayTitle:
																e.target.value,
														};
														saveDayEdit(
															weekIndex,
															dayIndex,
															updatedDay
														);
													}}
													className="mt-1 w-full p-2 border rounded"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													Task
												</label>
												<input
													type="text"
													value={day.task.taskName}
													onChange={(e) => {
														const updatedDay = {
															...day,
															task: {
																...day.task,
																taskName:
																	e.target
																		.value,
															},
														};
														saveDayEdit(
															weekIndex,
															dayIndex,
															updatedDay
														);
													}}
													className="mt-1 w-full p-2 border rounded"
												/>
											</div>
										</div>
									) : (
										<div className="flex justify-between">
											<div>
												<p className="font-semibold">
													{day.dayTitle}
												</p>
												<p>{day.task.taskName}</p>
											</div>
											<button
												onClick={() =>
													handleDayEdit(
														weekIndex,
														dayIndex
													)
												}
												className="p-2 text-gray-600 hover:text-blue-600"
											>
												<Pencil className="w-5 h-5" />
											</button>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{/* Add New Week Button */}
			<button
				onClick={addWeek}
				className="mt-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
			>
				<Plus className="w-5 h-5" />
				Add New Week
			</button>
		</div>
	);
};

export default ViewEditRoutine;
