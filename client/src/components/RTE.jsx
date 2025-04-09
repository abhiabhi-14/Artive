import React,{useEffect} from "react";
import { Editor } from "@tinymce/tinymce-react";


import { Controller } from "react-hook-form";

function RTE({ setIsEditorLoading, name, control, label, defaultValue = "" }) {

	const apiKey = import.meta.env.VITE_TINYMCE_API_KEY;
	const handleEditorLoadContent = () => {
		setIsEditorLoading(false);
	};

	useEffect(() => {
		// Ensure loading state is set to true when component mounts
		setIsEditorLoading(true);
	  }, [setIsEditorLoading]);

	return (
		<div className="w-full">
			{label && <label className="inline-block mb-1 pl-1">{label}</label>}

			<Controller
				name={name || "content"}
				control={control}
				render={({ field: { onChange } }) => (
					<Editor
						apiKey={apiKey}
						initialValue={defaultValue}
						init={{
							initialValue: defaultValue,
							height: 500,
							menubar: true,
							plugins: [
								"image",
								"advlist",
								"autolink",
								"lists",
								"link",
								"image",
								"charmap",
								"preview",
								"anchor",
								"searchreplace",
								"visualblocks",
								"code",
								"fullscreen",
								"insertdatetime",
								"media",
								"table",
								"code",
								"help",
								"wordcount",
								"anchor",
							],
							toolbar:
								"undo redo | blocks | image | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |removeformat | help",
							content_style:
								"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
							setup: (editor) => {
								 editor.on('LoadContent', handleEditorLoadContent); // Set loading state to false on init
							},
						}}
						onEditorChange={onChange}
					/>
				)}
			/>
		</div>
	);
}

export default RTE;
