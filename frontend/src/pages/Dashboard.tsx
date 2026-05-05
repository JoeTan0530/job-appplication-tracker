import React, { useState, useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import specific icons
import { faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

// Import table component
import CustomTable from "../components/CustomTable.tsx";
import CustomRating from '../components/CustomRating.tsx';
import { useNavigate } from "react-router-dom";
import { apiCaller } from "../utils/general.js";
import { showSystemPopup } from '../services/CustomSystemPopupService.js';

const Dashboard: React.FC = () => {
	const queryUrl = process.env.REACT_APP_QUERY_URL_BOOK;
	const navigate = useNavigate();

	const thArray = [
		"Title",
		"Status",
		"Rating",
		"Actions",
		"Added Date"
	]

	const listCss = {
		header: [
			{
				index: 3,
				css: {
					textAlign: "right",
				}
			},
			{
				index: 4,
				css: {
					textAlign: "right",
				}
			}
		],
		listing: [
			{
				index: 3,
				css: {
					textAlign: "right",
				}
			},
			{
				index: 4,
				css: {
					textAlign: "right",
				}
			}
		]
	};

	const [listingData, setListingData] = useState([]);
	const [listingCss, setListingCss] = useState(listCss);
	const [statusList, setStatusList] = useState({});
	const [filter, setFilter] = useState("");
	const [listingTabCount, setListingTabCount] = useState({});
	const [pagination, setPagination] = useState({});

	useEffect(() => {
		getStatusDisplay();
	}, []);

	useEffect(() => {
		if (statusList && typeof statusList === "object" && Object.keys(statusList).length > 0) {
			getBookList();
		}
	}, [statusList]);

	useEffect(() => {
		getBookList();
	}, [filter]);

	const navigateToPage = (pageName = 1) => {
		navigate(pageName);
	};

	const getStatusDisplay = () => {
		let params = {
			url: queryUrl,
			urlParams: {
				command: "getStatusList",
			}
		}

		apiCaller("POST", params, loadStatusDisplay);
	}

	const loadStatusDisplay = (data, msg) => {
		const optionList = data;

		if (optionList) {
			const optionObj = {};
			optionList.forEach((optionVal, optionIndex) => {
				optionObj[optionVal.value] = optionVal.label;
			});

			setStatusList(optionObj);
		}
	}

	const getBookList = (pageNum = 1) => {
		const params = {
			url: queryUrl,
			urlParams: {
				command: "getBookList",
				params: {
					status: filter,
					page: pageNum
				}
			}
		};

		apiCaller("POST", params, listingCallback);
	}

	const listingCallback = (data, msg) => {
		const bookList = data.listing;

		let listingData = [];

		if (bookList && Array.isArray(bookList) && bookList.length > 0) {
			bookList.forEach((dataVal, dataIndex) => {
				let editBtn = (
							<>
								<Button variant="tertiary" onClick={() => {navigateToPage(`/edit-book/${dataVal['bookID']}`)}} className="me-1"><FontAwesomeIcon icon={faPenToSquare} className="btn-icon"/></Button>
								<Button variant="tertiary" onClick={() => {deleteBook(dataVal['bookID'])}}><FontAwesomeIcon icon={faTrash} className="btn-icon"/></Button>
							</>
						);
				let ratingDisplay = (<CustomRating
												ratingID="rating"
												ratingCount={5}
												initialRating={Number(dataVal['rating'])}
												readOnly={true}
											/>);
				listingData.push({
					title: dataVal['title'],
					status: statusList[dataVal['status']] ? statusList[dataVal['status']] : dataVal['status'],
					rating: ratingDisplay,
					actionBtn: editBtn,
					createdAt: dataVal['createdAt']
				});
			});
		}

		setListingData(listingData);

		const bookCount = data.counts;
		let tabCount = bookCount ? bookCount : {};

		setListingTabCount(tabCount);

		setPagination(data.pagination);
	}

	const deleteBook = (bookID) => {
		const params = {
			url: queryUrl,
			urlParams: {
				command: "removeBookItem",
				params: {
					bookID: bookID,
				}
			}
		};

		apiCaller("POST", params, successDeleteBookCallback);
	}

	const successDeleteBookCallback = (data, msg) => {
		showSystemPopup("Successfully deleted book, refreshing book list.");
		getBookList();	
	}

	const changeListingTab = (event, tabName) => {
		document.querySelectorAll(".tab-btn").forEach(btn => {
		  	btn.classList.remove("active");
		});
		
		event.target.classList.add("active");
		setFilter(tabName);
	}

	return (
		<>
			<div className="d-flex flex-column flex-md-row justify-content-between mb-3">
				<div>
					<h1 className="page-title">
						My Books
					</h1>
					<h3 className="page-sub-title">
						Manage your reading collection
					</h3>
				</div>
				<div className="d-flex d-md-block justify-content-end mt-3 mt-md-0">
					<Button variant="primary" onClick={() => {navigateToPage("/add-book");}}>
						<FontAwesomeIcon icon={faPlus} className="btn-icon"/>
						<span>Add Book</span>
					</Button>
				</div>
			</div>
			<div>
				<div className="tab-container">
					<Button className="tab-btn active" onClick={(event) => {changeListingTab(event, "");}}>
						All ({listingTabCount.total ? listingTabCount.total : 0})
					</Button>
					<Button className="tab-btn" onClick={(event) => {changeListingTab(event, "to_read");}}>
						To Read ({listingTabCount.to_read ? listingTabCount.to_read : 0})
					</Button>
					<Button className="tab-btn" onClick={(event) => {changeListingTab(event, "reading");}}>
						Reading ({listingTabCount.reading ? listingTabCount.reading : 0})
					</Button>
					<Button className="tab-btn" onClick={(event) => {changeListingTab(event, "completed");}}>
						Completed ({listingTabCount.completed ? listingTabCount.completed : 0})
					</Button>
				</div>
			</div>
			<div className="mt-3">
				<CustomTable listingData={listingData} thArray={thArray} listingCss={listingCss} pagingData={pagination} pagingFunction={getBookList}/>
			</div>
		</>
	)
}

export default Dashboard;