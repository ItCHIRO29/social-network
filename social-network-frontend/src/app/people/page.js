"use client";

import { useState, useEffect } from "react";
import usePagination from "../hooks/usePagination";
import styles from "./people.module.css";
import FollowButton from "@/components/common/FollowButton";
import { useRouter } from "next/navigation";
export default function People() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  async function fetchUsers(page) {
    const params = new URLSearchParams({ page: page });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/GetAllUsers?${params}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }
  const { data, lastElementRef, reset } = usePagination(fetchUsers);
  useEffect(() => {
    setUsers(data)
  }, [data])

  const handleFollowStateChange = async (username) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/GetAllUsers`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      }
    } catch (error) {
      console.error("Error refreshing users:", error);
    }
  };

//   if (loading) {
//     return <div className={styles.loading}>Loading users...</div>;
//   }

  return (
    <div className={styles.container}>
      <h1>People</h1>
      <div className={styles.usersGrid}>
        {users.map((user, index) => (
          <div
            key={user.id}
            className={styles.userCard}
            ref={data.length - 1 === index ? lastElementRef : null}
          >
            <img
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
