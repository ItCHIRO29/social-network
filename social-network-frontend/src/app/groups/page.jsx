'use client'
import GroupsHeader from "@/components/groups/groupsHeader";
// import styles from "./groups.module.css";
import { useState } from "react";


export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [activeButton, setActiveButton] = useState("all groups");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    
    return (
        <>
        <div className="main-content">
            <h1>Groups</h1>
            <GroupsHeader />
            </div>
        </>
    );
}