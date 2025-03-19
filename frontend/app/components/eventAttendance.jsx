'use client';

import React, { useState } from "react";

export function EventAttendance({ event }) {
    const [isGoing, setIsGoing] = useState(event.going);

    const handleVote = (e, eventId, voteValue) => {
        e.preventDefault();
        setIsGoing(voteValue === "going"); // Update the state
        InsertVote(e, eventId, voteValue); // Call your function
    };

    return (
        <div id={"attendence" + event.id}>
            <label htmlFor="going">Going</label>
            <input
                type="radio"
                id="going"
                className="going"
                checked={isGoing === true}
                onChange={(e) => handleVote(e, event.id, "going")}
                name={"attendence" + event.id}
                value="going"
            />
            <label htmlFor="NotGoing">Not Going</label>
            <input
                type="radio"
                id="NotGoing"
                className="NotGoing"
                checked={isGoing === false}
                onChange={(e) => handleVote(e, event.id, "NotGoing")}
                name={"attendence" + event.id}
                value="NotGoing"
            />
        </div>
    );
}

function InsertVote(e, eventid, vote) {
    // let action = "";
    // let button = document.querySelector(`.${vote}`);
    let action = e.target.id;
    console.log("action:", action);
    // console.log("button :", button);

    // let type = button.getAttribute("data-submited");

    // if (type === "true") {
    //     action = "remove";
    //     button.setAttribute("data-submited", "false");
    // } else {
    //     action = "add";
    //     button.setAttribute("data-submited", "true");
    // }

    fetch(`http://localhost:8080/api/groups/insertVote?action=${action}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            event_id: eventid,
            going: vote === "going" ? true : false,
        }),
        credentials: "include",
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("vote inserted:", data);
            e.target.checked = data
            // e.target.style.display = "none";
        })
        .catch((error) => {
            console.error("Error inserting vote:", error);
        });
}