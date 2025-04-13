'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './posts.module.css';
import {useUserData} from '@/components/common/providers/userDataContext';
import Posts from '@/components/posts/Posts';
import GroupNavigation from '@/components/groups/GroupNavigation';
export default function GroupPostsPage() {
    const { name } = useParams();
    const userData = useUserData();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Group Posts</h1>
                <GroupNavigation groupId={name} />
            </div>
            <div className={styles.content}>
                <Posts />
            </div>
        </div>
    );
} 