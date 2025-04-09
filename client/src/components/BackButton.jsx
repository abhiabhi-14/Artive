import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // Optional icon from react-icons

export default function BackButton({ label = "Go Back", className = "" }) {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate(-1); // Go back to the previous page
	};

	return (
		<button
			onClick={handleBack}
			className={`btn btn-ghost inline-flex items-center gap-2 ${className}`} // Tailwind and DaisyUI classes
		>
			<FaArrowLeft /> {/* Optional back arrow icon */}
			{label}
		</button>
	);
}
