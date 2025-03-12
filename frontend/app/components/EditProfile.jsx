export default function EditP() {
    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const changes = Object.fromEntries(formData);
        console.log(changes);
        fetch("http://localhost:8080/api/users/EditProfile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(changes),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
            })
            .catch((error) => {
                console.error("Fetch Error:", error);
            });
        window.location.href = "/profile";
    }

    return (
        <form id="Edit-container" onSubmit={handleSubmit}>
            <input type="text" id="username" name="username" placeholder="Username" />
            <input type="email" id="email" name="email" placeholder="Email" />
            <select name="public" id="public">
                <option value="public">Public</option>
                <option value="private">Private</option>
            </select>
            <button type="submit">Commit changes</button>
        </form>
    );
}