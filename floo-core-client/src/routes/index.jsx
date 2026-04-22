import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Employee from "../pages/employee/Employee";
import EmployeeCreate from "../pages/employee/CreateEmployee";
import EditEmployee from "../pages/employee/EditEmployee";
import DetailEmployee from "../pages/employee/DetailEmployee";
import DetailLoan from "../pages/loan/DetailLoan";
import Loan from "../pages/loan/Loan";
import CreateLoan from "../pages/loan/CreateLoan";

import ProtectedRoute from "../components/layout/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/employees/:id" element={<DetailEmployee />} />
      <Route path="/employees/edit/:id" element={<EditEmployee />} />
      <Route path="/employees/create" element={<EmployeeCreate />} />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <Employee />
          </ProtectedRoute>
        }
      />
      <Route path="/loans/:id" element={<DetailLoan />} />
      <Route path="/loans/create" element={<CreateLoan />} />
      <Route path="/loans" element={<Loan />} />
    </Routes>
  );
}
