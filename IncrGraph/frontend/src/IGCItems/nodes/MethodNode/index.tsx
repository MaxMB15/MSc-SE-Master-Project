import "./MethodNode.css";
import CodeNode, { IGCCodeNodeProps } from "../CodeNode";
import { STYLES } from "@/styles/constants";
import { createComponent } from "@/utils/componentCache";
import { RegistryComponent } from "@/types/frontend";

const RawMethodNode: IGCCodeNodeProps = (props) => (
	<CodeNode
		{...props}
		data={{
			...props.data,
			backgroundColor: MethodNode.color,
		}}
	/>
);

const MethodNode: IGCCodeNodeProps & RegistryComponent = createComponent(
	RawMethodNode,
	"MethodNode",
	"Method Node",
	{
		color: STYLES.methodNodeColor,
		parentComponent: CodeNode,
		settable: true,
	},
);

export default MethodNode;
