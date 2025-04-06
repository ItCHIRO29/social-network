export default async function FetchData(category, id) {
    try {
        if (category === "profile") {
            // If id is 0 or not provided, fetch current user's profile
            const endpoint = id === 0 || !id 
                ? `http://localhost:8080/api/users/profile/me`
                : `http://localhost:8080/api/users/profile/${id}`;

            const response = await fetch(endpoint, {
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
            //console.log("data :: ", data);
            return data; // Return the resolved object
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        return null; // Handle errors gracefully
    }
}
