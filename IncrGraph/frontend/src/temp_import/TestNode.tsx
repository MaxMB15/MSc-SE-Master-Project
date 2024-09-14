import BaseNode, { IGCNodeProps } from "@/IGCItems/nodes/BaseNode";

const TestNode: IGCNodeProps = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        backgroundColor: TestNode.COLOR
    }}/>
);
TestNode.NAME = "TestNode";
TestNode.COLOR = "cyan";
TestNode.TYPE = "node";
TestNode.SETABLE = true;

export default TestNode;
