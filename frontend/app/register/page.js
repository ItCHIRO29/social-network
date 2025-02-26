
import "./register.css"
import Header from "../components/header";
export default function LoginPage() {
    return (
        <>
            {/* <Header /> */}
            <div className="Container">
                <div className="xx">
                    <img width={170} height={170} src="images/SN-logo1.png" alt="logo" />
                    <h2 style={{color: 'white', fontFamily:'serif'}}>Register</h2>
                </div>
                <div className="register-container">
                    <form method="post">
                        <div id="gender">
                            <label htmlFor="Female">Female</label>
                            <input type="radio" name="gender" value="male" />
                            <label htmlFor="Male">Male</label>
                            <input type="radio" name="gender" value="female" />
                        </div>
                        <input type="text" placeholder="username" />
                        <input type="text" placeholder="first name" />
                        <input type="text" placeholder="last name" />
                        <input type="number" placeholder="age" />
                        <input type="text" placeholder="Email" />
                        <input type="password" placeholder="Password" />
                        <label >(optional)</label>
                        <input type="file" datatype="image/*" placeholder="Avatar" />
                        <label>(optional)</label>
                        <input type="text" placeholder="Nickname" />
                        <label>(optional)</label>
                        <input type="text" placeholder="Bio" />
                        <a href="/login">you have an account? click here</a>
                        <button className="btn"><a href="/home" type="button">Register</a></button>
                    </form>
                </div>
            </div>
        </>

    );
}