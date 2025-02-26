
export default function Header() {
    const handleHomeRoute = (e) => {
        e.preventDefault();
        window.location.href = "/";
    }
    return (
        <>
            <header>
                <img className="logo" src="images/SN-logo1.png" alt="logo" onClick={handleHomeRoute} />
                <input type="search" id="search-input" placeholder="Search" />
                <h1>Social Network</h1>
            </header>
        </>
    );
}