import React, { useEffect, useState } from "react";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

import { getJobItem } from "../services/JobApplicationService.js";

const JobApplicationDetails: React.FC = () => {
  const { jobID } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!jobID) return;
    setIsLoading(true);
    getJobItem(jobID, (data) => {
      setJob(data?.item || data || null);
      setIsLoading(false);
    });
  }, [jobID]);

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
          <Button variant="secondary" onClick={() => navigate("/")}>
            <FontAwesomeIcon icon={faAnglesLeft} className="btn-icon" />
            Back
          </Button>
        </div>
        <div className="font-size-md font-weight-bold primary-text-color mb-1">Not found</div>
        <div className="font-size-sm font-weight-thin secondary-text-color">
          The job application could not be loaded.
        </div>
      </div>
    );
  }

  const fields = [
    "role",
    "company_name",
    "company_reg_num",
    "job_requirement",
    "location",
    "company_email",
    "status",
    "remark",
    "salary",
    "applied_date",
    "interview_date",
    "createdAt",
  ];

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between mb-3">
        <div className="d-flex align-items-center">
          <Button variant="secondary" className="me-2" onClick={() => navigate("/")}>
            <FontAwesomeIcon icon={faAnglesLeft} className="btn-icon" />
            Back
          </Button>
          <div>
            <h1 className="page-title mb-0">Application details</h1>
            <h3 className="page-sub-title mb-0">jobID: {jobID}</h3>
          </div>
        </div>
        <div className="d-flex d-md-block justify-content-end mt-3 mt-md-0">
          <Button variant="primary" onClick={() => navigate(`/jobs/${jobID}/edit`)}>
            <FontAwesomeIcon icon={faPenToSquare} className="btn-icon" />
            <span>Edit</span>
          </Button>
        </div>
      </div>

      <div className="form-container">
        <Row>
          {fields.map((key) => (
            <Col key={key} xs={12} md={6} className="mb-3">
              <div className="font-size-xs font-weight-thick secondary-text-color mb-1">{key}</div>
              <div className="font-size-sm font-weight-thin primary-text-color">
                {job[key] !== undefined && job[key] !== null && job[key] !== "" ? job[key] : "-"}
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

export default JobApplicationDetails;

