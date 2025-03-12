CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    foreign key(user_id) references users(id)
);