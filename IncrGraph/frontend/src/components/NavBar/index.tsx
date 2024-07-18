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
	ListItemButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info";
import OpenDirectoryButton from "../OpenDirectoryButton";

const Navbar: React.FC = () => {
	const [anchorElFile, setAnchorElFile] = useState<null | HTMLElement>(null);
	const [anchorElEdit, setAnchorElEdit] = useState<null | HTMLElement>(null);
	const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false);
	const [isConnectionStatusOpen, setIsConnectionStatusOpen] = useState(false);
	const [isConnected, setIsConnected] = useState(false);

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

	return (
		<AppBar position="static" sx={{ backgroundColor: "#1e1e1e" }}>
			<Toolbar>
				<img
					src="/logo.png"
					alt="Logo"
					style={{ width: "40px", marginRight: "16px" }}
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
						sx={{ mr: 2 }}
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
						<MenuItem onClick={handleMenuClose} style={{padding: 0}}>
							{/* <OpenDirectoryButton onClose={handleMenuClose} style={{padding: "6px 16px"}}>
								Open Project
							</OpenDirectoryButton> */}
                            <OpenDirectoryButton />
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
						sx={{ mr: 2 }}
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
						sx={{ mr: 2 }}
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
						<Box sx={{ width: 250, padding: 2 }}>
							<Typography variant="h6">Project Info</Typography>
							<List>
								<ListItem>
									<ListItemText
										primary="Time Worked"
										secondary="10 hours"
									/>
								</ListItem>
								<ListItem>
									<ListItemText
										primary="Number of Cells"
										secondary="42"
									/>
								</ListItem>
								<ListItem>
									<ListItemText
										primary="SLOC"
										secondary="1200"
									/>
								</ListItem>
								{/* Add more project metrics here */}
							</List>
						</Box>
					</Drawer>
					{/* <IconButton
						edge="end"
						color="inherit"
						aria-label="connection status"
						onClick={toggleConnectionStatusDrawer}
					>
						<Badge
							color={isConnected ? "success" : "error"}
							variant="dot"
						>
							<SyncIcon />
						</Badge>
						<Typography variant="button" sx={{ ml: 1 }}>
							Connection Status
						</Typography>
					</IconButton> */}
					<Drawer
						anchor="right"
						open={isConnectionStatusOpen}
						onClose={toggleConnectionStatusDrawer}
					>
						<Box sx={{ width: 250, padding: 2 }}>
							<Typography variant="h6">
								Connection Status
							</Typography>
							{isConnected ? (
								<>
									<ListItem>
										<ListItemText
											primary="Status"
											secondary="Connected"
										/>
									</ListItem>
									<ListItem>
										<ListItemText
											primary="Last Update"
											secondary="5 minutes ago"
										/>
									</ListItem>
									<ListItem>
										<ListItemText
											primary="Session Id"
											secondary="abc123"
										/>
									</ListItem>
									<ListItem>
										<ListItemButton
											onClick={() =>
												setIsConnected(false)
											}
										>
											Disconnect
										</ListItemButton>
									</ListItem>
								</>
							) : (
								<>
									<ListItem button onClick={handleConnectNow}>
										<ListItemText primary="Connect Now" />
									</ListItem>
									<ListItem button onClick={handleSync}>
										<ListItemText primary="Sync" />
									</ListItem>
								</>
							)}
						</Box>
					</Drawer>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default Navbar;
