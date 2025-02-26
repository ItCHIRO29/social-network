
import { useState } from "react";
import Post from "../components/post";

export default function CreatePost() {
    const [posts, setPosts] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);

    const handleCreatePost = (e) => {
        e.preventDefault();
        const title = e.target.title.value.trim();
        const content = e.target.content.value.trim();
        const image = e.target.image.files[0];

        if (!title || !content) return;

        const date = new Date().toLocaleString();
        const newPost = { title, content, date, image };

        setPosts([newPost, ...posts]);

        // Reset form fields
        e.target.title.value = "";
        e.target.content.value = "";
        setImagePreview(null);
        const handleImageChange = (e) => {
            if (e.type === "change") {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setImagePreview(reader.result);
                    reader.readAsDataURL(file);
                } else {
                    setImagePreview(null);
                    e.target.value = null;
                }
            }
        }
        handleImageChange(e);
    };

    return (
        <>
            <div id="createPost">
                <form id="creation" onSubmit={handleCreatePost}>
                    <img src="/images/profile.png" alt="profile" />
                    <section id="post-content">
                        <input type="text" name="title" placeholder="Title" />
                        <textarea name="content" placeholder="Content" />
                        <input id="post-file" type="file" name="image" accept="image/*" />
                        {imagePreview && <img id="preview" src={imagePreview} alt="Post preview" />}
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
            {/* Render Posts */}
            <div className="posts">
                {posts.map((post, index) => (
                    <Post post={post} key={index} />
                ))}
            </div>

        </>

    );
}
