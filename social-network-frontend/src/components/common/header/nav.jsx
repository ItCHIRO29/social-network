import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./nav.module.css";
import NotificationsList from "../NotificationsList";

export default function Nav() {
    const [hovered, setHovered] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const iconSize = 25;
    const router = useRouter();

    useEffect(() => {
        fetchNotificationCount();
        // Set up polling for notification count
        const interval = setInterval(fetchNotificationCount, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNotificationCount = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/count`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setNotificationCount(data.count);
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };

    const handleLogout = async function() {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
            {
                method: "POST",
                credentials: "include",
            }
        )
        if(response.ok){
            router.push("/login");
        }else{
            console.log("Error logging out");
        }
    }

    const toggleNotifications = () => {
        console.log('Toggle notifications clicked. Current state:', showNotifications);
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            setNotificationCount(0);
        }
    };

    return (
        <div className={styles.navContainer}>
            <div className={styles.mainNavItems}>
                <div className={styles.navItem} 
                     onMouseEnter={() => setHovered("Home")} 
                     onMouseLeave={() => setHovered("")}>
                    <Link href="/">
                        <Image src="/icons/home.svg" alt="home" width={iconSize} height={iconSize} />
                    </Link>
                    {hovered === "Home" && <div className={styles.description}>Home</div>}
                </div>

                <div className={styles.navItem} 
                     onMouseEnter={() => setHovered("People")} 
                     onMouseLeave={() => setHovered("")}>
                    <Link href="/people">
                        <Image src="/icons/pepole.svg" alt="people" width={iconSize} height={iconSize} />
                    </Link>
                    {hovered === "People" && <div className={styles.description}>People</div>}
                </div>

                <div className={styles.navItem} 
                     onMouseEnter={() => setHovered("Groups")} 
                     onMouseLeave={() => setHovered("")}>
                    <Link href="/groups">
                        <Image src="/icons/groups.svg" alt="groups" width={iconSize} height={iconSize} />
                    </Link>
                    {hovered === "Groups" && <div className={styles.description}>Groups</div>}
                </div>

                <div className={styles.navItem} 
                     onMouseEnter={() => setHovered("Notifications")} 
                     onMouseLeave={() => setHovered("")}>
                    <button 
                        className={styles.iconButton}
                        onClick={toggleNotifications}
                        type="button"
                    >
                        <Image 
                            src="/icons/notifications.svg" 
                            alt="notifications" 
                            width={iconSize} 
                            height={iconSize} 
                        />
                        {notificationCount > 0 && (
                            <span className={styles.notificationBadge}>
                                {notificationCount > 99 ? '99+' : notificationCount}
                            </span>
                        )}
                    </button>
                    {hovered === "Notifications" && <div className={styles.description}>Notifications</div>}
                    {showNotifications && (
                        <NotificationsList 
                            isVisible={showNotifications}
                            onClose={() => setShowNotifications(false)}
                            onNotificationsRead={() => setNotificationCount(0)}
                        />
                    )}
                </div>
            </div>

            <div className={styles.logoutContainer}>
                <div className={styles.navItem} 
                     onMouseEnter={() => setHovered("Logout")} 
                     onMouseLeave={() => setHovered("")}
                     onClick={() => handleLogout()}
                >
                    <Image src="/icons/logout.svg" alt="logout" width={iconSize} height={iconSize} />
                    {hovered === "Logout" && <div className={styles.description}>Logout</div>}
                </div>
            </div>
        </div>
    );
}


