import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
// import SocialNetworkUsers from "../../social-network-users";

export default function Members({ groupData }) {
    const [members, setMembers] = useState([]);
    useEffect(() => {
        const fetchMembers = async () => {
            if (groupData?.Members && members.length === 0) {
                setMembers(groupData.Members);
            }
        };
        fetchMembers();
    }, [groupData]);
    // setMembers(groupData.members);
    return (
        <>
            <div className="members" id="members">
                <h2>Members</h2>
                <div> {
                }
                    {members ? members.map((member) => (
                        <button key={member.id_member}>id {member.user_id}: {member.username}</button>
                    ))
                        : <p>No members yet </p>}
                    <button id="add-members" onClick={(e) => { Show(e, "add-members-list") }}>
                        <FontAwesomeIcon icon={faPlus} style={{ color: "#ffffff", fontSize: "20px" }} />
                        Add Members
                    </button>
                </div>
            </div>
            <AddMembers groupId={groupData.id_group} />
        </>
    );
}

function AddMembers({ groupId }) {
    console.log("groupId ===>", groupId);
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    useEffect(() => {
        const fetchUsers = async () => {
            const data = await GetInviteMembers();
            setUsers(data || []);
        };
        fetchUsers();
    }, []);
    // console.log("Group users to invit ===>", users);
    console.log("selectedUsers ===>", selectedUsers);
    return (
        <div id='add-members-list'>
            <button id="close" onClick={() => hide("add-members-list")}>X</button>
            <form onSubmit={(e) => { InviteMembers(e, selectedUsers, groupId) }}>
                {users ?
                    users.map((user) => (
                        <div key={user.id} id='follower' onChange={
                            (e) => {
                                if (e.target.checked) {
                                    setSelectedUsers(prevSelectedUsers => [...prevSelectedUsers, user.id]);
                                }
                            }
                        }>
                            <div id='invit-info'>
                                <img src={`http://localhost:8080/` + user.image} alt="" />
                                {user.full_name}
                            </div>
                            <input type="checkbox" value={user.id} />
                        </div>
                    )) : <h2>No users yet </h2>}
                <button id="add-members" >
                    <FontAwesomeIcon icon={faPlus} style={{ color: "#ffffff", fontSize: "20px" }} />
                    Add Members
                </button>
            </form>
        </div>
    );
}

async function GetInviteMembers() {
    try {
        const response = await fetch("http://localhost:8080/api/users/GetAllUsers", {
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            router.push("/login");
            throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        //console.log("Fetched Users:", data.users);
        return data.all_users || []; // Ensure it's always an array
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

async function InviteMembers(e, selectedUsers, groupId) {
    e.preventDefault();
    // let selectedMembers = [];
    const formData = new FormData(e.target);
    formData.append("invited_ids", JSON.stringify(selectedUsers || []));
    formData.append("group_id", groupId);
    console.log("formData", Object.fromEntries(formData));

    // const response = await fetch("http://localhost:8080/api/groups/invitation", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     credentials: "include",
    //     body: JSON.stringify(Object.fromEntries(formData)),
    // })
    // if (!response.ok) {
    //     alert("Failed to fetch users");
    //     //router.push("/login");
    //     //throw new Error("Failed to fetch users");
    // }
    e.target.reset();
    console.log("selectedMembers ===>", selectedUsers);
}
function Show(e, id) {
    const target1 = document.getElementById(id);
    console.log("target1 ===> ", target1);
    if (target1.style.display != "flex") {
        target1.style.display = "flex";
    } else {
        target1.style.display = "none";
    }
}
function hide(id) {
    const target1 = document.getElementById(id);
    target1.style.display = "none";
}