import { FC, ReactNode } from "react";

import "./root.css";
import Navbar from "../../components/NavBar";


interface RootPageProps {
	children?: ReactNode;
}

const RootPage: FC<RootPageProps> = ({ children }) => (
	<div>
		<Navbar></Navbar>

		<main>{children}</main>

		<footer className="footer">
			<p>Incremental Graph Code</p>
		</footer>
	</div>
);

export default RootPage;
