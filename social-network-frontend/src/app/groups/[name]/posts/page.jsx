'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from './posts.module.css';
import { useUserData } from '@/components/common/providers/userDataContext';
// import Posts from '@/components/posts/Posts';
import Posts from '@/components/posts/groupPosts'
import GroupNavigation from '@/components/groups/GroupNavigation';

export default function GroupPostsPage() {
    const { name } = useParams();
    console.log('groupId in navGroup BAr', name);
    const userData = useUserData();
    // const [unauthorized, setUnauthorized] = useState(false);
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Group Posts</h1>
                <GroupNavigation groupId={name} />
            </div>
            <Posts groupId={name} />
        </div>
    );
} 