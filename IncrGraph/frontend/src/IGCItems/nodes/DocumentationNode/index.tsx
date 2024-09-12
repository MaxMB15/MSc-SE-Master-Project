import React from "react";
import "./DocumentationNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "@/styles/constants";
import { NodeProps } from "reactflow";

interface DocumentationNodeProps extends NodeProps {}

const DocumentationNode: React.FC<DocumentationNodeProps> = (props) => (
	<BaseNode
		{...props}
		data={{
			...props.data,
			backgroundColor: STYLES.documentationNodeColor,
		}}
	/>
);

export default DocumentationNode;
