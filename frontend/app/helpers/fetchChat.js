export async function getChat() {
    try {
        const response = await fetch('http://localhost:8080/api/chat/GetChaters', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if (!response.ok) {
            console.log("response :: ", response, response.status);
            console.log('Error fetching chat data');
            return [];
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}