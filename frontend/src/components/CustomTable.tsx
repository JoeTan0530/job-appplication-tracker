import React from "react";
import { Table } from "react-bootstrap";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import specific icons
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';

// Import components
import CustomPagination from './CustomPagination.tsx';

interface CustomTableColumn<T = any> {
	header: string;
	accessor?: string;
	render?: (row: T) => React.ReactNode;
}

interface CustomTableProps {
	listingID: string,
	listingData: [],
	thArray?: [],
	columns?: CustomTableColumn[],
	listingCss?: {},
	emptyTitle?: string,
	emptySubtitle?: string
}

const CustomTable: React.FC<CustomTableProps> = (props) => {

	const { 
		listingID, 
		listingData, 
		thArray, 
		columns,
		listingCss, 
		pagingData,
		pagingFunction,
		emptyTitle = "No records found",
		emptySubtitle = "Add your first item to get started"
	} = props;

	const tableID = listingID || `defaultListID${document.getElementsByClassName("listing-table-container").length}`;

	const verifyIsArrayItem = (verifyItem) => {
		if (verifyItem && Array.isArray(verifyItem) && verifyItem.length > 0) {
			return true;
		} else {
			return false;
		}
	}

	const verifyIsObjectItem = (verifyItem) => {
		if (verifyItem !== null && !Array.isArray(verifyItem) && typeof verifyItem === 'object' && Object.keys(verifyItem).length > 0) {
			return true;
		} else {
			return false;
		}
	}

	const getCssStyleFromObj = (listCssObj, type, cellIndex) => {
		let listCellCss = {};

		if (verifyIsObjectItem(listCssObj) && verifyIsArrayItem(listCssObj[type])) {
			let listCellCssObj = listCssObj[type].find((item) => {
				return item.index === cellIndex;
			});

			if (listCellCssObj) {
				listCellCss = listCellCssObj['css'] ? listCellCssObj['css'] : {};
			}
		}

		return listCellCss;
	}


	const effectiveColumns: CustomTableColumn[] | null = verifyIsArrayItem(columns) ? columns : null;
	const effectiveHeaders: string[] | null = effectiveColumns
		? effectiveColumns.map((c) => c.header)
		: (verifyIsArrayItem(thArray) ? thArray : null);

	if (verifyIsArrayItem(listingData) && (effectiveColumns || effectiveHeaders)) {
		return (
			<>
				<div className="listing-table-container">
					<Table className="listing-table">
						{
							(effectiveHeaders) && (
								<thead>
									<tr>
										{
											effectiveHeaders.map((headerVal, headerIndex) => {
												let headerCellCss = getCssStyleFromObj(listingCss, "header", headerIndex);

												return (
													<th key={`header${tableID}${headerIndex}`} style={headerCellCss}>
														{headerVal}
													</th>
												)
											})
										}
									</tr>
								</thead>
							)
						}
						{
							(effectiveHeaders) && (
								<tbody>
									{
										listingData && listingData.map((listingVal, listingIndex) => {
											return (
												<tr key={`tableDataRow${tableID}${listingIndex}`}>
													{
														effectiveColumns
															? effectiveColumns.map((col, dataIndex) => {
																let listingCellCss = getCssStyleFromObj(listingCss, "listing", dataIndex);
																const cellVal = col.render
																	? col.render(listingVal)
																	: (col.accessor ? listingVal[col.accessor] : "");

																return (
																	<td key={`tableDataCell${tableID}${listingIndex}-${dataIndex}`} style={listingCellCss}>
																		{cellVal}
																	</td>
																);
															})
															: Object.entries(listingVal).map(([dataKey, dataVal], dataIndex) => {
																let listingCellCss = getCssStyleFromObj(listingCss, "listing", dataIndex);

																return (
																	<td key={`tableDataCell${tableID}${listingIndex}-${dataIndex}`} style={listingCellCss}>
																		{dataVal}
																	</td>
																)	
															})
													}
												</tr>
											)
										})
									}
								</tbody>
							)
						}
					</Table>
				</div>
				{pagingData && (
					<div className="mt-3">
						<CustomPagination pagingID={listingID} pagingData={pagingData} pagingFunction={pagingFunction} />
					</div>
				)}
			</>
		)
	} else {
		return (
			<div className="listing-table-no-data-container">
				<FontAwesomeIcon icon={faBriefcase} className="listing-table-no-data-icon"/>
				<div className="text-center font-size-md font-weight-bold primary-text-color mb-1">{emptyTitle}</div>
				<div className="text-center font-size-sm font-weight-thick secondary-text-color">{emptySubtitle}</div>
			</div>
		)
	}
}

export default CustomTable;