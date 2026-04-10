import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const PostCard = ({
	title = "Installing React.js with Vite and Tailwind CSS: A Quick and Efficient Guide",
	featuredImage = "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
	timeToRead = 3,
	slug = "contact",
	className=""
}) => {
	const theme = useSelector((state) => state.ui.theme);
	const add = theme === "dark" ? "shadow-lg shadow-gray-700" : "shadow-xl";
	return (
		<Link to={`/post/${slug}`}>
			<div className={`h-[300px] card bg-base-100 ${className} ${add}`}>
				<figure>
					<img className="w-full " src={featuredImage} alt="Shoes" />
				</figure>
				<div className="card-body">
					<h2 className="card-title">{title}</h2>
					<div className="card-actions justify-end">
						<div className="badge badge-primary badge-outline">
							{timeToRead}&nbsp;min read
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default PostCard;
