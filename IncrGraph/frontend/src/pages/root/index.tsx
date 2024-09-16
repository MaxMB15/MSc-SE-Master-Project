import { FC, ReactNode } from "react";
import GitHubIcon from "@mui/icons-material/GitHub";
import "./root.css";
import Navbar from "../../components/NavBar";
import { ThemeProvider } from "@mui/material/styles";
import { useThemeMode } from "@/hooks/useThemeMode";
import { PopupProvider } from "@/components/Popup/PopupProvider";
import { STYLES } from "@/styles/constants";

interface RootPageProps {
	children?: ReactNode;
}

const RootPage: FC<RootPageProps> = ({ children }) => {
	const [theme] = useThemeMode();

	return (
		<ThemeProvider theme={theme}>
			<PopupProvider>
				<div className="root-container">
					<Navbar />

					<main>{children}</main>

					<footer className="footer">
						<div className="footer-content">
							<div className="footer-logo">
								<p>Incremental Graph Code</p>
							</div>
							<div className="footer-social" style={{height: STYLES.footerHeight}}>
								<a
									href="https://github.com/MaxMB15/MSc-SE-Master-Project/tree/main/IncrGraph"
									target="_blank"
									rel="noopener noreferrer"
								>
									<GitHubIcon style={{ color: "#ffffff" }} />
								</a>
							</div>
						</div>
					</footer>
				</div>
			</PopupProvider>
		</ThemeProvider>
	);
};

export default RootPage;
