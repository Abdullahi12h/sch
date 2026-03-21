import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AcademicYearProvider } from './context/AcademicYearContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import DashboardLayout from './layouts/DashboardLayout';
import Admissions from './pages/Admissions';
import Students from './pages/Students';
import Academics from './pages/Academics';
import Timetable from './pages/Timetable';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import TeacherAttendance from './pages/TeacherAttendance';
import CreateTime from './pages/attendance/CreateTime';
import Subjects from './pages/Subjects';
import Grades from './pages/Grades';
import Periods from './pages/Periods';
import GradeDetails from './pages/GradeDetails';
import ExamSettings from './pages/exams/ExamSettings';
import MarksEntry from './pages/exams/MarksEntry';
import StudentResults from './pages/exams/StudentResults';
import MyFee from './pages/MyFee';
import Staff from './pages/Staff';
import PasswordRequests from './pages/PasswordRequests';
import DashboardSettings from './pages/DashboardSettings';
import BrandingSettings from './pages/BrandingSettings';
import SalaryRegistration from './pages/SalaryRegistration';
import CleaningChecklist from './pages/CleaningChecklist';
import Inventory from './pages/Inventory';
import HRAttendance from './pages/HRAttendance';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AcademicYearProvider>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />

            {/* Private Portal Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="admissions" element={<Admissions />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="attendance-teacher" element={<TeacherAttendance />} />
              <Route path="attendance-teacher/policy" element={<CreateTime />} />
              <Route path="exams/settings" element={<ExamSettings />} />
              <Route path="exams/marks" element={<MarksEntry />} />
              <Route path="exams/results" element={<StudentResults />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="grades" element={<Grades />} />
              <Route path="grades/:id" element={<GradeDetails />} />
              <Route path="periods" element={<Periods />} />
              <Route path="academics" element={<Academics />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="finance" element={<Finance />} />
              <Route path="finance/salary" element={<SalaryRegistration />} />
              <Route path="my-fee" element={<MyFee />} />
              <Route path="settings" element={<Settings />} />
              <Route path="staff" element={<Staff />} />
              <Route path="cleaning" element={<CleaningChecklist />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="hr-attendance" element={<HRAttendance />} />
              <Route path="reset-requests" element={<PasswordRequests />} />
              <Route path="dashboard-settings" element={<DashboardSettings />} />
              <Route path="branding" element={<BrandingSettings />} />
            </Route>
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AcademicYearProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
