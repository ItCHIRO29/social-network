export default function CommentSection({ post }) {
    return (
        <>
            <div id="comment">
                
                <img
                    id="comment-icon"
                    src="/images/comment-icon.png"
                    alt="logo"
                    onClick={handleClick}
                />
            </div>
        </>
    )
}