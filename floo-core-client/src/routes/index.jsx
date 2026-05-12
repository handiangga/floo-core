import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";

// ======================================================
// 🔥 DASHBOARD
// ======================================================
import Dashboard from "../pages/dashboard/Dashboard";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard";
import OwnerDashboard from "../pages/dashboard/OwnerDashboard";

// ======================================================
// 🔥 EMPLOYEE
// ======================================================
import Employee from "../pages/employee/Employee";
import EmployeeCreate from "../pages/employee/CreateEmployee";
import EditEmployee from "../pages/employee/EditEmployee";
import DetailEmployee from "../pages/employee/DetailEmployee";

// ======================================================
// 🔥 LOAN
// ======================================================
import DetailLoan from "../pages/loan/DetailLoan";
import Loan from "../pages/loan/Loan";
import CreateLoan from "../pages/loan/CreateLoan";

// ======================================================
// 🔥 PROTECTED
// ======================================================
import ProtectedRoute from "../components/layout/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================================================= */}
      {/* 🔥 AUTH */}
      {/* ================================================= */}
      <Route path="/" element={<Login />} />

      {/* ================================================= */}
      {/* 🔥 ADMIN DASHBOARD */}
      {/* ================================================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ================================================= */}
      {/* 🔥 MANAGER DASHBOARD */}
      {/* ================================================= */}
      <Route
        path="/dashboard/manager"
        element={
          <ProtectedRoute allowedRoles={["manager"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================================================= */}
      {/* 🔥 OWNER DASHBOARD */}
      {/* ================================================= */}
      <Route
        path="/dashboard/owner"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================================================= */}
      {/* 🔥 EMPLOYEE */}
      {/* ================================================= */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <Employee />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/create"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EmployeeCreate />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/edit/:id"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <EditEmployee />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <DetailEmployee />
          </ProtectedRoute>
        }
      />

      {/* ================================================= */}
      {/* 🔥 LOAN */}
      {/* ================================================= */}
      <Route
        path="/loans"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "owner"]}>
            <Loan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/loans/create"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <CreateLoan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/loans/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "manager", "owner"]}>
            <DetailLoan />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
