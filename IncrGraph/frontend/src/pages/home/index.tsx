import React, { useRef, useState } from "react";
import RootPage from "../root";
import FileExplorer from "../../components/FileExplorer";
import EditorPane from "../../components/EditorPane";
import FileEditor from "../../components/FileEditor";
import "./home.css";
import useConfirmDialog from "../../components/ConfirmDialog/useConfirmDialog";
import { Item } from "../../types/common";
import { Node, Edge } from "reactflow";


const HomePage: React.FC = () => {
    // Variables
    const { openConfirmDialog, ConfirmDialogPortal } = useConfirmDialog();
    // Refs
	const fileEditorRef = useRef<{ updateModel: (content: string) => void }>(
		null,
	);

    // State
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const [fileContent, setFileContent] = useState<string | null>(null);
    const [isIGCFile, setIsIGCFile] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);

    const [nodes, setNodes] = useState<Node[]>([]);
    // const [edges, setEdges] = useState<Edge[]>([]);

	const handleFileSelect = (filePath: string | null) => {
		setSelectedFile(filePath);
        setFileContent(null);
        setIsIGCFile(filePath !== null && filePath.endsWith(".igc"));
	};
	const pushFileContent = (content: string) => {
		setFileContent(() => content);
	};
	const passIGCFileContent = (
		content: string | null,
	) => {
        // console.log(filePath, content)
        

		return isIGCFile && content !== null ? content : null;
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
					igcContent={passIGCFileContent(fileContent)}
					updateGraphContentFileEditor={updateGraphContentFileEditor}
                    setSelectedItems={setSelectedItems}
                    nodes={nodes}
                    setNodes={setNodes}
				/>
				<FileEditor
					ref={fileEditorRef}
					selectedFile={selectedFile}
					pushFileContent={pushFileContent}
                    openConfirmDialog={openConfirmDialog}
                    isIGCFile={isIGCFile}
                    selectedItems={selectedItems}
                    setNodes={setNodes}
				/>
                <ConfirmDialogPortal />
			</div>
		</RootPage>
	);
};

export default HomePage;
