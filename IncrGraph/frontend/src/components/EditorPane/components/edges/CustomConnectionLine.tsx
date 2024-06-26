import { ConnectionLineComponent, getStraightPath } from "reactflow";
import { STYLES } from "../../../../styles/constants";

const CustomConnectionLine: ConnectionLineComponent = ({
	fromX,
	fromY,
	toX,
	toY,
	connectionLineStyle,
}) => {
	const [edgePath] = getStraightPath({
		sourceX: fromX,
		sourceY: fromY,
		targetX: toX,
		targetY: toY,
	});

	return (
		<g>
			<path style={connectionLineStyle} fill="none" d={edgePath} />
			<circle
				cx={toX}
				cy={toY}
				fill={STYLES.defaultEdgeColor}
				r={3}
				stroke={STYLES.defaultEdgeColor}
				strokeWidth={1.5}
			/>
		</g>
	);
};

export default CustomConnectionLine;

export const connectionLineStyle = {
	strokeWidth: STYLES.edgeWidth,
	stroke: STYLES.defaultEdgeColor,
};
