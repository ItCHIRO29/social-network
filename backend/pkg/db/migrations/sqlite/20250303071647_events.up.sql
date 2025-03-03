CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    creator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    foreign key(group_id) references groups(id),
    foreign key(creator_id) references users(id)
)

CREATE TABLE IF NOT EXISTS event_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    going BOOLEAN DEFAULT true,
    foreign key(user_id) references users(id),
    foreign key(event_id) references events(id)
)