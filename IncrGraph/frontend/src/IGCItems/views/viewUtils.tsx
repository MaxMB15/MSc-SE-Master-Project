import useStore from "@/store/store";
import { ElementItem } from "@/types/frontend";

// Save Indicator
const saveIndicatorKey = "saveIndicator";
const updateElementItem = (element: ElementItem, elements: ElementItem[]) =>
	elements.some((e) => e.key === element.key)
		? elements.map((e) => {
				if (e.key === element.key) {
					return element;
				}
				return e;
		  })
		: [...elements, element];

export type SaveIndicatorProps = "saved" | "error" | "outdated";

export const useSaveIndicator = (status: SaveIndicatorProps) => {
	const saveIndicator: ElementItem = {
		key: saveIndicatorKey,
		weight: 0,
		element: (
			<span
                key={saveIndicatorKey}
				className="navbar-circle-icon"
				style={{
					backgroundColor:
						status === "saved"
							? "green"
							: status === "error"
							? "red"
							: "orange",
				}}
			></span>
		),
	};

	useStore.getState().setNavBarContainer((prev) => updateElementItem(saveIndicator, prev));
};
