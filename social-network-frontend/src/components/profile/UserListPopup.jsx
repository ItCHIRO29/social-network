"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./UserListPopup.module.css";
import { useEffect, useState, useCallback, useRef } from "react";

export default function UserListPopup({
  isOpen,
  onClose,
  title,
  username,
  followButtonState,
}) {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const observer = useRef();

  const fetchUsers = useCallback(async () => {
    if (!username || !isOpen || isLoading || !hasMore) return;
    setIsloading(true);
    const params = new URLSearchParams({
      username: username,
      page: currentPage,
    });
    try {
      const endpoint = title.toLowerCase();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${endpoint}?${params}`,
        { method: "GET", credentials: "include" }
      );
      console.log("response ===>", response);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      if (data) {
        setUsers((prev) => [...data, ...prev]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching users:", error.message);
      setUsers([]);
    } finally {
      setIsloading(false);
    }
  }, [username, title, isOpen, currentPage, hasMore]);

  useEffect(() => {
    console.log("followButtonState ===>", followButtonState);
    fetchUsers();
  }, [fetchUsers]);

  const lastUserRef = useCallback(
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

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        <div className={styles.content}>
          {users.length === 0 ? (
            <div className={styles.emptyState}>
              {followButtonState === "follow" || "pending"
                ? `Follow ${username} to see their ${title.toLowerCase()}`
                : `No ${title.toLowerCase()} found`}
            </div>
          ) : (
            <ul className={styles.userList}>
              {users.map((user, index) => (
                <div ref={users.length - 1 == index ? lastUserRef : null}>
                  <li key={user.id} className={styles.userItem}>
                    <Link href={`/profile/${user.username}`} onClick={onClose}>
                      <Image
                        src={
                          user.image
                            ? `${process.env.NEXT_PUBLIC_API_URL}/${user.image}`
                            : "/images/profile.png"
                        }
                        alt={user.username}
                        width={40}
                        height={40}
                      />
                      <div className={styles.userInfo}>
                        <span className={styles.name}>{user.username}</span>
                      </div>
                    </Link>
                  </li>
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
