import "./DocumentationNode.css";
import BaseNode, { IGCNodeProps } from "../BaseNode";
import { STYLES } from "@/styles/constants";

const DocumentationNode: IGCNodeProps = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        backgroundColor: DocumentationNode.COLOR
    }}/>
);
DocumentationNode.NAME = "DocumentationNode";
DocumentationNode.COLOR = STYLES.documentationNodeColor;
DocumentationNode.TYPE = "node";
DocumentationNode.SETABLE = true;

export default DocumentationNode;
