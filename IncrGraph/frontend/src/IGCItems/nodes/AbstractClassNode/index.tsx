import "./AbstractClassNode.css";
import BaseNode, { IGCNodeProps } from "../BaseNode";
import { STYLES } from "@/styles/constants";

const AbstractClassNode: IGCNodeProps = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        backgroundColor: AbstractClassNode.COLOR
    }}/>
);
AbstractClassNode.NAME = "AbstractClassNode";
AbstractClassNode.COLOR = STYLES.abstractClassNodeColor;
AbstractClassNode.TYPE = "node";
AbstractClassNode.SETABLE = true;

export default AbstractClassNode;
