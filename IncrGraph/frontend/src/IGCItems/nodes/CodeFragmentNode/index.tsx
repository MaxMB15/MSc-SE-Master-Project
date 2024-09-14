import "./CodeFragmentNode.css";
import BaseNode, { IGCNodeProps } from "../BaseNode";
import { STYLES } from "@/styles/constants";

const CodeFragmentNode: IGCNodeProps = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        backgroundColor: CodeFragmentNode.COLOR
    }}/>
);
CodeFragmentNode.NAME = "CodeFragmentNode";
CodeFragmentNode.COLOR = STYLES.codeFragmentNodeColor;
CodeFragmentNode.TYPE = "node";
CodeFragmentNode.SETABLE = true;

export default CodeFragmentNode;