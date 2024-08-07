import React from "react";
import ReactMarkdown from "react-markdown";
import AddIcon from "@mui/icons-material/Add";
import styles from "./MarkdownDisplay.module.css";
import { IGCCodeNode, IGCNode } from "@/graphComponents/nodes/IGCNode";
import DocumentationNode from "@/graphComponents/nodes/DocumentationNode";

interface MarkdownDisplayProps {
	node: IGCNode;
}

const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ node }) => {
	const handleDoubleClick = () => {
        if (!(node instanceof IGCCodeNode)) {
            return;
        }
		DocumentationNode.setOrCreateDocumentationNode(node);
	};

	const content = node instanceof IGCCodeNode ? DocumentationNode.getCodeDocumentation(node) : null;

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
