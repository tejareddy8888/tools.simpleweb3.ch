import {
    createBrowserRouter,
} from "react-router-dom";
import Home from './pages/Home.jsx';

const router = createBrowserRouter([
    {
        element: <Home />,
        children: [
            {
                path: "/",
                element: <Home />,
                errorElement: <Home />,
            },
            {
                path: "/about",
                element: <Home />,
            },
        ],
    },
]);

export default router;