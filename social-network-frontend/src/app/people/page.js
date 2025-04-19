"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./people.module.css";
import FollowButton from "@/components/common/FollowButton";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function People() {
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const router = useRouter();
  let counter = 0;
  const fetchUsers = useCallback(async () => {
    // console.log(currentPage);
    if (!hasMore || loading) return;
    setLoading(true);
    const params = new URLSearchParams({ page: currentPage });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/GetAllUsers?${params}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          // setUsers((prev) => [...prev, ...data]);
          setUsers((prev) => {
            const existingIds = new Set(prev.map((u) => u.id)); // assuming unique `id`
            const filteredData = data.filter((user) => !existingIds.has(user.id));
            return [...prev, ...filteredData];
          });
          counter++
        } else {
          setHasMore(false);
        }
      }
      console.log("I'm here in line 38 in Peple.js:  " + counter);

    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, currentPage, counter]);

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

  useEffect(() => {
    fetchUsers();
  }, [currentPage, fetchUsers]);

  const handleFollowStateChange = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/GetAllUsers`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data)
      }
    } catch (error) {
      console.error("Error refreshing users:", error);
    }
  };



  return (
    <div className={styles.container}>
      <h1>People</h1>
      <div className={styles.usersGrid}>
        {users.map((user, index) => (
          <div
            key={user.id}
            className={styles.userCard}
            ref={users.length - 1 == index ? lastUserRef : null}
          >
            <Image
              width={100}
              height={100}
              src={
                user.image
                  ? `${process.env.NEXT_PUBLIC_API_URL}/${user.image}`
                  : "/images/profile.png"
              }
              alt={`${user.first_name} ${user.last_name}`}
              className={styles.userImage}
              onClick={() => router.push(`/profile/${user.username}`)}
            />
            <h3
              className={styles.fullName}
              onClick={() => router.push(`/profile/${user.username}`)}
            >
              {user.first_name} {user.last_name}
            </h3>
            <FollowButton
              userData={user}
              onStateChange={() => handleFollowStateChange(user.username)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
