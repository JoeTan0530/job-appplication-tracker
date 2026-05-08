import React from "react";
import { Row, Col } from "react-bootstrap";

const FooterDisplay: React.FC = () => {
	return (
		<>
			<Row>
				<Col className="text-center">
					<span className="footer-text">Designed & developed by Joe Tan © 2026</span>
				</Col>
			</Row>
		</>
	)
}

export default FooterDisplay;