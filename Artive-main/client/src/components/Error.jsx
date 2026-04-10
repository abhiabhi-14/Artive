import { useRouteError, Link } from "react-router-dom";

const Error = () => {
	const err = useRouteError();

	return (
		<div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-md text-center">
				<div className="mx-auto h-12 w-12 text-primary" />
				<h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
					Oops, something went wrong!
				</h1>
				<p className="mt-4">
					We're sorry, but the page you were looking for could not be
					found. Please check the URL or try navigating back to the
					homepage.
				</p>
				<div className="mt-6">
					<Link to="/" className="btn btn-primary" >
						Go to Homepage
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Error;
