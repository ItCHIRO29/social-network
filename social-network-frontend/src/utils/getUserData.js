export default async function getUserData(username = null) {
    try {
        // If no username is provided or username is 'me', fetch logged-in user's profile
        const url = username
            ? `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile?username=${username}`
            : `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`;

        const response = await fetch(url, {
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
