import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import Select from "react-select";

interface CustomSelectProps {
	selectOptions: [],
	handleSelectValue?: Function,
	placeholderDisplay?: string,
	selectID?: string,
	getInputDataKey?: string,
	currentValue?: string,
	customSelectRef?: React.Ref<HTMLDivElement>,
	addDefaultAllOption: boolean
}

const CustomSelect: React.FC<CustomSelectProps> = (props) => {
	/* 
		For the getInputDataKey by default it will use "id" 
		but if for the handle onChange function you're using
		"name" or whatever other props to get the input value
		you can use 'getInputDataKey' props to overwrite it.
	 */

	const {
		selectOptions,
		handleSelectValue,
		placeholderDisplay = "",
		selectID,
		getInputDataKey = "id",
		currentValue = "",
		customSelectRef,
		addDefaultAllOption = false
	} = props;

	let optionList = selectOptions ? selectOptions : [{ value: "", label: "" }];
	const displayID = selectID ? selectID : "select" + document.getElementsByClassName("form-select").length;

	const [displayType, setDisplayType] = useState(optionList[0]);
	const selectRef = useRef();

	useImperativeHandle(customSelectRef, () => ({
		resetInput: () => {
			triggerReset();
		}
	}));

	useEffect(() => {
		if (addDefaultAllOption) {
			let tempDefaultOption = {
				label: "All",
				value: ""
			}

			if (optionList[0]['value'] !== tempDefaultOption.value || (optionList[0]['value'] === tempDefaultOption && optionList[0]["label"] !== tempDefaultOption.label)) {
				optionList.unshift(tempDefaultOption);
			}
		}

		let currOption = { value: "", label: "" };
		if (currentValue || currentValue === 0) {
			let tempObj = optionList.find((item) => {
				return item.value === currentValue;
			});

			currOption = tempObj;
		} else {
			currOption = optionList[0];
		}

		setDisplayType(currOption);
	}, [optionList, currentValue]);

	const triggerChange = (onChangeVal) => {
		const inputRef = selectRef.current.inputRef;
		handleSelectValue({
			target: {
				id: inputRef[getInputDataKey],
				value: onChangeVal.value
			}
		});
	}

	const triggerReset = () => {
		setDisplayType(optionList[0]);
	}

	return (
		<Select
			inputId={displayID}
			ref={selectRef}
			className="form-select"
			classNamePrefix="form-select"
			options={optionList}
			value={displayType}
			onChange={(event) => {
				setDisplayType(event);
				triggerChange(event);
			}}
			placeholder={placeholderDisplay}
			styles={{
				control: (base) => ({
					...base,
					border: "none",
					boxShadow: "none"
				})
			}}
			components={{ IndicatorSeparator: () => null }}
		/>
	)
}

export default CustomSelect;