CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    created_at TEXT NOT NULL,
    foreign key(group_id) references groups(id),
    foreign key(user_id) references users(id),
    foreign key(post_id) references posts(id)
)