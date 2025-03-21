import React, { useState, useEffect } from "react";
// import { EventAttendance } from "../";
import { EventAttendance } from "../../eventAttendance"

export default function Events({ groupData }) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (groupData?.Events && events.length === 0) {
            setEvents(groupData.Events);
        }
    }, [groupData]); // Ensure effect re-runs when `groupData` changes
    const [isGoing, setIsGoing] = useState(event.going);

    const handleVote = (e, eventId, voteValue) => {
        e.preventDefault();
        setIsGoing(voteValue === "going"); // Update the state
        InsertVote(e, eventId, voteValue); // Call your function
    };
    return (
        <div className="test1" id="events">
            <h2>Events</h2>
            <div>
                {events.length > 0 ? (
                    events.map((event) => (
                        <div key={event.id} id="event-data">
                            <h2>{event.title}</h2>
                            <div> About the event : {event.description}</div>
                            <div>{event.date}</div>
                            <EventAttendance event={event} key={`att-${event.id}`} />
                        </div>
                    ))
                ) : (
                    <p>No events yet</p>
                )}
            </div>
        </div>
    );
}