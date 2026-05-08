import React from "react";
import { Container, Row, Col, Nav, Navbar, NavDropdown } from "react-bootstrap";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import specific icons
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';


const HeaderDisplay: React.FC = () => {
	return (
		<>
			<Row className="header-outer-row">
				<Col>
					<Container className="header-container">
						<Row>
							<Col xs={12}>
								<Navbar expand="md" className="justify-content-between align-items-center">
									<Container fluid>
										<Row className="justify-content-between align-items-center w-100">
											<Col xs={12} md={6} className="d-flex d-md-block justify-content-between align-items-center">
												<Navbar.Brand href="#home" className="header-brand-container">
										    		<div className="d-flex align-items-center">
														<FontAwesomeIcon icon={faBook} className="header-logo-icon me-2"/>
														<div className="header-logo-text">Book Tracker</div>
													</div>
										    	</Navbar.Brand>
										    	<Navbar.Toggle aria-controls="header-navbar" />
											</Col>
											<Col xs={12} md={6}>
										        <Navbar.Collapse id="header-navbar">
											        <Nav className="me-auto">
											            <Nav.Link href="#" className="header-btn">My books</Nav.Link>
											            <Nav.Link href="#" className="header-btn">Add books</Nav.Link>
											            <NavDropdown title={<FontAwesomeIcon icon={faUser} className="header-icon"/>} id="header-nav-dropdown">
											              	<NavDropdown.Item href="#action/3.1">Logout</NavDropdown.Item>
											            </NavDropdown>
											        </Nav>
										        </Navbar.Collapse>
										    </Col>
										</Row>
									</Container>
							    </Navbar>
							</Col>
						</Row>
					</Container>
				</Col>
			</Row>
		</>
	)
}

export default HeaderDisplay;