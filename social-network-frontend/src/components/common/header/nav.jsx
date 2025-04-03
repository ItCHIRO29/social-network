import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./nav.module.css";

export default function Nav() {
    const [hovered, setHovered] = useState("");
    const iconSize = 25;
    const router = useRouter();
    const  handleLogout = async function(){
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
                    <Image src="/icons/notifications.svg" alt="notifications" width={iconSize} height={iconSize} />
                    {hovered === "Notifications" && <div className={styles.description}>Notifications</div>}
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


