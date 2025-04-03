import isValidEmail from "./validators/validEmail";
import isValidPassword from "./validators/validPassword";
export default function isValidLoginForm(email, password) {
    return isValidEmail(email) === "" && isValidPassword(password) === "";
}