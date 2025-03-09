import React, { useState, useEffect } from 'react';
import { fetchMyGroups } from "../../helpers/fetchGroups";

export default function MyGroups() {
    const [myGroups, setMyGroups] = useState([]);

    useEffect(() => {
        const loadMyGroups = async () => {
            const data = await fetchMyGroups();
            setMyGroups(data);
        };
        loadMyGroups();
    }, []); // Runs only once

    return (
        <>
            {myGroups.length > 0 ? (
                myGroups.map((group) => (
                    // <div key={group.id_group}>
                    <button key={group.id_group} type="submit">
                        {group.name}
                    </button>
                    // </div>
                ))
            ) : (
                <p>Loading your groups...</p>
            )}
        </>
    );
}