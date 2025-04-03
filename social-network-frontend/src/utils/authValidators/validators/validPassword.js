
export default function isValidPassword(password) {
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
