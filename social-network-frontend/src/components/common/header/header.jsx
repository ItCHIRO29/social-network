"use client";


import React from "react";
import Logo from "./logo";
import styles from "./header.module.css";
import { Notifications } from "./notifications";
import Nav from "./nav";


export default function Header() {
    return (
        <header className={styles.header}>
            <Logo />
            <Nav/>
        </header>
    );
}