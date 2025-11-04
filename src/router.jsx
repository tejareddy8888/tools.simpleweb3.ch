import { createBrowserRouter } from "react-router-dom";
import SendTransaction from "./pages/SendTransaction.jsx";
import About from "./pages/About.jsx";
import  LandingPage  from "./pages/LandingPage.jsx";
import SolanaValidator from "./pages/SolanaValidator.jsx";

const router = createBrowserRouter([
    {
        path: "/", // 👈 root path
        element: <LandingPage />,
      },
      {
        path: "/transaction", // 👈 full screen route
        element: <SendTransaction />,
      },
      {
        path: "/solana-validator", // 👈 solana validator route
        element: <SolanaValidator />,
      },
      {
        path: "/about", // 👈 full screen route
        element: <About />,
      },
]);

export default router;
