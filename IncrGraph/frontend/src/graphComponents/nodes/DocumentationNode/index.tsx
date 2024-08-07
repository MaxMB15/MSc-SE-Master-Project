import "./DocumentationNode.css";
import { STYLES } from "@/styles/constants";
import { IGCCodeNode, IGCNode, IGCNodeProps } from "../IGCNode";
import IGCRelationship from "@/graphComponents/relationships/IGCRelationship";
import { EditorDisplayNode } from "@/types/frontend";
import DocumentationRelationship from "@/graphComponents/relationships/DocumentationRelationship";
import useStore from "@/store/store";

type DocumentationNodeProps = {
	documentation: string;
};

export default class DocumentationNode extends IGCNode {
	documentation: string;
	constructor(
		props: IGCNodeProps<DocumentationNodeProps>,
		documentation: string,
		label?: string,
	) {
		props = {
			...props,
			data: {
				...props.data,
				backgroundColor: STYLES.documentationNodeColor,
				label: label || props.data?.label || "",
				documentation: documentation,
			},
		};
		super(props, DocumentationNode.KEY, STYLES.documentationNodeColor);
		this.documentation = documentation;
	}

	public editorDisplay(): EditorDisplayNode {
		return {
			useEditor: {
				code: this.documentation,
                language: "markdown",
			},
		};
	}

    public editorChange(documentation: string): void {
        this.documentation = documentation;
    }

	public createRelationships(edges: IGCRelationship[]): IGCRelationship[] {
		// Implementation of createRelationships
		return edges;
	}

	public static getCodeDocumentation(node: IGCCodeNode): string | null {
		const incomingDocumentationNodes = node.getIncomingNodes((n) => {
			return n instanceof DocumentationNode;
		}) as DocumentationNode[];

		if (incomingDocumentationNodes.length === 0) {
			return null;
		}
		const documentationNode = incomingDocumentationNodes[0];
		return documentationNode.documentation;
	}

	public static setOrCreateDocumentationNode(node: IGCCodeNode): void {
		const { setNodes, edges, setEdges } = useStore.getState();

		const incomingDocumentationNodes = node.getIncomingNodes((n) => {
			return n instanceof DocumentationNode;
		}) as DocumentationNode[];

		if (incomingDocumentationNodes.length === 0) {
			// Create the documentation node
			const documentationNodeId = `documentation-${node.id}`;
			const documentationNode = new DocumentationNode(
				{
					id: documentationNodeId,
					xPos: node.position.x,
					yPos: node.position.y - 200,
					selected: true,
				},
				"",
				"Documentation",
			);
			const documentationRelationshipId = IGCRelationship.generateId(
				documentationNodeId,
				node.id,
				edges,
			);
			const documentationRelationship = new DocumentationRelationship({
				id: documentationRelationshipId,
				source: documentationNodeId,
				target: node.id,
			});

			setNodes((prevNodes) => [
				...prevNodes.map((n) => {
					n.selected = false;
					return n;
				}),
				documentationNode,
			]);
			setEdges((prevRelationships) => [
				...prevRelationships.map((r) => {
					r.selected = false;
					return r;
				}),
				documentationRelationship,
			]);
		} else {
			// Select the documentation node
			setNodes((prevNodes) => [
				...prevNodes.map((node) => {
					if (node.id === incomingDocumentationNodes[0].id) {
						node.selected = true;
					} else {
						node.selected = false;
					}
					return node;
				}),
			]);
			setEdges((prevRelationships) =>
				prevRelationships.map((r) => {
					r.selected = false;
					return r;
				}),
			);
		}
	}

	public static KEY = "DocumentationNode";
}
