
export default function CreatePost() {
    // console.log("Create Post");
    const PostsContainer = document.createElement('div')
    const main = document.getElementsByTagName('main');
    console.log("main:", main);
    console.log("PostsContainer:", PostsContainer);
    const handleCreatePost = async (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        console.log(title);
        const content = e.target.content.value;
        console.log(content);
        const now = new Date();
        if (title === '' || content === '') {
            return;
        }
        const date = now.toLocaleString();
        PostsContainer.innerHTML += `
        <div class="post">
        <section class="post-header">
            <img id="user-icon" src="images/profile.png" alt="profile" />
            <h2>username</h2>
        </section>
            <h1>${title}</h1>
            <p>content : ${content}</p>
            <p> Created at : ${date}</p>
            <div id="comment">
                <input type="text" name="comment" placeholder="comment" />
                <img id="comment-icon" src="images/comment-icon.png" alt="logo" />
            </div>
        </div>`;
        PostsContainer.classList.add('posts');
        main[0].appendChild(PostsContainer);
        e.target.title.value = '';
        e.target.content.value = '';
    }

    return (
        <>
            <div id="createPost">
                <form id="creation" onSubmit={handleCreatePost}>
                    <img src="images/profile.png" alt="profile" />
                    <section id="post-content">
                        <input type="text" name="title" placeholder="Title" />
                        <textarea type="text" name="content" placeholder="Content" />
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
        </>

    );
}
