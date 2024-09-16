import "./CodeFragmentNode.css";
import CodeNode, { IGCCodeNodeProps } from "../CodeNode";
import { STYLES } from "@/styles/constants";

const CodeFragmentNode: IGCCodeNodeProps = ( props ) => (
	<CodeNode {...props} data={{
        ...props.data,
        backgroundColor: CodeFragmentNode.COLOR
    }}/>
);
CodeFragmentNode.NAME = "CodeFragmentNode";
CodeFragmentNode.COLOR = STYLES.codeFragmentNodeColor;
CodeFragmentNode.TYPE = "node";
CodeFragmentNode.SETABLE = true;

export default CodeFragmentNode;