import React, { useState } from "react";
import styles from "./AddOnManager.module.css";
import useStore from "@/store/store";

interface AddOnManagerProps {
	onClose: () => void;
}

const AddOnManager: React.FC<AddOnManagerProps> = ({ onClose }) => {

    const {nodeTypes, relationshipTypes, viewTypes} = useStore();

	const [nodes, setNodes] = useState<string[]>(Object.keys(nodeTypes));
	const [relationships, setRelationships] = useState<string[]>(Object.keys(relationshipTypes));
	const [views, setViews] = useState<string[]>(Object.keys(viewTypes));

	const [selectedItems, setSelectedItems] = useState<string[]>([]);

	const toggleSelection = (item: string) => {
		setSelectedItems((prevSelected) =>
			prevSelected.includes(item)
				? prevSelected.filter((selectedItem) => selectedItem !== item)
				: [...prevSelected, item],
		);
	};

	const deleteSelected = () => {
		setNodes(nodes.filter((node) => !selectedItems.includes(node)));
		setRelationships(
			relationships.filter((rel) => !selectedItems.includes(rel)),
		);
		setViews(views.filter((view) => !selectedItems.includes(view)));
		setSelectedItems([]);
	};

	return (
		<div className={styles.managerContainer}>
			<div className={styles.listsContainer}>
				<div className={styles.listSection}>
					<h3>Nodes</h3>
					<ul className={styles.scrollableList}>
						{nodes.map((node) => (
							<li
								key={node}
								className={`${styles.listItem} ${
									selectedItems.includes(node)
										? styles.selected
										: ""
								}`}
								onClick={() => toggleSelection(node)}
							>
								{node}
							</li>
						))}
					</ul>
				</div>

				<div className={styles.listSection}>
					<h3>Relationships</h3>
					<ul className={styles.scrollableList}>
						{relationships.map((relationship) => (
							<li
								key={relationship}
								className={`${styles.listItem} ${
									selectedItems.includes(relationship)
										? styles.selected
										: ""
								}`}
								onClick={() => toggleSelection(relationship)}
							>
								{relationship}
							</li>
						))}
					</ul>
				</div>

				<div className={styles.listSection}>
					<h3>Views</h3>
					<ul className={styles.scrollableList}>
						{views.map((view) => (
							<li
								key={view}
								className={`${styles.listItem} ${
									selectedItems.includes(view)
										? styles.selected
										: ""
								}`}
								onClick={() => toggleSelection(view)}
							>
								{view}
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className={styles.actionButtons}>
				<button
					className={styles.deleteBtn}
					onClick={deleteSelected}
					disabled={selectedItems.length === 0}
				>
					Delete Selected
				</button>
				<button className={styles.importBtn}>Import AddOn</button>
			</div>
		</div>
	);
};

export default AddOnManager;
