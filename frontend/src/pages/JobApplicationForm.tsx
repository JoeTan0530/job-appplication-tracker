import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft, faFloppyDisk } from "@fortawesome/free-solid-svg-icons";

import CustomSelect from "../components/CustomSelect.tsx";
import { showSystemPopup } from "../services/CustomSystemPopupService.js";
import { addJobApplication, editJobApplication, getJobItem, getStatusList } from "../services/JobApplicationService.js";
import { formatDateDDMMYYYY, formatDateForInitialInput } from "../utils/general.js";

type JobApplicationFormMode = "add" | "edit";

interface JobApplicationFormProps {
  mode: JobApplicationFormMode;
}

const snakeToForm = (job) => {
  if (!job) return {};
  return {
    role: job.role || "",
    appliedDate: (job.applied_date ? formatDateForInitialInput(job.applied_date) : "") || "",
    companyName: job.company_name || "",
    companyRegNum: job.company_reg_num || "",
    jobRequirement: job.job_requirement || "",
    location: job.location || "",
    companyEmail: job.company_email || "",
    interviewDate: (job.interview_date ? formatDateForInitialInput(job.interview_date) : "") || "",
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
      console.log("test: ", snakeToForm(item));
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
      <div className="mb-2">
        <button
          type="button"
          className="sidebar-btn back-btn"
          onClick={() => navigate(isEdit ? `/jobs/${jobID}` : "/")}
        >
          <FontAwesomeIcon icon={faAnglesLeft} className="btn-icon" />
          Back
        </button>
      </div>

      <Row className="justify-content-between align-items-end mb-3">
        <Col xs={12} md={10} xl={11}>
          <h1 className="page-title mb-0">{isEdit ? "Edit application" : "Add application"}</h1>
          <h3 className="page-sub-title mb-0">
            {isEdit ? `jobID: ${jobID}` : "Create a new job application record"}
          </h3>
        </Col>
        <Col xs={12} md={2} xl={1} className="mt-3 mt-md-0">
          <Button variant="primary" className="w-100" onClick={triggerSave} disabled={!requiredOk}>
            <FontAwesomeIcon icon={faFloppyDisk} className="btn-icon" />
            <span>Save</span>
          </Button>
        </Col>
      </Row>

      <div className="form-container">
        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="role">
              <Form.Label>
                Role <span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Control type="text" value={formInputData.role} onChange={updateFormInput} />
              {errMsg?.role && <div className="form-error-msg">{errMsg.role}</div>}
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="companyName">
              <Form.Label>
                Company name <span className="required-asterisk">*</span>
              </Form.Label>
              <Form.Control type="text" value={formInputData.companyName} onChange={updateFormInput} />
              {errMsg?.companyName && <div className="form-error-msg">{errMsg.companyName}</div>}
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group className="form-group" controlId="companyRegNum">
              <Form.Label>
                Company reg no. <span className="required-asterisk">*</span>
              </Form.Label>
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
                addDefaultAllOption={true}
                customDefaultLabel={"Please select an option"}
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

