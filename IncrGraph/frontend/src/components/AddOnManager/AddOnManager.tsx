import React, { useState } from "react";
import styles from "./AddOnManager.module.css";

interface AddOnManagerProps {
	onClose: () => void;
}

const AddOnManager: React.FC<AddOnManagerProps> = ({ onClose }) => {
	const [nodes, setNodes] = useState<string[]>([
		"Node 1",
		"Node 2",
		"Node 3",
		"Node 4",
		"Node 5",
		"Node 6",
	]);
	const [relationships, setRelationships] = useState<string[]>([
		"Relationship 1",
	]);
	const [views, setViews] = useState<string[]>([
		"View 1",
		"View 2",
		"View 3",
	]);

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
