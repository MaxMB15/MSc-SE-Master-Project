import CodeNode, { IGCCodeNodeData } from "@/IGCItems/nodes/CodeNode";
import { IGCViewProps } from "../BaseView";
import { createView } from "@/utils/componentCache";
import { RegistryComponent } from "@/types/frontend";

import useStore from "@/store/store";
import { Node } from "reactflow";

import React, { useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { editor, KeyCode, KeyMod } from "monaco-editor";
import { useRunButton, useSaveIndicator } from "../viewUtils";
import TabbedCodeOutput from "@/components/TabbedCodeOutput";
import { FitAddon } from "@xterm/addon-fit";
import { deserializeGraphData } from "@/IGCItems/utils/serialization";
import { saveFileContent } from "@/requests";
import { Box } from "@mui/material";

const RawNodeCodeView: React.FC = () => {
	const selectedFile = useStore((state) => state.selectedFile);
	const selectedItem = useStore((state) => state.selectedItem);
	const fileChanged = useStore((state) => state.fileChanged);
	const mode = useStore((state) => state.mode);
	const nodes = useStore((state) => state.nodes);
	const setNodes = useStore((state) => state.setNodes);
	const savedNodes = useStore((state) => state.savedNodes);
	const getSessionData = useStore((state) => state.getSessionData);

	const [content, setContent] = React.useState<string | undefined>(undefined);

	const fitAddons = useRef<(FitAddon | null)[]>([]);

	const calculateHeight = (bool: Boolean) => {
		// THIS NEEDS TO BE FIXED
		const totalHeight = window.innerHeight;
		const tabbedOutputHeight = bool ? 600 : 400;
		return totalHeight - tabbedOutputHeight;
	};

	const validItem =
		selectedFile !== null &&
		selectedItem !== null &&
		selectedItem.item.type === "node";

	// Save indicator
	const onMount = (editor: editor.IStandaloneCodeEditor) => {
		setContent(editor.getModel()?.getValue());

		// Custom save handler for Command+S or Ctrl+S
		editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
			const sFile = useStore.getState().selectedFile;
			const curContent = editor.getModel()?.getValue();
			const selectedItem = useStore.getState().selectedItem;
			const savedNodes = useStore.getState().savedNodes;
			if (
				sFile !== null &&
				curContent !== undefined &&
				selectedItem !== null
			) {
				savedNodes[sFile][selectedItem.id].data.codeData.code =
					curContent;
				savedNodes[sFile][selectedItem.id].selected = true;
				const rawGraphData = deserializeGraphData(
					Object.values(savedNodes[sFile]),
					Object.values(useStore.getState().savedEdges[sFile]),
				);
				saveFileContent(sFile, rawGraphData).then((_) => {
					useStore.getState().updateFileContent(() => rawGraphData);
				});
			}
		});
	};
	useEffect(() => {
		if (validItem) {
			if (content !== undefined) {
				useSaveIndicator(
					content ===
						savedNodes[selectedFile][selectedItem.id]?.data.codeData
							.code
						? "saved"
						: "outdated",
				);
			}
		}
	}, [fileChanged, content]);
	useEffect(() => {
		const si = useStore.getState().selectedItem;
		if (si !== null) {
			useRunButton(si.item.object as Node<IGCCodeNodeData>);
		}
	}, [content, selectedItem?.id]);

	if (!validItem) {
		return <div className="text-display">No node selected</div>;
	}

	const currentNode: Node<IGCCodeNodeData> = selectedItem.item
		.object as Node<IGCCodeNodeData>;
	console.log("Selected item", selectedItem);
	console.log("nodes", nodes);

	const onChange = (content: string | undefined) => {
		setContent(content);
		console.log("Content changed", content);
		setNodes(selectedFile, (prevNodes) => {
			return prevNodes.map((node) => {
				if (node.id === currentNode.id) {
					node.data.codeData.code = content;
				}
				return node;
			});
		});
	};
	const editorPathKey = `${selectedFile}-${selectedItem.id}`;
	useStore.getState().setHasEditorCreated(editorPathKey);

	const sessionsData = getSessionData(selectedFile);
	const currentSessionId = useStore.getState().currentSessionId;
	let lastExecutionData = null;
	if (
		currentSessionId !== null &&
		sessionsData !== undefined &&
		sessionsData.sessions[currentSessionId] !== undefined
	) {
		const sessionData = sessionsData.sessions[currentSessionId];
		for (let i = sessionData.executions.length - 1; i >= 0; i--) {
			if (sessionData.executions[i].nodeId === selectedItem.id) {
				lastExecutionData = sessionData.executions[i];
				break;
			}
		}
	}
	return (
		<>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100%",
				}}
			>
				<div
					style={{
						flexGrow: 1,
					}}
				>
					<Box
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
						}}
					>
						<Editor
							path={editorPathKey}
							height="100%"
							defaultLanguage="python"
							defaultValue={currentNode.data.codeData.code}
							theme={mode === "light" ? "light" : "vs-dark"}
							onChange={onChange}
							onMount={onMount}
						/>
					</Box>
				</div>
				{lastExecutionData !== null && (
					<div style={{ flexShrink: 0, transition: "all 0.3s ease" }}>
						<TabbedCodeOutput
							executionData={lastExecutionData}
							// fitAddons={fitAddons}
						/>
					</div>
				)}
			</div>
		</>
	);
};

const NodeCodeView: IGCViewProps & RegistryComponent = createView(
	RawNodeCodeView,
	"NodeCodeView",
	"Node Code View",
	[CodeNode],
	{},
);

export default NodeCodeView;
