import React, { useEffect, useState } from "react";
import { allPosts } from "../api/posts";
import { Container, Error, Loading, PostCard } from "../components";
import { useQuery } from "@tanstack/react-query";
import { FaSearch } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";

const AllPost = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const currentPageFromUrl = parseInt(searchParams.get("page") || "1", 10); // Get page from URL
	const [page, setPage] = useState(currentPageFromUrl);
	const limit = 9; // You can adjust this value as needed

	useEffect(() => {
		// Sync the page state with the URL
		setSearchParams({ page });
	}, [page, setSearchParams]);

	const {
		isLoading,
		isError,
		data: response,
		error,
		isPreviousData,
	} = useQuery({
		queryKey: ["posts", page],
		queryFn: () => allPosts(page, limit, true),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 5,
	});

	if (isError) {
		console.error(error);
		return <Error />;
	}

	const { posts, currentPage, totalPages } = response?.data?.data || {};

	return (
		<Container className="my-10">
			<div className="flex justify-center items-center md:hidden">
				<Link to="/search" className="btn btn-primary ">
					<FaSearch className="" />{" "}
				</Link>
			</div>
			<div className="flex justify-center mb-6 relative">
				<button
					onClick={() => setPage((old) => Math.max(old - 1, 1))}
					disabled={page === 1}
					className="btn btn-primary">
					Previous
				</button>
				<span className="px-4 py-2">
					Page {page} of {totalPages}
				</span>
				<button
					onClick={() =>
						setPage((old) =>
							!isPreviousData && old < totalPages ? old + 1 : old
						)
					}
					disabled={page === totalPages}
					className="btn btn-primary">
					Next
				</button>
				<Link
					to="/search"
					className="btn btn-primary absolute top-0 right-20 max-md:hidden">
					<FaSearch />{" "}
				</Link>
			</div>

			{isLoading ? (
				<div className="w-full h-[80vh] flex justify-center items-center">
					<Loading className="w-20" />
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 md:px-10 lg:px-20">
					{posts?.map((post) => (
						<PostCard key={post._id} {...post} className="w-full" />
					))}
				</div>
			)}
		</Container>
	);
};

export default AllPost;
