"use client";

import "./login.css";
import { useState } from "react";
import isValidEmail from "@/utils/authValidators/validators/validEmail";
import isValidPassword from "@/utils/authValidators/validators/validPassword";
import isValidLoginForm from "@/utils/authValidators/validateLoginForm";
import { useRouter } from "next/navigation";




export default function LoginPage() {
    const router = useRouter();
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    })

    const HandleInputChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        setErrors((prevErrors) => {
            return {
                ...prevErrors,
                [name]: name === "password" ? isValidPassword(value) : isValidEmail(value),
            }
        })
    };

    async function submitFormHandler(e) {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        if (!isValidLoginForm(formData.email, formData.password)) {
            alert("Invalid email or password");
            return
        }
    
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: "POST",
            body: JSON.stringify(formData),
            credentials: "include",
        });
    
        if (!response.ok) {
            alert("Invalid email or password");
            return
        }
       if (typeof window !== 'undefined') {
            window.location.href = "/";
       }
    }
    
    return (

        <>
            < div className="Container" >
                <div className="xx">
                    <img width={150} height={150} src="images/SN-logo1.png" alt="logo" />
                    <h2 style={{ color: "white", fontFamily: 'serif' }}>Login</h2>
                </div>
                <div className="login-container">
                    <h1>Login</h1>
                    <form onSubmit={submitFormHandler}>
                        <input name="email" type="text" placeholder="Email" onChange={HandleInputChange} />
                        <p>{errors.email}</p>
                        <input name="password" type="password" placeholder="Password" onChange={HandleInputChange} />
                        <p>{errors.password}</p>
                        <a href="/register">you don't have an account? click here</a>
                        <button type="submit" className="btn">Login</button>
                    </form>
                </div>
            </div >
        </>

    );
}