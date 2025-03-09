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
            {groups.length > 0 ? (
                groups.map((group) => (
                    <form id="joinGroup" key={group.id_group}>
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
                <p>No groups!</p>
            )}
        </div>
    );
}
