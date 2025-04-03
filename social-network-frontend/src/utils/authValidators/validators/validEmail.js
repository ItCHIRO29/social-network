export default function isValidEmail(email) {
    if (email.length >= 255) return "Email is too long.";

    const re = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}$/;
    if (!re.test(email)) return "Invalid email format.";

    return "";
}

