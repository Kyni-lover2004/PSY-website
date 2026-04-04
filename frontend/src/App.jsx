import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import TestsList from './pages/TestsList';
import TestAuthCheck from './pages/TestAuthCheck';
import TestAnketa from './pages/TestAnketa';
import TestWelcome from './pages/TestWelcome';
import TestQuestionnaire from './pages/TestQuestionnaire';
import TestResults from './pages/TestResults';
import CompatibilityCheck from './pages/CompatibilityCheck';
import Appointment from './pages/Appointment';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tests" element={<TestsList />} />
          <Route path="test" element={<TestAuthCheck />} />
          <Route path="test/archetypes" element={<TestAuthCheck />} />
          <Route path="test/archetypes/anketa" element={<TestAnketa />} />
          <Route path="test/questionnaire" element={<TestQuestionnaire />} />
          <Route path="test/results/:code" element={<TestResults />} />
          <Route path="test/temperament" element={<TestsList />} />
          <Route path="test/love-language" element={<TestsList />} />
          <Route path="test/attachment" element={<TestsList />} />
          <Route path="test/values" element={<TestsList />} />
          <Route path="test/communication" element={<TestsList />} />
          <Route path="compatibility" element={<CompatibilityCheck />} />
          <Route path="appointment" element={<Appointment />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
