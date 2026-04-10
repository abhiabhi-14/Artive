import { Logo } from "../index";
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
	return (
		<>
			<footer className="footer footer-center p-10 bg-base-200">
				<aside>
					<Logo className={"text-xl"} />
					<p>Copyright © 2024 - All right reserved</p>
				</aside>
				<nav>
					<div className="grid grid-flow-col gap-4">
						<a
							href="https://github.com/devanshgupta08" // Replace with your GitHub profile URL
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-blue-500">
							<FaGithub size={24} className="fill-current" />
						</a>
						<a
							href="https://www.linkedin.com/in/devansh-gupta-236bb7257/" // Replace with your LinkedIn profile URL
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-blue-500">
							<FaLinkedin size={24} className="fill-current" />
						</a>
					</div>
				</nav>
			</footer>
		</>
	);
};

export default Footer;
