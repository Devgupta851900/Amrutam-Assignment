import Routine from "../models/Routine.js";
import User from "../models/User.js";
import RoutineProgress from "../models/RoutineProgress.js";
import { validateRoutineCreation } from "../utils/zodValidation.js";
import mongoose from "mongoose";

export const createRoutine = async (req, res) => {
	try {
		// Validate request body structure
		validateRoutineCreation(req.body);
	} catch (error) {
		return res.status(400).json({
			errors: error.errors.map((err) => ({
				field: err.path.join("."),
				message: err.message,
			})),
		});
	}

	try {
		const {
			title,
			description,
			duration,
			image,
			data = {},
			users = [],
		} = req.body;

		// Ensure creator is the authenticated admin user
		const creator = req.user._id;

		// Validate weeks and duration consistency
		if (!data.weeks || data.weeks.length !== duration) {
			return res.status(400).json({
				message:
					"Number of weeks in data must equal the duration defined.",
			});
		}

		// Validate each week
		for (const week of data.weeks) {
			if (!week.weekTitle || !week.weekDescription) {
				return res.status(400).json({
					message:
						"Each week must have a non-empty title and description.",
				});
			}

			// Ensure each week has exactly 7 days
			if (!week.days || week.days.length !== 7) {
				return res.status(400).json({
					message: `Week ${week.weekNumber} must have exactly 7 days.`,
				});
			}

			// Validate each day in the week
			for (const day of week.days) {
				if (!day.dayTitle) {
					return res.status(400).json({
						message: `Day ${day.dayNumber} in Week ${week.weekNumber} must have a non-empty title.`,
					});
				}

				const { task } = day;
				const { taskName, taskDescription, taskDuration } = task;
				if (!taskName || !taskDescription || !taskDuration) {
					return res.status(400).json({
						message: `Task for Day ${day.dayNumber} in Week ${week.weekNumber} must have a non-empty name, description, and duration.`,
					});
				}
			}
		}

		// Create new routine
		const newRoutine = new Routine({
			title,
			description,
			duration,
			image,
			data,
			users, // Only consumer users can be added
			creator, // Admin user who creates the routine
		});

		// Save routine to the database
		const savedRoutine = await newRoutine.save();

		// Add the routine to the creator's routines
		await User.findByIdAndUpdate(
			creator,
			{ $push: { routines: savedRoutine._id } },
			{ new: true } // Return the updated document
		);

		res.status(201).json({
			message: "Routine created successfully",
			routine: savedRoutine,
		});
	} catch (error) {
		console.error("Routine Creation Error:", error);

		// Handle duplicate key error
		if (error.code === 11000) {
			return res.status(409).json({
				message: "A routine with similar details already exists.",
			});
		}

		res.status(500).json({
			success: false,
			message: "Server error occurred while creating the routine.",
		});
	}
};

// Controller to update the title and description of an existing routine
export const updateRoutine = async (req, res) => {
	try {
		const { routineId } = req.params; // Get the routine ID from the request parameters
		const { title, description, image } = req.body; // Get the new title and description from the request body

		// Check if both title and description are provided
		if (!title || !description) {
			return res.status(400).json({
				message: "Both title and description are required.",
			});
		}

		// Find the routine by ID
		const routine = await Routine.findById(routineId);

		if (!routine) {
			return res.status(404).json({
				message: "Routine not found.",
			});
		}

		// Update the routine title and description
		routine.title = title;
		routine.description = description;
		routine.image = image;

		// Save the updated routine
		await routine.save();

		// Respond with the updated routine
		res.status(200).json({
			message: "Routine updated successfully.",
			routine,
		});
	} catch (error) {
		console.error("Error updating routine:", error);
		res.status(500).json({
			message: "An error occurred while updating the routine.",
		});
	}
};

// Controller to delete a specific routine
export const deleteRoutine = async (req, res) => {
	try {
		const { routineId } = req.params;

		// Find the routine by ID
		const routine = await Routine.findById(routineId);

		if (!routine) {
			return res.status(404).json({
				message: "Routine not found.",
			});
		}

		// Delete routine progress for this routine
		const routineProgressIds = await RoutineProgress.find({
			routineId,
		}).distinct("_id");
		await RoutineProgress.deleteMany({ routineId });

		// Remove routine and associated progress from all users
		await User.updateMany(
			{ routines: routineId },
			{
				$pull: {
					routines: routineId,
					routineProgress: { $in: routineProgressIds },
				},
			}
		);

		// Delete the routine itself
		await routine.deleteOne();

		res.status(200).json({
			message: "Routine and associated progress deleted successfully.",
		});
	} catch (error) {
		console.error("Error deleting routine:", error);
		res.status(500).json({
			message: "An error occurred while deleting the routine.",
			error: error.message,
		});
	}
};

// Controller to add a new week to an existing routine
export const addWeekToRoutine = async (req, res) => {
	try {
		const { routineId } = req.params;
		const { weekTitle, weekDescription, days } = req.body;

		// Step 1: Update routine
		const updatedRoutine = await Routine.findOneAndUpdate(
			{ _id: routineId },
			{
				$push: {
					"data.weeks": { weekTitle, weekDescription, days },
				},
				$inc: { duration: 1 },
			},
			{ new: true }
		);

		if (!updatedRoutine) {
			return res.status(404).json({ message: "Routine not found" });
		}

		// Step 2: Update progress - Using direct updateMany
		const updateResult = await RoutineProgress.updateMany(
			{ routineId: routineId },
			{
				$push: {
					progressData: [
						false,
						false,
						false,
						false,
						false,
						false,
						false,
					],
				},
			}
		);

		// Log a document before and after for verification
		const sampleDoc = await RoutineProgress.findOne({
			routineId: routineId,
		});
		console.log("Sample progress document after update:", sampleDoc);

		res.status(200).json({
			message: "Week added successfully",
			routine: updatedRoutine,
			progressUpdateResult: updateResult,
		});
	} catch (error) {
		console.error("Error in addWeekToRoutine:", error);
		res.status(500).json({
			message: "An error occurred",
			error: error.message,
		});
	}
};

// Controller to update a specific week in a routine
export const updateWeek = async (req, res) => {
	try {
		const { routineId, weekNumber } = req.params;
		const { title, description, image } = req.body;
		const weekIndex = weekNumber - 1;

		if (!title || !description) {
			return res.status(400).json({
				message: "Both title and description are required.",
			});
		}

		// Use findOneAndUpdate with positional operator to update specific week
		const updatedRoutine = await Routine.findOneAndUpdate(
			{
				_id: routineId,
				[`data.weeks.${weekIndex}`]: { $exists: true },
			},
			{
				$set: {
					[`data.weeks.${weekIndex}.weekTitle`]: title,
					[`data.weeks.${weekIndex}.weekDescription`]: description,
					[`data.weeks.${weekIndex}.weekImage`]: image,
				},
			},
			{ new: true, runValidators: true }
		);

		if (!updatedRoutine) {
			return res.status(404).json({
				message: "Routine not found or invalid week index.",
			});
		}

		res.status(200).json({
			message: `Week ${weekNumber} updated successfully.`,
			routine: updatedRoutine,
		});
	} catch (error) {
		console.error("Error updating week:", error);
		res.status(500).json({
			message: "An error occurred while updating the week.",
		});
	}
};

// Controller to delete a specific week from a routine
export const deleteWeekFromRoutine = async (req, res) => {
	try {
		const { routineId, weekNumber } = req.params;
		const weekIndex = weekNumber - 1;

		// Input validation
		if (!mongoose.Types.ObjectId.isValid(routineId)) {
			return res.status(400).json({
				message: "Invalid routine ID format",
			});
		}

		// Step 1: Check routine existence and permissions
		const routine = await Routine.findOne({ _id: routineId });

		if (!routine) {
			return res.status(404).json({
				message: "Routine not found",
			});
		}

		if (weekIndex < 0 || weekIndex >= routine.data.weeks.length) {
			return res.status(400).json({
				message: "Invalid week index",
			});
		}

		// Create a copy of weeks array without the week to be deleted
		const updatedWeeks = routine.data.weeks.filter(
			(_, index) => index !== weekIndex
		);

		// Step 2: Update routine with new weeks array
		const updatedRoutine = await Routine.findOneAndUpdate(
			{ _id: routineId },
			{
				$set: {
					"data.weeks": updatedWeeks,
					duration: updatedWeeks.length,
				},
			},
			{ new: true, runValidators: true }
		);

		if (!updatedRoutine) {
			return res.status(404).json({
				message: "Failed to update routine",
			});
		}

		// Step 3: Update routine progress documents
		const updateResult = await RoutineProgress.updateMany({ routineId }, [
			{
				$set: {
					progressData: {
						$concatArrays: [
							{ $slice: ["$progressData", weekIndex] },
							{
								$slice: [
									"$progressData",
									{ $add: [weekIndex, 1] },
									{ $size: "$progressData" },
								],
							},
						],
					},
				},
			},
		]);

		res.status(200).json({
			message: `Week ${weekNumber} deleted successfully.`,
			routine: updatedRoutine,
		});
	} catch (error) {
		console.error("Error deleting week:", error);
		res.status(500).json({
			message: "An error occurred while deleting the week.",
			error: error.message,
		});
	}
};

// Controller to update a specific day in a specific week of a routine
export const updateDay = async (req, res) => {
	try {
		const { routineId, weekNumber, dayNumber } = req.params;
		const { dayTitle, dayDescription, task } = req.body;

		const {
			taskName,
			taskDescription,
			taskDuration,
			productName,
			productImage,
			productLink,
		} = task;

		// Validate that routineId, weekNumber, and dayNumber are provided
		if (!routineId || !weekNumber || !dayNumber) {
			return res.status(400).json({
				message:
					"Routine ID, Week Number, and Day Number are required.",
			});
		}

		// Find and update the day in the routine
		const updatedRoutine = await Routine.findOneAndUpdate(
			{
				_id: routineId,
				[`data.weeks.${weekNumber - 1}.days.${dayNumber - 1}`]: {
					$exists: true,
				}, // Ensure the week and day exist
			},
			{
				$set: {
					// Update the day details (only fields provided)
					[`data.weeks.${weekNumber - 1}.days.${
						dayNumber - 1
					}.dayTitle`]: dayTitle,
					[`data.weeks.${weekNumber - 1}.days.${
						dayNumber - 1
					}.dayDescription`]: dayDescription,
					[`data.weeks.${weekNumber - 1}.days.${
						dayNumber - 1
					}.task.taskName`]: taskName,
					[`data.weeks.${weekNumber - 1}.days.${
						dayNumber - 1
					}.task.taskDescription`]: taskDescription,
					[`data.weeks.${weekNumber - 1}.days.${
						dayNumber - 1
					}.task.taskDuration`]: taskDuration,
					[`data.weeks.${weekNumber - 1}.days.${
						dayNumber - 1
					}.task.productName`]: productName,
					[`data.weeks.${weekNumber - 1}.days.${
						dayNumber - 1
					}.task.productImage`]: productImage,
					[`data.weeks.${weekNumber - 1}.days.${
						dayNumber - 1
					}.task.productLink`]: productLink,
				},
			},
			{ new: true, runValidators: true } // Return the updated document and run validations
		);

		// Check if the routine was found and updated
		if (!updatedRoutine) {
			return res.status(404).json({
				message: "Routine not found, or invalid week/ day index.",
			});
		}

		// Find the updated day object from the response
		const updatedDay =
			updatedRoutine.data.weeks[weekNumber - 1].days[dayNumber - 1];

		// Respond with the updated day details
		res.status(200).json({
			weekNumber,
			dayNumber,
			updatedDay,
			routineId,
		});
	} catch (error) {
		console.error("Error updating day:", error);
		res.status(500).json({
			message: "An error occurred while updating the day.",
			error: error.message,
		});
	}
};

// Controller to get progress for all users in a specific routine created by the admin
export const getRoutineUsersProgress = async (req, res) => {
	try {
		const { routineId } = req.params;

		// Find the routine and verify it was created by the admin
		const routine = await Routine.findOne({
			_id: routineId,
			creator: req.user._id,
		});

		if (!routine) {
			return res.status(404).json({
				message: "Routine not found or you are not the creator.",
			});
		}

		// Find all progress entries for this routine
		const usersProgress = await RoutineProgress.find({
			routineId: routineId,
		}).populate("user", "name email");

		// Transform progress data
		const progressDetails = usersProgress.map((progress) => {
			// Calculate total days and completed days
			const totalDays = routine.duration * 7;
			const completedDays = progress.progressData
				.flat()
				.filter(Boolean).length;
			const overallProgressPercentage = (completedDays / totalDays) * 100;

			// Calculate weekly progress
			const weeklyProgress = progress.progressData.map(
				(week, weekIndex) => ({
					weekNumber: weekIndex + 1,
					completedDays: week.filter(Boolean).length,
					totalDays: 7,
					weekProgressPercentage:
						(week.filter(Boolean).length / 7) * 100,
				})
			);

			return {
				userId: progress.user._id,
				userName: progress.user.name,
				userEmail: progress.user.email,
				overallProgressPercentage: overallProgressPercentage.toFixed(2),
				weeklyProgress,
			};
		});

		res.status(200).json({
			routineId: routine._id,
			routineTitle: routine.title,
			routineDescription: routine.description,
			routineImage: routine.image,
			routineDuration: routine.duration,
			usersProgress: progressDetails,
		});
	} catch (error) {
		console.error("Error retrieving routine users progress:", error);
		res.status(500).json({
			message:
				"An error occurred while retrieving routine users progress.",
		});
	}
};

// Controller to get progress summary across all routines created by the admin
export const getAdminRoutinesProgressSummary = async (req, res) => {
	try {
		// Find all routines created by the admin
		const adminRoutines = await Routine.find({
			creator: req.user._id,
		});

		// Prepare progress summary for each routine
		const routineProgressSummary = await Promise.all(
			adminRoutines.map(async (routine) => {
				// Find progress entries for this routine
				const usersProgress = await RoutineProgress.find({
					routineId: routine._id,
				}).populate("user", "name");

				// Calculate overall routine statistics
				const userProgressStats = usersProgress.map((progress) => {
					const totalDays = routine.duration * 7;
					const completedDays = progress.progressData
						.flat()
						.filter(Boolean).length;
					return (completedDays / totalDays) * 100;
				});

				return {
					routineId: routine._id,
					routineTitle: routine.title,
					routineDescription: routine.description,
					routineImage: routine.image,
					totalUsers: usersProgress.length,
					averageProgressPercentage:
						userProgressStats.length > 0
							? (
									userProgressStats.reduce(
										(a, b) => a + b,
										0
									) / userProgressStats.length
							  ).toFixed(2)
							: "0.00",
				};
			})
		);

		res.status(200).json({
			totalRoutines: adminRoutines.length,
			routineProgressSummary,
		});
	} catch (error) {
		console.error(
			"Error retrieving admin routines progress summary:",
			error
		);
		res.status(500).json({
			message:
				"An error occurred while retrieving routines progress summary.",
		});
	}
};
