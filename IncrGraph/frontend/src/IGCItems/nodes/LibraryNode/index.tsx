import "./LibraryNode.css";
import CodeNode, { IGCCodeNodeProps } from "../CodeNode";
import { STYLES } from "@/styles/constants";

const LibraryNode: IGCCodeNodeProps = ( props ) => (
	<CodeNode {...props} data={{
        ...props.data,
        backgroundColor: LibraryNode.COLOR
    }}/>
);
LibraryNode.NAME = "LibraryNode";
LibraryNode.COLOR = STYLES.libraryNodeColor;
LibraryNode.TYPE = "node";
LibraryNode.SETABLE = true;

export default LibraryNode;
