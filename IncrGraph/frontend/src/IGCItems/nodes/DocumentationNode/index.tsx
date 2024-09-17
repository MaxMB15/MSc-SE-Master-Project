import "./DocumentationNode.css";
import BaseNode, { IGCNodeProps } from "../BaseNode";
import { STYLES } from "@/styles/constants";
import { createComponent } from "@/utils/componentCache";
import { RegistryComponent } from "@/types/frontend";

const RawDocumentationNode: IGCNodeProps = (props) => (
	<BaseNode
		{...props}
		data={{
			...props.data,
			backgroundColor: DocumentationNode.color,
		}}
	/>
);

const DocumentationNode: IGCNodeProps & RegistryComponent = createComponent(
	RawDocumentationNode,
	"DocumentationNode",
	"Documentatio Node",
	{
		color: STYLES.documentationNodeColor,
		parentComponent: BaseNode,
	},
);

export default DocumentationNode;
