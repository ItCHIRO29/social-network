'use client'


// import  "../components/post.css"
import Comments from "../components/comment";

export default function Post({ post }) {
    // console.log("post :: ", post);
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
        <div className="post">
            <section className="post-header">
                <img id="user-icon" src={profileImage} alt="profile" onClick={() => { window.location.href = `/profile` }} />
                <h2>{post.Post_creator}</h2>
            </section>
            <h1>{post.Title}</h1>
            <p>Content: {post.Content}</p>
            <img id="post-image" src={imagePath} alt="Post" />
            <p>Created at: {post.CreatedAt}</p>
            <Comments postid={post.ID} />
            <p>{post.CreatedAt}</p>
            {imagePath !== "" && <img id="post-image" src={imagePath} alt="Post image" />}
            <div id="comment">
                <input type="text" name="comment" placeholder="Comment" />
                <img id="comment-icon" src="/images/comment-icon.png" alt="logo" />
            </div>
        </div>
    )

}