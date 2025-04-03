export default async function getUserData(id) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile?id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch Error:", error);
        return null;
    }
}
