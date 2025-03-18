// import { useState } from "react";
'use client';
import Post from "./post";
import { useEffect, useState } from "react";
import SemiPrivateList from "./SemiPrivateList";
import { selectedFollowers } from "./SemiPrivateList";
export default function CreatePost({ userImage, userId, isPriv }) {
    const [posts, setPosts] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);

    const handleCreatePost = (e) => {
        e.preventDefault();
        const title = e.target.title.value.trim();
        const content = e.target.content.value.trim();
        const checkbox = e.target.checkbox;
        console.log("checkbox============>", checkbox);
        // const image = e.target.image.files[0];
        const privacy = e.target.privacy.value;
        if (!title || !content) return;
        const formData = new FormData(e.target);
        formData.append("followers_ids", JSON.stringify(selectedFollowers || []));
        console.log("formData", Object.fromEntries(formData));
        fetch("http://localhost:8080/api/posts/createPost", {
            method: "POST",
            credentials: "include",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("post created:", data);
                if (posts && privacy == "Public") {
                    setPosts([data, ...posts]);
                } else {
                    setPosts([data]);
                }
            })
        e.target.title.value = "";
        e.target.content.value = "";
        e.target.image.value = null;
        e.target.reset();
        document.getElementById("choose-followers").style.display = "none";
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
                //  <div id="createPost">
                userId == 0 ?
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
                            <select name="privacy" className="btn" onChange={(e) => {
                                if (e.target.value === "semi-private") {
                                    document.getElementById("choose-followers").style.display = "block";
                                } else {
                                    document.getElementById("choose-followers").style.display = "none";
                                }
                            }}>
                                <option value="Public">Public</option>
                                <option value="Private">Private</option>
                                <option value="semi-private">Semi-Private</option>
                            </select>
                            <SemiPrivateList />
                        </section>
                    </form> : null
                /* </div>  */
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
    let link = "";
    if (id) {
        console.log("id :: ", id);
        link = `http://localhost:8080/api/posts/getPosts?id=${id}`;
    } else {
        console.log("id :: ", id);

        link = `http://localhost:8080/api/posts/getPosts`;
    }
    const response = await fetch(link, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })
    const data = await response.json()
    return data
}

