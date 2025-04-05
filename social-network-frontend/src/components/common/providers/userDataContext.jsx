import { createContext, useContext, useEffect, useState } from "react";
import getUserData from "@/utils/getUserData";

// Create a context
export const UserDataContext = createContext(null);

export function UserDataProvider({ children }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true); // optional: loading state

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Call getUserData without parameters to get logged-in user's data
                const data = await getUserData();
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false); // Stop loading once data is fetched
            }
        };

        fetchUserData();
    }, []);

    return (
        <UserDataContext.Provider value={{ userData, setUserData, loading }}>
            {children}
        </UserDataContext.Provider>
    );
}

// Custom hook for consuming the user data
export function useUserData() {
   return useContext(UserDataContext);
}
