'use client'

export default function Comments({ postid }) {
    const handleClick = async (e) => {
        const commentInput = e.target.previousElementSibling;
        const comment = commentInput.value.trim();

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
            commentInput.value = "";
        } else {
            console.error("Failed to post comment:", res.statusText);
        }
    };

    return (
        <div id="comment">
            <input type="text" name="comment" placeholder="Comment" />
            <img
                id="comment-icon"
                src="/images/comment-icon.png"
                alt="logo"
                onClick={handleClick}
            />
        </div>
    );
}