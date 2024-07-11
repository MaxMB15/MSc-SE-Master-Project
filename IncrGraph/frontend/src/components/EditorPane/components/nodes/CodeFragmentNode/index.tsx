import React from "react";
import "./CodeFragmentNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "@/styles/constants";
import { NodeProps } from "reactflow";

interface CodeFragmentNodeProps extends NodeProps {}

const CodeFragmentNode: React.FC<CodeFragmentNodeProps> = (props) => (
	<BaseNode
		{...props}
		data={{
			...props.data,
			backgroundColor: STYLES.codeFragmentNodeColor,
		}}
	/>
);

export default CodeFragmentNode;
