import "./ExecutionRelationship.css";
import { STYLES } from "@/styles/constants";
import IGCRelationship, { IGCRelationshipProps } from "../IGCRelationship";
import { SessionData } from "@/types/frontend";

class ExecutionRelationship extends IGCRelationship {
	public static KEY = "ExecutionRelationship";
	constructor(props: IGCRelationshipProps, label?: string) {
		const l = label || props.data?.labelObj?.label;
		super(
			props,
			STYLES.executionRelationshipColor,
            ExecutionRelationship.KEY,
			l !== undefined
				? {
						label: l,
						labelRadius: 50,
				  }
				: undefined,
		);
	}
	// Refresh the execution path edges
	public static updateExecutionPath(
		edges: IGCRelationship[],
		session: SessionData,
	): IGCRelationship[] {
		// Remove all execution relationship edges
		let filteredEdges = edges.filter(
			(edge) => !(edge instanceof ExecutionRelationship),
		);

		// Add execution relationship edges
		for (let i = 0; i < session.executionPath.length - 1; i++) {
			const source = session.executionPath[i];
			const target = session.executionPath[i + 1];
			const id = IGCRelationship.generateId(
				source,
				target,
				filteredEdges,
			);
			filteredEdges.push(
				new ExecutionRelationship(
					{
						id,
						source,
						target,
					},
					`${i + 1}`,
				),
			);
		}

		return filteredEdges;
	}

    // Logic for whenever an edge gets removed
public static removeExecutionRelation = (
	relationshipId: string,
	edges: IGCRelationship[],
	session: SessionData,
): { edges: IGCRelationship[]; session: SessionData } => {
	// Remove execution from executionPath. Note this might cause inconsistencies when running everything at once...
	// If an execution relationship is removed, update the session data

    const deleteQueue: string[] = [];
	const edgeObject = edges.find((edge) => edge.id === relationshipId);
	if (
		!(edgeObject instanceof ExecutionRelationship) ||
		edgeObject.data === undefined ||
		edgeObject.data.labelObj?.label === undefined
	) {
		return { edges, session };
	}
    deleteQueue.push(edgeObject.id);
	const label: string = edgeObject.data.labelObj.label;
	session.executionPath.splice(parseInt(label), 1);

	// Remove all execution relationship edges
	let filteredEdges = edges.filter(
		(edge) =>
			edge instanceof ExecutionRelationship ||
            deleteQueue.includes(edge.id),
	);

	// Add execution relationship edges
	for (let i = 0; i < session.executionPath.length - 1; i++) {
		const source = session.executionPath[i];
		const target = session.executionPath[i + 1];
        const id = IGCRelationship.generateId(source, target, filteredEdges);
		filteredEdges.push(
			new ExecutionRelationship(
                {
                    id,
				    source,
				    target
                },
				`${i + 1}`,
			),
		);
	}

	return { edges: filteredEdges, session };
};
}

export default ExecutionRelationship;
