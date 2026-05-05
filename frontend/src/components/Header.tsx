import React, { useRef, useState, useEffect } from "react";
import { Container, Row, Col, Nav, Navbar, NavDropdown } from "react-bootstrap";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import specific icons
import { faBook, faBars, faCaretDown, faXmark, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-regular-svg-icons';

// Import custom hooks for handling boostrap event.
import { useBootstrapDropdown } from '../hooks/useBootstrapDropdown.js';

const HeaderDisplay: React.FC = () => {
	// Initialize hooks for each dropdown with unique IDs
	const headerUserDropdown = useBootstrapDropdown('headerUserDropdown');

	const sidebarRef = useRef(null);
	const sidebarDisplayRef = useRef(null);
	const [sidebarContainer, setSidebarContainer] = useState(false);

	const userInfo = {
		name: sessionStorage.getItem('fullName'),
		email: sessionStorage.getItem('email'),
	}

	const toggleSidebar = () => {
		setSidebarContainer(prevState => !prevState);
	}

	useEffect(() => {
	    if (sidebarContainer) {
        	sidebarRef.current.classList.remove('closed-sidebar');
        	sidebarDisplayRef.current.classList.remove("closing-sidebar");
        	sidebarDisplayRef.current.classList.add("opening-sidebar");
	    } else {
	      	sidebarDisplayRef.current.classList.remove("opening-sidebar");
	      	sidebarDisplayRef.current.classList.add("closing-sidebar");
	      	setTimeout(() => {
	      		sidebarRef.current.classList.add('closed-sidebar');
	      	}, 300);
	    }
	  }, [sidebarContainer]); 

	return (
		<>
			<Row className="header-outer-row">
				<Col>
					<Container className="header-container">
						<Row className="justify-content-between align-items-center">
							<Col xs={9} md={6}>
								<div className="d-flex align-items-center">
									<a href="dashboard" className="d-flex align-items-center header-logo-anchor">
										<FontAwesomeIcon icon={faBook} className="header-logo-icon me-2"/>
										<div className="header-logo-text">Book Tracker</div>
									</a>
								</div>
							</Col>
							<Col xs={3} md={6}>
								<div className="d-flex d-md-none justify-content-end align-items-center">
									<div>
										<a role="button" className="header-btn sidebar-btn" onClick={toggleSidebar}>
											<FontAwesomeIcon icon={faBars} />
										</a>
									</div>
									<div id="sidebarContainer" className="sidebar-container closed-sidebar" ref={sidebarRef}>
										<div className="sidebar-background">
											<div className="sidebar-display" ref={sidebarDisplayRef}>
												<div className="sidebar-list">
													<div className="d-flex justify-content-end w-100 mb-2">
														<a role="button" className="sidebar-close-btn" onClick={toggleSidebar}>
															<FontAwesomeIcon icon={faXmark} className="sidebar-close-btn-icon"/>
														</a>
													</div>
													<div>
														<div className="font-size-md font-weight-thick primary-text-color">
															{userInfo['name']}
														</div>
														<div className="font-size-sm font-weight-thin secondary-text-color">
															{userInfo['email']}
														</div>
														<hr/>
													</div>
													<a href="/dashboard" className="sidebar-btn">
														My books
													</a>
													<a href="/add-book" className="sidebar-btn">
														Add books
													</a>
													<div className="sidebar-dropdown-container">
														<a role="button" className="sidebar-btn" data-bs-toggle="collapse" data-bs-target="#sidebarProfileBtn">
															<span>My profile</span>
															<FontAwesomeIcon icon={faCaretDown} className="sidebar-dropdown-icon"/>
														</a>
														<div id="sidebarProfileBtn" className="sidebar-dropdown-list collapse">
															<a role="button" className="sidebar-btn logout-btn">
																<FontAwesomeIcon icon={faArrowRightFromBracket} className="header-icon logout-icon me-1"/>
																<span>Logout</span>
															</a>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="d-none d-md-flex justify-content-end align-items-center">
									<a href="/dashboard" className="header-btn">
										My books
									</a>
									<a href="/add-book" className="header-btn">
										Add books
									</a>
									<div className="header-dropdown-container" ref={headerUserDropdown.containerRef}>
										<a 
											role="button"
											className="header-dropdown-btn"
											ref={headerUserDropdown.buttonRef}
											data-dropdown-id="headerUserDropdown"
											onClick={headerUserDropdown.toggleDropdown}
											aria-expanded={headerUserDropdown.isOpen}
										>
											<FontAwesomeIcon icon={faUser} className="header-icon"/>
										</a>
										<div id="headerUserDropdown" className="header-dropdown-list-container collapse">
											<div className="header-dropdown-list">
												<div className="header-dropdown-item">
													<div className="font-size-md font-weight-thick primary-text-color">
														{userInfo['name']}
													</div>
													<div className="font-size-sm font-weight-thin secondary-text-color">
														{userInfo['email']}
													</div>
													<hr className="mb-0"/>
												</div>
												<a role="button" className="header-dropdown-item logout-btn">
													<FontAwesomeIcon icon={faArrowRightFromBracket} className="header-icon logout-icon me-1"/>
													<span>Logout</span>
												</a>
											</div>
										</div>
									</div>
								</div>
							</Col>
						</Row>
					</Container>
				</Col>
			</Row>
		</>
	)
}

export default HeaderDisplay;