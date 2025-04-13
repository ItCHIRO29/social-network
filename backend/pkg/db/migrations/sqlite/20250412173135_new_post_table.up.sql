DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS private_posts;

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    created_at TEXT NOT NULL,
    privacy TEXT,
    can_see TEXT,
    foreign key(group_id) references groups(id),
    foreign key(user_id) references users(id)
);
