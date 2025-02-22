export default function LoginPage() {
    return (
        <div className="login-container">
            <h1>Register Page</h1>
            <form method="post">
                <div id="gender">
                    <span>Gender</span>
                    <input type="radio" name="gender" value="male" />
                    <label htmlFor="male">Male</label>
                    <input type="radio" name="gender" value="female" />
                </div>
                <input type="text" placeholder="username" />
                <input type="text" placeholder="first name" />
                <input type="text" placeholder="last name" />
                <input type="number" placeholder="age" />
                <input type="text" placeholder="Email" />
                <span>Privacy :</span>
                <select placeholder="Public/Private">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select >
                <input type="password" placeholder="Password" />
                <span>(optional)</span>
                <input type="file" datatype="image/*" placeholder="Avatar" />
                <span>(optional)</span>
                <input type="text" placeholder="Nickname" />
                <span>(optional)</span>
                <input type="text" placeholder="Bio" />
                <a href="/login">you have an account? click here</a>
                <button className="btn"><a href="/home" type="button">Register</a></button>
            </form>
        </div>
    );
}