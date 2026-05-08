import React, { useRef, useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import specific icons
import { faBriefcase, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';

const HeaderDisplay: React.FC = () => {
	const sidebarRef = useRef(null);
	const sidebarDisplayRef = useRef(null);
	const [sidebarContainer, setSidebarContainer] = useState(false);

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
									<a href="/" className="d-flex align-items-center header-logo-anchor">
										<FontAwesomeIcon icon={faBriefcase} className="header-logo-icon me-2"/>
										<div className="header-logo-text">Job Tracker</div>
									</a>
								</div>
							</Col>
							<Col xs={3} md={6}>
								<div className="d-flex d-md-none justify-content-end align-items-center">
									<div>
										<button type="button" className="header-btn sidebar-btn" onClick={toggleSidebar}>
											<FontAwesomeIcon icon={faBars} />
										</button>
									</div>
									<div id="sidebarContainer" className="sidebar-container closed-sidebar" ref={sidebarRef}>
										<div className="sidebar-background">
											<div className="sidebar-display" ref={sidebarDisplayRef}>
												<div className="sidebar-list">
													<div className="d-flex justify-content-end w-100 mb-2">
														<button type="button" className="sidebar-close-btn" onClick={toggleSidebar}>
															<FontAwesomeIcon icon={faXmark} className="sidebar-close-btn-icon"/>
														</button>
													</div>
													<a href="/" className="sidebar-btn" onClick={toggleSidebar}>
														Applications
													</a>
													<a href="/jobs/new" className="sidebar-btn" onClick={toggleSidebar}>
														Add application
													</a>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="d-none d-md-flex justify-content-end align-items-center">
									<a href="/" className="header-btn">
										Applications
									</a>
									<a href="/jobs/new" className="header-btn">
										Add application
									</a>
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