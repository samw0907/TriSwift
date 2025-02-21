DROP TABLE IF EXISTS "PersonalRecords", "SessionActivities", "Transitions", "Sessions", "Users" CASCADE;

CREATE TABLE "Users" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Sessions" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_type VARCHAR(255) NOT NULL,
    date TIMESTAMP NOT NULL,
    total_duration INTEGER NOT NULL,
    total_distance DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE
);

CREATE TABLE "SessionActivities" (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    sport_type VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    distance DECIMAL(10,2) NOT NULL,
    heart_rate_min INTEGER,
    heart_rate_max INTEGER,
    heart_rate_avg INTEGER,
    cadence INTEGER,
    power INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (session_id) REFERENCES "Sessions"(id) ON DELETE CASCADE
);

CREATE TABLE "Transitions" (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    previous_sport VARCHAR(255) NOT NULL,
    next_sport VARCHAR(255) NOT NULL,
    transition_time INTEGER NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (session_id) REFERENCES "Sessions"(id) ON DELETE CASCADE
);

CREATE TABLE "PersonalRecords" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(255) NOT NULL,
    distance DECIMAL(10,2),
    best_time INTEGER NOT NULL,
    record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "Users"(id) ON DELETE CASCADE
);
