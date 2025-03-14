CREATE TABLE IF NOT EXISTS followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    accepted BOOLEAN DEFAULT false,
    UNIQUE (follower_id, following_id),
    foreign key(follower_id) references users(id),
    foreign key(following_id) references users(id)
)