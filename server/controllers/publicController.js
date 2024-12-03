import Routine from "../models/Routine.js";

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
		console.error("Error retrieving routine:", error);
		res.status(500).json({
			message: "An error occurred while retrieving the routine.",
		});
	}
};

export const getAllRoutines = async (req, res) => {
	try {
		// Fetch all routines from the database
		const routines = await Routine.find();

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
