import { Navigate, Outlet } from "react-router-dom";
import useAuthStatus from "../hooks/useAuthStatus";
import Spinner from "./Spinner";

const PrivateRoute = () => {
    const { loggedUser, checkingStatus } = useAuthStatus();

    if (checkingStatus) {
        return <Spinner />;
    }

    return loggedUser ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default PrivateRoute;
