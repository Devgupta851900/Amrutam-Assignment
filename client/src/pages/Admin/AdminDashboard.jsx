import React, { useContext } from "react";
import { AppContext } from "../../utils/contextAPI";
import { NavLink } from "react-router-dom";
import {
	ChartBarIcon,
	PlusIcon,
	PencilIcon,
	UsersIcon,
	UserRound,
	Loader,
} from "lucide-react";
import { deleteRoutine } from "../../utils/api";
import toast from "react-hot-toast";

const AdminDashboard = () => {
	const { adminRoutineProgressSummary, fetchAdminData, loading, setLoading } =
		useContext(AppContext);

	const handleDelete = async (routineId) => {
		setLoading(true);

		const toastId = toast.loading("Deleting Routine");

		try {
			const confirmation = window.confirm(
				"Are you sure you want to delete this routine?"
			);
			if (!confirmation) return;

			// Call the delete API
			await deleteRoutine(routineId);

			await fetchAdminData();

			toast.success("Routine Deleted successfully");
		} catch (error) {
			toast.error("Error occured while deleting routine");
		}
		toast.dismiss(toastId);
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
		<div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
			{/* Main container with responsive padding and max width */}
			<div className="max-w-7xl mx-auto my-16 sm:mt-12">
				{/* Header - Responsive padding and font sizes */}
				<div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-lg shadow-2xl p-4 sm:p-6 mb-6 sm:mb-10">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
							Admin Dashboard
						</h1>
						<UserRound className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-100" />
					</div>
					<p className="mt-2 text-sm sm:text-base text-white">
						Comprehensive overview of routine progress and user
						engagement
					</p>
				</div>

				{/* Responsive Grid */}
				<div className="grid gap-4 sm:gap-6 grid-cols-1 md:w-[90%] lg:w-full mx-auto lg:grid-cols-3">
					{loading ? (
						<div className="col-span-full flex justify-center items-center py-8">
							<Loader className="animate-spin h-12 w-12 text-blue-500" />
							<div className="animate-pulse text-2xl text-gray-500">
								Loading your routine...
							</div>
						</div>
					) : adminRoutineProgressSummary.length > 0 ? (
						adminRoutineProgressSummary.map((routine) => (
							<div
								key={routine.routineId}
								className="h-[350px] sm:h-[400px] relative rounded-xl overflow-hidden shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
							>
								{/* Background Image */}
								<div
									className="absolute inset-0 bg-cover md:bg-contain lg:bg-cover bg-no-repeat bg-center z-0"
									style={{
										backgroundImage: `url(${routine?.routineImage})`,
										filter: "brightness(0.6)",
									}}
								/>

								{/* Content Container */}
								<div className="relative z-10 p-3 sm:p-4 lg:p-6 h-full bg-gradient-to-t from-black/60 via-black/40 to-transparent rounded-xl">
									<div className="flex flex-col justify-between h-full">
										{/* Stats Section */}
										<div className="space-y-3 sm:space-y-4">
											<div className="bg-white rounded-md shadow-md p-2 sm:p-3">
												<p className="text-gray-800 text-xs sm:text-sm font-medium flex justify-start items-center gap-2">
													<div className="bg-white rounded-full p-1 sm:p-2 shadow-md">
														<UsersIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
													</div>
													<div>
														Total Users:{" "}
														{routine.totalUsers}
													</div>
												</p>
												<p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">
													Average User Progress:{" "}
													{parseInt(
														routine.averageProgressPercentage,
														10
													)}
													%
												</p>
												<div className="relative my-1 h-1 bg-gray-300 rounded-full overflow-hidden">
													<div
														className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
														style={{
															width: `${routine.averageProgressPercentage}%`,
														}}
													/>
												</div>
											</div>
										</div>

										<div>
											<div className="bg-white font-semibold text-xs mb-1 text-gray-800 rounded-full shadow-md p-1 w-fit">
												Duration:{" "}
												{routine.routineDuration} Weeks
											</div>
											{/* Info and Actions Section */}
											<div className="flex flex-col bg-white text-gray-800 rounded-md shadow-md p-2 sm:p-3">
												<div>
													<h2 className="text-lg sm:text-xl font-semibold">
														{routine.routineTitle}
													</h2>
													<p className="text-xs sm:text-sm font-semibold">
														{routine.routineDescription
															.split(".")
															.at(0)}
														.
													</p>
												</div>

												{/* Action Buttons */}
												<div className="flex flex-wrap mt-2 gap-1 sm:gap-2">
													<NavLink
														to={`/admin/routine/summary/${routine.routineId}`}
														className="flex-1 min-w-0"
													>
														<button className="w-full bg-blue-500 text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center gap-1">
															<ChartBarIcon className=" w-4 h-4 aspect-square " />
															<span className="text-xs sm:text-sm">
																Stats
															</span>
														</button>
													</NavLink>

													<button
														onClick={() =>
															handleDelete(
																routine.routineId
															)
														}
														className="flex-1 min-w-0 bg-blue-500 text-white px-2 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 text-xs sm:text-sm"
													>
														Delete
													</button>

													<NavLink
														to={`/admin/routine/view-edit/${routine.routineId}`}
														className="flex-none"
													>
														<button className="h-full bg-blue-500 text-white px-2 sm:px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">
															<PencilIcon className="w-4 h-4" />
														</button>
													</NavLink>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="col-span-full bg-white rounded-xl shadow-lg p-4 sm:p-8 text-center">
							<p className="text-lg sm:text-xl text-gray-700">
								No routine data available
							</p>
						</div>
					)}
				</div>

				{/* Create New Routine Button - Responsive positioning */}
				<div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs sm:max-w-sm">
					<NavLink to="/admin/routine/create" className="block">
						<button className="w-full flex items-center justify-center bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-full shadow-lg hover:scale-105 transition-transform">
							<PlusIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
							<span className="text-sm sm:text-base">
								Create New Routine
							</span>
						</button>
					</NavLink>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
