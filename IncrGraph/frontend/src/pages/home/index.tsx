import React from "react";
import RootPage from "../root";
import FileExplorer from "../../components/FileExplorer";
import EditorPane from "../../components/EditorPane";
import FileEditor from "../../components/FileEditor";
import "./home.css";
import useConfirmDialog from "@components/ConfirmDialog/useConfirmDialog";

const HomePage: React.FC = () => {
	// Variables
    const { openConfirmDialog, ConfirmDialogPortal } = useConfirmDialog();

	return (
		<RootPage>
			<div className="app-container">
				<FileExplorer />
				<EditorPane/>
				<FileEditor
					openConfirmDialog={openConfirmDialog}
				/>
				<ConfirmDialogPortal />
			</div>
		</RootPage>
	);
};

export default HomePage;
