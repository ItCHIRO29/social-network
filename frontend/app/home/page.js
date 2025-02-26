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
            <CreatePost />
            <UserActivity />
        </main>
    );
}

