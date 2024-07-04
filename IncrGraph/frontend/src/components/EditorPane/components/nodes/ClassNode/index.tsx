import React from "react";
import "./ClassNode.css";
import BaseNode from "../BaseNode";
import { STYLES } from "@/styles/constants";
import { NodeProps } from "reactflow";

interface ClassNodeProps extends NodeProps {}

const ClassNode: React.FC<ClassNodeProps> = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        backgroundColor: STYLES.classNodeColor
    }}/>
);

export default ClassNode;
