import AppWrapper from "@/components/app-wrapper";
import { Outlet } from "react-router-dom";

const AppLayout = () => {

    return (
        <AppWrapper>
            <div className="h-full">
                <div>
                    <Outlet />
                </div>
            </div>
        </AppWrapper>
    );
};

export default AppLayout;