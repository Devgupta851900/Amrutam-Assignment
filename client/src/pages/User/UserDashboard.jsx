import { useContext, useState } from "react";
import { AppContext } from "../../utils/contextAPI";
import { NavLink, useNavigate } from "react-router-dom";
import { joinRoutine } from "../../utils/api";
import toast from "react-hot-toast";
import { Loader, UserRound } from "lucide-react";

const UserDashboard = () => {
	const { userRoutines, suggestedRoutines } = useContext(AppContext);

	const navigate = useNavigate();

	const [loading, setLoading] = useState(false);

	const { setUser, initializeApp } = useContext(AppContext);

	const handleJoin = async (routineId) => {
		try {
			setLoading(true);

			// Make the API request to join the routine
			const result = await joinRoutine(routineId);

			// Update `user` in context and localStorage
			const updatedUser = result.data.user;
			setUser(updatedUser);

			// Refetch user routines and suggested routines
			await initializeApp();

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

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader className="animate-spin h-12 w-12 text-blue-500" />
				<div className="animate-pulse text-2xl text-gray-500">
					Loading your routine...
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-20 px-6">
			{/* User Progress Section */}
			<div className="max-w-7xl mx-auto">
				<div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-lg shadow-2xl p-6 mb-10">
					<div className="flex items-center justify-between">
						<h1 className="text-4xl font-extrabold tracking-tight">
							User Dashboard
						</h1>
						<UserRound className="w-12 h-12 text-white" />
					</div>
					<p className="mt-2 text-white">
						Comprehensive overview of routine progress and user
						engagement
					</p>
				</div>

				<h1 className="text-3xl font-semibold text-gray-800 mb-8 relative">
					Your Progress
					<span className="absolute bottom-0 left-0 w-20 h-1 bg-blue-600"></span>
				</h1>

				{!(userRoutines.length > 0) ? (
					<div className="flex justify-center items-center my-24 w-full text-lg font-bold">
						You haven't joined any routine
					</div>
				) : (
					<div className="grid grid-cols-1 md:w-[90%] mx-auto lg:grid-cols-3 gap-8 ">
						{userRoutines?.map((routine, index) => (
							<div
								key={index}
								className="group h-[400px] relative rounded-xl overflow-hidden shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
							>
								<div
									className="absolute inset-0 bg-cover bg-no-repeat bg-center z-0"
									style={{
										backgroundImage: `url(${routine?.image})`,
										filter: "brightness(0.6)",
									}}
								/>
								<div className="relative z-10 p-6 h-full bg-gradient-to-t from-black/60 via-black/40 to-transparent rounded-xl">
									<div className="flex flex-col justify-between h-full">
										<div>
											<div className="flex flex-col bg-white text-gray-800 rounded-md shadow-md py-3">
												<h2 className="text-xl font-semibold px-3 ">
													{routine.title}
												</h2>
												<p className="text-sm font-semibold px-3   ">
													{routine.description
														.split(".")
														.at(0)}
												</p>
											</div>
											<div className="flex justify-between bg-white self-start mt-1 w-fit px-2 py-1 rounded-2xl text-sm">
												Duration:{" "}
												{routine?.overallProgress
													.totalDays / 7}{" "}
												weeks
											</div>
										</div>

										<div className="space-y-4">
											<div className="bg-white rounded-md shadow-md p-3">
												<p className="text-gray-800 font-medium mb-2 ">
													Progress:{" "}
													<span className="text-blue-400">
														{
															routine
																?.overallProgress
																.completedDays
														}{" "}
														/{" "}
														{
															routine
																?.overallProgress
																.totalDays
														}
													</span>
												</p>
												<div className="relative h-2 bg-gray-300 rounded-full overflow-hidden">
													<div
														className=" absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
														style={{
															width: `${routine.overallProgress.progressPercentage}%`,
														}}
													/>
												</div>
												<p className="text-sm font-semibold text-gray-800 mt-1">
													{
														routine.overallProgress
															.progressPercentage
													}
													% completed
												</p>
											</div>

											<NavLink
												to={`/user/routine/joined/${routine.routineId}`}
											>
												<button className="w-full mt-2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300">
													Continue
												</button>
											</NavLink>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Available Routines Section */}
				<h1 className="text-3xl font-semibold text-gray-800 mt-16 mb-8 relative ">
					Suggested Routines
					<span className="absolute -bottom-1 left-0 w-20 h-1 bg-green-600"></span>
				</h1>

				{!(suggestedRoutines.length > 0) ? (
					<div className="flex justify-center items-center my-24 w-full text-lg font-bold">
						No routines to show at this time
					</div>
				) : (
					<div className="grid grid-cols-1 md:w-[90%] mx-auto lg:grid-cols-3 gap-8  ">
						{suggestedRoutines?.map((routine, index) => (
							<div
								key={index}
								className="group h-[400px] relative rounded-xl overflow-hidden shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
							>
								<div
									className="absolute inset-0 bg-contain bg-no-repeat bg-center z-0"
									style={{
										backgroundImage: `url(${routine?.image})`,
										filter: "brightness(1)",
									}}
								/>
								<div className="relative z-10 p-6 h-full flex flex-col justify-end  bg-gradient-to-t from-black/70 via-black/40 to-transparent rounded-xl">
									<div className="flex flex-col">
										<div className="flex flex-col gap-1 md:flex-row justify-between text-gray-800 my-1 text-sm">
											<div className="flex justify-between bg-white w-fit px-2 py-1 rounded-2xl text-sm">
												Duration: {routine.duration}{" "}
												weeks
											</div>
											<div className="flex justify-between bg-white w-fit px-2 py-1 rounded-2xl text-sm">
												Created By:{" "}
												{routine.creator.name}
											</div>
										</div>

										<div className="flex flex-col bg-white text-gray-800 rounded-md shadow-md py-3">
											<h2 className="text-xl font-semibold px-3 ">
												{routine.title}
											</h2>
											<p className="text-sm font-semibold px-3   ">
												{routine.description
													.split(".")
													.at(0)}
											</p>

											<div className="space-y-3 px-3">
												<div className="grid grid-cols-2 gap-3 mt-4">
													<NavLink
														to={`/user/routine/view/${routine._id}`}
													>
														<button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors duration-300">
															View Details
														</button>
													</NavLink>
													<button
														onClick={() =>
															handleJoin(
																routine._id
															)
														}
														className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors duration-300"
													>
														Join
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default UserDashboard;
