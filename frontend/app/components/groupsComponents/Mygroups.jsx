"use client";
import React, { useState, useEffect } from "react";
import { fetchMyGroups } from "../../helpers/fetchGroups";
import GroupActivity from "../../groupActivity/page";
// import Header from "../header";
// import NavBar from "../userActivity";
// import CreateGroup from "./createGroup";
// import JoinGroup from "./joinGroup";
import "../../groupActivity/groupActivity.css"



export default function MyGroups() {
    const [myGroups, setMyGroups] = useState([]);
    // const [content, setContent] = useState(null);

    useEffect(() => {
        const loadMyGroups = async () => {
            const data = await fetchMyGroups();
            console.log(data);
            setMyGroups(data);
        };
        loadMyGroups();
    }, []);

    // If `content` is set, display it instead of the group list
    // if (content) {
    //     return content;
    // }

    return (
        <>
            {/* <main> */}
            {/* <Header />
                <NavBar />
                <CreateGroup /> */}
            <div id="groups" >
                <h1>Your Groups</h1>
                <div>
                    {myGroups.length > 0 ? (
                        myGroups.map((group) => (
                            <button
                                key={group.id_group}
                                type="button"
                                onClick={() => window.location.href = `/groupActivity?id=${group.name}`}
                            >
                                {group.name}
                            </button>
                        ))
                    ) : (
                        <p>Loading your groups...</p>
                    )}
                </div>
            </div>
            {/* <JoinGroup />
            </main > */}
        </>

    );
}
