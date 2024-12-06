import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { validateLogin, validateSignup } from "../utils/zodValidation.js";

dotenv.config();

export const signup = async (req, res) => {
	try {
		let validatedData;
		try {
			validatedData = validateSignup(req.body);
		} catch (error) {
			console.log(error);
			return res.status(400).json({
				errors: error.errors.map((err) => ({
					field: err.path.join("."),
					message: err.message,
				})),
			});
		}

		const { name, email, password, confirmPassword, accountType } =
			validatedData;

		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists. Please sign in to continue.",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
			name,
			email,
			accountType,
			password: hashedPassword,
		});

		user.password = undefined;

		return res.status(200).json({
			success: true,
			message: "User registered successfully",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			error: error.message,
			message: "Something Went Wrong",
		});
	}
};

export const login = async (req, res) => {
	try {
		let validatedData;

		try {
			validatedData = validateLogin(req.body);
		} catch (error) {
			return res.status(400).json({
				errors: error.errors.map((err) => ({
					field: err.path.join("."),
					message: err.message,
				})),
			});
		}

		const { email, password } = validatedData;

		const user = await User.findOne({ email }).populate().exec();

		if (!user) {
			return res.status(401).json({
				success: false,
				message: `User is not Registered with Us Please SignUp to Continue`,
			});
		}

		if (await bcrypt.compare(password, user.password)) {
			const token = jwt.sign(
				{ email: user.email, _id: user._id, role: user.accountType },
				process.env.JWT_SECRET
			);

			// Save token to user document in database
			user.token = token;
			user.password = undefined;
			user.accountType = undefined;
			// Set cookie for token and return success response
			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};
			res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: `User Login Success`,
			});
		} else {
			return res.status(401).json({
				success: false,
				message: `Password is incorrect`,
			});
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: `Login Failure Please Try Again`,
		});
	}
};

// Controller to get user details
export const getUserDetails = async (req, res) => {
	try {
		const userId = req.user._id; // Get the authenticated user's ID from req.user

		// Find the user by their ID and populate the 'routines' field to get the routines they are part of
		const user = await User.findById(userId).populate("routines");

		if (!user) {
			return res.status(404).json({
				message: "User not found.",
			});
		}

		// Respond with user details (excluding sensitive information like password)
		res.status(200).json({
			message: "User details fetched successfully.",
			user: {
				name: user.name,
				email: user.email,
				accountType: user.accountType,
				routines: user.routines.map((routine) => ({
					routineId: routine._id,
					routineTitle: routine.title,
				})),
			},
		});
	} catch (error) {
		console.error("Error fetching user details:", error);
		res.status(500).json({
			message: "An error occurred while fetching user details.",
		});
	}
};
