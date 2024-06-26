import React, { useEffect, useState } from "react";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import AddFileIcon from "@mui/icons-material/NoteAdd";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { FileNode } from "../../types/common";
import { useAxiosRequest } from "../../utils";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import "./FileExplorer.css";

interface FileExplorerProps {
	onFileSelect: (filePath: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [width, setWidth] = useState(300); // Initial width of 300px
	const [currentDir, setCurrentDir] = useState("File Explorer");
	const { response, error, loading, sendRequest } = useAxiosRequest<
		null,
		FileNode[]
	>();

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	const refreshFileTree = () => {
		sendRequest({
			method: "GET",
			route: "/api/file-explorer",
			useJWT: false,
		});
	};

	useEffect(() => {
		refreshFileTree();
	}, []);

	return (
		<div className="file-explorer-container">
			<ResizableBox
				width={isCollapsed ? 40 : width}
				height={Infinity}
				axis="x"
				minConstraints={[40, Infinity]}
				maxConstraints={[800, Infinity]}
				onResize={(event, { size }) => setWidth(size.width)}
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
					<div className={`navbar ${isCollapsed ? "collapsed" : ""}`}>
						{!isCollapsed && (
							<>
								<span className="directory-name">
									{currentDir}
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
						<FileExplorerContent
							onFileSelect={onFileSelect}
							response={response}
							error={error}
							loading={loading}
						/>
					)}
				</div>
			</ResizableBox>
		</div>
	);
};

const FileExplorerContent: React.FC<{
	onFileSelect: (filePath: string) => void;
	response: FileNode[] | null;
	error: string | null;
	loading: boolean;
}> = ({ onFileSelect, response, error, loading }) => {
	const handleFileSelect = (filePath: string) => {
		onFileSelect(filePath);
	};

	const renderTree = (nodes: FileNode[], currentPath: string = "") => {
		return nodes.map((node) => {
			const nodePath = currentPath
				? `${currentPath}/${node.name}`
				: node.name;
			return (
				<TreeItem
					key={node.name}
					itemId={node.name}
					label={node.name}
					slots={
						node.type === "directory"
							? { icon: FolderIcon }
							: { icon: InsertDriveFileIcon }
					}
					onClick={() =>
						node.type === "file" && handleFileSelect(nodePath)
					}
				>
					{node.children && renderTree(node.children, nodePath)}
				</TreeItem>
			);
		});
	};

	if (loading)
		return (
			<div className="loading">
				<p>Loading...</p>
			</div>
		);
	if (error) return <p>Error: {error}</p>;
	if (!response) return null;

	return (
		<SimpleTreeView
			slots={{ collapseIcon: FolderIcon, expandIcon: FolderIcon }}
			sx={{
				height: "100%",
				flexGrow: 1,
				overflowY: "auto",
			}}
		>
			{renderTree(response)}
		</SimpleTreeView>
	);
};

export default FileExplorer;
