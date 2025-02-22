
export default function LoginPage() {
    return (
        <div className="login-container">
            <h1>Login Page</h1>
            <form method="post">
                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <a href="/register">you don't have an account? click here</a>
                <button className="btn"><a href="/home">Login</a></button>
            </form>
        </div>
    );
}