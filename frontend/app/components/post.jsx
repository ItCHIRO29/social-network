'use client'
// import  "../components/post.css"
import Comments from "../components/comment";
export default function Post({ post, userImage }) {
    console.log("post :: ", post);
    let imagePath = "";
    if (post.Image != "") {
        imagePath = `http://localhost:8080/uploads/postsImages/iichi.jpg`;
    }
    return (
        <div className="post">
            <section className="post-header">
                <img id="user-icon" src={userImage} alt="profile" />
                <h2>{post.post_creator}</h2>
            </section>
            <h1>{post.Title}</h1>
            <p>Content: {post.Content}</p>
            <img id="post-image" src={imagePath} alt="Post" />
            <p>Created at: {post.CreatedAt}</p>
            <Comments postid={post.ID} />
        </div>
    )

}