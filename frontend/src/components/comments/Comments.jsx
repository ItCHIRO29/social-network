import { useState } from "react";
import styles from "./Comments.module.css";

export default function Comments({ postId }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState({ text: "", image: null });

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/comment?post_id=${postId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleComments = () => {
    const newShowComments = !showComments;
    setShowComments(newShowComments);
    if (newShowComments) {
      fetchComments();
    }
  };

  return (
    <div className={styles.commentsSection}>
      <div className={styles.commentInput}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!comment.text.trim() && !comment.image) {
              return;
            }
            const formData = new FormData();
            formData.append("text", comment.text.trim());
            console.log("comment.text");
            formData.append("image", comment.image);
            formData.append("postid", postId);
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/comment`,
                {
                  method: "POST",
                  credentials: "include",
                  body: formData,
                }
              );
              if (!res.ok) {
                throw new Error("Failed to post comment");
              }
              const data = await res.json();
              setComments((prevComments) => [data, ...prevComments]);
              setComment({ text: "", image: null });
            } catch (e) {
              console.error(e);
            }
          }}
          className={styles.commentForm}
        >
          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={comment.text}
              onChange={(e) => setComment({ ...comment, text: e.target.value })}
              className={styles.input}
            />
            <div className={styles.actions}>
              <label
                htmlFor={`comment-image-upload-${postId}`}
                className={styles.uploadButton}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input
                  id={`comment-image-upload-${postId}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setComment({ ...comment, image: e.target.files[0] })
                  }
                  className={styles.fileInput}
                />
              </label>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!comment.text.trim() && !comment.image}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
          {comment.image && (
            <div className={styles.imagePreview}>
              <span>{comment.image.name}</span>
              <button
                onClick={() => setComment({ ...comment, image: null })}
                className={styles.removeImage}
              >
                &times;
              </button>
            </div>
          )}
        </form>
      </div>

      <button className={styles.toggleButton} onClick={toggleComments}>
        {showComments ? "Hide Comments" : "Show Comments"}
      </button>

      {showComments && (
        <div className={styles.commentsList}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.ID} className={styles.commentItem}>
                <div className={styles.commentHeader}>
                  <strong className={styles.authorName}>
                    {comment.AuthorName}
                  </strong>
                  <span className={styles.timestamp}>
                    {new Date(comment.CreatedAt).toLocaleString()}
                  </span>
                </div>
                <p className={styles.commentContent}>{comment.content}</p>
                {comment.Image && (
                  <div className={styles.commentImageContainer}>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${comment.Image}`}
                      alt="Comment image"
                      width={400}
                      height={300}
                      className={styles.commentImage}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className={styles.noComments}>No comments yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
