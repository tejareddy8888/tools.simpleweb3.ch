import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import LandingPage from "./pages/LandingPage";
import Converter from './pages/Converter'; // Add this import

const router = createBrowserRouter([
  {
    path: "/", // 👈 root path
    element: <LandingPage />,
  },
  {
    path: "/transaction", // 👈 full screen route
    element: <Home />,
  },
  {
    path: "/about", // 👈 full screen route
    element: <About />,
  },
  {
    path: 'converter', // Add this route
    element: <Converter />,
  },
]);

export default router;
