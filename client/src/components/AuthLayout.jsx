import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

/*
This will ensure that:
*Unauthenticated users are redirected to the login page.
*Authenticated non-admin users are redirected to an unauthorized page.
*Only authenticated admin users can access the protected content. 
*/



function Protected({ children, authentication = true, adminOnly = false }) {
    const navigate = useNavigate();
    const [loader, setLoader] = useState(true);
    const authStatus = useSelector((state) => state.auth.status);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        if (authentication && authStatus !== authentication) {
            navigate("/login");
        } else if (!authentication && authStatus !== authentication) {
            navigate("/");
        } else if (adminOnly && (!user || user.role !== "admin")) {
            // Redirect non-admin users to home or an unauthorized page
            navigate("/unauthorized");
        }
        setLoader(false);
    }, [authStatus, navigate, authentication, adminOnly, user]);

    return loader ? <h1>Loading...</h1> : <>{children}</>;
}

export default Protected;