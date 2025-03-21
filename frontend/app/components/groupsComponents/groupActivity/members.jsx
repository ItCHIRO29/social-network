import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

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
            <AddMembers />
        </>
    );
}

function AddMembers() {
    return (
        <div id='add-members-list'>
            <button id="close" onClick={() => hide("add-members-list")}>X</button>
            <form>
                <button>followers </button>
                <button>followers </button>
                <button>followers </button>
                <button>followers </button>
                <button>followers </button>
                <button id="add-members" >
                    <FontAwesomeIcon icon={faPlus} style={{ color: "#ffffff", fontSize: "20px" }} />
                    Add Members
                </button>
            </form>
        </div>
    );
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