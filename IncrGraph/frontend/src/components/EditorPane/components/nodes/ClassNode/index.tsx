import React from "react";
import "./ClassNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "@/styles/constants";

interface ClassNodeProps {
    id: string
	data: {
		label: string;
	};
}

const ClassNode: React.FC<ClassNodeProps> = ({ id, data }) => (
	<BaseNode id={id} data={{
        label: data.label,
        backgroundColor: STYLES.classNodeColor
    }}/>
);

export default ClassNode;
