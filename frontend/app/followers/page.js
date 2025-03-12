'use client'
import Header from "../components/header";
import UserActivity from "../components/userActivity";
import FollowersPage from "../components/followers";
import "../profile/profile.css"
export default function Followers() {
    return (
        <>
            <Header />
            <UserActivity />
            <FollowersPage />
        </>
    );
}