import "./InterfaceNode.css";
import BaseNode, { IGCNodeProps } from "../BaseNode";
import { STYLES } from "@/styles/constants";

const InterfaceNode: IGCNodeProps = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        backgroundColor: InterfaceNode.COLOR
    }}/>
);
InterfaceNode.NAME = "InterfaceNode";
InterfaceNode.COLOR = STYLES.interfaceNodeColor;
InterfaceNode.TYPE = "node";
InterfaceNode.SETABLE = true;

export default InterfaceNode;
