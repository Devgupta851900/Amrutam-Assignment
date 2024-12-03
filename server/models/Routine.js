import mongoose, { Mongoose } from "mongoose";

const routineSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		index: true,
	},
	description: {
		type: String,
		required: true,
		trim: true,
	},
	users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	duration: {
		type: Number,
		required: true,
		min: 1,
	},
	data: {
		type: mongoose.Schema.Types.Mixed,
		default: {},
	},
});

export default mongoose.model("Routine", routineSchema);
