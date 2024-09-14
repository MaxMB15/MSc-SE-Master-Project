import "./LibraryNode.css";
import BaseNode, { IGCNodeProps } from "../BaseNode";
import { STYLES } from "@/styles/constants";

const LibraryNode: IGCNodeProps = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        backgroundColor: LibraryNode.COLOR
    }}/>
);
LibraryNode.NAME = "LibraryNode";
LibraryNode.COLOR = STYLES.libraryNodeColor;
LibraryNode.TYPE = "node";
LibraryNode.SETABLE = true;

export default LibraryNode;
