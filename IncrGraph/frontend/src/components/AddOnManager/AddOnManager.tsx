import React, { useState } from "react";
import styles from "./AddOnManager.module.css";
import useStore from "@/store/store";
import { callAddModule, callRemoveModule } from "@/requests";
import { ModuleComponent, ModuleComponentValues } from "@/types/frontend";
import path from "path-browserify";
import { useComponentRegistry } from "@/hooks/useComponentRegistry";
import { fetchAndRegisterComponents } from "@/utils/componentCache";

interface AddOnManagerProps {
	onClose: () => void;
}

const AddOnManager: React.FC<AddOnManagerProps> = ({ onClose }) => {
	const { nodeTypes, relationshipTypes, viewTypes, moduleData } = useStore();

	const { registerComponent, updateComponent } = useComponentRegistry();
	const everyComponentLabel = "All";

	const [selectedModule, setSelectedModule] =
		useState<string>(everyComponentLabel);
	const [selectedItems, setSelectedItems] = useState<
		ModuleComponentValues<any>[]
	>([]);

	const moduleComponentExists = (
		moduleComponent: ModuleComponentValues<any>,
		list: ModuleComponentValues<any>[],
	): boolean => {
		return list.some(
			(component) =>
				component.object.NAME === moduleComponent.object.NAME &&
				component.modulePath === moduleComponent.modulePath,
		);
	};

	const toggleSelection = (moduleComponent: ModuleComponentValues<any>) => {
		setSelectedItems((prevSelected) =>
			moduleComponentExists(moduleComponent, prevSelected)
				? prevSelected.filter(
						(selectedItem) => selectedItem !== moduleComponent,
				  )
				: [...prevSelected, moduleComponent],
		);
	};

	const getListFromComponentTypes = (
		componentTypes: ModuleComponent<any>,
	): JSX.Element[] => {
		return Object.values(componentTypes)
			.filter(
				(c) =>
					selectedModule === everyComponentLabel ||
					selectedModule === c.modulePath,
			)
			.map((component: ModuleComponentValues<any>) => (
				<li
					key={`${component.modulePath}~${component.object.NAME}`}
					className={`${styles.listItem} ${
						selectedItems.includes(component.object.NAME)
							? styles.selected
							: ""
					}`}
					onClick={() => toggleSelection(component)}
				>
					{component.object.NAME}
				</li>
			));
	};

	// Placeholder function for importing an add-on
	const handleImportAddon = (modulePath: string): void => {
		// Logic for importing addon
		callAddModule(modulePath).then(() => {
			// Refresh components
			handleRefreshComponents();
		});
	};

	// Placeholder function for refreshing the components
	const handleRefreshComponents = (): void => {
		// Logic for refreshing components
		fetchAndRegisterComponents(registerComponent);
	};

	const toggleEnableDisable = () => {
		// Logic to enable or disable selected items
		const toEnable =
			selectedItems.length > 0 ? !selectedItems[0].enabled : true;
		selectedItems.forEach((selectedItem) => {
			selectedItem.enabled = toEnable;
			updateComponent(selectedItem);
		});
	};

	const deleteModule = (modulePath: string) => {
		// Remove from files given from backend
		callRemoveModule(modulePath).then(() => {
			// Refresh components
			handleRefreshComponents();
		});
	};

	return (
		<div className={styles.managerContainer}>
			{/* Module Selector Dropdown */}
			<div className={styles.moduleSelectContainer}>
				<select
					value={selectedModule}
					onChange={(e) => setSelectedModule(e.target.value)}
					className={styles.moduleSelect}
				>
					<option value="All">All Modules</option>
					{moduleData.map((module) => (
						<option
							key={module.search_path}
							value={module.search_path}
						>
							{module.meta?.name ||
								path.basename(module.search_path)}
						</option>
					))}
				</select>

				{/* Refresh Button */}
				<button
					className={styles.refreshBtn}
					onClick={handleRefreshComponents}
				>
					Refresh
				</button>
			</div>

			<div className={styles.listsContainer}>
				<div className={styles.listSection}>
					<h3>Nodes</h3>
					<ul className={styles.scrollableList}>
						{getListFromComponentTypes(nodeTypes)}
					</ul>
				</div>

				<div className={styles.listSection}>
					<h3>Relationships</h3>
					<ul className={styles.scrollableList}>
						{getListFromComponentTypes(relationshipTypes)}
					</ul>
				</div>

				<div className={styles.listSection}>
					<h3>Views</h3>
					<ul className={styles.scrollableList}>
						{getListFromComponentTypes(viewTypes)}
					</ul>
				</div>
			</div>

			<div className={styles.actionButtons}>
				{/* Enable/Disable Selected */}
				<button
					className={styles.enableDisableBtn}
					onClick={toggleEnableDisable}
					disabled={selectedItems.length === 0}
				>
					Enable/Disable Selected
				</button>

				{/* Import AddOn */}
				<button
					className={styles.importBtn}
					onClick={() =>
						handleImportAddon(
							"/Users/maxboksem/Documents/Master's Thesis/MSc-SE-Master-Project/IncrGraph/frontend/src/temp_import",
						)
					}
				>
					Import AddOn
				</button>

				{/* Remove Module */}
				<button
					className={styles.deleteBtn}
					onClick={() => deleteModule(selectedModule)}
					disabled={selectedModule === "All"}
				>
					Remove AddOn
				</button>
			</div>
		</div>
	);
};

export default AddOnManager;
