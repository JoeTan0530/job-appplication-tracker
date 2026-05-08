import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import specific icons
import { faBook } from '@fortawesome/free-solid-svg-icons';

import { handlePasswordReveal, PasswordToggle, apiCaller } from "../utils/general.js";
import { useNavigate } from 'react-router-dom';
import { showSystemPopup } from '../services/CustomSystemPopupService.js';

const LoginPage: React.FC = () => {

	const [loginInputData, setLoginInputData] = useState({});
	const passwordInput = useRef(null);

	const updateFormInput = (events) => {
		const {id, value} = events.target;

		setLoginInputData((prevData) => ({
			...prevData,
			[id]: value
		}));
	}

	const navigate = useNavigate();

	const navigateToPage = (pageName) => {
		navigate(pageName);
	}

	const queryUrl = process.env.REACT_APP_QUERY_URL_USER;

	const triggerLogin = () => {
		let params = {
			url: queryUrl,
			urlParams: {
				command: "memberLogin",
				params: loginInputData
			}
		};

		apiCaller("POST", params, loginCallback);
	}

	const loginCallback = (data, message) => {
		showSystemPopup("Successfully logged in, redirecting to dashboard.");
		setTimeout(() => {
			navigateToPage("/dashboard");
		}, 1500);
	}

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			triggerLogin();
			const inputs = event.currentTarget.querySelectorAll("input");
			inputs.forEach((input) => input.blur());
		}
	}

	return (
		<Container fluid className="page-content-container login-page-container">
			<Row className="justify-content-center align-items-center full-page-row h-100">
				<Col xs={12} md={7} lg={5} xl={3}>
					<div className="w-100 d-flex flex-column justify-content-center align-items-center mb-3">
						<div className="mb-3">
							<FontAwesomeIcon icon={faBook} className="logo-icon"/>
						</div>
						<div className="mb-2">
							<h1 className="mb-0 font-size-xl font-weight-bold text-center primary-text-color">
								Book Tracker
							</h1>
						</div>
						<div>
							<h3 className="mb-0 font-size-md font-weight-thin secondary-text-color text-center">
								Track your reading journey
							</h3>
						</div>
					</div>
					<Row className="login-tab-container mx-0 mb-3">
						<Col xs={6} className="px-1">
							<Button className="login-tab-btn active" onClick={() => {navigateToPage("/");}}>
								Login
							</Button>
						</Col>
						<Col xs={6} className="px-1">
							<Button className="login-tab-btn" onClick={() => {navigateToPage("/registration");}}>
								Register
							</Button>
						</Col>
					</Row>
					<div className="login-form-container">
						<h2 className="mb-0 font-size-lg font-weight-thick primary-text-color">
							Welcome back
						</h2>
						<p className="font-size-sm font-weight-thin secondary-text-color">
							Enter your credentials and start your reading journey.
						</p>
						<Form id="loginForm" className="mb-4" onKeyDown={handleKeyDown}>
							<Form.Group className="form-group" controlId="username">
								<Form.Label>
									Email
								</Form.Label>
								<Form.Control type="text" onChange={updateFormInput}/>
							</Form.Group>
							<Form.Group className="form-group" controlId="password">
								<Form.Label>
									Password
								</Form.Label>
								<Form.Control ref={passwordInput} type="password" onChange={updateFormInput}/>
								<PasswordToggle passwordRef={passwordInput} />
							</Form.Group>
						</Form>
						<Button variant="primary" className="w-100" onClick={triggerLogin}>
							Login
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	);
}

export default LoginPage;