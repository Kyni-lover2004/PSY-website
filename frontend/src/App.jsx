import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TestWelcome from './pages/TestWelcome';
import TestQuestionnaire from './pages/TestQuestionnaire';
import TestResults from './pages/TestResults';
import CompatibilityCheck from './pages/CompatibilityCheck';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="test" element={<TestWelcome />} />
        <Route path="test/questionnaire" element={<TestQuestionnaire />} />
        <Route path="test/results/:code" element={<TestResults />} />
        <Route path="compatibility" element={<CompatibilityCheck />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;
