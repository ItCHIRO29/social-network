export function isValidAge(age) {
    if (age === "") return "Age is required";
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum)) return "Age must be a number";
    if (ageNum < 16) return "You must be at least 16 years old";
    if (ageNum > 160) return "Age must be 160 or less";
    return "";
}

export function isValidBio(bio) {
    if (bio.length > 255) return "Bio must be 255 characters or less";
    return "";
}

export function isValidEmail(email) {
    if (email === "") return "Email is required";
    if (email.length >= 255) return "Email is too long (max 254 characters)";
    
    const re = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$/;
    if (!re.test(email)) return "Invalid email format";
    return "";
}

export function isValidGender(gender) {
    if (!gender) return "Gender is required";
    const normalizedGender = gender.toLowerCase();
    const validGenders = ['male', 'female'];
    if (!validGenders.includes(normalizedGender)) return "Please select male or female";
    return "";
}

export function isValidName(name) {
    if (name === "") return "Name is required";
    if (name.length < 3) return "Name must be at least 3 characters";
    if (name.length > 30) return "Name must be 30 characters or less";
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return "Name can only contain letters and spaces";
    return "";
}

export function isValidNickname(nickname) {
    if (nickname === "") return "";
    if (nickname.length < 4) return "Nickname must be at least 4 characters";
    if (nickname.length > 30) return "Nickname must be 30 characters or less";
    if (!/^[a-zA-Z0-9-_]+$/.test(nickname)) return "Nickname can only contain letters, numbers, hyphens and underscores";
    return "";
}

export function isValidPassword(password) {
    if (password === "") return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (password.length > 254) return "Password must be 254 characters or less";

    let hasLower = false, hasUpper = false, hasDigit = false, hasSpecial = false;
    const specialChars = "!@#$%^&*()_+-=[]{}; ':\"\\|,.<>/?";

    for (let char of password) {
        if (char >= 'a' && char <= 'z') hasLower = true;
        else if (char >= 'A' && char <= 'Z') hasUpper = true;
        else if (char >= '0' && char <= '9') hasDigit = true;
        else if (specialChars.includes(char)) hasSpecial = true;
        else return "Password contains invalid characters";
    }

    if (!hasLower) return "Password must contain a lowercase letter";
    if (!hasUpper) return "Password must contain an uppercase letter";
    if (!hasDigit) return "Password must contain a digit";
    if (!hasSpecial) return "Password must contain a special character";
    return "";
}

export function isValidUsername(username) {
    if (username === "") return "Username is required";
    if (username.length < 4) return "Username must be at least 4 characters";
    if (username.length > 30) return "Username must be 30 characters or less";
    if (!/^[a-zA-Z0-9-_]+$/.test(username)) return "Username can only contain letters, numbers, hyphens and underscores";
    return "";
}

export function isValidLoginForm(email, password) {
    const emailError = isValidEmail(email);
    const passwordError = isValidPassword(password);
    return {
        isValid: emailError === "" && passwordError === "",
        emailError,
        passwordError
    };
}

export function isValidRegisterForm(formData) {
    const errors = {
        username: isValidUsername(formData.username),
        first_name: isValidName(formData.first_name),
        last_name: isValidName(formData.last_name),
        age: isValidAge(formData.age),
        gender: isValidGender(formData.gender),
        email: isValidEmail(formData.email),
        password: isValidPassword(formData.password),
        nickname: isValidNickname(formData.nickname),
        bio: isValidBio(formData.bio)
    };

    const isValid = Object.values(errors).every(error => error === "");
    
    return {
        isValid,
        errors,
        hasError: (field) => errors[field] !== "",
        getError: (field) => errors[field] || null
    };
}