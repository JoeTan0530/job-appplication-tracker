import React, { useEffect, useState, useCallback } from "react";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faPenToSquare, faBell } from "@fortawesome/free-solid-svg-icons";

import { getJobItem, getStatusList, sendEmailNotification } from "../services/JobApplicationService.js";
import { formatDateDDMMYYYY, formatNumberWithThousandsSeparator } from "../utils/general.js";
import { showSystemPopup } from "../services/CustomSystemPopupService.js";

const JobApplicationDetails: React.FC = () => {
  const { jobID } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [statusMap, setStatusMap] = useState<any>({});

  useEffect(() => {
    getStatusList((data) => {
      const list = Array.isArray(data) ? data : [];
      const nextMap = {};
      list.forEach((item) => {
        nextMap[item.value] = item.label;
      });
      setStatusMap(nextMap);
    });
  }, []);

  useEffect(() => {
    if (!jobID) return;
    setIsLoading(true);
    getJobItem(jobID, (data) => {
      let tempNewDataObj = data || null;

      if (tempNewDataObj) {
        tempNewDataObj.status = (statusMap[tempNewDataObj.status] ? statusMap[tempNewDataObj.status] : tempNewDataObj.status);
        tempNewDataObj.salary = formatNumberWithThousandsSeparator(tempNewDataObj.salary);
        tempNewDataObj.applied_date = (tempNewDataObj.applied_date != "" && tempNewDataObj.applied_date != "-") ? formatDateDDMMYYYY(tempNewDataObj.applied_date) : "-";
        tempNewDataObj.interview_date = (tempNewDataObj.interview_date != "" && tempNewDataObj.interview_date != "-") ? formatDateDDMMYYYY(tempNewDataObj.interview_date) : "-";
        tempNewDataObj.createdAt = (tempNewDataObj.createdAt != "" && tempNewDataObj.createdAt != "-") ? formatDateDDMMYYYY(tempNewDataObj.createdAt) : "-";
      }

      setJob(tempNewDataObj);
      setIsLoading(false);
    });
  }, [statusMap, jobID]);

  const triggerNotification = useCallback(async () => {
    sendEmailNotification(jobID, () => {
      showSystemPopup("Email notification send, please check your inbox.", "success");
    });
  })

  if (isLoading) {
    return (
      <div className="d-flex align-items-center">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        <div className="mb-3">
          <button type="button" className="sidebar-btn back-btn" onClick={() => navigate("/")}>
            <FontAwesomeIcon icon={faAnglesLeft} className="btn-icon" />
            Back
          </button>
        </div>
        <div className="font-size-md font-weight-bold primary-text-color mb-1">Not found</div>
        <div className="font-size-sm font-weight-thin secondary-text-color">
          The job application could not be loaded.
        </div>
      </div>
    );
  }

  const fields = [
    {
      label: "Role",
      value: "role"
    },
    {
      label: "Company name",
      value: "company_name"
    },
    {
      label: "Company reg no",
      value: "company_reg_num"
    },
    {
      label: "Job requirement",
      value: "job_requirement"
    },
    {
      label: "Location",
      value: "location"
    },
    {
      label: "Company email",
      value: "company_email"
    },
    {
      label: "Status",
      value: "status"
    },
    {
      label: "Remark",
      value: "remark"
    },
    {
      label: "Salary",
      value: "salary"
    },
    {
      label: "Applied date",
      value: "applied_date"
    },
    {
      label: "Interview date",
      value: "interview_date"
    },
    {
      label: "Created at",
      value: "createdAt"
    },
  ];

  return (
    <>
      <div className="mb-2">
        <button type="button" className="sidebar-btn back-btn" onClick={() => navigate("/")}>
          <FontAwesomeIcon icon={faAnglesLeft} className="btn-icon" />
          Back
        </button>
      </div>

      <Row className="justify-content-between align-items-end mb-3">
        <Col xs={12} md={8} lg={9}>
          <h1 className="page-title mb-0">Application details</h1>
          <h3 className="page-sub-title mb-0">jobID: {jobID}</h3>
        </Col>
        <Col xs={12} md={4} lg={3} className="d-flex justify-content-center justify-content-md-end align-items-end mt-3 mt-md-0">
          <Button variant="primary" className="me-2" onClick={() => triggerNotification()}>
            <FontAwesomeIcon icon={faBell} className="btn-icon" />
            <span>Notify</span>
          </Button>
          <Button variant="primary" onClick={() => navigate(`/jobs/${jobID}/edit`)}>
            <FontAwesomeIcon icon={faPenToSquare} className="btn-icon" />
            <span>Edit</span>
          </Button>
        </Col>
      </Row>

      <div className="form-container">
        <Row>
          {fields.map((fieldObj, index) => (
            <Col key={`formField${index}`} xs={12} md={6} className="mb-3">
              <div className="font-size-xs font-weight-thick secondary-text-color mb-1">{fieldObj['label']}</div>
              <div className="font-size-sm font-weight-thin primary-text-color">
                {job[fieldObj.value] !== undefined && job[fieldObj.value] !== null && job[fieldObj.value] !== "" ? job[fieldObj.value] : "-"}
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

export default JobApplicationDetails;

