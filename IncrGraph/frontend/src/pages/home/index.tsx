import React, { useRef, useState } from "react";
import RootPage from "../root";
import FileExplorer from "../../components/FileExplorer";
import EditorPane from "../../components/EditorPane";
import FileEditor from "../../components/FileEditor";
import "./home.css";

const HomePage: React.FC = () => {
	const fileEditorRef = useRef<{ updateModel: (content: string) => void }>(
		null,
	);

	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [fileContent, setFileContent] = useState<string | null>(null);

	const handleFileSelect = (filePath: string | null) => {
		setSelectedFile(filePath);
	};
	const pushFileContent = (content: string) => {
		setFileContent(() => content);
	};
	const passIGCFileContent = (
		filePath: string | null,
		content: string | null,
	) => {
		return filePath && filePath.endsWith(".igc") ? content : null;
	};

	const updateGraphContentFileEditor = (content: string) => {
		if (fileEditorRef.current) {
			fileEditorRef.current.updateModel(content);
		}
	};

	return (
		<RootPage>
			<div className="app-container">
				<FileExplorer onFileSelect={handleFileSelect} />
				<EditorPane
					igcContent={passIGCFileContent(selectedFile, fileContent)}
					updateGraphContentFileEditor={updateGraphContentFileEditor}
				/>
				<FileEditor
					ref={fileEditorRef}
					selectedFile={selectedFile}
					pushFileContent={pushFileContent}
				/>
			</div>
		</RootPage>
	);
};

export default HomePage;
