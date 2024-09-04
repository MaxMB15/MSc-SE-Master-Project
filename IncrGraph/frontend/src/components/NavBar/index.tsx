import React, { useState } from "react";
import {
	AppBar,
	Toolbar,
	Typography,
	Menu,
	MenuItem,
	IconButton,
	Divider,
	Box,
	Drawer,
	List,
	ListItem,
	ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info";
import OpenDirectoryButton from "../OpenDirectoryButton";
import useStore from "@/store/store";
import ThemeToggle from "../ThemeToggle";
import styles from './NavBar.module.css'; // Import the CSS module
import { isCodeContainingNode } from "../EditorPane/components/utils/types";

const Navbar: React.FC = () => {
	const [anchorElFile, setAnchorElFile] = useState<null | HTMLElement>(null);
	const [anchorElEdit, setAnchorElEdit] = useState<null | HTMLElement>(null);
	const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false);
	const [isConnectionStatusOpen, setIsConnectionStatusOpen] = useState(false);
	const [isConnected, setIsConnected] = useState(false);

	const { nodes, mode } = useStore();

	const { setProjectDirectory } = useStore(); // Variables from data store

	const handleFileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElFile(event.currentTarget);
	};

	const handleEditMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElEdit(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorElFile(null);
		setAnchorElEdit(null);
	};

	const handleOpenDirectory = (pathSelected: string) => {
		setProjectDirectory(() => pathSelected);
	};

	const toggleProjectInfoDrawer = () => {
		setIsProjectInfoOpen(!isProjectInfoOpen);
	};

	const toggleConnectionStatusDrawer = () => {
		setIsConnectionStatusOpen(!isConnectionStatusOpen);
	};

	const handleConnectNow = () => {
		// Simulate a connection attempt
		setIsConnected(true);
	};

	const handleSync = () => {
		// Simulate a sync action
		console.log("Syncing with server...");
	};

	const SLOC = (): string => {
		let sloc = 0;
		nodes.forEach((node) => {
			if (isCodeContainingNode(node)) {
				sloc += node.data.code.split("\n").length;
			}
		});
		return sloc.toString();
	};

	return (
		<AppBar
			position="static"
			className={styles.header} // Apply the header styles
		>
			<Toolbar>
				<img
					src="/logo.png"
					alt="Logo"
					className={styles.logo} // Apply the logo styles
				/>
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					Incremental Graph Code (IncrCode)
				</Typography>
				<Box sx={{ display: "flex", alignItems: "center" }}>
					<IconButton
						edge="start"
						color="inherit"
						aria-label="file menu"
						onClick={handleFileMenuOpen}
						className={styles.menuButton} // Apply the menu button styles
					>
						<MenuIcon />
						<Typography variant="button" sx={{ ml: 1 }}>
							File
						</Typography>
					</IconButton>
					<Menu
						anchorEl={anchorElFile}
						open={Boolean(anchorElFile)}
						onClose={handleMenuClose}
					>
						<MenuItem onClick={handleMenuClose}>
							New Project
						</MenuItem>
						<Divider />
						<MenuItem
							onClick={handleMenuClose}
							style={{ padding: 0 }}
						>
							<OpenDirectoryButton
								onClick={handleOpenDirectory}
								style={{ padding: "6px 16px" }}
							>
								Open Project
							</OpenDirectoryButton>
						</MenuItem>
						<Divider />
						<MenuItem onClick={handleMenuClose}>
							Save File Editor
						</MenuItem>
						<MenuItem onClick={handleMenuClose}>
							Save Graph Editor
						</MenuItem>
						<MenuItem onClick={handleMenuClose}>Save All</MenuItem>
					</Menu>
					<IconButton
						edge="start"
						color="inherit"
						aria-label="edit menu"
						onClick={handleEditMenuOpen}
						className={styles.menuButton} // Apply the menu button styles
					>
						<MenuIcon />
						<Typography variant="button" sx={{ ml: 1 }}>
							Edit
						</Typography>
					</IconButton>
					<Menu
						anchorEl={anchorElEdit}
						open={Boolean(anchorElEdit)}
						onClose={handleMenuClose}
					>
						<MenuItem onClick={handleMenuClose}>Undo</MenuItem>
						<MenuItem onClick={handleMenuClose}>Redo</MenuItem>
						<Divider />
						<MenuItem onClick={handleMenuClose}>Cut</MenuItem>
						<MenuItem onClick={handleMenuClose}>Copy</MenuItem>
						<MenuItem onClick={handleMenuClose}>Paste</MenuItem>
					</Menu>
					<IconButton
						edge="end"
						color="inherit"
						aria-label="project info"
						onClick={toggleProjectInfoDrawer}
						className={styles.menuButton} // Apply the menu button styles
					>
						<InfoIcon />
						<Typography variant="button" sx={{ ml: 1 }}>
							Project Info
						</Typography>
					</IconButton>
					<Drawer
						anchor="right"
						open={isProjectInfoOpen}
						onClose={toggleProjectInfoDrawer}
					>
						<Box className={styles.container}> {/* Use the container styles */}
							<div>
								<Typography variant="h6">
									Project Info
								</Typography>
								<List>
									<ListItem>
										<ListItemText
											primary="Time Worked"
											secondary="10 hours"
										/>
									</ListItem>
									<ListItem>
										<ListItemText
											primary="Number of Nodes"
											secondary={nodes.length}
										/>
									</ListItem>
									<ListItem>
										<ListItemText
											primary="SLOC"
											secondary={SLOC()}
										/>
									</ListItem>
									{/* Add more project metrics here */}
								</List>
							</div>
							<Box className={styles.themeToggleContainer}> {/* Use the theme toggle container styles */}
								<Typography
									variant="body2"
									className={styles.themeToggleLabel} // Apply the theme toggle label styles
								>
									{mode === "light"
										? "Light Mode"
										: "Dark Mode"}
								</Typography>
								<ThemeToggle />
							</Box>
						</Box>
					</Drawer>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;
