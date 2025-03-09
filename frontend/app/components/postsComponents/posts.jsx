// import { useState } from "react";
'use client';
import Post from "./post";
import { useEffect, useState } from "react";
export default function CreatePost({ userImage, userId }) {
    const [posts, setPosts] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);

    const handleCreatePost = (e) => {
        e.preventDefault();
        // const title = e.target.title.value.trim();
        // const content = e.target.content.value.trim();
        // const image = e.target.image.files[0];
        // const privacy = e.target.privacy.value;
        if (!title || !content) return;
        const formData = new FormData(e.target);
        fetch("http://localhost:8080/api/posts/createPost", {
            method: "POST",
            credentials: "include",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("post created:", data);
                if (posts) {
                    setPosts([data, ...posts]);
                } else {
                    setPosts([data]);
                }
            })
        e.target.title.value = "";
        e.target.content.value = "";
        e.target.image.value = null;
        setImagePreview(null);
    };
    useEffect(() => {
        async function fetchUser() {
            const data = await GetPosts(userId);
            setPosts(data);
        }
        fetchUser();
    }, []);
    //console.log("posts", posts);
    return (
        <>
            {
                userId == 0 ? <div id="createPost">
                    <form id="creation" onSubmit={handleCreatePost}>
                        <img src={userImage} alt="profile" />
                        <section id="post-content">
                            <input type="text" name="title" placeholder="Title" />
                            <textarea name="content" placeholder="Content" />
                            <input id="post-file" type="file" name="image" accept="image/*" />
                            {imagePreview
                                &&
                                <img id="preview" src={imagePreview} alt="Post preview" name="image" />}
                        </section>
                        <section id="post-options">
                            <button className="btn" type="submit">Publish</button>
                            <select name="privacy" className="btn">
                                <option value="Public">Public</option>
                                <option value="Private">Private</option>
                            </select>
                        </section>
                    </form>
                </div> : null
            }
            {
                userId != 0 ? <div className="posts" style={{ gridArea: "xx" }}>
                    {(!posts) ? <h1>No posts yet</h1> : posts.map((post) => (
                        <Post key={post.ID} post={post} postId={post.ID} />
                    ))}
                </div> : <div className="posts" >
                    {(!posts) ? <h1>No posts yet</h1> : posts.map((post) => (
                        <Post key={post.ID} post={post} postId={post.ID} />
                    ))}
                </div>
            }

        </>

    );
}

async function GetPosts(id) {
    const response = await fetch(`http://localhost:8080/api/posts/getPosts?id=${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })
    const data = await response.json()
    return data
}

