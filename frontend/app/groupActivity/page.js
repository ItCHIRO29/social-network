"use client";
import React, { useState, useEffect, Suspense } from "react";
import Header from "../components/header";
import NavBar from "../components/userActivity";
import { fetchGroupData } from "../helpers/fetchGroups";
import Events from "../components/groupsComponents/groupActivity/events";
import Members from "../components/groupsComponents/groupActivity/members";
import CreateGroupPost from "../components/groupsComponents/groupActivity/createGroupPost";
import { useSearchParams } from 'next/navigation';
import "./groupActivity.css"

function Group() {
    const [groupData, setGroupData] = useState(null);
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchGroupData(id);
            // console.log("data  ====>", data);
            setGroupData(data);
        };
        fetchData();
    }, []);
    console.log("groupData ==>", groupData);
    if (!groupData || !id) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <main>
                <Header />
                <NavBar />
                <div className="groupInfo">
                    <div className="left-infos">
                        <img className="profile-image" src="/images/profile.png" alt="Profile" />
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "20px" }}>
                            <h1>{groupData.name}</h1>
                            <p>{groupData.description}</p>
                        </div>
                    </div>
                </div>
                <CreateGroupPost id={groupData.id_group} />
                <Events groupData={groupData} />
                <Members groupData={groupData} />
            </main>
        </>
    )
}

export default function GroupActivity() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Group />
        </Suspense>
    )
}



function AddMembers() {
    return (
        <div>
            <h2>Add Members</h2>
            <form>
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" />
                <button type="submit">Add Member</button>
            </form>
        </div>
    );
}







