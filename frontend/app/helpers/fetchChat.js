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
            console.log('Error fetching chat data');
            return [];
        }
        const data = await response.json();
        // console.log("chat data :: ", data);
        return data;
    } catch (error) {
        console.log(error);
    }
}