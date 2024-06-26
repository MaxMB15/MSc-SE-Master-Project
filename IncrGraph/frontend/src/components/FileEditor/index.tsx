import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ResizableBox } from "react-resizable";
import { Editor, Monaco } from "@monaco-editor/react";
import "react-resizable/css/styles.css";
import "./FileEditor.css";
import { useAxiosRequest } from "../../utils";

interface FileEditorProps {
	selectedFile: string | null;
}

interface GetFilePathRequest {
	path: string;
}

interface GetFilePathResponse {
	content: string;
	lastModified: number;
}

interface SaveFilePathRequest {
	path: string;
	content: string;
}

interface FileHistory {
	lastSavedTimestamp: number;
	prevContent: string;
	prevSavedContent: string;
}

const FileEditor: React.FC<FileEditorProps> = ({ selectedFile }) => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [width, setWidth] = useState(500);
	const [fileContent, setFileContent] = useState<string | null>(null);
	const [currentSelectedFile, setCurrentSelectedFile] = useState<
		string | null
	>(null);
	const [isSaved, setIsSaved] = useState<boolean>(true);
	const [fileHistories, setFileHistories] = useState<
		Map<string, FileHistory>
	>(new Map());
	const {
		error: readFileError,
		loading: readFileLoading,
		sendRequest: readFileSendRequest,
	} = useAxiosRequest<GetFilePathRequest, GetFilePathResponse>();
	const { error: saveFileError, sendRequest: saveFileSendRequest } =
		useAxiosRequest<SaveFilePathRequest, null>();
	const editorRef = useRef<any>(null);
	const monacoRef = useRef<Monaco | null>(null);
	const modelsRef = useRef<Map<string, any>>(new Map());

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	const handleEditorMount = (editor: any, monaco: Monaco) => {
		editorRef.current = editor;
		monacoRef.current = monaco;
		if (selectedFile && fileContent !== null) {
			createOrReuseModel(selectedFile, fileContent);
		}
	};

	const handleResize = useCallback(() => {
		if (editorRef.current) {
			editorRef.current.layout();
		}
	}, []);

	const handleEditorChange = (value: string | undefined) => {
		setFileContent(value || "");
		// Check history if the file is the previously saved file
		const fileHistory = fileHistories.get(currentSelectedFile || "");
		if (fileHistory) {
			if (fileHistory.prevSavedContent !== value) {
				setIsSaved(false);
			} else {
				setIsSaved(true);
			}
		}
	};

	const saveChanges = () => {
		if (fileContent !== null && selectedFile !== null) {
			saveFileSendRequest({
				method: "POST",
				data: { path: selectedFile, content: fileContent },
				route: "/api/file-explorer/file-content",
				useJWT: false,
			}).then(() => {
				setIsSaved(true);
				const currentTime = Date.now();
				setFileHistories(
					new Map(
						fileHistories.set(selectedFile, {
							lastSavedTimestamp: currentTime,
							prevContent: fileContent,
							prevSavedContent: fileContent,
						}),
					),
				);
			});
		}
	};

	const fetchFileContent = async (filePath: string) => {
		// Save the previous file history
		if (currentSelectedFile !== null && fileContent !== null) {
			const fileHistory = fileHistories.get(currentSelectedFile);
			if (fileHistory) {
				setFileHistories(
					new Map(
						fileHistories.set(currentSelectedFile, {
							lastSavedTimestamp: fileHistory.lastSavedTimestamp,
							prevContent: fileContent,
							prevSavedContent: fileHistory.prevSavedContent,
						}),
					),
				);
			}
		}

		// Write the new file content
		setCurrentSelectedFile(filePath);
		try {
			const response = await readFileSendRequest({
				method: "GET",
				data: { path: filePath },
				route: "/api/file-explorer/file-content",
				useJWT: false,
			});

			const { content, lastModified } = response;
			const fileHistory = fileHistories.get(filePath);
			const previousTimestamp = fileHistory?.lastSavedTimestamp;

			if (previousTimestamp && lastModified > previousTimestamp) {
				const shouldRefresh = window.confirm(
					"The file has changed externally. Would you like to refresh?",
				);
				if (shouldRefresh) {
					setFileContent(content);
					setIsSaved(true);
					setFileHistories(
						new Map(
							fileHistories.set(filePath, {
								lastSavedTimestamp: lastModified,
								prevContent: content,
								prevSavedContent: content,
							}),
						),
					);
					return;
				}
			}

			if (fileHistory) {
				setFileContent(fileHistory.prevContent);
				if (editorRef.current && monacoRef.current) {
					createOrReuseModel(filePath, fileHistory.prevContent);
				}
				if (content !== fileHistory.prevContent) {
					setIsSaved(false);
				} else {
					setIsSaved(true);
				}
			} else {
				setFileContent(content);
				setIsSaved(true);
				setFileHistories(
					new Map(
						fileHistories.set(filePath, {
							lastSavedTimestamp: lastModified,
							prevContent: content,
							prevSavedContent: content,
						}),
					),
				);
			}
		} catch (error) {
			console.error("Error fetching the file:", error);
		}
	};

	const createOrReuseModel = (filePath: string, content: string) => {
		if (!monacoRef.current) {
			return;
		}
		let model = modelsRef.current.get(filePath);
		if (!model) {
			model = monacoRef.current.editor.createModel(content, "python");
			modelsRef.current.set(filePath, model);
		}
		if (editorRef.current) {
			editorRef.current.setModel(model);
		}
	};

	useEffect(() => {
		if (selectedFile !== null) {
			fetchFileContent(selectedFile);
		}
	}, [selectedFile]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "s") {
				event.preventDefault();
				saveChanges();
			}
		};

		// Window keydown event listener
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [fileContent]);

	useEffect(() => {
		// Window resize event listener
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
			onResize={(_, { size }) => setWidth(size.width)}
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
							<>
								<span className="navbar-title">
									Code Editor
								</span>
								{selectedFile && (
									<span
										className="navbar-circle-icon"
										style={{
											backgroundColor:
												saveFileError != null
													? "red"
													: isSaved
													? "green"
													: "orange",
										}}
									></span>
								)}
								<span className="take-full-width"></span>
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
						<Box
							sx={{
								flexGrow: 1,
								backgroundColor: "#1e1e1e",
								overflowY: "auto",
							}}
						>
							{readFileLoading && <div>Loading...</div>}
							{readFileError != null && (
								<div>Error: {readFileError}</div>
							)}
							{selectedFile !== null && fileContent !== null && (
								<Editor
									height="100%"
									language="python"
									value={fileContent}
									theme="vs-dark"
									options={{ readOnly: false }}
									onMount={handleEditorMount}
									onChange={handleEditorChange}
								/>
							)}
							{!selectedFile && (
								<div style={{ textAlign: "center" }}>
									Select a file to view its content.
								</div>
							)}
						</Box>
					)}
				</div>
			</div>
		</ResizableBox>
	);
};

export default FileEditor;
