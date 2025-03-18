"use client";
import Header from "../components/header";
import NavBar from "../components/userActivity";
import Post from "../components/postsComponents/post";
import { fetchGroup, fetchGroupData } from "../helpers/fetchGroups";
import React, { useState, useEffect, Suspense} from "react";
import "./groupActivity.css"
import { useSearchParams } from 'next/navigation';

function Group() {
    const [groupData, setGroupData] = useState(null);
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchGroupData(id);
            setGroupData(data);
        };
        fetchData();
    }, []);

    if (!groupData || !id) {
        return <div>Loading...</div>;
    }
    return (
        // <Suspense fallback={<div>Loading...</div>}>
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
            <Members groupData={groupData} />
            <Events groupData={groupData} />
        </main>
        </>
        // </Suspense>
    )
}

export default function GroupActivity() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Group />
        </Suspense>
    )
}

function Members({ groupData }) {
    const [members, setMembers] = useState([]);
    useEffect(() => {
        const fetchMembers = async () => {
            // const data = await fetchGroup(groupData.id);
            setMembers(groupData.Members);
        };
        fetchMembers();
    }, []);
    // setMembers(groupData.members);
    return (
        <div className="members" id="members">
            <h2>Members</h2>
            <div>
                {members ? members.map((member) => (
                    <button key={member.id}>member {member.user_id}: {member.username}</button>
                )) : <p>No members yet </p>}
            </div>
        </div>
    );
}

function Events({ groupData }) {
    const [events, setEvents] = useState([]);
    useEffect(() => {
        const fetchEvents = async () => {
            // const data = await fetchGroup(groupData.id);
            setEvents(groupData.Events);
        };
        fetchEvents();
    }, []);
    // setEvents(groupData.events);
    return (
        <div className="test1" id="events">
            <h2>Events</h2>
            <div>
                {(events || events.length != 0) ? events.map((event) => (
                    <div key={event.id}>
                        <button >event : {event.title}</button>
                        <div>{event.description}</div>
                        <div>{event.date}</div>
                        <div id="attendence">
                            <button className="going">Going</button>
                            <button className="NotGoing">Not going</button>
                        </div>
                    </div>
                )) : <p>No events yet </p>}
            </div>
        </div>
    );
}
function CreateGroupPost({ id }) {
    const [posts, setPosts] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);

    const handleCreatePost = (e) => {
        e.preventDefault();
        const title = e.target.title.value.trim();
        const content = e.target.content.value.trim();
        // const image = e.target.image.files[0];
        // const privacy = e.target.privacy.value;
        if (!title || !content) return;
        const formData = new FormData(e.target);
        fetch("http://localhost:8080/api/posts/CreateGroupPost?groupId=" + id, {
            method: "POST",
            credentials: "include",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("post created:", data);
                if (posts) {
                    setPosts([data, ...posts]);
                } else {
                    setPosts([data]);
                }
            })
        e.target.title.value = "";
        e.target.content.value = "";
        e.target.image.value = null;
        setImagePreview(null);
    };
    useEffect(() => {
        async function fetchUser() {
            const data = await GetPosts(id);
            setPosts(data);
        }
        fetchUser();
    }, []);
    console.log("posts", posts);
    return (
        <>

            <form id="creation" onSubmit={handleCreatePost}>
                <section id="post-content">
                    <input type="text" name="title" placeholder="Title" />
                    <textarea name="content" placeholder="Content" />
                    <input id="post-file" type="file" name="image" accept="image/*" />
                    {imagePreview
                        &&
                        <img id="preview" src={imagePreview} alt="Post preview" name="image" />}
                </section>
                <section id="post-options">
                    <button className="btn" type="submit">Publish</button>
                </section>
            </form>

            {
                <div className="posts">
                    {(!posts) ? <h1>No posts yet</h1> : posts.map((post) => (
                        <Post key={post.ID} post={post} postId={post.ID} />
                    ))}
                </div>

            }

        </>

    );
}

async function GetPosts(id) {
    const response = await fetch(`http://localhost:8080/api/posts/getPostsByGroup?groupId=${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    })
    const data = await response.json()
    return data
}

