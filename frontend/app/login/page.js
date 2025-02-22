
export default function LoginPage() {
    return (
        <>
            <div className="Container">
                <div className="xx">
                    <h1>Social Network</h1>
                    <img width={200} height={200} src="images/SN-logo1.png" alt="logo" />
                </div>
                <div className="login-container">
                    <h1>Login Page</h1>
                    <form method="post">
                        <input type="text" placeholder="Username" />
                        <input type="password" placeholder="Password" />
                        <a href="/register">you don't have an account? click here</a>
                        <button className="btn"><a href="/home">Login</a></button>
                    </form>
                </div>
            </div>
        </>
    );
}