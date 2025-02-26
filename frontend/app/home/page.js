"use client";
import { React } from "react";
import CreatePost from "../components/posts";
import UserActivity from "../components/userActivity";
import Header from "../components/header";
import "./home.css"

export default function HomeP() {
    return (
        <main>
            <Header />
            <div className="test1" id="chat">
                <h2>Chats</h2>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
                <button >John Doe</button>
                <button >Jane Doe</button>
                <button >John Smith</button>
                <button >Jane Smith</button>
            </div>
            <CreatePost />
            <div className="test2">
                <h2>about</h2>
                <div className="center-user-infos">
                    <p>First Name: iichi</p>
                    <p>Last Name: iichi</p>
                    <p>Age: 20</p>
                    <p>Email: ii@gmail.com</p>
                    <p>Bio: iichi</p>
                </div>
            </div>
            <UserActivity />
        </main>
    );
}

