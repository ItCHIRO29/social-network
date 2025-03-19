CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    foreign key(admin_id) references users(id)
);

CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL ,
    group_id INTEGER NOT NULL ,
    accepted BOOLEAN DEFAULT false,
    foreign key(user_id) references users(id),
    foreign key(group_id) references groups(id)
);