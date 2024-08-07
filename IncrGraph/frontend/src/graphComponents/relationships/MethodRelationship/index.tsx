import "./MethodRelationship.css";
import { STYLES } from "@/styles/constants";
import IGCRelationship, { IGCRelationshipProps } from "../IGCRelationship";
import MethodNode from "@/graphComponents/nodes/MethodNode";
import ClassNode from "@/graphComponents/nodes/ClassNode";
import useStore from "@/store/store";

class MethodRelationship extends IGCRelationship {
	public static KEY = "MethodRelationship";
	constructor(props: IGCRelationshipProps) {
		super(props, MethodRelationship.KEY, STYLES.methodNodeColor);

		const { nodes, setNodes } = useStore.getState();

		const sourceNode = nodes.find((node) => node.id === props.source);
		const targetNode = nodes.find((node) => node.id === props.target);

		if (sourceNode === undefined || targetNode === undefined) {
			return;
		}

		if (
			sourceNode instanceof MethodNode &&
			targetNode instanceof ClassNode
		) {
			targetNode.updateAnalysis(); // Not sure if state will be saved
			if (targetNode.getDefinitions().classes.length !== 0) {
				// Update method node with class name
				setNodes((prevNodes) => {
					return prevNodes.map((node) => {
						if (node.id === sourceNode.id) {
							sourceNode.scope.push(targetNode.getDefinitions().classes[0]);
						}
						return sourceNode;
					});
				});
			}
		}
	}
}

export default MethodRelationship;
