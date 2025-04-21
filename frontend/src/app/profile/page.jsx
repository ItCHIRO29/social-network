'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/components/common/providers/userDataContext';

export default function DefaultProfilePage() {
    const router = useRouter();
    const { userData, loading } = useUserData();

    useEffect(() => {
        if (!loading && userData) {
            router.replace(`/profile/${userData.username}`);
        }
    }, [userData, loading, router]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div>Loading...</div>
        </div>
    );
} 