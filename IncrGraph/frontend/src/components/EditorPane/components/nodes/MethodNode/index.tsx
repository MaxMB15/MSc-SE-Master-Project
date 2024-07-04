import React from "react";
import "./MethodNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "@/styles/constants";

interface MethodNodeProps {
    id: string
	data: {
		label: string;
	};
}

const MethodNode: React.FC<MethodNodeProps> = ({ id, data }) => (
	<BaseNode id={id} data={{
        label: data.label,
        backgroundColor: STYLES.methodNodeColor
    }}/>
);

export default MethodNode;
