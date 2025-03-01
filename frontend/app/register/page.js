
'use client'
import "./register.css"

async function HandleRegister(e) {
    e.preventDefault();
    const formData = new FormData()
    formData.append('username', e.target.username.value);
    formData.append('first_name', e.target.first_name.value);
    formData.append('last_name', e.target.last_name.value);
    formData.append('age', e.target.age.value);
    formData.append('email', e.target.email.value);
    formData.append('password', e.target.password.value);
    formData.append('gender', e.target.gender.value);
    formData.append('image', e.target.image.files[0]);
    formData.append('bio', e.target.bio.value);
    formData.append('nickname', e.target.nickname.value);

    fetch('http://localhost:8080/api/auth/register',
        {
            method: 'POST',
            body: formData,
        }
    ).then(response => response.json())
        .then(data => {
            console.log("registered successfully");
            console.log(data);
        })
        .catch(error => {
            console.error(error);
        })
}


export default function RegisterPage() {
    return (
        <>
            <div className="Container">
                <div className="xx">
                    <img width={170} height={170} src="images/SN-logo1.png" alt="logo" />
                    <h2 style={{ color: 'white', fontFamily: 'serif' }}>Register</h2>
                </div>
                <div className="register-container">
                    <form method="post" onSubmit={HandleRegister}>
                        <div id="gender">
                            <label htmlFor="Female">Male</label>
                            <input type="radio" name="gender" value="male" />
                            <label htmlFor="Male">Female</label>
                            <input type="radio" name="gender" value="female" />
                        </div>
                        <input type="text" name="username" placeholder="username" />
                        <input type="text" name="first_name" placeholder="first name" />
                        <input type="text" name="last_name" placeholder="last name" />
                        <input type="number" name="age" placeholder="age" />
                        <input type="text" name="email" placeholder="Email" />
                        <input type="password" name="password" placeholder="Password" />
                        <label >(optional)</label>
                        <input type="file" accept="image/*" name="image" placeholder="Avatar" />
                        <label>(optional)</label>
                        <input type="text" name="nickname" placeholder="Nickname" />
                        <label>(optional)</label>
                        <input type="text" name="bio" placeholder="Bio" />
                        <a href="/login">you have an account? click here</a>
                        <button className="btn" type="submit">Register</button>
                    </form>
                </div>
            </div>
        </>

    );
}

