'use client'
import EditP from "../components/userProfile/EditProfile";
import Header from "../components/header";
import UserActivity from "../components/userActivity";
import "./edit.css"
import AboutUser from "../components/userProfile/aboutUser";
import Chat from "../components/chatComponents/chat";
export default function EditProfile() {
    return (
        <>
            <main id="main1">
                <Header />
                <UserActivity />
                <Chat className={"test1"} id={"chat"} />
                <EditP />
            </main>
        </>

    );
}