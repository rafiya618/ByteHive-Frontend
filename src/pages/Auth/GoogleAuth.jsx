import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/auth";


const GoogleAuth = () => {
    const navigate = useNavigate();
    const {auth, setAuth} = useAuth()
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const error = urlParams.get("error");

        if (error) {
            // alert(`Error: ${error}`); // Display error message
            toast.error(error)
            navigate("/");
        } else if (token) {
            const decoded = jwtDecode(token);
            setAuth({ token: token, user: decoded });
            localStorage.setItem("Auth", JSON.stringify({ token: token }));
            toast.success("Authentication successfull!")
            console.log('decoded', decoded)
            if (decoded.onboardingStep == 2)
                navigate("/setup-profile");
            else if(decoded.onboardingStep == 4)
                navigate("/");
        }
    }, []);

    return <h1>Authenticating...</h1>;
};

export default GoogleAuth;
