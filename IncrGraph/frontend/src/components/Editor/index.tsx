import React from "react";
import MonacoEditor from "react-monaco-editor";

interface EditorProps {
	language: string;
	code: string;
	onChange: (newValue: string) => void;
}

const Editor: React.FC<EditorProps> = ({ language, code, onChange }) => {
	const editorOptions = {
		selectOnLineNumbers: true,
		roundedSelection: false,
		readOnly: false,
		automaticLayout: false,
	};

	return (
		<MonacoEditor
			width="100%"
			height="400"
			language={language}
			theme="vs-dark"
			value={code}
			options={{
				...editorOptions,
				cursorStyle: "line",
			}}
			onChange={onChange}
		/>
	);
};

export default Editor;
