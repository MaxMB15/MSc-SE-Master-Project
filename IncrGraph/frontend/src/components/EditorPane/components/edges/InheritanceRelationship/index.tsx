import { ComponentType, useCallback } from "react";
import { useStore, getStraightPath, EdgeProps, MarkerType } from "reactflow";
import { STYLES } from "@/styles/constants";

import BaseRelation from "../BaseRelationship";

interface InheritanceRelationshipProps extends EdgeProps {
	id: string;
	source: string;
	target: string;
	markerEnd?: string;
	style?: React.CSSProperties;
	data?: {
		backgroundColor?: string;
	};
	selected?: boolean;
}

const InheritanceRelationship: ComponentType<InheritanceRelationshipProps> = ({
	id,
	source,
	target,
	style,
	data,
	selected,
}) => {
	return <BaseRelation id={id} source={source} target={target} style={style} data={data} selected={selected} />;
};

export default InheritanceRelationship;

export const defaultEdgeOptions = {
	// style: { strokeWidth: STYLES.edgeWidth, stroke: STYLES.defaultEdgeColor },
	type: "floating",
	markerEnd: {
		type: MarkerType.ArrowClosed,
		color: STYLES.defaultEdgeColor,
	},
	elevateEdgesOnSelection: true,
};
