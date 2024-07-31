import "./MethodRelationship.css";
import { STYLES } from "@/styles/constants";
import { IGCEdge, IGCEdgeProps } from "@/graphComponents/edges/IGCEdge";
import { MethodNode } from "@/graphComponents/nodes/MethodNode";
import { ClassNode } from "@/graphComponents/nodes/ClassNode";
import useStore from "@/store/store";

interface MethodRelationshipProps extends IGCEdgeProps {}

export class MethodRelationship extends IGCEdge implements MethodRelationshipProps {
    
    constructor({...props}: MethodRelationship) {
        super({
            ...props,
            backgroundColor: STYLES.methodRelationshipColor,
        });

        const {nodes, setNodes} = useStore.getState();

        const sourceNode = nodes.find((node) => node.id === props.source);
        const targetNode = nodes.find((node) => node.id === props.target);

        if(sourceNode === undefined || targetNode === undefined) {
            return;
        }

        if(sourceNode instanceof MethodNode && targetNode instanceof ClassNode) {
            targetNode.updateAnalysis(); // Not sure if state will be saved
            if(targetNode.getDefinitions().classes.length !== 0){

                // Update method node with class name
                setNodes((prevNodes) => {
                    return prevNodes.map((node) => {
                        if (node.id === sourceNode.id) {
                            sourceNode.scope = targetNode.getDefinitions().classes[0];
                        }
                        return sourceNode;
                    });
                });
            }
        }
    }

    public static KEY = "MethodRelationship";
}
