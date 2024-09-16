import "./MethodNode.css";
import CodeNode, { IGCCodeNodeProps } from "../CodeNode";
import { STYLES } from "@/styles/constants";

const MethodNode: IGCCodeNodeProps = ( props ) => (
	<CodeNode {...props} data={{
        ...props.data,
        backgroundColor: MethodNode.COLOR
    }}/>
);
MethodNode.NAME = "MethodNode";
MethodNode.COLOR = STYLES.methodNodeColor;
MethodNode.TYPE = "node";
MethodNode.SETABLE = true;

export default MethodNode;
