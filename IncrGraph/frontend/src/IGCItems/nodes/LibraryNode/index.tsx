import "./LibraryNode.css";
import CodeNode, { IGCCodeNodeProps } from "../CodeNode";
import { STYLES } from "@/styles/constants";
import { createComponent } from "@/utils/componentCache";
import { RegistryComponent } from "@/types/frontend";

const RawLibraryNode: IGCCodeNodeProps = (props) => (
	<CodeNode
		{...props}
		data={{
			...props.data,
			backgroundColor: LibraryNode.color,
		}}
	/>
);

const LibraryNode: IGCCodeNodeProps & RegistryComponent = createComponent(
	RawLibraryNode,
	"LibraryNode",
	"Library Node",
	{
		color: STYLES.libraryNodeColor,
		parentComponent: CodeNode,
		settable: true,
	},
);

export default LibraryNode;
