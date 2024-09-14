import React from "react";
import styles from "./LoadingScreen.module.css";

const LoadingScreen: React.FC = () => {
	return (
		<div className={styles.loadingScreen}>
			<div className={styles.spinner}></div>
			<p className={styles.message}>Loading dynamic components...</p>
		</div>
	);
};

export default LoadingScreen;
