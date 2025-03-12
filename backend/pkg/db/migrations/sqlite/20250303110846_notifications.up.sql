CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiver_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    reference_id INTEGER,
    content TEXT,
    seen BOOLEAN DEFAULT false,
    created_at TEXT NOT NULL,
    CHECK (type IN ('follow', 'follow_request', 'accepted_follow', 'rejected_follow', 'group_invitation', 'request_join_group', 'event')),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

