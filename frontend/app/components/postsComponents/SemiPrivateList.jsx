// import React from "react";
import { useEffect, useState } from "react";
import { GetFollowers } from "../userProfile/followers";
export let selectedFollowers = [];
export default function SemiPrivateList() {
    const [followers, setFollowers] = useState([]);
    useEffect(() => {
        async function fetchFollowers() {
            const data = await GetFollowers();
            setFollowers(data);
        }
        fetchFollowers();
    }, []);

    return (
        <div id="choose-followers"  >
            {followers ? followers.map((follower) => (
                <div key={follower.id}>
                    <input
                        type="checkbox"
                        id={follower.id}
                        value={follower.id}
                        name={follower.username}
                        onChange={(e) => {
                            if (e.target.checked) {
                                selectedFollowers.push(follower.id);
                            }/*  else {
                                selectedFollowers = selectedFollowers.filter((f) => f.id !== follower.id);
                            } */
                        }}
                    />
                    <span>{follower.username}</span>
                </div>
            )) : <p>No followers</p>}
        </div>
    );
}