export async function fetchMyGroups() {
    return await fetch("http://localhost:8080/api/groups/getGroups/MyGroups", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error("Fetch error:", error);
            return []; // Return empty array in case of error
        });
}
export async function fetchAllGroups() {
    return await fetch("http://localhost:8080/api/groups/getGroups/all", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error("Fetch error:", error);
            return []; // Return empty array in case of error
        });
}
export async function fetchGroupData(group_name) {
    return await fetch(`http://localhost:8080/api/groups/getGroupActivity?group=${group_name}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error("Fetch error:", error);
            return []; // Return empty array in case of error
        });
}