import React, { useState } from "react";
import RootPage from "../root";
import FileExplorer from "../../components/FileExplorer";
import EditorPane from "../../components/EditorPane";
import FileEditor from "../../components/FileEditor";
import "./home.css";

const HomePage: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<string | null>(null);

	const handleFileSelect = (filePath: string | null) => {
		setSelectedFile(filePath);
	};

	return (
		<RootPage>
			<div className="app-container">
				<FileExplorer onFileSelect={handleFileSelect} />
				<EditorPane />
				<FileEditor selectedFile={selectedFile} />
			</div>
		</RootPage>
	);
};

export default HomePage;
