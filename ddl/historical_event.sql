-- DDL Query for storing historical events
CREATE TABLE historical_events(
    event_id CHAR(36) PRIMARY KEY,
    event_name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    duration_minutes INT NOT NULL,
    parent_event_id CHAR(36),
    metadata JSON,
    CONSTRAINT fk_parent FOREIGN KEY(parent_event_id) REFERENCES historical_events(event_id)
); 

-- Indexing the most searched fields
CREATE INDEX idx_historical_events_start ON historical_events(start_date);
CREATE INDEX idx_historical_events_end   ON historical_events(end_date);