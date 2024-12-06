import Routine from "../models/Routine.js";
import User from "../models/User.js";
import RoutineProgress from "../models/RoutineProgress.js";

// Allow user to join a routine
export const joinRoutine = async (req, res) => {
	try {
		const { routineId } = req.params; // Get routine ID from request parameters
		const userId = req.user._id; // Assuming user is authenticated and their ID is available in req.user

		// Find the routine by ID
		const routine = await Routine.findById(routineId);

		if (!routine) {
			return res.status(404).json({
				message: "Routine not found.",
			});
		}

		// Check if the user is already part of the routine
		if (routine.users.includes(userId)) {
			return res.status(400).json({
				message: "User is already part of the routine.",
			});
		}

		// Use findOneAndUpdate to add the user to the routine's users array
		const updatedRoutine = await Routine.findOneAndUpdate(
			{ _id: routineId, users: { $ne: userId } },
			{ $push: { users: userId } },
			{ new: true, runValidators: true }
		);

		if (!updatedRoutine) {
			return res.status(404).json({
				message:
					"Routine not found or user is already part of the routine.",
			});
		}

		// Also add the routine to the user's routines array if the user is a 'consumer'
		const user = await User.findById(userId);
		if (user.accountType === "consumer") {
			await User.findOneAndUpdate(
				{ _id: userId },
				{ $push: { routines: routineId } },
				{ new: true, runValidators: true }
			);
		}

		// Create the initial progressData array (weeks x 7, all set to false)
		const weeks = routine.data.weeks || []; // assuming routine has a weeks array
		const progressData = Array(weeks.length)
			.fill()
			.map(() => Array(7).fill(false)); // weeks x 7, initially false

		// Create the RoutineProgress object
		const routineProgress = new RoutineProgress({
			routineId,
			user: userId,
			progressData,
		});
		await routineProgress.save();

		// Add the routineProgress to the routine's routineProgress array
		await Routine.findByIdAndUpdate(
			routineId,
			{ $push: { routineProgress: routineProgress._id } },
			{ new: true }
		);

		// Add routine progress to user's routineProgress array
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ $push: { routineProgress: routineProgress._id } },
			{ new: true }
		);

		// Add the routineProgress to the creator's routineProgress array
		await User.findByIdAndUpdate(
			routine.creator,
			{ $push: { routineProgress: routineProgress._id } },
			{ new: true }
		);

		// Respond with success message and routine progress
		res.status(200).json({
			message: "User successfully joined the routine.",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error joining routine:", error);
		res.status(500).json({
			message: "An error occurred while adding the user to the routine.",
		});
	}
};

// Mark a day as completed or incompleted
export const markDayCompleted = async (req, res) => {
	try {
		const { routineId, weekNumber, dayNumber, status } = req.params; // Get routineId, weekIndex (zero-based), dayNumber (1-7), and status
		const userId = req.user._id; // Assuming user is authenticated and their ID is available in req.user

		const weekIndex = weekNumber - 1;
		const dayIndex = dayNumber - 1;

		// Validate the status (it should be either true or false)
		if (status !== "true" && status !== "false") {
			return res.status(400).json({
				message:
					"Status should be either 'true' for completed or 'false' for incomplete.",
			});
		}

		// Find the routine by ID
		const routine = await Routine.findById(routineId);

		if (!routine) {
			return res.status(404).json({
				message: "Routine not found.",
			});
		}

		if (!routine.users.includes(userId)) {
			return res.status(400).json({
				message: "User is not the part of the routine.",
			});
		}

		// Ensure the weekIndex is valid
		if (weekIndex < 0 || weekIndex >= routine.data.weeks.length) {
			return res.status(400).json({
				message: `Week index ${weekIndex} is out of range.`,
			});
		}

		// Ensure the dayNumber is valid (1-7)
		if (dayNumber < 1 || dayNumber > 7) {
			return res.status(400).json({
				message: "Day number must be between 1 and 7.",
			});
		}

		// Find the routine progress entry for the user
		const routineProgress = await RoutineProgress.findOneAndUpdate(
			{
				routineId,
				user: userId,
			},
			{
				$set: {
					[`progressData.${weekIndex}.${dayIndex}`]:
						status === "true" ? true : false,
				},
			},
			{ new: true, runValidators: true }
		);

		// Respond with the updated routine progress
		res.status(200).json({
			message: `Day ${dayNumber} in Week ${weekIndex + 1} marked as ${
				status === "true" ? "completed" : "incomplete"
			}.`,
			routineProgress,
		});
	} catch (error) {
		console.error("Error marking day completed/incompleted:", error);
		res.status(500).json({
			message: "An error occurred while updating the day's progress.",
		});
	}
};

// overall progress of a specific routine
export const getRoutineProgress = async (req, res) => {
	try {
		const { routineId } = req.params; // Get routineId from request parameters
		const userId = req.user._id; // Assuming user is authenticated and their ID is available in req.user

		// Find the routine progress for the user
		const routineProgress = await RoutineProgress.findOne({
			routineId,
			user: userId,
		});

		if (!routineProgress) {
			return res.status(404).json({
				message: "Routine progress not found for the user.",
			});
		}

		// Fetch the routine details to get the number of weeks
		const routine = await Routine.findById(routineId);
		if (!routine) {
			return res.status(404).json({
				message: "Routine not found.",
			});
		}

		const weeks = routine.data.weeks || []; // Assuming weeks data exists in routine.data
		let totalDays = 0;
		let completedDays = 0;

		const weekProgress = weeks.map((week, weekIndex) => {
			const dailyProgress = routineProgress.progressData[weekIndex];

			let weekCompletedDays = 0;
			const dayStatus = dailyProgress.map((dayStatus, dayIndex) => {
				totalDays++;
				if (dayStatus) {
					completedDays++;
					weekCompletedDays++;
				}
				return {
					[`${dayIndex}`]: dayStatus ? true : false,
				};
			});

			const weekCompletionPercentage = dailyProgress.length
				? ((weekCompletedDays / dailyProgress.length) * 100).toFixed(2)
				: 0;

			return {
				weekNumber: weekIndex + 1,
				weekTitle: week.weekTitle || `Week ${weekIndex + 1}`,
				dailyStatus: dayStatus,
				weekCompletionPercentage,
			};
		});

		// Calculate overall progress: Percentage of days completed out of total days
		const progressPercentage =
			totalDays > 0 ? ((completedDays / totalDays) * 100).toFixed(2) : 0;

		// Respond with detailed progress for each week, each day, and overall progress
		res.status(200).json({
			message: "Routine progress fetched successfully.",
			routineId,
			userId,
			weekProgress,
			overallProgress: {
				totalDays,
				completedDays,
				progressPercentage,
			},
		});
	} catch (error) {
		console.error("Error fetching routine progress:", error);
		res.status(500).json({
			message: "An error occurred while fetching the routine progress.",
		});
	}
};

// Controller to get user's progress for each routine joined
export const getAllRoutineProgress = async (req, res) => {
	try {
		const userId = req.user._id; // Get the authenticated user's ID from req.user

		// Fetch the user to get the routines they've joined
		const user = await User.findById(userId).populate("routines");
		if (!user) {
			return res.status(404).json({
				message: "User not found.",
			});
		}

		const userRoutines = user.routines;

		// If the user has no routines, return an empty response
		if (userRoutines.length === 0) {
			return res.status(200).json({
				message: "User has not joined any routines.",
				routinesProgress: [],
			});
		}

		// For each routine, fetch the progress and calculate overall progress
		const routinesProgress = await Promise.all(
			userRoutines.map(async (routine) => {
				// Fetch the progress data for the routine and user
				const routineProgress = await RoutineProgress.findOne({
					routineId: routine._id,
					user: userId,
				});

				if (!routineProgress) {
					return {
						routineId: routine._id,
						title: routine.title,
						description: routine.description,
						overallProgress: {
							totalDays: 0,
							completedDays: 0,
							progressPercentage: 0,
						},
					};
				}

				// Fetch the routine's weeks data
				const weeks = routine.data.weeks || []; // assuming routine has a weeks array
				let totalDays = 0;
				let completedDays = 0;

				// Calculate total and completed days
				weeks.forEach((week, weekIndex) => {
					const dailyProgress =
						routineProgress.progressData[weekIndex];

					dailyProgress.forEach((dayStatus) => {
						totalDays++;
						if (dayStatus) completedDays++;
					});
				});

				// Calculate overall progress: Percentage of days completed out of total days
				const progressPercentage =
					totalDays > 0
						? ((completedDays / totalDays) * 100).toFixed(2)
						: 0;

				return {
					routineId: routine._id,
					title: routine.title,
					description: routine.description,
					image: routine.image,
					overallProgress: {
						totalDays,
						completedDays,
						progressPercentage,
					},
				};
			})
		);

		// Respond with the overall progress of all routines
		res.status(200).json({
			message: "User's routine progress fetched successfully.",
			routinesProgress,
		});
	} catch (error) {
		console.error("Error fetching all routine progress:", error);
		res.status(500).json({
			message:
				"An error occurred while fetching the routine progress for all routines.",
		});
	}
};
