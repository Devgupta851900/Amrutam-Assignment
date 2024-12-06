import React, { useContext } from "react";
import { AppContext } from "../../utils/contextAPI";
import { NavLink } from "react-router-dom";
import { ChartBarIcon, PlusIcon, PencilIcon, UsersIcon } from "lucide-react";

const AdminDashboard = () => {
	const { adminRoutineProgressSummary, loading } = useContext(AppContext);

	return (
		<div className="min-h-screen pt-24 bg-gray-50 p-8">
			<div className="max-w-7xl mx-auto">
				<div className="bg-gradient-to-r  from-indigo-600 to-purple-600 text-white rounded-lg shadow-2xl p-6 mb-10">
					<div className="flex items-center justify-between">
						<h1 className="text-4xl font-extrabold tracking-tight">
							Admin Dashboard
						</h1>
						<ChartBarIcon className="w-12 h-12 text-white/70" />
					</div>
					<p className="mt-2 text-indigo-100">
						Comprehensive overview of routine progress and user
						engagement
					</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{loading ? (
						<div className="col-span-full flex justify-center items-center">
							<div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
						</div>
					) : adminRoutineProgressSummary.length > 0 ? (
						adminRoutineProgressSummary.map((routine) => (
							<div
								key={routine.routineId}
								className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
							>
								<div className="relative">
									<img
										src={
											routine.routineImage ||
											"https://via.placeholder.com/350"
										}
										alt={routine.routineTitle}
										className="w-full h-48 object-cover rounded-t-xl"
									/>
									<div className="absolute top-4 right-4 bg-white/80 rounded-full p-2 shadow-md">
										<UsersIcon className="w-6 h-6 text-indigo-600" />
									</div>
								</div>

								<div className="p-6">
									<h3 className="text-2xl font-bold text-gray-800 mb-3">
										{routine.routineTitle}
									</h3>

									<div className="space-y-2 mb-4">
										<div className="flex justify-between items-center">
											<span className="text-gray-600">
												Total Users
											</span>
											<span className="font-bold text-indigo-600">
												{routine.totalUsers}
											</span>
										</div>

										<div className="w-full bg-gray-200 rounded-full h-2.5">
											<div
												className="bg-indigo-600 h-2.5 rounded-full"
												style={{
													width: `${routine.averageProgressPercentage}%`,
												}}
											></div>
										</div>

										<div className="flex justify-between items-center">
											<span className="text-gray-600">
												Avg. Progress
											</span>
											<span className="font-bold text-indigo-600">
												{
													routine.averageProgressPercentage
												}
												%
											</span>
										</div>
									</div>

									<div className="flex space-x-3">
										<NavLink
											to={`/admin/routine/summary/${routine.routineId}`}
											className="flex-1"
										>
											<button className="w-full flex items-center justify-center bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors">
												<ChartBarIcon className="w-5 h-5 mr-2" />
												Detailed Stats
											</button>
										</NavLink>
										<NavLink
											to={`/admin/routine/view-edit/${routine.routineId}`}
											className="flex-1"
										>
											<button className="bg-yellow-400 text-black p-2 rounded-lg hover:bg-yellow-500 transition-colors">
												<PencilIcon className="w-5 h-5" />
											</button>
										</NavLink>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="col-span-full bg-white rounded-xl shadow-lg p-8 text-center">
							<p className="text-xl text-gray-500">
								No routine data available
							</p>
						</div>
					)}
				</div>

				<div className="mt-8 flex justify-center">
					<NavLink to="/admin/routine/create">
						<button className="flex items-center bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform">
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
