import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const auth = async (req, res, next) => {
	try {
		const token =
			req.cookies.token ||
			req.body.token ||
			req.header("Authorization").replace("Bearer ", "");

		if (!token) {
			return res
				.status(401)
				.json({ success: false, message: `Token Missing` });
		}

		try {
			const decode = await jwt.verify(token, process.env.JWT_SECRET);
			req.user = decode;
		} catch (error) {
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};
export const isConsumer = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "consumer") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Consumers",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
export const isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
