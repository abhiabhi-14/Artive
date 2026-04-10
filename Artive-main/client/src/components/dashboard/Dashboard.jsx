import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "../../api/dashboard";
import { Loading } from "../index.js";
import { FaUser, FaCommentDots, FaFileAlt } from "react-icons/fa"; // Import icons

function Dashboard() {
	let {
		isLoading,
		isError,
		data: response,
		error,
	} = useQuery({
		queryKey: ["dashboard"],
		queryFn: fetchDashboardData,
	});
	response = response?.data?.data;

	if (isLoading) {
		return (
			<div className="w-full h-[80vh] flex justify-center items-center">
				<Loading className="w-20" />
			</div>
		);
	}

	if (isError) {
		console.error(error);
		return <div>Error loading data...</div>;
	}

	const { userCount, commentCount, postCount, recentUsers, recentComments, recentPosts } = response;

	return (
		<div className="p-4">
			<h1 className="text-3xl font-bold mb-6">Dashboard</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="card bg-base-100 shadow-xl">
					<div className="card-body flex items-center space-x-4">
						<FaUser className="text-4xl text-blue-500" />
						<div className="flex flex-col items-center">
							<div className="stat-title text-lg">Total Users</div>
							<div className="stat-value text-2xl">{userCount}</div>
						</div>
					</div>
				</div>

				<div className="card bg-base-100 shadow-xl">
					<div className="card-body flex items-center space-x-4">
						<FaCommentDots className="text-4xl text-green-500" />
						<div className="flex flex-col items-center">
							<div className="stat-title text-lg">Total Comments</div>
							<div className="stat-value text-2xl">{commentCount}</div>
						</div>
					</div>
				</div>

				<div className="card bg-base-100 shadow-xl">
					<div className="card-body flex items-center space-x-4">
						<FaFileAlt className="text-4xl text-purple-500" />
						<div className="flex flex-col items-center">
							<div className="stat-title text-lg">Total Posts</div>
							<div className="stat-value text-2xl">{postCount}</div>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-8 grid grid-cols-1 gap-6">
				<div className="card bg-base-100 shadow-xl">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">Recent Users</h2>
						<ul className="list-disc pl-5">
							{recentUsers.map((user) => (
								<li key={user._id} className="mb-2">
									<span className="font-semibold">{user.username}</span> - {user.email}
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="card bg-base-100 shadow-xl">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">Recent Comments</h2>
						<ul className="list-disc pl-5">
							{recentComments.map((comment) => (
								<li key={comment._id} className="mb-2">
									<span className="font-semibold">{comment.username}</span>: {comment.content}{" "}
									on "<span className="italic">{comment.postTitle}</span>"
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="card bg-base-100 shadow-xl">
					<div className="card-body">
						<h2 className="card-title text-xl mb-4">Recent Posts</h2>
						<ul className="list-disc pl-5">
							{recentPosts.map((post) => (
								<li key={post._id} className="mb-2">
									<span className="font-semibold">{post.title}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
