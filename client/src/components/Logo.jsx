/**
 * v0 by Vercel.
 * @see https://v0.dev/t/oUV4fm1tSpE
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { MountainIcon } from "./icons/icons";


function Logo({ className }) {
	return (
		<div className={`flex gap-1 ${className}`}>
			<MountainIcon className="w-6 h-6" />
			<span>BlogScape</span>
		</div>
	);
}


export default Logo;