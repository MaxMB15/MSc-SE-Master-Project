import CodeNode from "@/IGCItems/nodes/CodeNode";
import { IGCViewProps } from "../BaseView";
import CodeFragmentNode from "@/IGCItems/nodes/CodeFragmentNode";


const NodeCodeView: IGCViewProps = () => {
    return (
        <div>
            <h1>Node Code View</h1>
        </div>
    );
}
NodeCodeView.NAME = "NodeCodeView";
NodeCodeView.TYPE = "view";
NodeCodeView.COLOR = "#ffffff";
NodeCodeView.forComponents = [CodeFragmentNode]

export default NodeCodeView;