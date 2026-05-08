import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import icons
import { faAnglesLeft } from '@fortawesome/free-solid-svg-icons';

import CustomSelect from '../components/CustomSelect.tsx';
import CustomRating from '../components/CustomRating.tsx';
import { useNavigate } from 'react-router-dom';
import { apiCaller } from "../utils/general.js";
import { showSystemPopup } from '../services/CustomSystemPopupService.js';

const AddBook: React.FC = () => {
	const queryUrl = process.env.REACT_APP_QUERY_URL_BOOK;

	const navigate = useNavigate();
	const [formInputData, setFormInputData] = useState({});
	const [statusOptions, setStatusOptions] = useState([]);

	const updateFormInput = (events) => {
		const {id, value} = events.target;

		setFormInputData((prevData) => ({
			...prevData,
			[id]: value
		}));
	};

	const navigateToPage = (pageName) => {
		navigate(pageName);
	}

	useEffect(() => {
		getStatusOptions();
	}, []);

	const getStatusOptions = () => {
		let params = {
			url: queryUrl,
			urlParams: {
				command: "getStatusList",
			}
		}

		apiCaller("POST", params, loadStatusOptions);
	}

	const loadStatusOptions = (data, msg) => {
		const optionList = data;
		setStatusOptions(optionList);
	}

	const triggerAddBook = () => {
		let params = {
			url: queryUrl,
			urlParams: {
				command: "addBookItem",
				params: formInputData
			}
		}

		// console.log("params: ", params);

		apiCaller("POST", params, addBookCallback);
	}

	const addBookCallback = (data, msg) => {
		showSystemPopup("Successfully added a new book, redirecting to dashboard.");
		setTimeout(() => {
			navigateToPage("/dashboard");
		}, 1500);
	}

	return (
		<>
			<Container fluid>
				<Row className="justify-content-center">
					<Col xs={12} lg={8} xl={6}>
						<div className="mb-3">
							<Button variant="tertiary" onClick={() => {navigateToPage("/dashboard")}}>
								<FontAwesomeIcon icon={faAnglesLeft} className="me-1"/>
								<span className="font-size-md">Back to Books</span>
							</Button>
						</div>
						<div className="form-container">
							<h1 className="font-size-lg font-weight-thick">
								Add New Book
							</h1>
							<h3 className="font-size-sm font-weight-thin secondary-text-color">
								Add a book to your reading collection
							</h3>
							<div className="mt-4">
								<Form id="addBookForm">
									<Form.Group className="form-group" controlId="title">
										<Form.Label>
											Title *
										</Form.Label>
										<Form.Control type="text" onChange={updateFormInput}/>
									</Form.Group>
									<Form.Group className="form-group" controlId="author">
										<Form.Label>
											Author *
										</Form.Label>
										<Form.Control type="text" onChange={updateFormInput}/>
									</Form.Group>
									<Form.Group className="form-group" controlId="description">
										<Form.Label>
											Description
										</Form.Label>
										<Form.Control as="textarea" rows={3} onChange={updateFormInput}/>
									</Form.Group>
									<Form.Group className="form-group">
										<Form.Label>
											Reading Status
										</Form.Label>
										<CustomSelect 
											selectOptions={statusOptions}
											placeholderDisplay="Please select an option"
											selectID="status"
											handleSelectValue={updateFormInput}
										/>
									</Form.Group>
									<Form.Group className="form-group" controlId="rating">
										<Form.Label>
											Ratings
										</Form.Label>
										<div>
											<CustomRating
												ratingID="rating"
												handleGetRatingValue={updateFormInput}
												ratingCount={5}
												initialRating={1}
												showText={false}
											/>
										</div>
									</Form.Group>
										<Row className="mx-md-0">
											<Col xs={12} md={10} className="mb-2 mb-md-0 ps-md-0 pe-md-1">
												 <Button variant="primary" className="w-100" onClick={triggerAddBook}>
													Add Book
												</Button>
											</Col>
											<Col xs={12} md={2} className="ps-md-1 pe-md-0">
												 <Button variant="secondary" className="w-100" onClick={() => {navigateToPage("/dashboard")}}>
													Cancel
												</Button>
											</Col>
										</Row>
								</Form>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
		</>
	);
}

export default AddBook;