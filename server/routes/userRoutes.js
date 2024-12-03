import { Router } from "express";
import {
	getRoutineProgress,
	markDayCompleted,
	getAllRoutineProgress,
	joinRoutine,
} from "../controllers/UserController.js";
import { auth, isConsumer } from "../middleware/auth.js";

const router = Router();

router.post("/routine/joinRoutine/:routineId", auth, isConsumer, joinRoutine);

router.post(
	"/routine/:routineId/:weekNumber/:dayNumber/:status",
	auth,
	isConsumer,
	markDayCompleted
);

router.get(
	"/routines/getRoutineProgress/:routineId",
	auth,
	isConsumer,
	getRoutineProgress
);

router.get(
	"/routines/getAllRoutineProgress",
	auth,
	isConsumer,
	getAllRoutineProgress
);

export default router;
