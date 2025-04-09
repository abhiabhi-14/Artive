import React from "react";
import { Post as PostComponent,Loading,Error, Container} from "../components";
import { getPost } from "../api/posts";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

const Post = () => {

    const { slug } = useParams();

	const {
		isLoading,
		isError,
		data: response,
		error,
	} = useQuery({
		queryKey: ["post", slug],
		queryFn: () => getPost(slug),
		staleTime: 1000 * 60 * 5,
	});

	if (isLoading) {
		return (
			<div className="w-full h-[80vh] flex justify-center items-center">
				<Loading className="w-20" />
			</div>
		);
	}
	if (isError) {
		console.error(error);
		return <Error />;
	}

	const post = response?.data?.data?.[0];
	return (
		<Container className="flex flex-col items-center my-10">
			<PostComponent  post={post}  />
		</Container>
	);
};

export default Post;
