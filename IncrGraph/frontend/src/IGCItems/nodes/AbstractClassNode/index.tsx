import "./AbstractClassNode.css";
import { STYLES } from "@/styles/constants";
import CodeNode, { IGCCodeNodeProps } from "../CodeNode";
import { createComponent } from "@/utils/componentCache";
import { RegistryComponent } from "@/types/frontend";

const RawAbstractClassNode: IGCCodeNodeProps = (props) => (
	<CodeNode
		{...props}
		data={{
			...props.data,
			backgroundColor: AbstractClassNode.color,
		}}
	/>
);

const AbstractClassNode: IGCCodeNodeProps & RegistryComponent = createComponent(
	RawAbstractClassNode,
	"AbstractClassNode",
	"Abstract Class Node",
	{
		color: STYLES.abstractClassNodeColor,
		parentComponent: CodeNode,
		settable: true,
	},
);

export default AbstractClassNode;
