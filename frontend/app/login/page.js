"use client";

import "./login.css";
import { useState } from "react";
// import LoginComponent from "@/app/components/login";
function isValidEmail(email) {
    if (email.length >= 255) return "Email is too long.";

    const re = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$/;
    if (!re.test(email)) return "Invalid email format.";

    return "";
}


function isValidPassword(password) {
    if (password.length < 8) return "Password is too short. It should be at least 8 characters.";
    if (password.length > 254) return "Password is too long. It should be at most 254 characters.";

    let hasLower = false, hasUpper = false, hasDigit = false, hasSpecial = false;
    const specialChars = "!@#$%^&*()_+-=[]{}; ':\"\\|,.<>/?";

    for (let char of password) {
        if (char >= 'a' && char <= 'z') hasLower = true;
        else if (char >= 'A' && char <= 'Z') hasUpper = true;
        else if (char >= '0' && char <= '9') hasDigit = true;
        else if (specialChars.includes(char)) hasSpecial = true;
        else return "Password contains invalid characters.";
    }

    if (!hasLower) return "Password must contain at least one lowercase letter.";
    if (!hasUpper) return "Password must contain at least one uppercase letter.";
    if (!hasDigit) return "Password must contain at least one digit.";
    if (!hasSpecial) return "Password must contain at least one special character.";

    return "";
}

async function submitFormHandler(e) {
    e.preventDefault();
    console.log("Form submitted");
    const formData = Object.fromEntries(new FormData(e.target));
    const email = formData.email;
    const password = formData.password;
    const credentials = btoa(`${email}:${password}`);
    localStorage.setItem("jwt", credentials);
    // console.log("formdata : ", formData);
    console.log("Form Data:", formData);

    const response = await fetch('http://localhost:8080/api/auth/login', {
        method: "POST",
        body: JSON.stringify(formData),
        credentials: "include",
    });

    if (!response.ok) {
        alert("Invalid email or password");
        return
    }
    window.location.href = "/home";
}




export default function LoginPage() {
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