import { Heading1 } from 'lucide-react'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './pages/Homepage';

const router = createBrowserRouter([
	
	{
		path: "/Homepage",
		element: <Homepage/>
	}
])

function App(){

	return (
	
		<RouterProvider router={router}/>
	)
}
export default App
