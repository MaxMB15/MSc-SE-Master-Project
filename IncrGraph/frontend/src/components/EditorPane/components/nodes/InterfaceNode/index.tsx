import React from "react";
import "./InterfaceNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "../../../../../styles/constants";

interface InterfaceNodeProps {
    id: string
	data: {
		label: string;
	};
}

const InterfaceNode: React.FC<InterfaceNodeProps> = ({ id, data }) => (
	<BaseNode id={id} data={{
        label: data.label,
        backgroundColor: STYLES.interfaceNodeColor
    }}/>
);

export default InterfaceNode;
