import React, { useContext } from "react";
import { AppContext } from "../../utils/contextAPI";
import { NavLink } from "react-router-dom";
import { ChartBarIcon, PlusIcon, PencilIcon, UsersIcon } from "lucide-react";
import { deleteRoutine } from "../../utils/api";

const AdminDashboard = () => {
	const { adminRoutineProgressSummary, fetchAdminData, loading } =
		useContext(AppContext);

	const handleDelete = async (routineId) => {
		try {
			const confirmation = window.confirm(
				"Are you sure you want to delete this routine?"
			);
			if (!confirmation) return;

			// Call the delete API
			await deleteRoutine(routineId);

			await fetchAdminData();
		} catch (error) {
			console.error("Error deleting routine:", error);
		}
	};

	return (
		<div className="min-h-screen pt-24 bg-[#F5F5DC] p-8">
			{/* Beige background */}
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-[#F5DEB3] rounded-lg shadow-2xl p-6 mb-10">
					<div className="flex items-center justify-between">
						<h1 className="text-4xl font-extrabold tracking-tight">
							Admin Dashboard
						</h1>
						<ChartBarIcon className="w-12 h-12 text-[#F5DEB3]/70" />
					</div>
					<p className="mt-2 text-[#D2B48C]">
						Comprehensive overview of routine progress and user
						engagement
					</p>
				</div>

				{/* Routine Cards Grid */}
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{loading ? (
						<div className="col-span-full flex justify-center items-center">
							<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#8B4513]"></div>
						</div>
					) : adminRoutineProgressSummary.length > 0 ? (
						adminRoutineProgressSummary.map((routine) => (
							<div
								key={routine.routineId}
								className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-[#D2B48C]"
							>
								{/* Card Image Background */}
								<div className="relative">
									<div
										className="w-full h-48 bg-cover bg-center rounded-t-xl"
										style={{
											backgroundImage: `url(${
												routine.routineImage ||
												"https://via.placeholder.com/350"
											})`,
											backgroundBlendMode: "multiply",
											backgroundColor:
												"rgba(210, 180, 140, 0.3)", // Soft beige overlay
										}}
									>
										<div className="absolute top-4 right-4 bg-white/80 rounded-full p-2 shadow-md">
											<UsersIcon className="w-6 h-6 text-[#8B4513]" />
										</div>
									</div>
								</div>

								{/* Card Content */}
								<div className="p-6 bg-[#F5E6D3]">
									{" "}
									{/* Light beige background */}
									<h3 className="text-2xl font-bold text-[#6B4423] mb-3">
										{routine.routineTitle}
									</h3>
									<div className="space-y-2 mb-4">
										<div className="flex justify-between items-center">
											<span className="text-[#8B4513]">
												Total Users
											</span>
											<span className="font-bold text-[#6B4423]">
												{routine.totalUsers}
											</span>
										</div>

										<div className="w-full bg-[#D2B48C] rounded-full h-2.5">
											<div
												className="bg-[#8B4513] h-2.5 rounded-full"
												style={{
													width: `${routine.averageProgressPercentage}%`,
												}}
											></div>
										</div>

										<div className="flex justify-between items-center">
											<span className="text-[#8B4513]">
												Avg. Progress
											</span>
											<span className="font-bold text-[#6B4423]">
												{
													routine.averageProgressPercentage
												}
												%
											</span>
										</div>
									</div>
									{/* Action Buttons */}
									<div className="flex space-x-3">
										<NavLink
											to={`/admin/routine/summary/${routine.routineId}`}
											className="flex-1"
										>
											<button className="w-full flex items-center justify-center bg-[#8B4513] text-[#F5DEB3] py-2 px-4 rounded-lg hover:bg-[#6B4423] transition-colors">
												<ChartBarIcon className="w-5 h-5 mr-2" />
												Detailed Stats
											</button>
										</NavLink>
										<NavLink
											to={`/admin/routine/view-edit/${routine.routineId}`}
											className="flex-1"
										>
											<button className="bg-[#D2B48C] text-[#6B4423] p-2 rounded-lg hover:bg-[#C0A376] transition-colors">
												<PencilIcon className="w-5 h-5" />
											</button>
										</NavLink>
										<button
											onClick={() =>
												handleDelete(routine.routineId)
											}
											className="bg-[#D2B48C] text-[#6B4423] p-2 rounded-lg hover:bg-[#C0A376] transition-colors"
										>
											Delete
										</button>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="col-span-full bg-[#F5E6D3] rounded-xl shadow-lg p-8 text-center">
							<p className="text-xl text-[#8B4513]">
								No routine data available
							</p>
						</div>
					)}
				</div>

				{/* Create New Routine Button */}
				<div className="mt-8 flex justify-center">
					<NavLink to="/admin/routine/create">
						<button className="flex items-center bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-[#F5DEB3] py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform">
							<PlusIcon className="w-6 h-6 mr-2" />
							Create New Routine
						</button>
					</NavLink>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
