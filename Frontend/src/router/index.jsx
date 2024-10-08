import Login from "../pages/login";
import SignUp from "../pages/signup";
import {createBrowserRouter} from "react-router-dom";
 import AuthRoute from "../components/AuthRoute";
import Dashboard from "../pages/dashboard";
import Layout from "@/pages/layout/index.jsx";
import Income from "@/pages/transaction/index.jsx";
import {Payments} from "@mui/icons-material";
import Reports from "@/pages/report/index.jsx";
import UserProfile from "@/pages/userProfile/index.jsx";
import Account from "@/pages/account/index.jsx";
import ContactUs from "@/pages/contactUs/index.jsx";
import Investment from "@/pages/investment/index.jsx";


const router = createBrowserRouter([
    {
        path: '/',
        element: (
              <AuthRoute>
                <Layout/>
              </AuthRoute>
        ),
        children : [
            {
                path: '/',
                index: true,
                element: <Dashboard/>
            },
            {
                path: 'transaction',
                element: <Income/>
            },
            {
                path:'payment',
                element: <Payments/>
            },
            {
                path:'report',
                element: <Reports/>
            },
            {
                path:'contact-us',
                element: <ContactUs/>
            },
            {
                path:'investment',
                element: <Investment/>
            },
        ]
    },
    {
        path: '/account',
        element: <Account/>,
    },
    {
        path: '/login',
        element: <Login/>,
        index: true
    },
    {
        path:'signup',
        element: <SignUp/>
    },
    {
        path: 'userprofile',
        element: <UserProfile/>
    }
]);


export default router;