import React from "react";
import "./LibraryNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "@/styles/constants";
import { NodeProps } from "reactflow";

interface LibraryNodeProps extends NodeProps {}

const LibraryNode: React.FC<LibraryNodeProps> = (props) => (
	<BaseNode
		{...props}
		data={{
			...props.data,
			backgroundColor: STYLES.libraryNodeColor,
		}}
	/>
);

export default LibraryNode;
