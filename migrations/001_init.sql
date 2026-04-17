CREATE SCHEMA IF NOT EXISTS renal_consultants;

SET search_path TO renal_consultants, public;

CREATE TABLE IF NOT EXISTS renal_consultants.patients_user (
    id          BIGSERIAL PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    first_name  TEXT NOT NULL DEFAULT '',
    last_name   TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS renal_consultants.patients_patient (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES renal_consultants.patients_user(id) ON DELETE CASCADE,
    phone       TEXT,
    dob         DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS patients_patient_user_id_idx
    ON renal_consultants.patients_patient (user_id);

CREATE TABLE IF NOT EXISTS renal_consultants.devices_reading (
    id            BIGSERIAL PRIMARY KEY,
    patient_id    BIGINT NOT NULL REFERENCES renal_consultants.patients_patient(id) ON DELETE CASCADE,
    reading_type  TEXT NOT NULL,
    value         NUMERIC(10, 3) NOT NULL,
    unit          TEXT,
    recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS devices_reading_patient_recorded_idx
    ON renal_consultants.devices_reading (patient_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS renal_consultants.patients_note (
    id          BIGSERIAL PRIMARY KEY,
    patient_id  BIGINT NOT NULL REFERENCES renal_consultants.patients_patient(id) ON DELETE CASCADE,
    author_id   BIGINT REFERENCES renal_consultants.patients_user(id) ON DELETE SET NULL,
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS patients_note_patient_created_idx
    ON renal_consultants.patients_note (patient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS renal_consultants.care_plans (
    id          BIGSERIAL PRIMARY KEY,
    patient_id  BIGINT NOT NULL REFERENCES renal_consultants.patients_patient(id) ON DELETE CASCADE,
    plan_type   TEXT NOT NULL CHECK (plan_type IN ('CCM', 'RPM')),
    content     JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS care_plans_patient_created_idx
    ON renal_consultants.care_plans (patient_id, created_at DESC);
