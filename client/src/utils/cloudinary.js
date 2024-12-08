import axios from "axios";

export const uploadToCloudinary = async (file) => {
	const CLOUDINARY_UPLOAD_URL =
		"https://api.cloudinary.com/v1_1/dlj2flmvh/image/upload"; // Replace with your Cloudinary URL
	const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Replace with your upload preset

	const formData = new FormData();
	formData.append("file", file);
	formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

	try {
		const response = await axios.post(CLOUDINARY_UPLOAD_URL, formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});

		// Cloudinary returns the image's secure URL
		return response.data.secure_url;
	} catch (error) {
		console.error("Error uploading to Cloudinary:", error);
		throw new Error("Failed to upload image to Cloudinary.");
	}
};
