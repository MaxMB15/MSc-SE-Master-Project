import "./ClassNode.css";
import CodeNode, { IGCCodeNodeProps } from "../CodeNode";
import { STYLES } from "@/styles/constants";

const ClassNode: IGCCodeNodeProps = ( props ) => (
	<CodeNode {...props} data={{
        ...props.data,
        backgroundColor: ClassNode.COLOR
    }}/>
);
ClassNode.NAME = "ClassNode";
ClassNode.COLOR = STYLES.classNodeColor;
ClassNode.TYPE = "node";
ClassNode.SETABLE = true;

export default ClassNode;
