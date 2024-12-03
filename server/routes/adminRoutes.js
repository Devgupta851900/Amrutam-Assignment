import { Router } from "express";
import {
	createRoutine,
	deleteRoutine,
	updateRoutine,
	addWeekToRoutine,
	deleteWeekFromRoutine,
	updateDay,
	updateWeek,
	getRoutineUsersProgress,
	getAdminRoutinesProgressSummary,
} from "../controllers/AdminController.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = Router(); // Create a new router instance

// Routine specific APIs
router.post("/createRoutine", auth, isAdmin, createRoutine);
router.delete(
	"/routines/deleteRoutine/:routineId",
	auth,
	isAdmin,
	deleteRoutine
);
router.put("/routines/updateRoutine/:routineId", auth, isAdmin, updateRoutine);

// Add, Update, delete a specific week APIS
router.post("/routines/addWeek/:routineId", auth, isAdmin, addWeekToRoutine);

router.delete(
	"/routines/deleteWeek/:routineId/:weekNumber",
	auth,
	isAdmin,
	deleteWeekFromRoutine
);

router.put(
	"/routines/updateWeek/:routineId/:weekNumber",
	auth,
	isAdmin,
	updateWeek
);

// Upadte a day of some week
router.put(
	"/routines/updateDay/:routineId/:weekNumber/:dayNumber",
	auth,
	isAdmin,
	updateDay
);

router.get(
	"/routine/getAllUserProgresses/:routineId",
	auth,
	isAdmin,
	getRoutineUsersProgress
);

router.get(
	"/routine/getAdminRoutineProgressSummary/:routineId",
	auth,
	isAdmin,
	getAdminRoutinesProgressSummary
);

export default router;
