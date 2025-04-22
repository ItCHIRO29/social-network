'use client'
import { useState } from "react";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.css";
import {
    isValidAge,
    isValidBio,
    isValidEmail,
    isValidGender,
    isValidName,
    isValidNickname,
    isValidPassword,
    isValidUsername,
    isValidRegisterForm
} from "@/utils/authValidators";

export default function RegisterPage() {
    // const router = useRouter();

    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        age: "",
        BirthDate: "",
        gender: "",
        email: "",
        password: "",
        nickname: "",
        bio: "",
        image: null
    });

    const [errors, setErrors] = useState({
        username: "",
        first_name: "",
        last_name: "",
        age: "",
        gender: "",
        email: "",
        password: "",
        nickname: "",
        bio: ""
    });

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "file") {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
            return;
        }

        if (type === "radio") {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateField = (name, value) => {
        switch (name) {
            case "username": return isValidUsername(value);
            case "first_name": return isValidName(value);
            case "last_name": return isValidName(value);
            case "age": return isValidAge(value);
            case "gender": return isValidGender(value);
            case "email": return isValidEmail(value);
            case "password": return isValidPassword(value);
            case "nickname": return isValidNickname(value);
            case "bio": return isValidBio(value);
            default: return "";
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setErrors(prev => ({
            ...prev,
            [name]: validateField(name, value)
        }));
    };

    async function handleRegister(e) {
        e.preventDefault();

        // Validate all fields on submit
        const validation = isValidRegisterForm(formData);
        setErrors(validation.errors);

        if (!validation.isValid) {
            // Scroll to first error
            const firstErrorField = Object.keys(validation.errors).find(
                key => validation.errors[key]
            );
            if (firstErrorField) {
                document.querySelector(`[name="${firstErrorField}"]`)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
            return;
        }

        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null && value !== "") {
                formDataToSend.append(key, value);
            }
        });

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: 'POST',
                body: formDataToSend,
                credentials: 'include',
            });

            if (response.ok) {
                if (typeof window !== 'undefined') {
                    window.location.href = "/";
                }
            } else {
                const data = await response.json();
                alert(data.error || "Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("An error occurred during registration:", error);
            alert("An unexpected error occurred. Please try again.");
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.logoSection}>
                <img
                    width={170}
                    height={170}
                    src="/images/logo.png"
                    alt="logo"
                />
                <h2 className={styles.logoTitle}>Register</h2>
            </div>

            <div className={styles.registerContainer}>
                <h1>Create Account</h1>
                <form onSubmit={handleRegister}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.inputField} ${errors.username ? styles.inputError : ''}`}
                        />
                        {errors.username && <p className={styles.errorText}>{errors.username}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            name="first_name"
                            placeholder="First Name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.inputField} ${errors.first_name ? styles.inputError : ''}`}
                        />
                        {errors.first_name && <p className={styles.errorText}>{errors.first_name}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            name="last_name"
                            placeholder="Last Name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.inputField} ${errors.last_name ? styles.inputError : ''}`}
                        />
                        {errors.last_name && <p className={styles.errorText}>{errors.last_name}</p>}
                    </div>

                    <div className={styles.genderSection}>
                        <label className={styles.genderLabel}>Gender:</label>
                        <div className={styles.genderOptions}>
                            <label htmlFor="male" className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    id="male"
                                    name="gender"
                                    value="male"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    checked={formData.gender === "male"}
                                    className={styles.radioInput}
                                />
                                Male
                            </label>
                            <label htmlFor="female" className={styles.radioLabel}>
                                <input
                                    type="radio"
                                    id="female"
                                    name="gender"
                                    value="female"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    checked={formData.gender === "female"}
                                    className={styles.radioInput}
                                />
                                Female
                            </label>
                        </div>
                        {errors.gender && <p className={styles.errorText}>{errors.gender}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="date"
                            name="age"
                            placeholder="Age"
                            value={formData.age}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.inputField} ${errors.age ? styles.inputError : ''}`}
                        />
                        {errors.age && <p className={styles.errorText}>{errors.age}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.inputField} ${errors.email ? styles.inputError : ''}`}
                        />
                        {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.inputField} ${errors.password ? styles.inputError : ''}`}
                        />
                        {errors.password && <p className={styles.errorText}>{errors.password}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.optionalLabel}>Profile Image (optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            name="image"
                            onChange={handleInputChange}
                            className={styles.fileInput}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.optionalLabel}>Nickname (optional)</label>
                        <input
                            type="text"
                            name="nickname"
                            placeholder="Nickname"
                            value={formData.nickname}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.inputField} ${errors.nickname ? styles.inputError : ''}`}
                        />
                        {errors.nickname && <p className={styles.errorText}>{errors.nickname}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.optionalLabel}>Bio (optional)</label>
                        <textarea
                            name="bio"
                            placeholder="Bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={`${styles.inputField} ${errors.bio ? styles.inputError : ''}`}
                            rows={3}
                        />
                        {errors.bio && <p className={styles.errorText}>{errors.bio}</p>}
                    </div>

                    <Link href="/login" className={styles.loginLink}>
                        Already have an account? Click here
                    </Link>

                    <button
                        className={styles.submitButton}
                        type="submit"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}