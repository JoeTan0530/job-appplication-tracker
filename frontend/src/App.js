import './App.css';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation, useNavigate } from "react-router-dom";

import CustomSystemPopupProvider from "./contexts/CustomSystemPopupContext.jsx";

// css
import "./assets/css";
import "bootstrap/dist/css/bootstrap.min.css";

// import javascript functions from bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// frame import
import FrameLayout from "./components/FrameLayout.tsx";

// pages import
import LoginPage from "./pages/LoginPage.tsx";
import RegistrationPage from "./pages/RegistrationPage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AddBook from "./pages/AddBook.tsx";
import EditBook from "./pages/EditBook.tsx";

function App() {
  return (
    <div className="main-display">
      <CustomSystemPopupProvider>
        <Router>
          <Routes>
            <Route path="*" element={<LoginPage />} />
            <Route path="/registration" element={<RegistrationPage />} />

            <Route element={<FrameLayout />}>
              <Route path="/dashboard" element={<Dashboard />}/>
              <Route path="/add-book" element={<AddBook />}/>
              <Route path="/edit-book/:bookID" element={<EditBook />}/>
            </Route>

            {/* 404 route */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </Router>
      </CustomSystemPopupProvider>
    </div>
  );
}

export default App;
