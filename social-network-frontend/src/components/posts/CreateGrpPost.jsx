import { useState, useEffect } from "react";
import { useUserData } from "../common/providers/userDataContext";
import { validateTitle, validateContent, validateImage, validatePost } from "@/utils/postValidators";
// import SemiPrivateList from "./SemiPrivateList";
import styles from "./CreateGrpPost.module.css";

export default function CreateGrpPost({ groupId, onPostCreated }) {
    const { userData } = useUserData();
    const [post, setPost] = useState({
        title: "",
        content: "",
        image: null,
        // privacy: "Public"
    });
    // const [selectedFollowers, setSelectedFollowers] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({
        title: "",
        content: "",
        image: "",
        // privacy: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debug log to check userData
    useEffect(() => {
        console.log('Current userData:', userData);
    }, [userData]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'image') {
            const file = files?.[0];
            if (!file) {
                setPost(prev => ({
                    ...prev,
                    [name]: null
                }));
                setImagePreview(null);
                return;
            }

            setPost(prev => ({
                ...prev,
                [name]: file
            }));
            setErrors(prev => ({
                ...prev,
                [name]: validateImage(file)
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPost(prev => ({
                ...prev,
                [name]: value
            }));
            setErrors(prev => ({
                ...prev,
                [name]: name === 'title' ? validateTitle(value) : validateContent(value)
            }));
        }
    };

    // const handlePrivacyChange = (e) => {
    //     const privacy = e.target.value;
    //     setPost(prev => ({ ...prev, privacy }));
    //     if (privacy !== "semi-private") {
    //         setSelectedFollowers([]);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userData || !userData.id) {
            console.error('No user data available');
            alert('Please log in to create a post');
            return;
        }

        // Validate all fields
        const validation = validatePost(post);
        if (!validation.isValid) {
            console.log('Validation failed:', validation.errors);
            setErrors(validation.errors);
            return;
        }

        // Validate semi-private selection
        // if (post.privacy === "semi-private" && selectedFollowers.length === 0) {
        //     alert("Please select at least one follower for semi-private posts");
        //     return;
        // }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('title', post.title.trim());
        formData.append('content', post.content.trim());
        // formData.append('privacy', post.privacy.toLowerCase());
        // formData.append('followers_ids', JSON.stringify(selectedFollowers));

        if (post.image) {
            formData.append('image', post.image);
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/CreateGroupPost?groupId=${groupId}`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Post created successfully:', data);

            onPostCreated(data);
            // Reset form
            setPost({ title: "", content: "", image: null });
            // setSelectedFollowers([]);
            setImagePreview(null);
            setErrors({ title: "", content: "", image: "" });
            e.target.reset();
        } catch (error) {
            console.error('Error creating post:', error);
            alert(error.message || "An unexpected error occurred while creating the post");
        } finally {
            setIsSubmitting(false);
        }
    };
    console.log("userData in group create post ===>", userData)
    return (
        <div className={styles.createPostContainer}>
            <form onSubmit={handleSubmit} className={styles.postForm}>
                <div className={styles.userInfo}>
                    {/* <Image 
                        src={userData.image ? `${process.env.NEXT_PUBLIC_API_URL}/${userData?.image}` : "/images/default-avatar.svg"}
                        alt="profile"
                        className={styles.profileImage}
                    /> */}
                </div>

                <section className={styles.postContent}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
                        value={post.title}
                        onChange={handleChange}
                        className={`${styles.titleInput} ${errors?.title ? styles.inputError : ''}`}
                    />
                    {errors?.title && <p className={styles.errorText}>{errors.title}</p>}

                    <textarea
                        name="content"
                        placeholder="Content"
                        value={post.content}
                        onChange={handleChange}
                        className={`${styles.contentInput} ${errors?.content ? styles.inputError : ''}`}
                    />
                    {errors?.content && <p className={styles.errorText}>{errors.content}</p>}

                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className={`${styles.fileInput} ${errors?.image ? styles.inputError : ''}`}
                    />
                    {errors?.image && <p className={styles.errorText}>{errors.image}</p>}

                    {imagePreview && (
                        <img 
                            src={imagePreview}
                            alt="Post preview"
                            className={styles.previewImage}
                        />
                    )}
                </section>

                <section className={styles.postOptions}>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                        onClick={() => console.log('Submit button clicked')}
                    >
                        {isSubmitting ? 'Publishing...' : 'Publish'}
                    </button>
                </section>
            </form>
            
        </div>
    );
} 