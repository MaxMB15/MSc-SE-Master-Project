import "./AbstractClassNode.css";
import { STYLES } from "@/styles/constants";
import CodeNode, { IGCCodeNodeProps } from "../CodeNode";

const AbstractClassNode: IGCCodeNodeProps = ( props ) => (
	<CodeNode {...props} data={{
        ...props.data,
        backgroundColor: AbstractClassNode.COLOR
    }}/>
);
AbstractClassNode.NAME = "AbstractClassNode";
AbstractClassNode.COLOR = STYLES.abstractClassNodeColor;
AbstractClassNode.TYPE = "node";
AbstractClassNode.SETABLE = true;

export default AbstractClassNode;
