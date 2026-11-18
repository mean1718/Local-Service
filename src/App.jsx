import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import PostService from './pages/PostService.jsx';
import ReportIssue from './pages/ReportIssue.jsx';
import Auth from './pages/Auth.jsx';
import servicesData from './data/services.js';
import './index.css';
import BottomNav from './components/BottomNav.jsx';

function App() {
  const [services, setServices] = useState(() => {
    try {
      const stored = localStorage.getItem("lsf_services");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage errors and fall back to seed data.
    }
    return servicesData;
  });

  const [currentLocation, setCurrentLocation] = useState("Phnom Penh");

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("lsf_current_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const addService = (newService) => {
    setServices([...services, { ...newService, id: services.length + 1 }]);
  };

  useEffect(() => {
    try {
      localStorage.setItem("lsf_services", JSON.stringify(services));
    } catch {
      // Ignore storage errors.
    }
  }, [services]);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-zinc-100 text-zinc-900 pb-20 sm:pb-24">
        <Navbar
          currentLocation={currentLocation}
          onChangeLocation={setCurrentLocation}
          currentUser={currentUser}
        />
        <main className="px-4 sm:px-6 pb-6">
          <Routes>
            <Route
              path="/"
              element={<Auth onAuthSuccess={(user) => setCurrentUser(user)} />}
            />
            <Route
              path="/home"
              element={<Home services={services} currentLocation={currentLocation} />}
            />
            <Route
              path="/services"
              element={<Services services={services} currentLocation={currentLocation} />}
            />
            <Route path="/services/:id" element={<ServiceDetail services={services} />} />
            <Route path="/post-service" element={<PostService onAddService={addService} />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route
              path="/auth"
              element={<Auth onAuthSuccess={(user) => setCurrentUser(user)} />}
            />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;