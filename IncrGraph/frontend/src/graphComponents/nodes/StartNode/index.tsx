import React from "react";
import "./StartNode.css";
import { Handle, Position } from "reactflow";
import { changeSelection } from "@/graphComponents/utils/utils";
import { IGCNode, IGCNodeProps } from "../IGCNode";
import IGCRelationship from "@/graphComponents/relationships/IGCRelationship";
import { EditorDisplayNode } from "@/types/frontend";


export default class StartNode extends IGCNode {
    constructor(partialNodeProps: IGCNodeProps) {
        super(partialNodeProps, StartNode.KEY, "#ffffff");
    }
    public editorDisplay(): EditorDisplayNode {
        return {}
    }
    public deserialize(): string {
        throw new Error("Method not implemented.");
    }
    public createRelationships(edges: IGCRelationship[]): IGCRelationship[] {
        // Does not do anything
        return edges;
    }
    // Override single click and unselect all nodes
	private onNodeClick(event: React.MouseEvent<HTMLElement>) {
		event.stopPropagation(); // Prevent the default single click behavior
        // Deselect All Nodes and Edges
        changeSelection([]);
	};

	render () {
		return (<div className="igc-start-node" onClick={this.onNodeClick}>
			<div className="igc-start-node-inner">
				<Handle
					type="source"
					position={Position.Top}
					style={{
						left: "50%",
						top: "50%",
						transform: "translate(-50%, -50%)",
                        border: "1px solid transparent",
					}}
				/>
			</div>
		</div>);
    }

    public static KEY = "StartNode";
}