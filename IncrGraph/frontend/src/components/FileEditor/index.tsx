import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ResizableBox } from "react-resizable";
import { Editor } from "@monaco-editor/react";
import "react-resizable/css/styles.css";
import "./FileEditor.css";
import { useAxiosRequest } from "../../utils";

interface FileEditorProps {
	selectedFile: string | null;
}

const FileEditor: React.FC<FileEditorProps> = ({ selectedFile }) => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [width, setWidth] = useState(500); // Initial width of 300px
	const [fileContent, setFileContent] = useState<string | null>(null);
	const { response, error, loading, sendRequest, setResponse } =
		useAxiosRequest<null, string>();
	const editorRef = useRef<any>(null);

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	const handleEditorDidMount = (editor: any) => {
		editorRef.current = editor;
	};

	const handleResize = useCallback(() => {
		if (editorRef.current) {
			editorRef.current.layout();
		}
	}, []);

	useEffect(() => {
		if (selectedFile) {
			sendRequest({
				method: "GET",
				route: `/api/file-explorer/file-content?path=${encodeURIComponent(
					selectedFile,
				)}`,
				useJWT: false,
			});
		}
	}, [selectedFile, sendRequest, setResponse]);

	useEffect(() => {
		if (response) {
			setFileContent(response);
		}
	}, [response]);

	useEffect(() => {
		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [handleResize]);

	return (
		<ResizableBox
			width={isCollapsed ? 40 : width}
			height={Infinity}
			axis="x"
			minConstraints={[40, Infinity]}
			maxConstraints={[800, Infinity]}
			onResize={(event, { size }) => setWidth(size.width)}
			onResizeStop={handleResize}
			resizeHandles={["w"]}
			handle={
				<div className="resize-handle-container-left">
					<div
						className="resize-handle"
						style={{
							cursor: "ew-resize",
							height: "100%",
							width: "5px",
							position: "absolute",
							left: 0,
							top: 0,
							backgroundColor: "transparent",
						}}
					/>
				</div>
			}
		>
			<div className="file-editor-container">
				<div
					className={`file-editor ${isCollapsed ? "collapsed" : ""}`}
				>
					<div className={`navbar ${isCollapsed ? "collapsed" : ""}`}>
						{!isCollapsed && (
							<span className="directory-name">File Editor</span>
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
						<Box
							sx={{
								flexGrow: 1,
								backgroundColor: "#1e1e1e",
								overflowY: "auto",
							}}
						>
							{loading && <div>Loading...</div>}
							{error && <div>Error: {error}</div>}
							{selectedFile && fileContent && (
								<Editor
									height="100%"
									language="javascript"
									value={fileContent}
									theme="vs-dark"
									options={{ readOnly: true }}
									onMount={handleEditorDidMount}
								/>
							)}
							{!selectedFile && (
								<div style={{textAlign: "center"}}>Select a file to view its content.</div>
							)}
						</Box>
					)}
				</div>
			</div>
		</ResizableBox>
	);
};

export default FileEditor;
