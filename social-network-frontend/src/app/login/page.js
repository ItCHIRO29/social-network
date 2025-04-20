"use client";

import styles from "./login.module.css";
import { useState } from "react";
import { isValidEmail, isValidPassword, isValidLoginForm } from "@/utils/authValidators";
// import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    // const router = useRouter();
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const handleInputChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: name === "password" ? isValidPassword(value) : isValidEmail(value),
        }));
    };

    async function submitFormHandler(e) {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        if (!isValidLoginForm(formData.email, formData.password)) {
            alert("Invalid email or password");
            return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            method: "POST",
            body: JSON.stringify(formData),
            credentials: "include",
        });

        if (!response.ok) {
            alert("Invalid email or password");
            return;
        }

        if (typeof window !== 'undefined') {
            window.location.href = "/";
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.logoSection}>
                <img width={150} height={150} src="/images/logo.png" alt="logo" />
                <h2 className={styles.logoTitle}>Login</h2>
            </div>
            <div className={styles.loginContainer}>
                <h1>Login</h1>
                <form onSubmit={submitFormHandler}>
                    <input name="email" type="text" placeholder="Email" onChange={handleInputChange} />
                    <p className={styles.errorText}>{errors.email}</p>
                    <input name="password" type="password" placeholder="Password" onChange={handleInputChange} />
                    <p className={styles.errorText}>{errors.password}</p>
                    <Link href="/register">you don t have an account? click here</Link>
                    <button type="submit" className={styles.btn}>Login</button>
                </form>
            </div>
        </div>
    );
}