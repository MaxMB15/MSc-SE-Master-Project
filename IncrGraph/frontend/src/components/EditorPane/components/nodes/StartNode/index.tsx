import React from "react";
import "./StartNode.css";
import { Handle, Position } from "reactflow";


const StartNode: React.FC = () => {

	return (
		<div className="igc-start-node">
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
		</div>
	);
};

export default StartNode;
