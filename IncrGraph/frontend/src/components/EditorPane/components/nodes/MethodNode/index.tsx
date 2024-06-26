import React from "react";
import "./methodNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "../../../../../styles/constants";

interface CodeFragmentNodeProps {
    id: string
	data: {
		label: string;
	};
}

const CodeFragmentNode: React.FC<CodeFragmentNodeProps> = ({ id, data }) => (
	<BaseNode id={id} data={{
        label: data.label,
        backgroundColor: STYLES.methodNodeColor
    }}/>
);

export default CodeFragmentNode;
