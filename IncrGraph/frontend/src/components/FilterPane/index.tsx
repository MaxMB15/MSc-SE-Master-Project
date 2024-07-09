import React, { useState } from "react";
import {
	MenuItem,
	Checkbox,
	ListItemText,
	Popper,
	Paper,
	ClickAwayListener,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import "./FilterPane.css";
import useStore from "@/store/store";

const FilterPane: React.FC = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [filterOptions, setFilterOptions] = useState<{
		[key: string]: boolean;
	}>({
		Base: true,
		Inheritance: true,
		Overrides: true,
		Method: true,
		Execution: true,
		Dependency: true,
	});

	const { setEdges } = useStore();

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(anchorEl ? null : event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};

	const relationshipTypeMapping: { [key: string]: string } = {
		Base: "baseRelationship",
		Inheritance: "inheritanceRelationship",
		Overrides: "overridesRelationship",
		Method: "methodRelationship",
		Execution: "executionRelationship",
		Dependency: "dependencyRelationship",
	};

	const mapDisplayNameToRelationshipType = (
		displayName: string,
	): string | null => {
		return relationshipTypeMapping[displayName] || null;
	};

	const changeEdgeVisibility = (
		relationshipType: string,
		visible: boolean,
	) => {
		setEdges((prevEdges) => {
			const newEdges = prevEdges.map((edge) => {
				if (
					relationshipType ===
					edge.type
				) {
					edge.hidden = !visible;
				}
				return edge;
			});
			return newEdges;
		});
	};

	const handleCheckboxChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setFilterOptions({
			...filterOptions,
			[event.target.name]: event.target.checked,
		});
		changeEdgeVisibility(mapDisplayNameToRelationshipType(event.target.name) || "", event.target.checked);
	};

	const open = Boolean(anchorEl);

	return (
		<>
			<button
				className="icon-button"
				title="Filter Relationships"
				onClick={handleMenuOpen}
			>
				<FilterListIcon />
			</button>
			<Popper
				open={open}
				anchorEl={anchorEl}
				placement="bottom-start"
				className="filter-pane-popper"
			>
				<ClickAwayListener onClickAway={handleMenuClose}>
					<Paper className="filter-pane-paper">
						{[
							"Base",
							"Inheritance",
							"Overrides",
							"Method",
							"Execution",
							"Dependency",
						].map((relationshipType) => (
							<MenuItem
								key={relationshipType}
								className={`filter-pane-menu-item filter-pane-${relationshipType
									.replace(/\s/g, "-")
									.toLowerCase()}`}
							>
								<div className="filter-pane-color" />
								<ListItemText primary={relationshipType} />
								<Checkbox
									checked={filterOptions[relationshipType]}
									onChange={handleCheckboxChange}
									name={relationshipType}
									color="primary"
									className="filter-pane-checkbox"
									style={{ color: "#ffffff" }}
								/>
							</MenuItem>
						))}
					</Paper>
				</ClickAwayListener>
			</Popper>
		</>
	);
};

export default FilterPane;
