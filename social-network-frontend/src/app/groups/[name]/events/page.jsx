'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import EventForm from '../../../../components/groups/EventForm';
import GroupNavigation from '../../../../components/groups/GroupNavigation';
import styles from './events.module.css';

export default function GroupEvents() {
    const [events, setEvents] = useState([]);
    const { name: groupId } = useParams();

    useEffect(() => {
        fetchEvents();
    }, [groupId]);

    const fetchEvents = async () => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/groups/${groupId}/events`, {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleVote = async (eventId, choice) => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/groups/${groupId}/events/${eventId}/vote`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ choice }),
            });
            
            if (response.ok) {
                fetchEvents(); // Refresh events to show updated votes
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    return (
        <div className={styles.eventsContainer}>
            <div className={styles.header}>
                <h1>Group Events</h1>
            </div>

            <GroupNavigation groupId={groupId} activeTab="events" />

            <div className={styles.formSection}>
                <EventForm 
                    groupId={groupId}
                    onEventCreated={fetchEvents}
                />
            </div>

            <div className={styles.eventsList}>
                {events.map((event) => (
                    <div key={event.id} className={styles.eventCard}>
                        <h2>{event.title}</h2>
                        <p>{event.description}</p>
                        <p className={styles.datetime}>
                            {new Date(event.datetime).toLocaleString()}
                        </p>
                        
                        <div className={styles.votingSection}>
                            <button 
                                className={`${styles.voteButton} ${event.userVote === 'going' ? styles.selected : ''}`}
                                onClick={() => handleVote(event.id, 'going')}
                            >
                                Going ({event.goingCount})
                            </button>
                            <button 
                                className={`${styles.voteButton} ${event.userVote === 'not_going' ? styles.selected : ''}`}
                                onClick={() => handleVote(event.id, 'not_going')}
                            >
                                Not Going ({event.notGoingCount})
                            </button>
                        </div>
                    </div>
                ))}
                {events.length === 0 && (
                    <p className={styles.noEvents}>No events scheduled yet.</p>
                )}
            </div>
        </div>
    );
} 