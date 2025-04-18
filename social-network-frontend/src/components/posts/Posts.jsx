import { useState, useEffect, useCallback, useRef } from "react";
import { useUserData } from "../common/providers/userDataContext";
import CreatePost from "./CreatePost";
import Post from "./Post";
import styles from "./Posts.module.css";

export default function Posts({ userId = null, showCreatePost = true }) {
  const { userData } = useUserData();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    const params = new URLSearchParams();
    params.set("page", currentPage);

    if (userId) {
      params.set("id", userId);
    }
    try {
      setLoading(true);
      setError(null);

      const url = userId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/posts/getPosts?${params}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/posts/getPosts?${params}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch posts");
      }

      const data = await response.json();
      if (data) {
        setPosts((prev) => [...prev, ...data]);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message || "Failed to fetch posts. Please try again later.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [hasMore, currentPage, loading, userId]);

  const lastPostRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...(prev || [])]);
  };

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchPosts} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.postsContainer}>
      {showCreatePost && userData && (
        <CreatePost onPostCreated={handlePostCreated} />
      )}

      <div className={styles.postsList}>
        {!posts || posts.length === 0 ? (
          <div className={styles.noPosts}>
            {userId ? "No posts yet" : "No posts to show"}
          </div>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.ID}
              ref={posts.length - 1 == index ? lastPostRef : null}
            >
              <Post post={post} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
