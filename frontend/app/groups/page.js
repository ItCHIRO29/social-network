"use client";

import Header from "../components/header";
import CreateGroup from "../components/groupsComponents/createGroup";
import NavBar from "../components/userActivity";
import JoinGroup from "../components/groupsComponents/joinGroup";
import MyGroups from "../components/groupsComponents/Mygroups";
import "./groups.css"
export default function Page() {
    return (
        <>
            <main>
                <Header />
                <NavBar />
                <CreateGroup />
                
                    <MyGroups />
                <JoinGroup />
            </main >
        </>
    )
}