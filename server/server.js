import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import { DBconnect } from "./config/database.js";
import { cloudinaryConnect } from "./config/cloudinary.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { auth } from "./middleware/auth.js";
import { login, signup, getUserDetails } from "./controllers/AuthController.js";
import { getRoutine, getAllRoutines } from "./controllers/publicController.js";

const app = express();

dotenv.config();

app.use(
	cors({
		origin: "*",
		credentials: true,
	})
);

app.use(express.json());

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: "/tmp/",
	})
);

app.use(cookieParser());

const PORT = process.env.PORT || 4000;

cloudinaryConnect();

DBconnect();

app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: `Your server is running at port ${PORT}`,
	});
});

app.post("/api/v1/auth/login", login);
app.post("/api/v1/auth/signup", signup);
app.get("/api/v1/auth/getUserDetails", auth, getUserDetails);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.get("/api/v1/getRoutine/:routineId", getRoutine);
app.get("/api/v1/getAllRoutines", getAllRoutines);

app.listen(PORT, () => {
	console.log(`App is running at port ${PORT}`);
});
