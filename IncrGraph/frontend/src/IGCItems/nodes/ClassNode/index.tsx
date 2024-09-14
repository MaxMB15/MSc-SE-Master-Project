import "./ClassNode.css";
import BaseNode, { IGCNodeProps } from "../BaseNode";
import { STYLES } from "@/styles/constants";

const ClassNode: IGCNodeProps = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        backgroundColor: ClassNode.COLOR
    }}/>
);
ClassNode.NAME = "ClassNode";
ClassNode.COLOR = STYLES.classNodeColor;
ClassNode.TYPE = "node";
ClassNode.SETABLE = true;

export default ClassNode;
