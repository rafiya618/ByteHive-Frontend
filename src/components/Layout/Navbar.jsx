import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";

const Navbar = () => {

    const [isOpen, setIsOpen] = useState(false);
    const [auth, setAuth] = useAuth()

    const HandleLogout = () => {
        localStorage.removeItem("Auth")
        setAuth({...auth, token: ''})
        toast.success("User logout successfully.")
    }
 
    return (
        <nav className="navbar">
            <div className="nav-container">
                <h1 className="logo">ByteHive</h1>

                <ul className={`nav-links ${isOpen ? "open" : ""}`}>
                    <li><Link to="/">Home</Link></li>
                    {
                        (!auth?.token) ?
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/register">Register</Link></li>
                            </>
                            : <>
                                <li ><Link to="/login" onClick={HandleLogout}>Logout</Link></li>
                            </>

                    }


                </ul>
            </div>
        </nav>
    );
};

export default Navbar;

