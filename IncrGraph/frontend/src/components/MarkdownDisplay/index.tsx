import React from "react";
import ReactMarkdown from "react-markdown";
import AddIcon from "@mui/icons-material/Add";
import styles from "./MarkdownDisplay.module.css";
import { Node, Edge } from "reactflow";
import {
	getEdgeId,
	getIncomingNodes,
} from "../../IGCItems/utils/utils";
import useStore from "@/store/store";

interface MarkdownDisplayProps {
	node: Node;
}

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ node }) => {
	// Data Store
	const { nodes, setNodes, edges, setEdges } = useStore();

	const handleDoubleClick = () => {
		setOrCreateDocumentationNode(node, nodes, edges);
	};
	const getCodeDocumentation = (
		node: Node,
		nodes: Node[],
		edges: Edge[],
	): string | null => {
		const incomingDocumentationNodes = getIncomingNodes(
			node.id,
			nodes,
			edges,
            (node) => node.type === "documentationNode",
		);
		if (incomingDocumentationNodes.length === 0) {
			return null;
		}
		return incomingDocumentationNodes[0].data.code;
	};

	const setOrCreateDocumentationNode = (
		node: Node,
		nodes: Node[],
		edges: Edge[],
	): void => {
		const incomingDocumentationNodes = getIncomingNodes(
			node.id,
			nodes,
			edges,
            (node) => node.type === "documentationNode",
		);
		if (incomingDocumentationNodes.length === 0) {
			// Need to create the documentation node
			const documentationNodeId = `documentation-${node.id}`;
			const documentationNode = {
				id: documentationNodeId,
				type: "documentationNode",
				position: {
					x: node.position.x,
					y: node.position.y - 200,
				},
				data: {
					label: `Documentation`,
					code: "",
					language: "markdown",
				},
				selected: true,
			};
			const documentationEdge = {
				id: getEdgeId(documentationNodeId, node.id, edges),
				source: documentationNodeId,
				target: node.id,
				type: "documentationRelationship",
			};
			setNodes((prevNodes) => [
				...prevNodes.map((node) => {
					node.selected = false;
					return node;
				}),
				documentationNode,
			]);
			setEdges((prevEdges) => [...prevEdges, documentationEdge]);
		} else {
			setNodes((prevNodes) => [
				...prevNodes.map((node) => {
					if (node.id === incomingDocumentationNodes[0].id) {
						node.selected = true;
					} else {
						node.selected = false;
					}
					return node;
				}),
			]);
		}
	};

	const content = getCodeDocumentation(node, nodes, edges);

	return (
		<div
			className={styles.markdownDisplayContainer}
			onDoubleClick={handleDoubleClick}
		>
			{content === null ? (
				<div className={styles.iconContainer}>
					<AddIcon />
				</div>
			) : null}
			<div className={content === null ? styles.hidden : ""}>
				<ReactMarkdown>{content !== null ? content : ""}</ReactMarkdown>
			</div>
		</div>
	);
};

export default MarkdownDisplay;
