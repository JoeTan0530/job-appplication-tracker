import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Import the FontAwesomeIcon component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPenToSquare, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

import CustomTable from "../components/CustomTable.tsx";
import { showSystemPopup } from "../services/CustomSystemPopupService.js";
import { showConfirmModal } from "../services/CustomConfirmModalService.js";
import { formatDateDDMMYYYY } from "../utils/general.js";
import { getJobAppList, getStatusList, removeJobItem } from "../services/JobApplicationService.js";

const JobApplicationList: React.FC = () => {
  const navigate = useNavigate();

  const [rawList, setRawList] = useState([]);
  const [statusMap, setStatusMap] = useState<any>({});

  const refreshList = useCallback(() => {
    getJobAppList((data) => {
      const list = data?.listing || data || [];
      setRawList(Array.isArray(list) ? list : []);
    });
  }, []);

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
    refreshList();
  }, [statusMap, refreshList]);

  const triggerDelete = useCallback(async (jobID) => {
    const ok = await showConfirmModal({
      title: "Delete application",
      message: (
        <div>
          This will permanently remove the job application <b>#{jobID}</b>.
        </div>
      ),
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmVariant: "danger",
    });

    if (!ok) return;

    removeJobItem(jobID, () => {
      showSystemPopup("Deleted application. Refreshing list.", "success");
      refreshList();
    });
  }, [refreshList]);

  const columns = useMemo(
    () => [
      { header: "ID", accessor: "jobID" },
      { header: "Role", accessor: "role" },
      {
        header: "Applied",
        render: (row) => formatDateDDMMYYYY(row.applied_date) || row.applied_date || "-",
      },
      { header: "Company", accessor: "company_name" },
      { header: "Reg no.", accessor: "company_reg_num" },
      {
        header: "Requirement",
        render: (row) => (
          <div className="text-ellipsis-1" style={{ maxWidth: 260 }}>
            {row.job_requirement || "-"}
          </div>
        ),
      },
      { header: "Salary", accessor: "salary" },
      {
        header: "Status",
        render: (row) => statusMap[row.status] || row.status || "-",
      },
      {
        header: "Created",
        render: (row) => formatDateDDMMYYYY(row.createdAt) || row.createdAt || "-",
      },
      {
        header: "Actions",
        render: (row) => (
          <div className="d-flex justify-content-end">
            <Button
              variant="tertiary"
              className="me-1"
              onClick={() => navigate(`/jobs/${row.jobID}`)}
            >
              <FontAwesomeIcon icon={faEye} className="btn-icon" />
            </Button>
            <Button
              variant="tertiary"
              className="me-1"
              onClick={() => navigate(`/jobs/${row.jobID}/edit`)}
            >
              <FontAwesomeIcon icon={faPenToSquare} className="btn-icon" />
            </Button>
            <Button variant="tertiary" onClick={() => triggerDelete(row.jobID)}>
              <FontAwesomeIcon icon={faTrash} className="btn-icon" />
            </Button>
          </div>
        ),
      },
    ],
    [navigate, statusMap, triggerDelete]
  );

  const listCss = useMemo(
    () => ({
      header: [
        { index: 9, css: { textAlign: "right" } },
      ],
      listing: [
        { index: 9, css: { textAlign: "right" } },
      ],
    }),
    []
  );

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between mb-3">
        <div>
          <h1 className="page-title">Job applications</h1>
          <h3 className="page-sub-title">Track your pipeline in one place</h3>
        </div>
        <div className="d-flex d-md-block justify-content-end mt-3 mt-md-0">
          <Button variant="primary" onClick={() => navigate("/jobs/new")}>
            <FontAwesomeIcon icon={faPlus} className="btn-icon" />
            <span>Add application</span>
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <CustomTable
          listingID="jobAppList"
          listingData={rawList}
          columns={columns}
          listingCss={listCss}
          emptyTitle="No job applications yet"
          emptySubtitle="Click “Add application” to create your first record"
        />
      </div>
    </>
  );
};

export default JobApplicationList;

