import { Definitions, Dependencies } from "shared";
import BaseNode, { IGCNodeProps, IGCNodePropsWithoutRegistry } from "../BaseNode";
import { runCode } from "@/utils/codeExecution";
import useStore from "@/store/store";
import { RegistryComponent } from "@/types/frontend";

type CodeData = {
	code: string;
	scope?: string;
	dependencies?: Dependencies;
	new_definitions?: Definitions;
};

type IGCCodeNodeData<T = {}> = T & {
    codeData: CodeData;
}

export type IGCCodeNodePropsWithoutRegistry<T = {}> = IGCNodePropsWithoutRegistry<IGCCodeNodeData & T>;
export type IGCCodeNodeProps<T = {}> = IGCCodeNodePropsWithoutRegistry<T> & RegistryComponent;

export const CodeNode: IGCCodeNodePropsWithoutRegistry = (props) => {
    const { projectDirectory } = useStore();

    const handleRun = () => {
		console.log("Run action triggered for node:", props.id);
		if (props.data.codeData !== undefined && projectDirectory !== null) {
			runCode(props.data.codeData.code, props.id, props.data.codeData.scope);
		}

		// // Select the node
		// setNodes((prevNodes) => {
		// 	return prevNodes.map((node) => {
		// 		node.selected = node.id === id;
		// 		return node;
		// 	});
		// });

		// // Deselect all edges
		// setEdges((prevEdges) => {
		// 	return prevEdges.map((edge) => {
		// 		edge.selected = false;
		// 		return edge;
		// 	});
		// });

	};
    return (
        <BaseNode {...props} data={{
            ...props.data,
            handleRun: handleRun,
        }}/>
    );
    
};

export default CodeNode;