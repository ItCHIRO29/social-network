// import { useState } from "react";
import Post from "../components/post";
import { useEffect, useState } from "react";
export default function CreatePost({ userImage }) {
    const [posts, setPosts] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);

    const handleCreatePost = (e) => {
        e.preventDefault();
        const title = e.target.title.value.trim();
        const content = e.target.content.value.trim();
        const image = e.target.image.files[0];
        const privacy = e.target.privacy.value;
        if (!title || !content) return;
        const formData = new FormData(e.target);
        fetch("http://localhost:8080/api/posts/createPost", {
            method: "POST",
            credentials: "include",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("data", data);
                setPosts([data, ...posts]);
            })
        e.target.title.value = "";
        e.target.content.value = "";
        e.target.image.value = null;
        setImagePreview(null);
    };
    useEffect(() => {
        async function fetchUser() {
            const data = await GetPosts();
            setPosts(data);
        }
        fetchUser();
    }, []);
    console.log("posts", posts);
    return (
        <>
            <div id="createPost">
                <form id="creation" onSubmit={handleCreatePost}>
                    <img src={userImage} alt="profile" />
                    <section id="post-content">
                        <input type="text" name="title" placeholder="Title" />
                        <textarea name="content" placeholder="Content" />
                        <input id="post-file" type="file" name="image" accept="image/*" />
                        {imagePreview && <img id="preview" src={imagePreview} alt="Post preview" name="image" />}
                    </section>
                    <section id="post-options">
                        <button className="btn" type="submit">Publish</button>
                        <select name="privacy" className="btn">
                            <option value="Public">Public</option>
                            <option value="Private">Private</option>
                        </select>
                    </section>
                </form>
            </div>
            <div className="posts">
                {posts.map((post, index) => (
                    <Post post={post} key={index} />
                ))}
            </div>

        </>

    );
}

async function GetPosts() {
    const response = await fetch("http://localhost:8080/api/posts/getPosts", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })
    const data = await response.json()
    return data
}

