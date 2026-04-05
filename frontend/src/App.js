import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Items from './pages/Items';
import Issue from './pages/Issue';
import Return from './pages/Return';
import Reports from './pages/Reports';
import About from './pages/About';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Router>
      <div className="app-container">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
        <div className="app-body">
          <Sidebar isOpen={sidebarOpen} onNavigate={closeSidebar} onClose={closeSidebar} />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/items" element={<Items />} />
              <Route path="/issue" element={<Issue />} />
              <Route path="/return" element={<Return />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
