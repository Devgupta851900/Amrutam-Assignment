import mongoose from "mongoose";

const routineProgressSchema = new mongoose.Schema({
	routineId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Routine",
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	progressData: {
		type: [[Boolean]],
		default: [],
	},
	totalWeeks: {
		type: Number,
		default: 0,
	},
});

export default mongoose.model("RoutineProgress", routineProgressSchema);
