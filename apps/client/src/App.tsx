import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';

import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Workflows from './pages/Workflows';
import WorkflowEditor from './pages/WorkflowEditor';
import Executions from './pages/Executions';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import Templates from './pages/Templates';
import TemplatePreview from './pages/TemplatePreview';
import GuestWorkflow from './pages/GuestWorkflow';
import Pricing from './pages/Pricing';
import Desktop from './pages/Desktop';
import Download from './pages/Download';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Contact from './pages/Contact';
import About from './pages/About';

// Simple auth check
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
};

function AppContent() {
  useKeyboardShortcuts();

  return (
    <>
      <KeyboardShortcutsModal />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/desktop" element={<Desktop />} />
        <Route path="/download" element={<Download />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/templates/:id/preview" element={<TemplatePreview />} />
        <Route path="/workflow/guest" element={<GuestWorkflow />} />

        {/* Protected routes */}
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="workflows" element={<Workflows />} />
          <Route path="workflows/new" element={<WorkflowEditor />} />
          <Route path="workflows/:id" element={<WorkflowEditor />} />
          <Route path="executions" element={<Executions />} />
          <Route path="templates" element={<Templates />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <AppContent />
      </div>
    </ThemeProvider>
  );
}

export default App;

