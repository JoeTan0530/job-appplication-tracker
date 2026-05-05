import axios from "axios";
import { useState } from "react";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Import specific icons
import { faEyeSlash, faEye } from '@fortawesome/free-solid-svg-icons';

// Import services
import { showSystemPopup } from '../services/CustomSystemPopupService.js';

export const apiCaller = async (method, param, fCallback, setErrMsg, setIsLoading=null) => {

	if (method == "POST") {
		const customUrl = param['url'] ? param['url'] : process.env.REACT_APP_QUERY_URL;

		let params = param['urlParams'] ? param['urlParams'] : {};

		if (!params['params']) {
			params['params'] = {};
		}

		params['params']['userID'] = sessionStorage.getItem('userID') ? sessionStorage.getItem('userID') : "";

		try {
			let res = await axios.post(customUrl, params, {
				headers: {
		      "Content-Type": "application/json",
		    },
			});

			callApiSuccess(res, fCallback, setErrMsg, param);

			if(setIsLoading) {
				setIsLoading(false)
			}
		} catch (err) {
			if (!navigator.onLine) {
				alert("Network Issue");
			} else {
				alert(err);
			}
			if(setIsLoading) {
				setIsLoading(false)
			}
		}
	} else if (method == "GET") {
		let getURL = param['url'] ? param['url'] : "";

		let apiURL = getURL;

		if (param['urlParams']) {
			if (Array.isArray(param['urlParams'])) {
				let getParams = param['urlParams'];

				getParams.forEach((value, key) => {
					apiURL += "/" + value;
				});
			}
		}

		try {
			let res = await axios.get(apiURL);

			if (fCallback) {
				fCallback(res, "Success Get Data");
			}

		} catch (err) {
			if (!navigator.onLine) {
				alert("Network Issue");
			} else {
				alert(err);
				if (fCallback) {
					fCallback(err, "Error Get Data");
				}
			}

			if(setIsLoading) {
				setIsLoading(false)
			}
		}
	}
}

function callApiSuccess(res, fCallback, setErrMsg, param) {
	let result = res["data"];

	if (result && result.status == "ok") {
		if (result['data'] && result['data']['isLoginData'] && result['data']['isLoginData'] === 1) {
			if (result['data']['sessionID']) {
				sessionStorage.setItem('userSession', result['data']['sessionID']);
			}

			if (result['data']['clientID']) {
				sessionStorage.setItem('userID', result['data']['clientID']);
			}

			if (result['data']['userInfo']) {
				sessionStorage.setItem('fullName', result['data']['userInfo']['name']);
				sessionStorage.setItem('email', result['data']['userInfo']['email']);
			}
		}

		fCallback(result.data, result.statusMsg);
	} else if (result.status == "error" && result.data && result.data.field && result.data.field != "") {
		result.data.field.forEach((element) => {
			setErrMsg((prevData) => ({
				...prevData,
				[element.id]: element.msg,
			}));
		});
	} else if (result.status == "error") {
		errorHandling(result.code, result.statusMsg);
	} else {
		console.log("Something went wrong");
	}
}

function errorHandling(code, msg) {
	switch (code) {
		case 1:
			showSystemPopup(msg, 'warning');
			break;
		case 2:
			showSystemPopup(msg, 'error');
			break;
		default:
			console.log('Default Error');
	}
}

export const restrictNumberOnly = (inputEvent, sort = "normal", inputDecimal) => {
	let inputVal = inputEvent.target.value;
	const maxDecimal = parseInt(inputDecimal ? inputDecimal : process.env.REACT_APP_DEFAULT_DP, 10);
	let regexPattern = /[^0-9.]/g;

	if (sort === "numberOnly") {
		regexPattern = /[^0-9]/g;
	}

	inputVal = inputVal.replace(regexPattern, "");
	let decimalIndex = inputVal.indexOf(".");

	if (decimalIndex > -1) {
		let tempSlice = inputVal.slice(decimalIndex + 1);
		tempSlice = tempSlice.replace(/[^0-9]/g, "");
		if (tempSlice.length > maxDecimal) {
			tempSlice = tempSlice.slice(0, maxDecimal);
		}
		inputVal = inputVal.slice(0, decimalIndex + 1) + tempSlice;
	}

	inputEvent.target.value = inputVal;
};

export const handlePasswordReveal = (passwordElement, eventNode) => {
	let newPasswordType = "text";
	let passwordRef = passwordElement;

	if (passwordRef) {
		if (passwordRef.current.type == newPasswordType) {
			newPasswordType = "password";
		}

		passwordRef.current.type = newPasswordType;
	}
};

export const PasswordToggle = ({ passwordRef, initial = false }) => {
  const [isOn, setIsOn] = useState(initial);

  const handleClick = (event) => {
    const newState = !isOn;
    setIsOn(newState);
    handlePasswordReveal(passwordRef, event);
  };

  return (
    <a
		role="button"
		className="form-password-anchor"
		onClick={(event) => {
			handleClick(event);
		}}>
		<FontAwesomeIcon icon={isOn ? faEye : faEyeSlash} />
	</a>
  );
};