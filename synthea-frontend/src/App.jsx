import { Heading1 } from 'lucide-react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './pages/Homepage';
import MainDashboard from './pages/MainDashboard';
import DataGeneration from './pages/DataGeneration';

const router = createBrowserRouter([
	
	{
		path: "/Homepage",
		element: <Homepage/>
	},
	{
		
		path:"/Dashboard",
		element: <MainDashboard/>
	},
	
	{
		path: "/DataGeneration",
		element: <DataGeneration/>
	},

])

function App(){

	return (
	
		<RouterProvider router={router}/>
	)
}
export default App
