import React, { useEffect, useState } from "react";
import RootPage from "../root";
import FileExplorer from "../../components/FileExplorer";
import EditorPane from "../../components/EditorPane";
import FileEditor from "../../components/FileEditor";
import "./home.css";
import useConfirmDialog from "@components/ConfirmDialog/useConfirmDialog";
import useTextDialog from "@/components/TextDialog/useTextDialog";
import { useComponentRegistry } from "@/hooks/useComponentRegistry";
import LoadingScreen from "@/components/LoadingScreen";
import { fetchAndRegisterComponents,} from "@/utils/componentCache";

const HomePage: React.FC = () => {
	// Variables
	const { openConfirmDialog, ConfirmDialogPortal } = useConfirmDialog();
	const { openTextDialog, TextDialogPortal } = useTextDialog();

	const [isLoading, setIsLoading] = useState(true);
	const { registerComponent } = useComponentRegistry();

	useEffect(() => {
        fetchAndRegisterComponents(registerComponent).then(() => {
            setIsLoading(false); // Components loaded, hide loading screen
        });
	}, []);

	// For importing and categorizing components
	if (isLoading) {
		return <LoadingScreen />;
	}

	return (
		<RootPage>
			<div className="app-container">
				{isLoading ? (
					<LoadingScreen />
				) : (
					<>
						<FileExplorer openTextDialog={openTextDialog} />
						<EditorPane />
						<FileEditor openConfirmDialog={openConfirmDialog} />
						<ConfirmDialogPortal />
						<TextDialogPortal />
					</>
				)}
			</div>
		</RootPage>
	);
};

export default HomePage;
