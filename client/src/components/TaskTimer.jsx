import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TaskTimer = ({ duration = 180, onComplete, dayId }) => {
	const [timeLeft, setTimeLeft] = useState(duration);
	const [isRunning, setIsRunning] = useState(false);
	const timerRef = useRef(null);

	useEffect(() => {
		if (isRunning && timeLeft > 0) {
			timerRef.current = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(timerRef.current);
						setIsRunning(false);
						onComplete(dayId);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => clearInterval(timerRef.current);
	}, [isRunning, timeLeft, onComplete, dayId]);

	const toggleTimer = () => setIsRunning(!isRunning);

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${mins}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
	};

	const progressPercentage = () => {
		return ((duration - timeLeft) / duration) * 100;
	};

	return (
		<div className="mt-4 space-y-2">
			<div className="w-full bg-gray-200 rounded-full h-2.5">
				<div
					className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
					style={{ width: `${progressPercentage()}%` }}
				></div>
			</div>
			<div className="flex items-center justify-between">
				<div className="text-sm font-medium text-gray-500">
					{formatTime(timeLeft)}
				</div>
				<button
					onClick={toggleTimer}
					className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition"
				>
					{isRunning ? (
						<Pause className="h-5 w-5 text-blue-600" />
					) : (
						<Play className="h-5 w-5 text-blue-600" />
					)}
				</button>
			</div>
		</div>
	);
};

export default TaskTimer;
