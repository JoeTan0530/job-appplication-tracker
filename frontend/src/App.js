import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import CustomSystemPopupProvider from "./contexts/CustomSystemPopupContext.jsx";
import CustomConfirmModalProvider from "./contexts/CustomConfirmModalContext.jsx";

// css
import "./assets/css";
import "bootstrap/dist/css/bootstrap.min.css";

// import javascript functions from bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// frame import
import FrameLayout from "./components/FrameLayout.tsx";

// pages import
import JobApplicationList from "./pages/JobApplicationList.tsx";
import JobApplicationDetails from "./pages/JobApplicationDetails.tsx";
import JobApplicationForm from "./pages/JobApplicationForm.tsx";

function App() {
  return (
    <div className="main-display">
      <CustomSystemPopupProvider>
        <CustomConfirmModalProvider>
          <Router>
            <Routes>
              <Route element={<FrameLayout />}>
                <Route path="/" element={<JobApplicationList />} />
                <Route path="/jobs/new" element={<JobApplicationForm mode="add" />} />
                <Route path="/jobs/:jobID" element={<JobApplicationDetails />} />
                <Route path="/jobs/:jobID/edit" element={<JobApplicationForm mode="edit" />} />
              </Route>

              {/* 404 route */}
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </Router>
        </CustomConfirmModalProvider>
      </CustomSystemPopupProvider>
    </div>
  );
}

export default App;
