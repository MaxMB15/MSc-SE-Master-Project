import useStore from "@/store/store";
import { ElementItem } from "@/types/frontend";
import { IGCCodeNodeData } from "../nodes/CodeNode";
import { Node } from "reactflow";
import { runCode } from "@/utils/codeExecution";
import { PlayArrow } from "@mui/icons-material";

// Save Indicator
const saveIndicatorKey = "saveIndicator";
const updateElementItem = (element: ElementItem, elements: ElementItem[]) =>
	elements.some((e) => e.key === element.key)
		? elements.map((e) => {
				if (e.key === element.key) {
					return element;
				}
				return e;
		  })
		: [...elements, element];

export type SaveIndicatorProps = "saved" | "error" | "outdated";

export const useSaveIndicator = (status: SaveIndicatorProps) => {
	const saveIndicator: ElementItem = {
		key: saveIndicatorKey,
		weight: 0,
		element: (
			<span
				key={saveIndicatorKey}
				className="navbar-circle-icon"
				style={{
					backgroundColor:
						status === "saved"
							? "green"
							: status === "error"
							? "red"
							: "orange",
				}}
			></span>
		),
	};

	useStore
		.getState()
		.setNavBarContainer((prev) => updateElementItem(saveIndicator, prev));
};

const runButtonKey = "runButton";
export const useRunButton = (node: Node<IGCCodeNodeData>) => {
	const runButton: ElementItem = {
		key: runButtonKey,
		weight: 10,
		element: (
			<button
				className="icon-button"
				title="Run Code"
				onClick={() =>
					runCode(
						node.data.codeData.code,
						node.id,
						node.data.codeData.scope,
					)
				}
				disabled={
					node.data.codeData.code === "" ||
					useStore.getState().currentSessionId === null
				}
			>
				<PlayArrow />
			</button>
		),
	};

	useStore
		.getState()
		.setNavBarContainer((prev) => updateElementItem(runButton, prev));
};
