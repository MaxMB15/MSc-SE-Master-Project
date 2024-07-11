import React from "react";
import "./AbstractClassNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "@/styles/constants";
import { NodeProps } from "reactflow";

interface AbstractClassNodeProps extends NodeProps {}

const AbstractClassNode: React.FC<AbstractClassNodeProps> = (props) => (
	<BaseNode
		{...props}
		data={{
			...props.data,
			backgroundColor: STYLES.abstractClassNodeColor,
		}}
	/>
);

export default AbstractClassNode;
