import { apiCaller } from "../utils/general.js";

const getJobApiUrl = () => {
  return process.env.REACT_APP_QUERY_URL_JOB || process.env.REACT_APP_QUERY_URL;
};

export const getStatusList = (callback) => {
  const params = {
    url: getJobApiUrl(),
    urlParams: {
      command: "getStatusList",
    },
  };

  apiCaller("POST", params, callback);
};

export const getJobAppList = (pageNum, callback) => {
  const params = {
    url: getJobApiUrl(),
    urlParams: {
      command: "getJobAppList",
      params: {
        page: pageNum
      }
    },
  };

  apiCaller("POST", params, callback);
};

export const getJobItem = (jobID, callback) => {
  const params = {
    url: getJobApiUrl(),
    urlParams: {
      command: "getJobItem",
      params: {
        jobID,
      },
    },
  };

  apiCaller("POST", params, callback);
};

export const addJobApplication = (payload, callback, setErrMsg) => {
  const params = {
    url: getJobApiUrl(),
    urlParams: {
      command: "addJobApplication",
      params: payload,
    },
  };

  apiCaller("POST", params, callback, setErrMsg);
};

export const editJobApplication = (payload, callback, setErrMsg) => {
  const params = {
    url: getJobApiUrl(),
    urlParams: {
      command: "editJobApplication",
      params: payload,
    },
  };

  apiCaller("POST", params, callback, setErrMsg);
};

export const removeJobItem = (jobID, callback) => {
  const params = {
    url: getJobApiUrl(),
    urlParams: {
      command: "removeJobItem",
      params: {
        jobID,
      },
    },
  };

  apiCaller("POST", params, callback);
};

export const sendEmailNotification = (jobID, callback) => {
  const params = {
    url: getJobApiUrl(),
    urlParams: {
      command: "sendNotifEmail",
      params: {
        jobID,
      },
    },    
  }

  apiCaller("POST", params, callback);
}

