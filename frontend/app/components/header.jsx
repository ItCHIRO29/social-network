"use client";

export default function Header() {
    const handleHomeRoute = (e) => {
        e.preventDefault();
        window.location.href = "/";
    }
    return (
        <>
            <header>
                <h1>Social Network</h1>
                <img className="logo" src="images/SN-logo1.png" alt="logo" onClick={handleHomeRoute} />
            </header>
        </>
    );
}