// This is to help allow the custom system popup function to be allowed to be used in any components or functions
let showPopupFunction = null;

export const registerPopup = (showFunction) => {
  showPopupFunction = showFunction;
};

export const showSystemPopup = (message, type = 'info', duration = 3000) => {
  if (showPopupFunction) {
    showPopupFunction(message, type, duration);
  } else {
    console.log('Popup not registered yet');
  }
};