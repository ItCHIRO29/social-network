"use client";
import { React } from "react";
import CreatePost from "../components/posts";
import UserActivity from "../components/userActivity";
import Header from "../components/header";

export default function HomeP() {
    return (
        <>
            <Header />
            <CreatePost />
            <UserActivity />
        </>
    );
}

