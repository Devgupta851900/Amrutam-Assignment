import { z } from "zod";

export const validateRoutineCreationSchema = z.object({
	title: z.string().trim().min(1, "Title is required"), // Validates non-empty string
	description: z.string().trim().min(1, "Description is required"), // Validates non-empty string
	duration: z.number({ invalid_type_error: "Duration must be a number" }), // Validates numeric input
	data: z.unknown().optional(), // Optional field that allows any value
});

export const validateRoutineCreation = (data) => {
	return validateRoutineCreationSchema.parse(data);
};

export const loginSchema = z.object({
	email: z.string().trim().email("Invalid Email Address"),
	password: z.string().trim().min(8, "Password must be atleast 8 characters"),
});

export const validateLogin = (data) => {
	return loginSchema.parse(data);
};

export const signupSchema = z
	.object({
		name: z.string().trim().min(1, "Name is required"),
		email: z.string().trim().email("Invalid Email Address"),
		password: z
			.string()
			.trim()
			.min(8, "Password must be at least 8 characters"),
		confirmPassword: z
			.string()
			.trim()
			.min(8, "Password must be at least 8 characters"),
		accountType: z.enum(["admin", "consumer"], {
			errorMap: () => ({ message: "Invalid account type" }),
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export const validateSignup = (data) => {
	return signupSchema.parse(data);
};
