import { STYLES } from "@/styles/constants";
import BaseRelationship, { IGCRelationshipProps } from "../BaseRelationship";

const ExecutionRelationship: IGCRelationshipProps = (
	props,
) => {
	return (
		<BaseRelationship
			{...props}
			data={{
				...props.data,
				backgroundColor: ExecutionRelationship.COLOR,
                labelRadius: 50
			}}
		/>
	);
};
ExecutionRelationship.NAME = "ExecutionRelationship";
ExecutionRelationship.COLOR = STYLES.executionRelationshipColor;
ExecutionRelationship.TYPE = "relationship";
ExecutionRelationship.SETABLE = true;

export default ExecutionRelationship;

