import React, { useContext, useState } from "react";
import { produce } from "immer";
import ImageUploader from "../../components/ImageUploader";
import { createRoutine } from "../../utils/api";
import { AppContext } from "../../utils/contextAPI";

const CreateRoutinePage = () => {
	const { fetchAdminData } = useContext(AppContext);

	const [routine, setRoutine] = useState({
		title: "",
		description: "",
		duration: 0,
		image: null,
		imageUrl: null,
		weeks: [],
	});

	const handleCreateRoutine = async () => {
		try {
			// Validate duration and ensure it matches weeks length
			if (typeof routine.duration !== "number") {
				routine.duration = parseInt(routine.duration, 10);

				if (isNaN(routine.duration)) {
					throw new Error("Duration must be a valid number");
				}
			}

			// Ensure duration matches weeks length
			if (routine.duration !== routine.weeks.length) {
				throw new Error(
					`Duration (${routine.duration}) must match the number of weeks (${routine.weeks.length})`
				);
			}

			const validatedRoutine = produce(routine, (draft) => {
				// Validate and set the duration
				draft.duration = routine.duration;

				// Validate and parse taskDuration for each day
				draft.weeks.forEach((week) => {
					week.days.forEach((day) => {
						// Ensure taskDuration is a number
						if (typeof day.task.taskDuration !== "number") {
							const parsedDuration = parseInt(
								day.task.taskDuration,
								10
							);

							if (isNaN(parsedDuration)) {
								throw new Error(
									`Invalid task duration: ${day.task.taskDuration}`
								);
							}

							day.task.taskDuration = parsedDuration;
						}
					});
				});
			});

			const routineData = {
				...validatedRoutine,
				data: {
					weeks: validatedRoutine.weeks,
				},
			};

			// Make the API call with the validated routine
			const response = await createRoutine(routineData);

			await fetchAdminData();

			// Handle successful response
			console.log("Routine created successfully", response);
		} catch (error) {
			// Error handling
			console.error("Error creating routine:", error.message);
		}
	};

	const handleFieldChange = (path, value) => {
		setRoutine((prev) =>
			produce(prev, (draft) => {
				const keys = path.split(".");
				let pointer = draft;
				keys.forEach((key, index) => {
					if (index === keys.length - 1) pointer[key] = value;
					else pointer = pointer[key];
				});
			})
		);
	};

	const addWeek = () => {
		setRoutine((prev) =>
			produce(prev, (draft) => {
				draft.weeks.push({
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
				});
				draft.duration = draft.weeks.length;
			})
		);
	};

	const handleTaskChange = (weekIndex, dayIndex, field, value) => {
		setRoutine((prev) =>
			produce(prev, (draft) => {
				draft.weeks[weekIndex].days[dayIndex].task[field] = value;
			})
		);
	};

	return (
		<div className="container mx-auto pt-24 px-4 py-8 max-w-7xl">
			<h1 className="text-4xl font-extrabold text-gray-700 mb-6">
				Create Your Routine
			</h1>
			<div className="bg-gray-100 shadow-lg rounded-lg p-6 space-y-6">
				<div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
					<div className="space-y-4">
						{/* Routine Title Section - Styled like day section */}
						<div className="flex items-center space-x-4">
							<div className="flex-grow space-y-2">
								<label className="block text-xl font-bold text-gray-700 mb-2">
									Routine Title
								</label>
								<input
									type="text"
									value={routine.title}
									onChange={(e) =>
										handleFieldChange(
											"title",
											e.target.value
										)
									}
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
									placeholder="Enter routine title"
								/>
							</div>
						</div>

						{/* Routine Description Section - Styled like day section */}
						<div className="bg-gray-50 p-4 rounded-md border border-gray-200">
							<label className="block text-xl font-bold text-gray-700 mb-2">
								Routine Description
							</label>
							<textarea
								value={routine.description}
								onChange={(e) =>
									handleFieldChange(
										"description",
										e.target.value
									)
								}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300 resize-y"
								rows="3"
								placeholder="Enter routine description"
							></textarea>
						</div>

						{/* Routine Image Section - Styled like day section */}
						<div className="bg-gray-50 p-4 rounded-md border border-gray-200">
							<label className="block text-xl font-bold text-gray-700 mb-2">
								Routine Image
							</label>
							<ImageUploader
								label="Routine Image"
								path="imageUrl"
								onUploadSuccess={(path, secureUrl) =>
									handleFieldChange(path, secureUrl)
								}
								initialImageUrl={routine.imageUrl}
								className="w-full mt-2"
							/>
						</div>
					</div>
				</div>

				{/* Weeks Section */}
				<div className="space-y-6">
					<h2 className="text-2xl font-bold text-gray-800">Weeks</h2>
					{routine.weeks.map((week, weekIndex) => (
						<div
							key={weekIndex}
							className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
						>
							<div className="space-y-4">
								{/* Week Title Section - Styled like day section */}
								<div className="flex items-center space-x-4">
									<div className="flex-grow space-y-2">
										<label className="block text-xl font-bold text-gray-700 mb-2">
											Week Title
										</label>
										<input
											type="text"
											value={week.weekTitle}
											onChange={(e) =>
												handleFieldChange(
													`weeks.${weekIndex}.weekTitle`,
													e.target.value
												)
											}
											className="w-full p-3 border rounded-md text-lg font-semibold"
											placeholder={`Week ${
												weekIndex + 1
											} Title`}
										/>
									</div>
								</div>

								{/* Week Description Section - Styled like day section */}
								<div className="bg-gray-50 p-4 rounded-md border border-gray-200">
									<label className="block text-xl font-bold text-gray-700 mb-2">
										Week Description
									</label>
									<input
										type="text"
										value={week.weekDescription}
										onChange={(e) =>
											handleFieldChange(
												`weeks.${weekIndex}.weekDescription`,
												e.target.value
											)
										}
										className="w-full p-3 border rounded-md"
										placeholder={`Week ${
											weekIndex + 1
										} Description`}
									/>
								</div>

								{/* Week Image Section - Styled like day section */}
								<div className="bg-gray-50 p-4 rounded-md border border-gray-200">
									<label className="block text-xl font-bold text-gray-700 mb-2">
										Week Image
									</label>
									<ImageUploader
										label="Week Image"
										path={`weeks.${weekIndex}.weekImageUrl`}
										onUploadSuccess={(path, secureUrl) =>
											handleFieldChange(path, secureUrl)
										}
										initialImageUrl={week.weekImageUrl}
										className="w-full"
									/>
								</div>

								{/* Days Section */}
								<div className="space-y-4">
									{week.days.map((day, dayIndex) => (
										<div
											key={`week-${weekIndex}-day-${dayIndex}`}
											className="bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200"
										>
											<div className="block text-2xl text-end font-bold text-gray-700 mb-2 underline">{`Day ${
												dayIndex + 1
											}`}</div>
											<div className="flex flex-col space-y-4">
												{/* Image and Basic Info Section */}
												<div className="flex items-center space-x-4">
													<ImageUploader
														label="Day Image"
														path={`weeks.${weekIndex}.days.${dayIndex}.task.dayImage`}
														onUploadSuccess={(
															path,
															secureUrl
														) =>
															handleFieldChange(
																path,
																secureUrl
															)
														}
														initialImageUrl={
															day.task.dayImageUrl
														}
														className="w-32 h-32 object-cover rounded-lg"
													/>

													<div className="flex-grow space-y-2">
														{/* Day Title */}
														<input
															type="text"
															value={day.dayTitle}
															onChange={(e) =>
																handleFieldChange(
																	`weeks.${weekIndex}.days.${dayIndex}.dayTitle`,
																	e.target
																		.value
																)
															}
															className="w-full p-2 border rounded-md text-lg font-semibold"
															placeholder={`Day ${
																dayIndex + 1
															} Title`}
														/>

														{/* Day Description */}
														<input
															type="text"
															value={
																day.dayDescription
															}
															onChange={(e) =>
																handleFieldChange(
																	`weeks.${weekIndex}.days.${dayIndex}.dayDescription`,
																	e.target
																		.value
																)
															}
															className="w-full p-2 border rounded-md text-gray-600"
															placeholder={`Day ${
																dayIndex + 1
															} Description`}
														/>
													</div>
												</div>

												{/* Task Details Section */}
												<div className="bg-gray-50 p-4 rounded-md border border-gray-200">
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														{/* Task Name */}
														<div>
															<label className="block text-sm font-medium text-gray-700 mb-1">
																Task Name
															</label>
															<input
																type="text"
																value={
																	day.task
																		.taskName
																}
																onChange={(e) =>
																	handleTaskChange(
																		weekIndex,
																		dayIndex,
																		"taskName",
																		e.target
																			.value
																	)
																}
																className="w-full p-2 border rounded-md"
																placeholder={`Day ${
																	dayIndex + 1
																} Task Name`}
															/>
														</div>

														{/* Task Description */}
														<div>
															<label className="block text-sm font-medium text-gray-700 mb-1">
																Task Description
															</label>
															<input
																type="text"
																value={
																	day.task
																		.taskDescription
																}
																onChange={(e) =>
																	handleTaskChange(
																		weekIndex,
																		dayIndex,
																		"taskDescription",
																		e.target
																			.value
																	)
																}
																className="w-full p-2 border rounded-md"
																placeholder={`Day ${
																	dayIndex + 1
																} Task Description`}
															/>
														</div>
													</div>
												</div>

												{/* Product Details Section */}
												<div className="bg-gray-50 p-4 rounded-md border border-gray-200">
													<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
														{/* Task Duration */}
														<div>
															<label className="block text-sm font-medium text-gray-700 mb-1">
																Task Duration
															</label>
															<input
																type="number"
																value={
																	day.task
																		.taskDuration
																}
																onChange={(e) =>
																	handleTaskChange(
																		weekIndex,
																		dayIndex,
																		"taskDuration",
																		e.target
																			.value
																	)
																}
																className="w-full p-2 border rounded-md"
																placeholder={`Day ${
																	dayIndex + 1
																} Task Duration`}
															/>
														</div>

														{/* Product Name */}
														<div>
															<label className="block text-sm font-medium text-gray-700 mb-1">
																Product Name
															</label>
															<input
																type="text"
																value={
																	day.task
																		.productName
																}
																onChange={(e) =>
																	handleTaskChange(
																		weekIndex,
																		dayIndex,
																		"productName",
																		e.target
																			.value
																	)
																}
																className="w-full p-2 border rounded-md"
																placeholder="Product Name"
															/>
														</div>
													</div>

													{/* Product Link */}
													<div className="mt-4">
														<label className="block text-sm font-medium text-gray-700 mb-1">
															Product Link
														</label>
														<input
															type="text"
															value={
																day.task
																	.productLink
															}
															onChange={(e) =>
																handleTaskChange(
																	weekIndex,
																	dayIndex,
																	"productLink",
																	e.target
																		.value
																)
															}
															className="w-full p-2 border rounded-md"
															placeholder="Product Link"
														/>
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
					<button
						onClick={addWeek}
						className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
					>
						Add Week
					</button>
				</div>
			</div>

			<button
				onClick={handleCreateRoutine}
				className="px-3 py-2 m-4 bg-gray-300 text-black"
			>
				Create Routine
			</button>
		</div>
	);
};

export default CreateRoutinePage;
