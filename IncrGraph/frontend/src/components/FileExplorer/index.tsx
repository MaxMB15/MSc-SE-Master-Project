import React, { useEffect, useState } from "react";
import AddFileIcon from "@mui/icons-material/NoteAdd";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FileNode, GetFileTreeRequest } from "shared";
import { useAxiosRequest } from "../../utils/requests";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import styles from "./FileExplorer.module.css";
import useStore from "@/store/store";
import ConfigurationOverview from "../ConfigurationOverview";
import path from "path-browserify";
import ContextMenu from "./components/ContextMenu";
import TreeView from "../TreeView";
import { createEmptyIGCFile, createNewDirectory, createNewFile, deleteFileOrDirectory, getFileContent, renameFileOrDirectory } from "@/requests";
import { isValidIGC } from "@/IGCItems/utils/serialization";

interface FileExplorerProps {
	openTextDialog: (defaultName: string) => Promise<string | null>;
}
type ContextMenuState = {
	mouseX: number;
	mouseY: number;
} | null;

const FileExplorer: React.FC<FileExplorerProps> = ({ openTextDialog }) => {
	// VARIABLES
	const { response, error, loading, sendRequest } = useAxiosRequest<
        GetFileTreeRequest,
		FileNode[]
	>();

	const { setSelectedFile, projectDirectory } = useStore(); // Variables from data store

	// STATE
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [width, setWidth] = useState(300);
	const [currentDir, setCurrentDir] = useState<string | null>(null);
	const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
	const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
	const [tree, setTree] = useState<FileNode[]>([]);
	const [treeItemEditing, setTreeItemEditing] = useState<string | null>(null);
    const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set<string>());


	const refreshFileTree = () => {
		if (!projectDirectory) return;
		sendRequest({
			method: "GET",
			route: "/api/file-explorer/file-tree",
			data: { path: projectDirectory },
			useJWT: false,
		}).then((response) => {
			setTree(response);
		});
	};

	useEffect(() => {
		refreshFileTree();
		setCurrentDir(() => projectDirectory);
	}, [projectDirectory]);

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	const handleNodeSelect = (node: FileNode) => {
		setSelectedNode(node);
		if (node.type === "file") {
			setSelectedFile(() => node.fullPath);
		}
	};

	const handleNodeRename = async (node: FileNode, newName: string) => {
		if (!selectedNode) return;
        if (newName === "") return;

		const updatedNode = { ...selectedNode, name: newName };
		console.log(`Renaming ${selectedNode.fullPath} to ${newName}`);
        const newPath = path.join(path.dirname(node.fullPath), newName)
        await renameFileOrDirectory(node.fullPath, newPath);

		setTree((prevTree) =>
			prevTree.map((n) =>
				n.fullPath === updatedNode.fullPath ? updatedNode : n,
			),
		);
        // Check if the new file is an igc file or if it does not decode to a proper json
        if (newName.endsWith(".igc")) {
            // Get file content
            const fileContent = await getFileContent(newPath);
            if(!isValidIGC(fileContent.content)){
                // Create an empty igc file
                console.log(`Creating empty IGC file ${newPath}`);
                await createEmptyIGCFile(newPath);
            }
        }

        // Refresh the file tree
        refreshFileTree();
	};
    const handleDelete = async (node: FileNode | null) => {
        if(node === null) return;
        console.log(`Deleting ${node.fullPath}`);
        await deleteFileOrDirectory(node.fullPath);
        setTree((prevTree) =>
            prevTree.filter((n) => n.fullPath !== node.fullPath),
        );
    }

	const handleNodeContextMenu = (event: React.MouseEvent, node: FileNode) => {
		event.preventDefault();
		setContextMenu({
			mouseX: event.clientX - 2,
			mouseY: event.clientY - 4,
		});
		setSelectedNode(node);
        refreshFileTree();
	};

	const handleClose = () => {
		setContextMenu(null);
	};

	const createNewFileHandler = async () => {
        if (projectDirectory === null) return;
        let dirPath = projectDirectory;
        if(selectedNode !== null){
            dirPath = selectedNode.type === "directory" ? selectedNode.fullPath : path.dirname(selectedNode.fullPath);
        }

		const newFilePath = path.join(dirPath, "New File");
		await createNewFile(newFilePath);

		refreshFileTree();
		setTreeItemEditing(newFilePath); // Enable renaming immediately
    };

    const createNewDirectoryHandler = async () => {
		if (projectDirectory === null) return;
        let dirPath = projectDirectory;
        if(selectedNode !== null){
            dirPath = selectedNode.type === "directory" ? selectedNode.fullPath : path.dirname(selectedNode.fullPath);
        }

		const newDirPath = path.join(dirPath, "New Folder");
		await createNewDirectory(newDirPath);

		refreshFileTree();
		setTreeItemEditing(newDirPath); // Enable renaming immediately
	};

	// useEffect(() => {
	// 	const handleFocusIn = (event: FocusEvent) => {
	// 		console.log("Focus in:", event.target);
	// 	};

	// 	const handleFocusOut = (event: FocusEvent) => {
	// 		console.log("Focus out:", event.target);
	// 	};

	// 	document.addEventListener("focusin", handleFocusIn);
	// 	document.addEventListener("focusout", handleFocusOut);

	// 	return () => {
	// 		document.removeEventListener("focusin", handleFocusIn);
	// 		document.removeEventListener("focusout", handleFocusOut);
	// 	};
	// }, []);

	return (
		<div className={styles.fileExplorerContainer}>
			<ResizableBox
				width={isCollapsed ? 40 : width}
				height={Infinity}
				axis="x"
				minConstraints={[40, Infinity]}
				maxConstraints={[800, Infinity]}
				onResize={(_, { size }) => setWidth(size.width)}
				resizeHandles={["e"]}
				handle={
					<div className={styles.resizeHandleContainer}>
						<div
							className={styles.resizeHandle}
							style={{
								cursor: "ew-resize",
								height: "100%",
								width: "5px",
								position: "absolute",
								right: 0,
								top: 0,
								backgroundColor: "transparent",
							}}
						/>
					</div>
				}
			>
				<div
					className={styles.fileExplorer}
					style={{ width: isCollapsed ? 40 : width }}
				>
					<div
						className={`navbar-component ${
							isCollapsed ? "collapsed" : ""
						}`}
					>
						{!isCollapsed && (
							<>
								<span
									className="navbar-component-title take-full-width"
									title={currentDir ? currentDir : ""}
									style={{ cursor: "default" }}
								>
									{currentDir
										? path.basename(currentDir)
										: "File Explorer"}
								</span>
								<button
									className="icon-button"
									title="Add File"
									onClick={createNewFileHandler}
								>
									<AddFileIcon />
								</button>
								<button
									className="icon-button"
									title="Add Directory"
									onClick={createNewDirectoryHandler}
								>
									<CreateNewFolderIcon />
								</button>
								<button
									className="icon-button"
									title="Refresh"
									onClick={refreshFileTree}
								>
									<RefreshIcon />
								</button>
							</>
						)}
						<button
							className="icon-button"
							title="Toggle Visibility"
							onClick={toggleCollapse}
						>
							<VisibilityIcon />
						</button>
					</div>
					{!isCollapsed && (
						<>
							<div style={{ height: "30%", maxHeight: "30%" }}>
								{loading ? (
									<div className="loading">
										<p>Loading...</p>
									</div>
								) : error ? (
									<p>Error: {error}</p>
								) : response !== null ? (
									<div className={styles.treeViewContainer}>
										<TreeView
											nodes={tree}
											selectedNodeId={
												selectedNode?.fullPath || null
											}
											actions={{
												onSelect: handleNodeSelect,
												onRename: handleNodeRename,
												onContextMenu:
													handleNodeContextMenu,
											}}
											state={{
												editing: treeItemEditing,
												setEditing: setTreeItemEditing,
                                                expandedSet: expandedSet,
                                                setExpandedSet: setExpandedSet,
											}}
										/>
									</div>
								) : (
									<div style={{ margin: "10px" }}>
										No Project Open
									</div>
								)}
							</div>
							<ConfigurationOverview
								openTextDialog={openTextDialog}
							/>
						</>
					)}
				</div>
			</ResizableBox>
			<ContextMenu
				mouseX={contextMenu?.mouseX || null}
				mouseY={contextMenu?.mouseY || null}
				handleClose={handleClose}
				actions={{
					onRename: () =>
						setTreeItemEditing(selectedNode?.fullPath || null),
                    onDelete: () => handleDelete(selectedNode),
					// Other actions can be omitted and will default to empty functions
				}}
			/>
		</div>
	);
};

export default FileExplorer;
