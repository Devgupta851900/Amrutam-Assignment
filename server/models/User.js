import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		default: "",
	},
	accountType: {
		type: String,
		enum: ["consumer", "admin"],
	},
	routines: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Routine",
		},
	],
	routineProgress: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "RoutineProgress",
		},
	],
});

export default mongoose.model("User", userSchema);
