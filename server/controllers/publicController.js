import Routine from "../models/Routine.js";
import User from "../models/User.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";

export const getRoutine = async (req, res) => {
	try {
		const { routineId } = req.params;

		if (!routineId) {
			return res.status(404).json({
				success: false,
				message: "Routine id is required",
			});
		}

		const routine = await Routine.findById(routineId).populate({
			path: "creator",
			select: "name",
		});

		routine.users = undefined;

		if (!routine) {
			return res.status(404).json({
				message: "Routine not found.",
			});
		}

		res.status(200).json({
			message: "Routine retrieved successfully.",
			routine,
		});
	} catch (error) {
		res.status(500).json({
			message: "An error occurred while retrieving the routine.",
		});
	}
};

export const getAllRoutines = async (req, res) => {
	try {
		// Fetch all routines from the database
		const routines = await Routine.find().populate("creator", "name");

		routines.forEach((routine) => {
			routine.data = undefined;
			routine.users = undefined;
			routine.creator._id = undefined;
		});

		if (!routines || routines.length === 0) {
			return res.status(404).json({
				message: "No routines found.",
			});
		}

		res.status(200).json({
			message: "Routines retrieved successfully.",
			routines,
		});
	} catch (error) {
		console.error("Error fetching routines:", error);
		res.status(500).json({
			message: "An error occurred while retrieving the routines.",
			error: error.message,
		});
	}
};

export const updateDisplayPicture = async (req, res) => {
	try {
		// Make sure imageUrl exists in the request body
		if (!req.body.imageUrl) {
			return res.status(400).json({
				success: false,
				message: "No image URL provided.",
			});
		}

		const imageUrl = req.body.imageUrl;
		const userId = req.user._id;

		// Find the user in the database
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found.",
			});
		}

		// Update the user's display picture with the Cloudinary URL
		user.image = imageUrl;
		await user.save();

		// Respond with success and updated user data
		return res.status(200).json({
			success: true,
			message: "Image updated successfully.",
			data: user,
		});
	} catch (error) {
		// Log the error for debugging
		console.error("Error updating display picture:", error);

		// Respond with a proper error message
		return res.status(500).json({
			success: false,
			message: error.message || "Internal server error.",
		});
	}
};
