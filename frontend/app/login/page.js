import "./login.css";
export default function LoginPage() {
    return (
        <>
            <div className="Container">
                <div className="xx">
                    <img width={150} height={150} src="images/SN-logo1.png" alt="logo" />
                    <h2 style={{ color: "white", fontFamily: 'serif' }}>Login</h2>
                </div>
                <div className="login-container">
                    <h1>Login</h1>
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