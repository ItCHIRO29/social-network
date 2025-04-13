CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    age INTEGER NOT NULL,
    bio TEXT,
    nickname TEXT,
    username TEXT NOT NULL UNIQUE,
    image TEXT,
    email TEXT NOT NULL,
    public BOOLEAN DEFAULT false,
    last_active TEXT NOT NULL, 
    password TEXT NOT NULL
);