// Post.jsx
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import CommentSection from "./CommentSection";

function Post({ post }) {
	return (
		<article className="lg:w-[50%] md:w-[70%] w-[92%]">
			<PostHeader post={post} />
			<PostContent post={post} />
			<CommentSection postId={post._id} />
		</article>
	);
}

export default Post;
