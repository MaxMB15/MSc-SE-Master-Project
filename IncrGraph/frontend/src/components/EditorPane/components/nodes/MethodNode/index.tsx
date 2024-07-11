import React from "react";
import "./MethodNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "@/styles/constants";
import { NodeProps } from "reactflow";

interface MethodNodeProps extends NodeProps {}

const MethodNode: React.FC<MethodNodeProps> = (props) => (
	<BaseNode
		{...props}
		data={{
			...props.data,
			backgroundColor: STYLES.methodNodeColor,
		}}
	/>
);

export default MethodNode;
