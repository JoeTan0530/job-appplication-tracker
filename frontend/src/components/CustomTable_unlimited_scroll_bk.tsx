import React, { useEffect, useRef, useCallback } from "react";
import { Table } from "react-bootstrap";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import specific icons
import { faBook, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface CustomTableProps {
	listingID: string;
	listingData: any[];
	thArray: any[];
	listingCss: any;
	hasMore?: boolean;           // Whether more data is available to load
	loading?: boolean;           // Whether data is currently loading
	onLoadMore?: () => void;     // Function to call when loading more data
	loadingComponent?: React.ReactNode; // Custom loading component
}

const CustomTable: React.FC<CustomTableProps> = (props) => {
	const { 
		listingID, 
		listingData, 
		thArray, 
		listingCss,
		hasMore = false,
		loading = false,
		onLoadMore,
		loadingComponent
	} = props;

	const tableID = listingID || `defaultListID${document.getElementsByClassName("listing-table-container").length}`;
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadingRef = useRef<HTMLDivElement>(null);
	const tableContainerRef = useRef<HTMLDivElement>(null);

	const verifyIsArrayItem = (verifyItem: any): boolean => {
		if (verifyItem && Array.isArray(verifyItem) && verifyItem.length > 0) {
			return true;
		} else {
			return false;
		}
	}

	const verifyIsObjectItem = (verifyItem: any): boolean => {
		if (verifyItem !== null && !Array.isArray(verifyItem) && typeof verifyItem === 'object' && Object.keys(verifyItem).length > 0) {
			return true;
		} else {
			return false;
		}
	}

	const getCssStyleFromObj = (listCssObj: any, type: string, cellIndex: number): React.CSSProperties => {
		let listCellCss: React.CSSProperties = {};

		if (verifyIsObjectItem(listCssObj) && verifyIsArrayItem(listCssObj[type])) {
			let listCellCssObj = listCssObj[type].find((item: any) => {
				return item.index === cellIndex;
			});

			if (listCellCssObj) {
				listCellCss = listCellCssObj['css'] ? listCellCssObj['css'] : {};
			}
		}

		return listCellCss;
	}

	// Setup intersection observer for infinite scroll
	useEffect(() => {
		if (!onLoadMore) return;

		const options = {
			root: tableContainerRef.current,
			rootMargin: '0px 0px 100px 0px', // Load when 100px from bottom
			threshold: 0.1
		};

		observerRef.current = new IntersectionObserver((entries) => {
			const firstEntry = entries[0];
			if (firstEntry.isIntersecting && hasMore && !loading) {
				onLoadMore();
			}
		}, options);

		if (loadingRef.current) {
			observerRef.current.observe(loadingRef.current);
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [hasMore, loading, onLoadMore]);

	// Default loading component
	const defaultLoadingComponent = (
		<div className="text-center py-4">
			<FontAwesomeIcon icon={faSpinner} spin className="me-2" />
			<span>Loading more books...</span>
		</div>
	);

	// No data state
	if (!verifyIsArrayItem(listingData)) {
		return (
			<div className="listing-table-no-data-container">
				<FontAwesomeIcon icon={faBook} className="listing-table-no-data-icon"/>
				<div className="text-center font-size-md font-weight-bold primary-text-color mb-1">No Books Found</div>
				<div className="text-center font-size-sm font-weight-thick secondary-text-color">Start building your reading collection</div>
			</div>
		)
	}

	return (
		<div 
			className="listing-table-container" 
			ref={tableContainerRef}
			style={{ overflowY: 'auto', maxHeight: '600px' }}
		>
			<Table className="listing-table">
				{verifyIsArrayItem(thArray) && (
					<thead>
						<tr>
							{thArray.map((headerVal, headerIndex) => {
								let headerCellCss = getCssStyleFromObj(listingCss, "header", headerIndex);
								return (
									<th key={`header${tableID}${headerIndex}`} style={headerCellCss}>
										{headerVal}
									</th>
								)
							})}
						</tr>
					</thead>
				)}
				<tbody>
					{listingData.map((listingVal, listingIndex) => {
						return (
							<tr key={`tableDataRow${tableID}${listingIndex}`}>
								{Object.entries(listingVal).map(([dataKey, dataVal], dataIndex) => {
									let listingCellCss = getCssStyleFromObj(listingCss, "listing", dataIndex);
									return (
										<td key={`tableDataCell${tableID}${listingIndex}-${dataIndex}`} style={listingCellCss}>
											{dataVal as React.ReactNode}
										</td>
									)
								})}
							</tr>
						)
					})}
				</tbody>
			</Table>
			
			{/* Loading indicator for infinite scroll */}
			{hasMore && (
				<div ref={loadingRef}>
					{loadingComponent || defaultLoadingComponent}
				</div>
			)}
			
			{/* End of list message */}
			{!hasMore && listingData.length > 0 && (
				<div className="text-center py-3 text-muted font-size-sm">
					No more books to load
				</div>
			)}
		</div>
	);
}

export default CustomTable;