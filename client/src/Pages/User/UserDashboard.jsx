import { useContext } from "react";
import { AppContext } from "../../utils/contextAPI";
import { NavLink, useNavigate } from "react-router-dom";
import { joinRoutine } from "../../utils/api";
import toast from "react-hot-toast";

const UserDashboard = () => {
	const { userRoutines, suggestedRoutines } = useContext(AppContext);

	const navigate = useNavigate();

	const { setUser, fetchAllRoutines, loading, setLoading } =
		useContext(AppContext);

	const handleJoin = async (routineId) => {
		try {
			setLoading(true);

			// Make the API request to join the routine
			const result = await joinRoutine(routineId);

			// Update `user` in context and localStorage
			const updatedUser = result.data.user;
			setUser(updatedUser);
			localStorage.setItem("user", JSON.stringify(updatedUser));

			// Refetch user routines and suggested routines
			await fetchAllRoutines(updatedUser);

			// Navigate to the joined routine's page
			navigate(`/user/routine/joined/${routineId}`);

			toast.success("You have successfully joined the routine!");
		} catch (error) {
			console.error(
				"An error occurred while joining the routine:",
				error
			);
			toast.error(
				"An unexpected error occurred. Please try again later."
			);
		}
		setLoading(false);
	};

	return (
		<div>
			{!loading && (
				<div className="p-6 pt-24 bg-gray-50 min-h-screen">
					{/* User Progress Section */}
					<h1 className="text-3xl font-extrabold text-gray-800 mb-6">
						Your Progress
					</h1>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{userRoutines?.map((routine, index) => (
							<div
								key={index}
								className="bg-white rounded-xl shadow-md p-6 transition-transform transform hover:scale-105"
							>
								<img
									alt="Routine"
									src={routine?.image}
									className="w-full h-48 object-contain rounded-lg mb-4"
								/>
								<h2 className="text-xl font-semibold text-gray-800 mb-2">
									{routine.title}
								</h2>
								<p className="text-gray-600 text-sm mb-4">
									{routine.description}
								</p>
								<p className="text-gray-700 font-medium mb-2">
									Progress:{" "}
									<span className="text-blue-600">
										{routine?.overallProgress.completedDays}{" "}
										/ {routine?.overallProgress.totalDays}
									</span>
								</p>
								<div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
									<div
										className="absolute top-0 left-0 h-full bg-blue-500"
										style={{
											width: `${routine.overallProgress.progressPercentage}%`,
										}}
									></div>
								</div>
								<p className="text-sm text-gray-600 mb-4">
									{routine.overallProgress.progressPercentage}
									% completed
								</p>

								<NavLink
									to={`/user/routine/joined/${routine.routineId}`}
								>
									<button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
										Continue
									</button>
								</NavLink>
							</div>
						))}
					</div>

					{/* Suggested Routines Section */}
					<h1 className="text-3xl font-extrabold text-gray-800 mt-12 mb-6">
						Available Routines
					</h1>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{suggestedRoutines?.map((routine, index) => (
							<div
								key={index}
								className="bg-white rounded-xl shadow-lg p-6 transition-transform transform hover:scale-105"
							>
								<img
									alt="Routine"
									src={routine?.image}
									className="w-full h-48 object-contain rounded-lg mb-4"
								/>
								<h2 className="text-xl font-semibold text-gray-800 mb-2">
									{routine.title}
								</h2>
								<p className="text-gray-600 text-sm mb-4">
									{routine.description}
								</p>
								<div className="flex justify-between text-gray-700 text-sm mb-2">
									<span className="font-medium">
										Created By:
									</span>
									<span>{routine.creator.name}</span>
								</div>
								<div className="flex justify-between text-gray-700 text-sm mb-4">
									<span className="font-medium">
										Duration:
									</span>
									<span>{routine.duration}</span>
								</div>

								<NavLink
									to={`/user/routine/view/${routine._id}`}
								>
									<button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
										View Details
									</button>
								</NavLink>
								<button
									onClick={() => handleJoin(routine._id)}
									className="px-6 py-2 bg-purple-700 hover:bg-purple-800 transition text-white font-bold rounded-lg shadow-lg"
								>
									Join Routine
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default UserDashboard;
