"use client";
import React, { useEffect, useState } from "react";
import { fetchAllGroups } from "../../helpers/fetchGroups";

export default function JoinGroup() {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const loadGroups = async () => {
            const data = await fetchAllGroups();
            setGroups(data);
        };
        loadGroups();
    }, []);

    return (
        <div id="joinGroup-container">
            {groups ? (
                groups.map((group) => (
                    <form id="joinGroup" key={group.id_group} onSubmit={(e) => sendInvit(e, group.id_group)} >
                        <h1>{group.name}</h1>
                        <div>
                            <h3>Group Description:</h3>
                            <p>{group.description}</p>
                        </div>
                        <button className="joinButton" type="submit">
                            Join
                        </button>
                    </form>
                ))
            ) : (
                <h1>No groups to Join yet !</h1>
            )}
        </div>
    );
}

async function sendInvit(e, id_group) {
    e.preventDefault();
    const response = await fetch("http://localhost:8080/api/groups/invitation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
            id_group: id_group,
        }),
    });
    console.log(response);
}
