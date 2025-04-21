'use client';

import Link from "next/link";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./nav.module.css";
import NotificationsList from "@/components/notifications/NotificationsList";
import { useUserData } from '@/components/common/providers/userDataContext';
import { WebSocketContext } from '../providers/websocketContext';


export default function Nav() {
    const [hovered, setHovered] = useState("");
    const iconSize = 25;
    const router = useRouter();
    const { userData } = useUserData();
    const ws = useContext(WebSocketContext);

    const handleLogout = async function () {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
            {
                method: "POST",
                credentials: "include",
            }
        )
        if (response.ok) {
            ws.close();
            router.push("/login");
        } else {
            console.log("Error logging out");
        }
    }

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <div className={styles.navContainer}>
            <div className={styles.mainNavItems}>
                <Link href={`/profile/${userData?.username}`}>
                    <div className={styles.navItem}
                        onMouseEnter={() => setHovered("Profile")}
                        onMouseLeave={() => setHovered("")}>
                        <img
                            src={userData?.image ? `${process.env.NEXT_PUBLIC_API_URL}/${userData?.image}` : `${process.env.NEXT_PUBLIC_API_URL}/uploads/profileImages/default-avatar.svg`}
                            alt="profile"
                            width={iconSize}
                            height={iconSize}
                            className={styles.profileIcon}
                        />
                        {hovered === "Profile" && <div className={styles.description}>Profile</div>}
                    </div>
                </Link>

                <Link href="/">
                    <div className={styles.navItem}
                        onMouseEnter={() => setHovered("Home")}
                        onMouseLeave={() => setHovered("")}>
                        <img src="/icons/home.svg" alt="home" width={iconSize} height={iconSize} />
                        {hovered === "Home" && <div className={styles.description}>Home</div>}
                    </div>
                </Link>


                <Link href="/people">
                    <div className={styles.navItem}
                        onMouseEnter={() => setHovered("People")}
                        onMouseLeave={() => setHovered("")}>
                        <img src="/icons/pepole.svg" alt="people" width={iconSize} height={iconSize} />
                        {hovered === "People" && <div className={styles.description}>People</div>}
                    </div>
                </Link>

                <Link href="/groups">
                    <div className={styles.navItem}
                        onMouseEnter={() => setHovered("Groups")}
                        onMouseLeave={() => setHovered("")}>
                        <img src="/icons/groups.svg" alt="groups" width={iconSize} height={iconSize} />
                        {hovered === "Groups" && <div className={styles.description}>Groups</div>}
                    </div>
                </Link>
                
                <div className={styles.navItem}
                    onMouseEnter={() => setHovered("Notifications")}
                    onMouseLeave={() => setHovered("")}>
                    <div className={styles.notificationIconWrapper}>
                        <NotificationsList />
                    </div>
                    {hovered === "Notifications" && <div className={styles.description}>Notifications</div>}
                </div>
            </div>

            <div className={styles.logoutContainer}>
                <div className={styles.navItem}
                    onMouseEnter={() => setHovered("Logout")}
                    onMouseLeave={() => setHovered("")}
                    onClick={() => handleLogout()}
                >
                    <img src="/icons/logout.svg" alt="logout" width={iconSize} height={iconSize} />
                    {hovered === "Logout" && <div className={styles.description}>Logout</div>}
                </div>
            </div>
        </div>
    );
}


