import BaseNode, { IGCNodeProps } from "../BaseNode";

const TestNode: IGCNodeProps = ( props ) => (
	<BaseNode {...props} data={{
        ...props.data,
        backgroundColor: TestNode.COLOR
    }}/>
);
TestNode.NAME = "TestNode";
TestNode.COLOR = "cyan";
TestNode.SETABLE = true;

export default TestNode;
