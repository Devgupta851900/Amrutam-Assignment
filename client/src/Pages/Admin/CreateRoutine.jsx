import React, { useState } from "react";
import { PlusCircle, Trash, Save, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";

const CreateRoutinePage = () => {
	const [routine, setRoutine] = useState({
		title: "",
		description: "",
		image: "",
		weeks: [],
	});
	const [openWeeks, setOpenWeeks] = useState({});
	const [uploading, setUploading] = useState(false);

	// Cloudinary Upload
	const uploadImage = async (file) => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("upload_preset", "ml_default");
		formData.append("cloud_name", "dlj2flmvh");

		try {
			setUploading(true);
			const response = await axios.post(
				`https://api.cloudinary.com/v1_1/dlj2flmvh/image/upload`,
				formData
			);
			return response.data.secure_url;
		} catch (error) {
			console.error("Image upload failed:", error);
			alert("Failed to upload image. Please try again.");
			return null;
		} finally {
			setUploading(false);
		}
	};

	// Create default 7-day template
	const createDefaultDays = () => {
		return Array.from({ length: 7 }, (_, dayIndex) => ({
			dayTitle: `Day ${dayIndex + 1}`,
			image: "",
			task: {
				taskName: "",
				taskDescription: "",
				taskDuration: "",
				productName: "",
				productLink: "",
				productImage: "",
			},
		}));
	};

	// Image upload handler
	const handleImageUpload = async (e, path) => {
		const file = e.target.files[0];
		if (!file) return;

		const uploadedUrl = await uploadImage(file);
		if (uploadedUrl) {
			const keys = path.split(".");
			const updatedRoutine = { ...routine };
			let pointer = updatedRoutine;
			keys.forEach((key, index) => {
				if (index === keys.length - 1) {
					pointer[key] = uploadedUrl;
				} else {
					pointer = pointer[key];
				}
			});
			setRoutine(updatedRoutine);
		}
	};

	const addWeek = () => {
		setRoutine((prev) => ({
			...prev,
			weeks: [
				...prev.weeks,
				{
					weekTitle: `Week ${prev.weeks.length + 1}`,
					weekDescription: "",
					image: "",
					days: createDefaultDays(),
				},
			],
		}));
	};

	const addDay = (weekIndex) => {
		const updatedWeeks = [...routine.weeks];
		updatedWeeks[weekIndex].days.push({
			dayTitle: `Day ${updatedWeeks[weekIndex].days.length + 1}`,
			image: "",
			task: {
				taskName: "",
				taskDescription: "",
				taskDuration: "",
				productName: "",
				productLink: "",
				productImage: "",
			},
		});
		setRoutine((prev) => ({ ...prev, weeks: updatedWeeks }));
	};

	const handleInputChange = (path, value) => {
		const keys = path.split(".");
		const updatedRoutine = { ...routine };
		let pointer = updatedRoutine;
		keys.forEach((key, index) => {
			if (index === keys.length - 1) {
				pointer[key] = value;
			} else {
				pointer = pointer[key];
			}
		});
		setRoutine(updatedRoutine);
	};

	const removeWeek = (index) => {
		const updatedWeeks = [...routine.weeks];
		updatedWeeks.splice(index, 1);
		setRoutine((prev) => ({ ...prev, weeks: updatedWeeks }));
	};

	const removeDay = (weekIndex, dayIndex) => {
		const updatedWeeks = [...routine.weeks];
		updatedWeeks[weekIndex].days.splice(dayIndex, 1);
		setRoutine((prev) => ({ ...prev, weeks: updatedWeeks }));
	};

	const toggleWeek = (index) => {
		setOpenWeeks((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	const handleSaveRoutine = () => {
		console.log("Routine Saved:", routine);
		alert("Routine saved successfully! Check the console for details.");
	};

	// Rest of the component remains the same as the previous implementation
	return (
		<div className="container mx-auto px-4 py-8 max-w-7xl">
			<h1 className="text-3xl font-extrabold text-gray-800 mb-6">
				Create New Routine
			</h1>
			<div className="bg-white shadow-xl rounded-xl p-6 space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Title
					</label>
					<input
						type="text"
						value={routine.title}
						onChange={(e) =>
							handleInputChange("title", e.target.value)
						}
						className="mt-1 block w-full p-2 border rounded-lg"
						placeholder="Enter routine title"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Description
					</label>
					<textarea
						value={routine.description}
						onChange={(e) =>
							handleInputChange("description", e.target.value)
						}
						className="mt-1 block w-full p-2 border rounded-lg"
						rows="3"
						placeholder="Enter routine description"
					></textarea>
				</div>

				{/* Routine Image */}
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Routine Image
					</label>
					<input
						type="file"
						onChange={(e) => handleImageUpload(e, "image")}
						className="mt-1 block w-full"
					/>
					{uploading && <p className="text-gray-500">Uploading...</p>}
					{routine.image && (
						<img
							src={routine.image}
							alt="Routine"
							className="mt-2 w-32 h-32 object-cover rounded-lg"
						/>
					)}
				</div>

				{/* Weeks Section */}
				<div className="space-y-4">
					<h2 className="text-xl font-bold">Weeks</h2>
					{routine.weeks.map((week, weekIndex) => (
						<div
							key={weekIndex}
							className="border rounded-lg shadow-md"
						>
							<div
								className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer"
								onClick={() => toggleWeek(weekIndex)}
							>
								<div className="flex items-center space-x-4">
									<input
										type="text"
										value={week.weekTitle}
										onChange={(e) =>
											handleInputChange(
												`weeks.${weekIndex}.weekTitle`,
												e.target.value
											)
										}
										placeholder={`Week ${
											weekIndex + 1
										} Title`}
										className="p-1 border rounded-md"
									/>
								</div>
								<div className="flex items-center space-x-2">
									<button
										onClick={() => removeWeek(weekIndex)}
										className="text-red-500 hover:text-red-700"
									>
										<Trash className="h-5 w-5" />
									</button>
									{openWeeks[weekIndex] ? (
										<ChevronUp className="h-5 w-5 text-gray-500" />
									) : (
										<ChevronDown className="h-5 w-5 text-gray-500" />
									)}
								</div>
							</div>
							{openWeeks[weekIndex] && (
								<div className="p-4 space-y-4">
									<textarea
										value={week.weekDescription}
										onChange={(e) =>
											handleInputChange(
												`weeks.${weekIndex}.weekDescription`,
												e.target.value
											)
										}
										placeholder="Enter week description"
										className="w-full p-2 border rounded-md"
									></textarea>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Week Image
										</label>
										<input
											type="file"
											onChange={(e) =>
												handleImageUpload(
													e,
													`weeks.${weekIndex}.image`
												)
											}
											className="mt-1 block w-full"
										/>
										{week.image && (
											<img
												src={week.image}
												alt={`Week ${weekIndex + 1}`}
												className="mt-2 w-32 h-32 object-cover rounded-lg"
											/>
										)}
									</div>

									{/* Days Section */}
									<div>
										<h3 className="text-lg font-bold">
											Days
										</h3>
										{week.days.map((day, dayIndex) => (
											<div
												key={dayIndex}
												className="border rounded-lg p-4 space-y-2"
											>
												<input
													type="text"
													value={day.dayTitle}
													onChange={(e) =>
														handleInputChange(
															`weeks.${weekIndex}.days.${dayIndex}.dayTitle`,
															e.target.value
														)
													}
													placeholder={`Day ${
														dayIndex + 1
													} Title`}
													className="w-full p-1 border rounded-md"
												/>
												<div>
													<label className="block text-sm font-medium text-gray-700">
														Day Image
													</label>
													<input
														type="file"
														onChange={(e) =>
															handleImageUpload(
																e,
																`weeks.${weekIndex}.days.${dayIndex}.image`
															)
														}
														className="mt-1 block w-full"
													/>
													{day.image && (
														<img
															src={day.image}
															alt={`Day ${
																dayIndex + 1
															}`}
															className="mt-2 w-32 h-32 object-cover rounded-lg"
														/>
													)}
												</div>
												<textarea
													value={
														day.task.taskDescription
													}
													onChange={(e) =>
														handleInputChange(
															`weeks.${weekIndex}.days.${dayIndex}.task.taskDescription`,
															e.target.value
														)
													}
													placeholder="Task Description"
													className="w-full p-2 border rounded-md"
												></textarea>
												<button
													onClick={() =>
														removeDay(
															weekIndex,
															dayIndex
														)
													}
													className="text-red-500 hover:text-red-700"
												>
													<Trash className="h-5 w-5" />
												</button>
											</div>
										))}
										<button
											onClick={() => addDay(weekIndex)}
											className="flex items-center text-green-500 hover:text-green-700 mt-4"
										>
											<PlusCircle className="h-5 w-5 mr-1" />
											Add Day
										</button>
									</div>
								</div>
							)}
						</div>
					))}
					<button
						onClick={addWeek}
						className="flex items-center text-green-500 hover:text-green-700 mt-4"
					>
						<PlusCircle className="h-5 w-5 mr-1" />
						Add Week
					</button>
				</div>

				{/* Save Button */}
				<button
					onClick={handleSaveRoutine}
					className="flex items-center bg-blue-500 text-white p-2 rounded-lg shadow hover:bg-blue-600"
				>
					<Save className="h-5 w-5 mr-2" />
					Save Routine
				</button>
			</div>
		</div>
	);
};

export default CreateRoutinePage;
