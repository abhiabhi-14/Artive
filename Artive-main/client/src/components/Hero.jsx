import { useEffect } from "react";
import { Link } from "react-router-dom";
import { GoArrowRight } from "react-icons/go";
import Container from "./Container";
import { useSelector } from "react-redux";
import lightImage from "/hero-bg-light.jpg";
import darkImage from "/hero-bg-dark.jpg";

const Hero = () => {
	const theme = useSelector((state) => state.ui.theme);
	const status = useSelector((state) => state.auth.status);
	const image = theme === "light" ? lightImage : darkImage;

	// Preload images
	useEffect(() => {
		const preloadImages = [lightImage, darkImage];
		preloadImages.forEach((src) => {
			const img = new Image();
			img.src = src;
		});
	}, []);

	return (
		<section
			className="w-screen h-screen bg-cover bg-center py-20 md:py-32 lg:py-40 relative"
			style={{ backgroundImage: `url(${image})` }}>
			{/* Background overlay */}
			<div className="top-0 left-0 w-full h-full absolute z-1 bg-gradient-to-b from-base-100 via-transparent to-base-200">
				<Container className="flex flex-col items-center">
					{!status && (
						<div
							role="alert"
							className="alert alert-info opacity-75 mt-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								className="h-6 w-6 shrink-0 stroke-current">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<span>Login to see posts</span>
						</div>
					)}
					<div className="container px-4 md:px-6">
						<div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
							<div className="space-y-4 mt-20">
								<h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl lg:text-7xl">
									BlogScape
								</h1>
								<p className="max-w-[700px] text-lg text-primary-foreground md:text-xl">
									Explore a world of insights, stories, and
									perspectives from my diverse
									experiences.
								</p>
								{status && (
									<Link
										className="btn btn-primary"
										to="/all-posts">
										Explore Blog
										<GoArrowRight />
									</Link>
								)}
							</div>
						</div>
					</div>
				</Container>
			</div>
		</section>
	);
};

export default Hero;
