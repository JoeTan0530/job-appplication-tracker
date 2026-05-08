let showConfirmFunction = null;

export const registerConfirmModal = (showFunction) => {
  showConfirmFunction = showFunction;
};

export const showConfirmModal = (options) => {
  if (showConfirmFunction) {
    return showConfirmFunction(options);
  }

  return Promise.resolve(false);
};

