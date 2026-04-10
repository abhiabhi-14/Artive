import { Link } from "react-router-dom";

const Unauthorized = () => {

	return (
		<div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-md text-center">
				<div className="mx-auto h-12 w-12 text-warn" />{" "}
				{/* Use a warning color */}
				<h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
					Unauthorized Access!
				</h1>
				<p className="mt-4">
					You are not authorized to view this page. Please{" "}
					<Link to="/login" className="text-warn underline">
						login
					</Link>{" "}
					or contact the administrator.
				</p>
				<div className="mt-6">
					<Link
						to="/"
						className="btn btn-primary">
						Go to Homepage
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Unauthorized;
