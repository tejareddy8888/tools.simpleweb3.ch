import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import LandingPage from "./pages/LandingPage";
import Converter from './pages/Converter'; 
import Sign from "./pages/Sign.jsx";

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
    path: 'sign', 
    element: <Sign />,
  },
  {
    path: 'converter', 
    element: <Converter />,
  },
]);

export default router;
