import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const GoogleAuth = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");
        const error = urlParams.get("error");

        if (error) {
            // alert(`Error: ${error}`); // Display error message
            toast.error(error)
            navigate("/");
        } else if (token) {
          localStorage.setItem("Auth", JSON.stringify({ token }));
          toast.success("Authentication successfull!")
          navigate("/");
        }
    }, []);

    return <h1>Authenticating...</h1>;
};

export default GoogleAuth;
