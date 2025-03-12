'use client'


// import  "../components/post.css"
import Comments from "../comments/comment";

export default function Post({ post, postId }) {
    //console.log("post :: ", post);
    let imagePath = "";
    let profileImage = "";
    if (post.Image != "") {
        imagePath = `http://localhost:8080/` + post.Image;
    }
    if (post.ProfileImage != "") {
        profileImage = `http://localhost:8080/` + post.ProfileImage;
    } else {
        profileImage = "./images/profile.png";
    }

    return (
        <div className="post" key={postId}>
            <section className="post-header">
                <img id="user-icon" src={profileImage} alt="profile" onClick={() => { window.location.href = `/profile` }} />
                <h2>{post.Post_creator}</h2>
                <h1>ID : {post.ID}</h1>
            </section>
            <h1>{post.Title}</h1>
            <p>Content: {post.Content}</p>
            <p>{post.CreatedAt}</p>
            {imagePath !== "" ? <img id="post-image" src={imagePath} alt="Post image" /> : null}
            <Comments postid={post.ID} />
        </div>
    )

}