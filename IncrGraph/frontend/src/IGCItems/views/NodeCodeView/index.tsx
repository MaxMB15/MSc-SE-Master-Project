import CodeNode from "@/IGCItems/nodes/CodeNode";
import { IGCViewProps } from "../BaseView";
import { createView } from "@/utils/componentCache";
import { RegistryComponent } from "@/types/frontend";
import CodeFragmentNode from "@/IGCItems/nodes/CodeFragmentNode";

const RawNodeCodeView: React.FC = () => {
	return (
		<div>
			<h1>Node Code View</h1>
		</div>
	);
};
const NodeCodeView: IGCViewProps & RegistryComponent = createView(
	RawNodeCodeView,
	"NodeCodeView",
	"Node Code View",
    [CodeNode],
    {}
);


export default NodeCodeView;
