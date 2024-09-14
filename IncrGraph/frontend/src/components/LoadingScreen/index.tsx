import React from "react";
import styles from "./LoadingScreen.module.css";
import useStore from "@/store/store";
import { STYLES } from "@/styles/constants";

const LoadingScreen: React.FC = () => {
	const { mode } = useStore();
	return (
		<div className={styles.loadingScreen}>
			<div className={styles.spinner}></div>
			<p
				className={styles.message}
				style={
					mode === "light"
						? { color: STYLES.mainFontColorLight }
						: { color: STYLES.mainFontColorDark }
				}
			>
				Loading dynamic components...
			</p>
		</div>
	);
};

export default LoadingScreen;
