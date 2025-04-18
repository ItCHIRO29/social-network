"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Post from "@/components/posts/Post";
import styles from "./UserPosts.module.css";

export default function UserPosts({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const observer = useRef();
  const fetchPosts = useCallback(async () => {
    if (!hasMore || loading) return
    setLoading(true)
    const params = new URLSearchParams({page: currentPage})
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/user/${userId}?${params}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      if (data) {
          setPosts((prev) => [...prev, ...data]);

      } else {
        setHasMore(false)
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const lastPostRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("hello im the pagination");

          setCurrentPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (posts.length === 0) {
    return <div className={styles.noPosts}>No posts yet</div>;
  }

  return (
    <div className={styles.userPosts}>
      <h2>Posts</h2>
      <div className={styles.postsGrid}>
        {posts.map((post, index) => (
            <div key={post.id} ref={posts.length-1 == index ? lastPostRef : null}>
                <Post post={post} />
            </div>
        ))}
      </div>
    </div>
  );
}
