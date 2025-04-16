'use client'

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "../events.module.css"


export default function Event() {
    const { id: eventid } = useParams();
    const { name } = useParams();
    const [event, setEvent] = useState();
    const [isloading, setisloading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchevent();
    }, [eventid]);

    const fetchevent = async () => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/groups/CreateEvent?group=${name}&id=${eventid}`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setEvent(data);
                setisloading(false);
            } else if (response.status === 400) {
                setError("Event Not Found");
                setisloading(false);
            } else if (response.status === 500) {
                setError("Internal server Error Try later");
                setisloading(false);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setError("Internal server Error Try later");
            setisloading(false);

        }
    }
    const handleVote = async (eventId, choice) => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/groups/insert_vote?action=${choice}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    eventId,
                    // choice: choice,
                ),
            });

            if (response.ok) {
                fetchevent(); // Refresh events to show updated votes
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };
    console.log("event Data :::: ", event);
    return (
        <div className={styles.eventsContainer}>
            {isloading ? (
                <div className={styles.noEvents}> is loading</div>
            ) : (
                <>

                    <div className={styles.header}>
                        <h1>Group Events</h1>
                    </div>
                    {error && <h1 className={styles.Error}>{error}</h1>}
                    <div className={styles.eventsList}>
                        {
                            (event.id == 0 || !event) ? (
                                <div className={styles.noEvents}>
                                    <h2>No Events Found</h2>
                                </div>
                            ) : (
                                <div key={event.id} className={styles.eventCard}>
                                    <h2>{event.title}</h2>
                                    <p className={styles.datetime}>{event.description}</p>
                                    <p className={styles.datetime}>
                                        {new Date(event.date).toLocaleString()}
                                    </p>

                                    <div className={styles.votingSection}>
                                        <button
                                            className={`${styles.voteButton} ${event.userVote === 'going' ? styles.selected : ''}`}
                                            onClick={() => handleVote(event.id, 'going')}
                                        >
                                            Going ({event.GoingCount})
                                        </button>
                                        <button
                                            className={`${styles.voteButton} ${event.userVote === 'not_going' ? styles.selected : ''}`}
                                            onClick={() => handleVote(event.id, 'not_going')}
                                        >
                                            Not Going ({event.NotGoingCount})
                                        </button>
                                    </div>
                                </div>
                            )
                        }



                    </div>
                </>
            )}

        </div>
    );
}