import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import icons
import { faAnglesLeft } from '@fortawesome/free-solid-svg-icons';

import CustomSelect from '../components/CustomSelect.tsx';
import CustomRating from '../components/CustomRating.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCaller } from "../utils/general.js";
import { showSystemPopup } from '../services/CustomSystemPopupService.js';

const EditBook: React.FC = () => {
	const { bookID } = useParams();
	const queryUrl = process.env.REACT_APP_QUERY_URL_BOOK;

	const navigate = useNavigate();
	const [formInputData, setFormInputData] = useState({
		title: '',
		author: '',
		description: '',
		status: '',
		rating: 1
	});
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
		getBookItem();
	}

	const triggerEditBook = () => {
		let params = {
			url: queryUrl,
			urlParams: {
				command: "editBookItem",
				params: formInputData
			}
		}

		apiCaller("POST", params, editBookCallback);
	}

	const editBookCallback = (data, msg) => {
		showSystemPopup("Successfully edited details, redirecting to dashboard.");
		setTimeout(() => {
			navigateToPage("/dashboard");
		}, 1500);
	}

	const getBookItem = () => {
		if (bookID) {
			let params = {
				url: queryUrl,
				urlParams: {
					command: "getBookItem",
					params: {
						bookID: bookID
					}
				}
			}

			apiCaller("POST", params, loadBookData);
		} else {
			showSystemPopup("Invalid book ID, redirecting back to dashboard.", 'error');
			setTimeout(() => {
				navigateToPage("/dashboard");
			}, 1500);
		}
	}

	const loadBookData = (data, msg) => {
		setFormInputData((prevData) => ({
			status: data.status ?? '',
			rating: data.rating ?? 1,      // ← Ensure rating is set
			author: data.author ?? '',
			title: data.title ?? '',
			description: data.description ?? '',
			bookID: data.bookID
		}));
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
										<Form.Control type="text" onChange={updateFormInput} value={formInputData?.title}/>
									</Form.Group>
									<Form.Group className="form-group" controlId="author">
										<Form.Label>
											Author *
										</Form.Label>
										<Form.Control type="text" onChange={updateFormInput} value={formInputData?.author}/>
									</Form.Group>
									<Form.Group className="form-group" controlId="description">
										<Form.Label>
											Description
										</Form.Label>
										<Form.Control as="textarea" rows={3} onChange={updateFormInput} value={formInputData?.description}/>
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
											currentValue={formInputData.status ? formInputData.status : ""}
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
												initialRating={formInputData.rating ? formInputData.rating : 1}
											/>
										</div>
									</Form.Group>
										<Row>
											<Col xs={12}>
												 <Button variant="primary" className="w-100" onClick={triggerEditBook}>
													Edit Book
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

export default EditBook;

