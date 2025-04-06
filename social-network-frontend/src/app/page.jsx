'use client';
import Image from "next/image";
import Posts from "@/components/posts/Posts";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className="main">
      <Posts />
    </div>
  );
}
