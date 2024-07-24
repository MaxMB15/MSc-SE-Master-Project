import React, { useEffect, useState } from "react";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AddFileIcon from "@mui/icons-material/NoteAdd";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FileNode, GetDirectoryStructureRequest } from "shared";
import { useAxiosRequest } from "../../utils/requests";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import "./FileExplorer.css";
import useStore from "@/store/store";
import ConfigurationOverview from "../ConfigurationOverview";
import path from "path-browserify";

interface FileExplorerProps {
	openTextDialog: (defaultName: string) => Promise<string | null>;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ openTextDialog }) => {
	// VARIABLES
	const { response, error, loading, sendRequest } = useAxiosRequest<
		GetDirectoryStructureRequest,
		FileNode[]
	>();

	const { setSelectedFile, projectDirectory } = useStore(); // Variables from data store

	// STATE
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [width, setWidth] = useState(300);
	const [currentDir, setCurrentDir] = useState<string | null>(null);

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	const refreshFileTree = () => {
		if (!projectDirectory) return;
		sendRequest({
			method: "GET",
			route: "/api/file-explorer",
			data: { path: projectDirectory },
			useJWT: false,
		});
	};

	useEffect(() => {
		refreshFileTree();
		setCurrentDir(() => projectDirectory);
	}, [projectDirectory]);

	const handleFileSelect = (filePath: string) => {
		setSelectedFile(() => filePath);
	};

	const renderTree = (nodes: FileNode[]) => {
		return nodes.map((node) => {
			return (
				<TreeItem
					key={node.fullPath}
					itemId={node.fullPath}
					label={node.name}
					slots={
						node.type === "directory"
							? { icon: FolderIcon }
							: { icon: InsertDriveFileIcon }
					}
					onClick={() =>
						node.type === "file" && handleFileSelect(node.fullPath)
					}
				>
					{node.children && renderTree(node.children)}
				</TreeItem>
			);
		});
	};

	return (
		<div className="file-explorer-container">
			<ResizableBox
				width={isCollapsed ? 40 : width}
				height={Infinity}
				axis="x"
				minConstraints={[40, Infinity]}
				maxConstraints={[800, Infinity]}
				onResize={(_, { size }) => setWidth(size.width)}
				resizeHandles={["e"]}
				handle={
					<div className="resize-handle-container">
						<div
							className="resize-handle"
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
					className="file-explorer"
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
                                    style={{cursor: "default"}}
								>
									{currentDir
										? path.basename(currentDir)
										: "File Explorer"}
								</span>
								<button
									className="icon-button"
									title="Add File"
								>
									<AddFileIcon />
								</button>
								<button
									className="icon-button"
									title="Add Directory"
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
                            <div style={{height: "50%", maxHeight: "50%"}}>
							{loading ? (
								<div className="loading">
									<p>Loading...</p>
								</div>
							) : error ? (
								<p>Error: {error}</p>
							) : response ? (
								<SimpleTreeView
									slots={{
										collapseIcon: FolderIcon,
										expandIcon: FolderIcon,
									}}
									sx={{
										height: "100%",
										flexGrow: 1,
										overflowY: "auto",
									}}
								>
									{renderTree(response)}
								</SimpleTreeView>
							) : <div style={{margin: "10px"}}>
                            No Project Open
                        </div>}
                            </div>
							<ConfigurationOverview
								openTextDialog={openTextDialog}
							/>
						</>
					)}
				</div>
			</ResizableBox>
		</div>
	);
};

export default FileExplorer;
