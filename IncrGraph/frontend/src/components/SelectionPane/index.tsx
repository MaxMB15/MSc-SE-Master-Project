import React, { useState, useEffect } from "react";
import CustomSelect from "../CustomSelect";
import "./SelectionPane.css";
import useStore from "@/store/store";

interface SelectionPaneProps {}

const SelectionPane: React.FC<SelectionPaneProps> = ({}) => {

    // VARIABLES
    const { selectedItems, selectedItem, setSelectedItem, setNodes } = useStore();


    // STATE
	const [name, setName] = useState<string>("");
	const [selectedOption, setSelectedOption] = useState<string>("");

	useEffect(() => {
		if (selectedItems.length > 0) {
			setName(selectedItem?.name || "");
		}
	}, [selectedItem, selectedItems]);
	useEffect(() => {
		if (selectedItems.length > 0) {
			setSelectedItem(() => selectedItems[0]);
			let optionType = selectedItems[0].type === "Node" ? selectedItems[0].item.type : "";
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
			setNodes((prevNodes) =>
				prevNodes.filter((node) => node.id !== selectedItem.id),
			);
		}
	};

	const handleItemChange = (value: string) => {
		let item = selectedItems.find((item) => item.id === value);
		setSelectedItem(() => item ? item : null);
	};

	const getOptions = (type: "Node" | "Edge") => {
		if (type === "Node") {
			return [
				{
					value: "baseNode",
					label: "Base",
					className: "selection-pane-node-base",
				},
				{
					value: "classNode",
					label: "Class",
					className: "selection-pane-node-class",
				},
				{
					value: "abstractClassNode",
					label: "Abstract Class",
					className: "selection-pane-node-abstract-class",
				},
				{
					value: "interfaceNode",
					label: "Interface",
					className: "selection-pane-node-interface",
				},
				{
					value: "libraryNode",
					label: "Library",
					className: "selection-pane-node-library",
				},
				{
					value: "methodNode",
					label: "Method",
					className: "selection-pane-node-method",
				},
				{
					value: "codeFragmentNode",
					label: "Code Fragment",
					className: "selection-pane-node-code-fragment",
				},
			];
		} else if (type === "Edge") {
			return [
				{
					value: "Base",
					label: "Base",
					className: "selection-pane-edge-base",
				},
				{
					value: "Inheritance",
					label: "Inheritance",
					className: "selection-pane-edge-inheritance",
				},
				{
					value: "Overrides",
					label: "Overrides",
					className: "selection-pane-edge-overrides",
				},
				{
					value: "Method",
					label: "Method",
					className: "selection-pane-edge-method",
				},
				{
					value: "Execution",
					label: "Execution",
					className: "selection-pane-edge-execution",
				},
				{
					value: "Dependency",
					label: "Dependency",
					className: "selection-pane-edge-dependency",
				},
			];
		}
		return [];
	};

	return (
		<div className="selection-pane-formControl">
			{selectedItems.length !== 1 && (
				<CustomSelect
					id="item-select"
					label="Select Item"
					options={selectedItems.map((item) => ({
						value: item.id,
						label: item.name,
						className: "",
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
						options={getOptions("Node")}
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
						options={getOptions("Edge")}
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

export default SelectionPane;
