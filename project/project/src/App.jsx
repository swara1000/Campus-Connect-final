import { Navigate, Route, Routes } from "react-router-dom";

// ================= ADMIN PAGES =================
import AdminLogin from "./pages/AdminAuth/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import StudentManagement from "./pages/StudentManagement.jsx";

// ================= ADMIN PROTECTION =================
import AdminProtectedRoute from "./routes/AdminProtectedRoute";

// ================= ADMIN LAYOUT =================
import AdminLayout from "./components/layout/AdminLayout";

// ================= ADMIN MODULES =================
import Events from "./components/Events";
import Clubs from "./components/Clubs";
import Placements from "./components/Placements";
import StudyMaterials from "./components/StudyMaterials";
import LearningRequests from "./components/LearningRequests";
import Notifications from "./components/Notifications";

function App() {
  return (
    <Routes>

      {/* ================= DEFAULT ================= */}
      <Route
        path="/"
        element={<Navigate to="/admin/login" replace />}
      />

      {/* ================= ADMIN LOGIN ================= */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* ================= PROTECTED ADMIN ================= */}
      <Route element={<AdminProtectedRoute />}>

        <Route
          path="/admin"
          element={<AdminLayout />}
        >

          {/* /admin → /admin/dashboard */}
          <Route
            index
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          {/* ================= DASHBOARD ================= */}
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          {/* ================= STUDENT MANAGEMENT ================= */}
          <Route
            path="students"
            element={<StudentManagement />}
          />

          {/* ================= EVENTS ================= */}
          <Route
            path="events"
            element={<Events />}
          />

          {/* ================= CLUBS ================= */}
          <Route
            path="clubs"
            element={<Clubs />}
          />

          {/* ================= PLACEMENTS ================= */}
          <Route
            path="placements"
            element={<Placements />}
          />

          {/* ================= STUDY MATERIALS ================= */}
          <Route
            path="materials"
            element={<StudyMaterials />}
          />

          {/* ================= LEARNING REQUESTS ================= */}
          <Route
            path="learning-requests"
            element={<LearningRequests />}
          />

          {/* ================= NOTIFICATIONS ================= */}
          <Route
            path="notifications"
            element={<Notifications />}
          />

        </Route>
      </Route>

      {/* ================= INVALID ROUTE ================= */}
      <Route
        path="*"
        element={
          <Navigate
            to="/admin/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;