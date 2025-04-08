import { useState } from 'react';
import Link from 'next/link';
import { dateFormat } from '../../utils/dateFormat';
import Comments from '../comments/Comments';
import styles from './Post.module.css';

export default function Post({ post }) {
    const [showComments, setShowComments] = useState(false);
    console.log("Post:", post);
    const imagePath = post.Image ? `${process.env.NEXT_PUBLIC_API_URL}/${post.Image}` : null;
    const profileImage = post.ProfileImage
        ? `${process.env.NEXT_PUBLIC_API_URL}/${post.ProfileImage}`
        : '/images/default-avatar.svg';

    return (
        <div className={styles.postContainer}>
            <section className={styles.postHeader}>
                <Link href={`/profile/${post.Username}`} className={styles.userInfo}>
                    <img
                        src={profileImage}
                        alt="profile"
                        width={40}
                        height={40}
                        className={styles.profileImage}
                    />
                    <div className={styles.userDetails}>
                        <h2 className={styles.username}>{post.Username}</h2>
                        <span className={styles.subtitle}>{post.Post_creator}</span>
                        <span className={styles.timestamp}>{dateFormat(post.CreatedAt)}</span>
                    </div>
                </Link>
                <p className={styles.subtitle}>status: {post.Type}</p>
            </section>

            <div className={styles.postContent}>
                <h3 className={styles.title}>{post.Title}</h3>
                <p className={styles.content}>{post.Content}</p>
                {imagePath && (
                    <div className={styles.imageContainer}>
                        <img
                            src={imagePath}
                            alt="Post content"
                            className={styles.postImage}
                        />
                    </div>
                )}
            </div>

            <div className={styles.postActions}>
                <button
                    className={styles.commentButton}
                    onClick={() => setShowComments(!showComments)}
                    aria-label="Toggle comments"
                >
                    <svg
                        className={styles.commentIcon}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                </button>
            </div>

            {showComments && <Comments postId={post.ID} />}
        </div>
    );
} 