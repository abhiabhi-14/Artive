import React, { useId } from "react";

const Input = ({ label, type = "text", className = "", ...props }, ref) => {
	const id = useId();
	return (
		<div className="w-full flex flex-col items-start">
			{label && (
				<label className="block mb-1 pl-1" htmlFor={id}>
					{label}
				</label>
			)}
			<input
				type={type}
				className={`input input-bordered w-full ${className}`}
				ref={ref}
				{...props}
				id={id}
			/>
		</div>
	);
};

export default React.forwardRef(Input);
