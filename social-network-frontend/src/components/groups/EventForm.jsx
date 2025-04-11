'use client'
import { useState } from 'react';
import styles from './EventForm.module.css';

export default function EventForm({ groupId, onEventCreated }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [datetime, setDatetime] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/groups/${groupId}/events`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    datetime: new Date(datetime).toISOString(),
                }),
            });

            if (response.ok) {
                // Reset form fields after successful submission
                setTitle('');
                setDescription('');
                setDatetime('');
                onEventCreated();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to create event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            setError('Failed to create event. Please try again.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.formHeader}>
                <h2>Create New Event</h2>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Enter event title"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        placeholder="Enter event description"
                        rows={4}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="datetime">Date and Time</label>
                    <input
                        id="datetime"
                        type="datetime-local"
                        value={datetime}
                        onChange={(e) => setDatetime(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <div className={styles.formActions}>
                    <button type="submit">
                        Create Event
                    </button>
                </div>
            </form>
        </div>
    );
} 