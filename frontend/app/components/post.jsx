// import  "../components/post.css"
export default function Post({ post }) {
    return (
        <div className="post">
            <section className="post-header">
                <img id="user-icon" src="images/profile.png" alt="profile" />
                <h2>username</h2>
            </section>
            <h1>{post.title}</h1>
            <p>Content: {post.content}</p>
            {post.image && <img id="post-image" src={URL.createObjectURL(post.image)} alt="Post" />}
            <p>Created at: {post.date}</p>
            <div id="comment">
                <input type="text" name="comment" placeholder="Comment" />
                <img id="comment-icon" src="/images/comment-icon.png" alt="logo" />
            </div>
        </div>
    )

}