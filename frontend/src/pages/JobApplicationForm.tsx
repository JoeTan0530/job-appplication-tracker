import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";

import CustomSelect from "../components/CustomSelect.tsx";
import { showSystemPopup } from "../services/CustomSystemPopupService.js";
import { addJobApplication, editJobApplication, getJobItem, getStatusList } from "../services/JobApplicationService.js";

type JobApplicationFormMode = "add" | "edit";

interface JobApplicationFormProps {
  mode: JobApplicationFormMode;
}

const snakeToForm = (job) => {
  if (!job) return {};
  return {
    role: job.role || "",
    appliedDate: job.applied_date || "",
    companyName: job.company_name || "",
    companyRegNum: job.company_reg_num || "",
    jobRequirement: job.job_requirement || "",
    location: job.location || "",
    companyEmail: job.company_email || "",
    interviewDate: job.interview_date || "",
    salary: job.salary || "",
    status: job.status || "",
    remark: job.remark || "",
  };
};

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { jobID } = useParams();

  const isEdit = mode === "edit";

  const [formInputData, setFormInputData] = useState<any>({
    role: "",
    appliedDate: "",
    companyName: "",
    companyRegNum: "",
    jobRequirement: "",
    location: "",
    companyEmail: "",
    interviewDate: "",
    salary: "",
    status: "",
    remark: "",
  });
  const [statusOptions, setStatusOptions] = useState<any[]>([]);
  const [errMsg, setErrMsg] = useState<any>({});

  const requiredOk = useMemo(() => {
    return (
      formInputData.role?.toString().trim() &&
      formInputData.companyName?.toString().trim() &&
      formInputData.companyRegNum?.toString().trim()
    );
  }, [formInputData]);

  useEffect(() => {
    getStatusList((data) => {
      setStatusOptions(Array.isArray(data) ? data : []);
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    if (!jobID) return;
    getJobItem(jobID, (data) => {
      const item = data?.item || data || null;
      setFormInputData((prev) => ({ ...prev, ...snakeToForm(item) }));
    });
  }, [isEdit, jobID]);

  const updateFormInput = (events) => {
    const { id, value } = events.target;
    setFormInputData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const updateSelect = (id, val) => {
    setFormInputData((prevData) => ({
      ...prevData,
      [id]: val,
    }));
  };

  const triggerSave = () => {
    setErrMsg({});

    const payload = {
      ...formInputData,
    };

    if (isEdit) {
      editJobApplication({ ...payload, jobID }, () => {
        showSystemPopup("Saved changes.", "success");
        navigate(`/jobs/${jobID}`);
      }, setErrMsg);
      return;
    }

    addJobApplication(payload, (data) => {
      showSystemPopup("Application added.", "success");
      const newID = data?.jobID || data?.id;
      navigate(newID ? `/jobs/${newID}` : "/");
    }, setErrMsg);
  };

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between mb-3">
        <div className="d-flex align-items-center">
          <Button variant="secondary" className="me-2" onClick={() => navigate(isEdit ? `/jobs/${jobID}` : "/")}>
            <FontAwesomeIcon icon={faAnglesLeft} className="btn-icon" />
            Back
          </Button>
          <div>
            <h1 className="page-title mb-0">{isEdit ? "Edit application" : "Add application"}</h1>
            <h3 className="page-sub-title mb-0">
              {isEdit ? `jobID: ${jobID}` : "Create a new job application record"}
            </h3>
          </div>
        </div>
        <div className="d-flex d-md-block justify-content-end mt-3 mt-md-0">
          <Button variant="primary" onClick={triggerSave} disabled={!requiredOk}>
            <FontAwesomeIcon icon={faFloppyDisk} className="btn-icon" />
            <span>Save</span>
          </Button>
        </div>
      </div>

      <div className="form-container">
        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="role">
              <Form.Label>Role *</Form.Label>
              <Form.Control type="text" value={formInputData.role} onChange={updateFormInput} />
              {errMsg?.role && <div className="form-error-msg">{errMsg.role}</div>}
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="companyName">
              <Form.Label>Company name *</Form.Label>
              <Form.Control type="text" value={formInputData.companyName} onChange={updateFormInput} />
              {errMsg?.companyName && <div className="form-error-msg">{errMsg.companyName}</div>}
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="companyRegNum">
              <Form.Label>Company reg no. *</Form.Label>
              <Form.Control type="text" value={formInputData.companyRegNum} onChange={updateFormInput} />
              {errMsg?.companyRegNum && <div className="form-error-msg">{errMsg.companyRegNum}</div>}
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="status">
              <Form.Label>Status</Form.Label>
              <CustomSelect
                selectID="status"
                selectOptions={statusOptions}
                currentValue={formInputData.status}
                addDefaultAllOption={false}
                handleSelectValue={(event) => updateSelect("status", event.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="appliedDate">
              <Form.Label>Applied date</Form.Label>
              <Form.Control type="date" value={formInputData.appliedDate} onChange={updateFormInput} />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="interviewDate">
              <Form.Label>Interview date</Form.Label>
              <Form.Control type="date" value={formInputData.interviewDate} onChange={updateFormInput} />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="companyEmail">
              <Form.Label>Company email</Form.Label>
              <Form.Control type="email" value={formInputData.companyEmail} onChange={updateFormInput} />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="location">
              <Form.Label>Location</Form.Label>
              <Form.Control type="text" value={formInputData.location} onChange={updateFormInput} />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group className="form-group" controlId="jobRequirement">
              <Form.Label>Job requirement</Form.Label>
              <Form.Control as="textarea" rows={3} value={formInputData.jobRequirement} onChange={updateFormInput} />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="salary">
              <Form.Label>Salary</Form.Label>
              <Form.Control type="text" value={formInputData.salary} onChange={updateFormInput} />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group className="form-group" controlId="remark">
              <Form.Label>Remark</Form.Label>
              <Form.Control as="textarea" rows={3} value={formInputData.remark} onChange={updateFormInput} />
            </Form.Group>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default JobApplicationForm;

