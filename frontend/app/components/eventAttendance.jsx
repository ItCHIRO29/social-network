'use client';

import React, { useState } from "react";

export function EventAttendance({ event }) {
    const [isGoing, setIsGoing] = useState(event.going);

    const handleVote = (e, eventId, goingStatus) => {
        e.preventDefault(); // Prevent default to handle state manually
        InsertVote(eventId, goingStatus, setIsGoing);
    };

    console.log("is going", event.id, isGoing);

    return (
        <div id={`attendance-${event.id}`} key={`attendance-${event.id}`}>
            <fieldset>
                <legend>Attendance</legend>
                <input
                    key={`going-${event.id}`}
                    type="radio"
                    id={`going-${event.id}`}
                    className="going"
                    checked={isGoing === true}
                    onChange={(e) => handleVote(e, event.id, true)}
                    name={`attendance-${event.id}`}
                    value="going"
                />
                <label htmlFor={`going-${event.id}`}>Going</label>

                <input
                    key={`not-going-${event.id}`}
                    type="radio"
                    id={`not-going-${event.id}`}
                    className="NotGoing"
                    checked={isGoing === false}
                    onChange={(e) => handleVote(e, event.id, false)}
                    name={`attendance-${event.id}`}
                    value="NotGoing"
                />
                <label htmlFor={`not-going-${event.id}`}>Not Going</label>
            </fieldset>
        </div>
    );
}

function InsertVote(eventId, goingStatus, setIsGoing) {
    // Define the action based on the goingStatus
    const action = goingStatus ? "going" : "not-going";
    console.log(eventId)
    fetch(`http://localhost:8080/api/groups/insert_vote?action=${action}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            event_id: eventId,
            going: goingStatus,
        }),
        credentials: "include",
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error('Failed to update attendance');
            }
        })
        .then((data) => {
            console.log("vote inserted:", goingStatus);
            setIsGoing(goingStatus); // Update state to match the selected option
        })
        .catch((error) => {
            console.error("Error inserting vote:", error);
        });
}