import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './pages/Homepage';
import MainDashboard from './pages/MainDashboard';
import DataGeneration from './pages/DataGeneration';
import PatientDashboard from './pages/PatientDashboard';
import ConditionsDashboard from "./pages/ConditionsDashboard";
import AllergiesDashboard from './pages/AllergiesDashboard';

import path from 'path';

const router = createBrowserRouter([
  { path: "/", element: <Homepage /> },
  { path: "/dashboard", element: <MainDashboard /> },
  { path: "/data_generation", element: <DataGeneration /> },
  { path: "/patient_dashboard", element: <PatientDashboard /> },
  { path: "/conditions_dashboard", element: <ConditionsDashboard /> },
  { path: "/allergies_dashboard", element: <AllergiesDashboard /> },
]);

function App() {
  return (
    // w-full ensures it takes full browser width, min-h-screen ensures full height
    <div className="w-full h-screen bg-gray-50 overflow-hidden">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
