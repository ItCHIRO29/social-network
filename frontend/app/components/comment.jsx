'use client'

export default function Comments({ postid }) {
    const handleClick = async (inputElement) => {
        const comment = inputElement.value.trim();

        if (!comment) {
            alert("Please enter a comment.");
            return;
        }

        const res = await fetch("http://localhost:8080/api/comment", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                postid: postid,
                Content: comment,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (res.ok) {
            console.log("Comment posted successfully!");
            inputElement.value = "";
        } else {
            console.error("Failed to post comment:", res.statusText);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            const inputElement = e.target;
            handleClick(inputElement);
        }
    };

    return (
        <div id="comment">
            <input
                type="text"
                name="comment"
                placeholder="Comment"
                onKeyDown={handleKeyPress}
            />
            <img
                id="comment-icon"
                src="/images/comment-icon.png"
                alt="logo"
                onClick={(e) => {
                    const inputElement = e.target.previousElementSibling;
                    handleClick(inputElement);
                }}
            />
        </div>
    );
}