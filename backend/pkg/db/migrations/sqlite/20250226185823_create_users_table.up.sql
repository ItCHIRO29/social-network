CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    age INTEGER NOT NULL,
    bio TEXT,
    nickname TEXT,
    username TEXT NOT NULL,
    image TEXT,
    email TEXT NOT NULL,
    public BOOLEAN DEFAULT 
    password TEXT NOT NULL
);