import React from "react";
import "./AbstractClassNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "../../../../../styles/constants";

interface AbstractClassNodeProps {
    id: string
	data: {
		label: string;
	};
}

const AbstractClassNode: React.FC<AbstractClassNodeProps> = ({ id, data }) => (
	<BaseNode id={id} data={{
        label: data.label,
        backgroundColor: STYLES.abstractClassNodeColor
    }}/>
);

export default AbstractClassNode;
