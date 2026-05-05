import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import HeaderDisplay from "./Header.tsx";
import FooterDisplay from "./Footer.tsx";
import { Outlet } from 'react-router-dom';

const FrameLayout: React.FC = () => {
	return (
		<>
			<Container fluid>
				<HeaderDisplay />
				<Container>
					<Row>
						<Col>
							<div className="content-display-container">
								<Outlet />
							</div>
						</Col>
					</Row>
				</Container>
				<FooterDisplay />
			</Container>
		</>
	)
}

export default FrameLayout;