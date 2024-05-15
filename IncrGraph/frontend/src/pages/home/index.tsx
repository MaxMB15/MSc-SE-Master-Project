import React from "react";
import RootPage from "../root";
import FileExplorer from "../../components/FileExplorer";
import EditorPane from "../../components/EditorPane";
import FileEditor from "../../components/FileEditor";
import "./home.css";

const HomePage: React.FC = () => {
	return (
		<RootPage>
			<div className="app-container">
				<FileExplorer />
				<EditorPane />
				<FileEditor />
			</div>
		</RootPage>
	);
};

export default HomePage;
