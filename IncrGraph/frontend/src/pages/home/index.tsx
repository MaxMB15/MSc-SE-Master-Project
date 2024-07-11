import React from "react";
import RootPage from "../root";
import FileExplorer from "../../components/FileExplorer";
import EditorPane from "../../components/EditorPane";
import FileEditor from "../../components/FileEditor";
import "./home.css";
import useConfirmDialog from "@components/ConfirmDialog/useConfirmDialog";
import useTextDialog from "@/components/TextDialog/useTextDialog";

const HomePage: React.FC = () => {
	// Variables
    const { openConfirmDialog, ConfirmDialogPortal } = useConfirmDialog();
    const { openTextDialog, TextDialogPortal } = useTextDialog();
	return (
		<RootPage>
			<div className="app-container">
				<FileExplorer openTextDialog={openTextDialog}/>
				<EditorPane/>
				<FileEditor
					openConfirmDialog={openConfirmDialog}
				/>
				<ConfirmDialogPortal />
				<TextDialogPortal />
            </div>
		</RootPage>
	);
};

export default HomePage;
