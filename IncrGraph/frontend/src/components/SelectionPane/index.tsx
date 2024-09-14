import React, { useState, useEffect } from "react";
import CustomSelect, { SelectOption } from "../CustomSelect";
import "./SelectionPane.css";
import useStore from "@/store/store";
import { applyEdgeChanges } from "reactflow";
import {
	updateExecutionPath,
	updateExecutionPathEdge,
} from "../../IGCItems/utils/utils";
import _ from "lodash";
import { useTriggerEdgeTypeUpdate } from "@/hooks/useEdgeTypeUpdate";
import { ModuleComponent, ModuleComponentValues, RegistryComponent } from "@/types/frontend";

interface SelectionPaneProps {}

const SelectionPane: React.FC<SelectionPaneProps> = ({}) => {
	// VARIABLES
	const {
		isIGCFile,
		selectedItems,
		selectedItem,
		setSelectedItem,
		setNodes,
		setEdges,
		currentSessionId,
		sessions,
		setSessions,
		nodeTypes,
		relationshipTypes,
	} = useStore();
	const triggerEdgeTypeUpdate = useTriggerEdgeTypeUpdate();

	// STATE
	const [name, setName] = useState<string>("");
	const [selectedOption, setSelectedOption] = useState<string>("");

	useEffect(() => {
		if (selectedItems.length > 0) {
			setName(selectedItem?.name || "");
		} else {
			setSelectedItem(() => null);
		}
	}, [selectedItem, selectedItems]);
	useEffect(() => {
		if (selectedItems.length > 0) {
			setSelectedItem(() => selectedItems[0]);
			let optionType = selectedItems[0].item.type;
			!optionType && (optionType = "");
			setSelectedOption(optionType);
		}
	}, [selectedItems]);

	if (selectedItems.length === 0) {
		return null;
	}

	const handleOptionChange = (value: string) => {
		setSelectedOption(value);
		if (selectedItem) {
			if (selectedItem.type === "Node") {
				setNodes((prevNodes) =>
					prevNodes.map((node) => {
						if (node.id === selectedItem.id) {
							return {
								...node,
								type: value,
							};
						}
						return node;
					}),
				);
			} else if (selectedItem.type === "Edge") {
				setEdges((prevEdges) =>
					prevEdges.map((edge) => {
						if (edge.id === selectedItem.id) {
							return {
								...edge,
								type: value,
							};
						}
						return edge;
					}),
				);
				triggerEdgeTypeUpdate(selectedItem.id);
			}
		}
	};

	const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value);
		if (selectedItem) {
			setNodes((prevNodes) =>
				prevNodes.map((node) => {
					if (node.id === selectedItem.id) {
						return {
							...node,
							data: {
								...node.data,
								label: event.target.value,
							},
						};
					}
					return node;
				}),
			);
		}
	};

	const handleDelete = () => {
		console.log("Delete button clicked");
		if (selectedItem) {
			if (selectedItem.type === "Node") {
				// Get current session data
				if (currentSessionId !== null) {
					const session = sessions.get(currentSessionId);
					if (session !== undefined) {
						setEdges((prevEdges) => {
							let vSession = _.cloneDeep(session);
							let currentExecutionPath: string[] = _.cloneDeep(
								vSession.executionPath,
							);
							vSession.executionPath;
							let edgesConnectedToNode = prevEdges.filter(
								(edge) =>
									edge.source === selectedItem.id ||
									edge.target === selectedItem.id,
							);

							for (let edge of edgesConnectedToNode.reverse()) {
								let edgeId = edge.id;
								let changes = updateExecutionPathEdge(
									edgeId,
									prevEdges,
									vSession,
								);
								prevEdges = changes.edges;
								vSession = changes.session;
							}
							if (
								vSession.executionPath !== currentExecutionPath
							) {
								// Shallow is okay
								setSessions((prevSessions) => {
									return prevSessions.set(
										currentSessionId,
										vSession,
									);
								});
							}

							return updateExecutionPath(prevEdges, vSession);
						});
					}
				}
				setNodes((prevNodes) =>
					prevNodes.filter((node) => node.id !== selectedItem.id),
				);
			} else if (selectedItem.type === "Edge") {
				setEdges((prevEdges) => {
					// Get current session data
					if (currentSessionId !== null) {
						const session = sessions.get(currentSessionId);
						if (session !== undefined) {
							let vSession = session;
							let currentExecutionPath: string[] = _.cloneDeep(
								vSession.executionPath,
							);

							const uepData = updateExecutionPathEdge(
								selectedItem.id,
								prevEdges,
								vSession,
							);
							prevEdges = uepData.edges;
							vSession = uepData.session;
							if (
								vSession.executionPath !== currentExecutionPath
							) {
								// Shallow is okay
								setSessions((prevSessions) => {
									return prevSessions.set(
										currentSessionId,
										vSession,
									);
								});
							}
						}
					}
					return applyEdgeChanges(
						[{ type: "remove", id: selectedItem.id }],
						prevEdges,
					);
				});
			}
		}
	};

	const handleItemChange = (value: string) => {
		let item = selectedItems.find((item) => item.id === value);
		setSelectedItem(() => (item ? item : null));
	};

	// const getOptions = (type: "Node" | "Edge") => {
	// 	if (type === "Node") {
	// 		return [
	// 			{
	// 				value: "BaseNode",
	// 				label: "Base",
	// 				className: "selection-pane-node-base",
	// 			},
	// 			{
	// 				value: "ClassNode",
	// 				label: "Class",
	// 				className: "selection-pane-node-class",
	// 			},
	// 			{
	// 				value: "AbstractClassNode",
	// 				label: "Abstract Class",
	// 				className: "selection-pane-node-abstract-class",
	// 			},
	// 			{
	// 				value: "InterfaceNode",
	// 				label: "Interface",
	// 				className: "selection-pane-node-interface",
	// 			},
	// 			{
	// 				value: "LibraryNode",
	// 				label: "Library",
	// 				className: "selection-pane-node-library",
	// 			},
	// 			{
	// 				value: "MethodNode",
	// 				label: "Method",
	// 				className: "selection-pane-node-method",
	// 			},
	// 			{
	// 				value: "CodeFragmentNode",
	// 				label: "Code Fragment",
	// 				className: "selection-pane-node-code-fragment",
	// 			},
	// 			{
	// 				value: "ImportNode",
	// 				label: "Import File Node",
	// 				className: "selection-pane-node-import",
	// 			},
	// 		];
	// 	} else if (type === "Edge") {
	// 		return [
	// 			{
	// 				value: "BaseRelationship",
	// 				label: "Base",
	// 				className: "selection-pane-edge-base",
	// 			},
	// 			{
	// 				value: "InheritanceRelationship",
	// 				label: "Inheritance",
	// 				className: "selection-pane-edge-inheritance",
	// 			},
	// 			{
	// 				value: "OverridesRelationship",
	// 				label: "Overrides",
	// 				className: "selection-pane-edge-overrides",
	// 			},
	// 			{
	// 				value: "MethodRelationship",
	// 				label: "Method",
	// 				className: "selection-pane-edge-method",
	// 			},
	// 			{
	// 				value: "ExecutionRelationship",
	// 				label: "Execution",
	// 				className: "selection-pane-edge-execution",
	// 			},
	// 			{
	// 				value: "DependencyRelationship",
	// 				label: "Dependency",
	// 				className: "selection-pane-edge-dependency",
	// 			},
	// 		];
	// 	}
	// 	return [];
	// };

	if (!isIGCFile) {
		return;
	}
	return (
		<div className="selection-pane-formControl">
			{selectedItems.length !== 1 && (
				<CustomSelect
					id="item-select"
					label="Select Item"
					options={selectedItems.map((item) => ({
						value: item.id,
						label: item.name,
						style: {},
					}))}
					value={selectedItem?.id ? selectedItem.id : ""}
					onChange={handleItemChange}
				/>
			)}

			{selectedItem?.type === "Node" && (
				<>
					<CustomSelect
						id="node-select"
						label="Node"
						options={createSelectionList(nodeTypes)}
						value={selectedOption}
						onChange={handleOptionChange}
					/>
					<label
						htmlFor="name-input"
						className="selection-pane-label"
					>
						Name
					</label>
					<input
						id="name-input"
						type="text"
						value={name}
						onChange={handleNameChange}
						className="selection-pane-input"
					/>
				</>
			)}

			{selectedItem?.type === "Edge" && (
				<>
					<CustomSelect
						id="edge-select"
						label="Relation"
						options={createSelectionList(relationshipTypes)}
						value={selectedOption}
						onChange={handleOptionChange}
					/>
				</>
			)}

			<button
				className="selection-pane-deleteButton"
				onClick={handleDelete}
			>
				DELETE
			</button>
		</div>
	);
};

const insertSpaceBeforeUppercase = (str: string): string => {
    return str.replace(/([A-Z])/g, (_, p1, offset) => {
      return offset > 0 ? ` ${p1}` : p1; // Add space only if it's not the first character
    });
  }

const cleanLabel = (rc: RegistryComponent): string => {
    return insertSpaceBeforeUppercase(rc.NAME.toUpperCase().endsWith(rc.TYPE.toUpperCase()) ? rc.NAME.slice(0, rc.NAME.length-rc.TYPE.length) : rc.NAME);
}

export const createSelectionList = (
	componentTypes: ModuleComponent<any>,
): SelectOption[] => {
	const mappedArray = Object.values(componentTypes)
		.filter(
			(component: ModuleComponentValues<any>) =>
				component.object.SETABLE !== undefined && component.object.SETABLE === true,
		)
		.map((component: ModuleComponentValues<any>) => {
			return {
				value: component.object.NAME,
				label: cleanLabel(component.object),
				style: { backgroundColor: component.object.COLOR },
			};
		});
	return mappedArray;
};

export default SelectionPane;
