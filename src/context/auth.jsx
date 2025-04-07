import { useState, createContext, useContext, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({ token: "" });

    useEffect(() => {
        const data = localStorage.getItem("Auth");
        if (data) {
            const parseData = JSON.parse(data);
            setAuth({ token: parseData.token }); // Directly set parsed token
        }
    }, []); 

    return (
        <AuthContext.Provider value={[auth, setAuth]}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
