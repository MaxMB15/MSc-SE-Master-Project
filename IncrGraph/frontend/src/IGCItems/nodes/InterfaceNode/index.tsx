import "./InterfaceNode.css";
import CodeNode, { IGCCodeNodeProps } from "../CodeNode";
import { STYLES } from "@/styles/constants";

const InterfaceNode: IGCCodeNodeProps = ( props ) => (
	<CodeNode {...props} data={{
        ...props.data,
        backgroundColor: InterfaceNode.COLOR
    }}/>
);
InterfaceNode.NAME = "InterfaceNode";
InterfaceNode.COLOR = STYLES.interfaceNodeColor;
InterfaceNode.TYPE = "node";
InterfaceNode.SETABLE = true;

export default InterfaceNode;
