CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    created_at TEXT NOT NULL,
    privacy TEXT,
    CHECK (((privacy IS NOT NULL OR privacy != '') AND group_id IS NULL) OR ((privacy IS NULL OR privacy == '') AND group_id IS NOT NULL)),
    CHECK (privacy IN ('public', 'private', 'semi-private')),
    foreign key(group_id) references groups(id),
    foreign key(user_id) references users(id)
)

CREATE TABLE IF NOT EXISTS private_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    can_see INTEGER NOT NULL,
    foreign key(post_id) references posts(id),
    foreign key(can_see) references users(id)
)