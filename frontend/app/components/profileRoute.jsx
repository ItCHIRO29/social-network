export default function ProfileRoute() {
    const handleClick = (e) => {
        e.preventDefault();
        window.history.pushState({},"profile","/profile")
    }


    return (
        <>
            <img className="button-img" src="/images/profile.png" alt="Profile" onClick={handleClick} />
        </>
    );
}