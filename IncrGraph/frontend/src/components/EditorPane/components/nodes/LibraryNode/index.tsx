import React from "react";
import "./LibraryNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "@/styles/constants";

interface LibraryNodeProps {
    id: string
	data: {
		label: string;
	};
}

const LibraryNode: React.FC<LibraryNodeProps> = ({ id, data }) => (
	<BaseNode id={id} data={{
        label: data.label,
        backgroundColor: STYLES.libraryNodeColor
    }}/>
);

export default LibraryNode;
