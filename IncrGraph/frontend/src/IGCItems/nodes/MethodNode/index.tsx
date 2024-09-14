import "./MethodNode.css";
import BaseNode, { IGCNodeProps } from "../BaseNode";
import { STYLES } from "@/styles/constants";

const MethodNode: IGCNodeProps = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        backgroundColor: MethodNode.COLOR
    }}/>
);
MethodNode.NAME = "MethodNode";
MethodNode.COLOR = STYLES.methodNodeColor;
MethodNode.TYPE = "node";
MethodNode.SETABLE = true;

export default MethodNode;
