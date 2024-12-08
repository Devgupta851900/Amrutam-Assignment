/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import ImageUploader from "./ImageUploader";
import { updateWeek, updateDay, updateRoutine } from "../utils/api";

const UnifiedModal = ({ isOpen, onClose, mode, data = {}, fetchRoutine }) => {
	// Initialize state based on mode and data
	const initialState = {
		title: data.title || "",
		description: data.description || "",
		image: data.image || "",
		duration: data.duration || "",
		routines: data.routines || [],
		taskName: data.taskName || "",
		taskDescription: data.taskDescription || "",
		taskDuration: data.taskDuration || "",
		productName: data.productName || "",
		productLink: data.productLink || "",
		productImage: data.productImage || "",
	};
	const [formData, setFormData] = useState(initialState);

	// Reset state when mode or data changes
	useEffect(() => {
		setFormData(initialState);
	}, [mode, data]);

	// Close on escape key
	useEffect(() => {
		const handleEscape = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			// Create a filtered formData object based on the current mode
			let relavantData = {};

			switch (mode) {
				case "week":
					relavantData = {
						title: formData.title,
						description: formData.description,
						image: formData.image,
					};
					await updateWeek(
						data.routineId,
						data.weekIndex,
						relavantData
					); // Call editWeek function
					break;
				case "day":
					relavantData = {
						dayTitle: formData.title,
						dayDescription: formData.description,
						task: {
							taskName: formData.taskName,
							taskDescription: formData.taskDescription,
							taskDuration: parseInt(formData.taskDuration, 10),
							productName: formData.productName,
							productLink: formData.productLink,
							productImage: formData.productImage,
						},
					};
					await updateDay(
						data.routineId,
						data.weekIndex,
						data.dayIndex,
						relavantData
					); // Call editDay function
					break;
				case "routine":
					relavantData = {
						title: formData.title,
						description: formData.description,
						image: formData.image,
					};
					await updateRoutine(data.routineId, relavantData); // Call editRoutine function
					break;
				default:
					// Handle any other modes or default case
					console.error("Unknown mode");
					return;
			}

			fetchRoutine();
			// Close modal after submitting
			onClose();
		} catch (error) {
			console.error("Error submitting form:", error);
		}
	};

	// Function to handle image uploads
	const handleFieldChange = (field, value) => {
		setFormData((prevData) => ({ ...prevData, [field]: value }));
	};

	// Field configurations for each mode
	const fieldConfig = {
		routine: [
			{
				id: "title",
				label: "Title",
				type: "text",
				placeholder: "Enter routine title",
			},
			{
				id: "description",
				label: "Description",
				type: "textarea",
				placeholder: "Enter routine description",
			},
			{ id: "image", label: "Image", type: "image" },
		],
		week: [
			{
				id: "title",
				label: "Title",
				type: "text",
				placeholder: "Enter week title",
			},
			{
				id: "description",
				label: "Description",
				type: "textarea",
				placeholder: "Enter week description",
			},
			{ id: "image", label: "Image", type: "image" },
		],
		day: [
			{
				id: "title",
				label: "Day Title",
				type: "text",
				placeholder: "Enter Day Title",
			},
			{
				id: "description",
				label: "Day Description",
				type: "text",
				placeholder: "Enter Day Description",
			},
			{
				id: "taskName",
				label: "Task Name",
				type: "text",
				placeholder: "Enter task name",
			},
			{
				id: "taskDescription",
				label: "Task Description",
				type: "textarea",
				placeholder: "Enter task description",
			},
			{
				id: "taskDuration",
				label: "Task Duration",
				type: "number",
				placeholder: "Enter task duration",
			},
			{
				id: "productName",
				label: "Product Name",
				type: "text",
				placeholder: "Enter product name",
			},
			{
				id: "productLink",
				label: "Product Link",
				type: "text",
				placeholder: "Enter product link",
			},
			{ id: "productImage", label: "Product Image", type: "image" },
		],
	};

	const renderFields = () =>
		(fieldConfig[mode] || []).map(({ id, label, type, placeholder }) => (
			<div key={id} className="space-y-2 ">
				<label
					htmlFor={id}
					className="block text-sm font-medium text-gray-700"
				>
					{label}
				</label>
				{type === "textarea" ? (
					<textarea
						id={id}
						value={formData[id]}
						onChange={(e) =>
							setFormData({ ...formData, [id]: e.target.value })
						}
						className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
						placeholder={placeholder}
						rows={3}
					/>
				) : type === "image" ? (
					<ImageUploader
						label={label}
						path={id}
						onUploadSuccess={(path, secureUrl) =>
							handleFieldChange(path, secureUrl)
						}
						initialImageUrl={formData[id]}
						className="w-full mt-2"
					/>
				) : (
					<input
						id={id}
						type={type}
						value={formData[id]}
						onChange={(e) =>
							setFormData({ ...formData, [id]: e.target.value })
						}
						className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
						placeholder={placeholder}
					/>
				)}
			</div>
		));

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center ">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 max-h-[90vh] overflow-y-auto">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-xl font-semibold">
						{mode === "week" && `Editing Week ${data.weekIndex}`}
						{mode === "day" &&
							`Editing Day ${data.dayIndex} of Week ${data.weekIndex}`}
						{mode === "routine" && "Editing Routine Header"}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
					>
						✕
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{renderFields()}
					<div className="mt-6 flex justify-end space-x-3">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
						>
							{mode === "addWeek" ? "Add" : "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default UnifiedModal;
