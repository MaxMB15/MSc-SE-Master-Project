import React from "react";
import "./InterfaceNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "@/styles/constants";
import { NodeProps } from "reactflow";

interface InterfaceNodeProps extends NodeProps {}

const InterfaceNode: React.FC<InterfaceNodeProps> = (props) => (
	<BaseNode
		{...props}
		data={{
			...props.data,
			backgroundColor: STYLES.interfaceNodeColor,
		}}
	/>
);

export default InterfaceNode;
