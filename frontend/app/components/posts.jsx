
import Header from "./header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';


export default function CreatePost() {
    // console.log("Create Post");
    const PostsContainer = document.createElement('div')
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
            <h2>User</h2>
            <h1>${title}</h1>
            <p>content : ${content}</p>
            <p> Created at : ${date}</p>
            <div id="comment">
                <input type="text" name="comment" placeholder="comment" />
                <img id="comment-icon" src="images/comment-icon.png" alt="logo" />
            </div>
        </div>`;
        PostsContainer.classList.add('posts');
        document.body.appendChild(PostsContainer);
        e.target.title.value = '';
        e.target.content.value = '';
    }

    return (

        <>
            {/* <Header /> */}
            <div id="createPost">
                {/* <h1>Create Post</h1> */}
                <form id="creation" onSubmit={handleCreatePost}>
                    <img src="images/profile.png" alt="logo" />
                    <input type="text" name="title" placeholder="Title" />
                    <input type="text" name="content" placeholder="Content" />
                    <button className="btn" type="submit">Publish</button>
                </form>
            </div>
        </>

    );
}
