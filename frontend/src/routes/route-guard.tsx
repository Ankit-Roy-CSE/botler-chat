import { Navigate, Outlet } from "react-router-dom";

interface Props {
    requireAuth?: boolean;
}

const RouteGuard = ({ requireAuth }: Props) => {
    return <Outlet />;
};

export default RouteGuard;