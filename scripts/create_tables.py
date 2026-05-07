"""
Run this script once to create the Clinic_1 schema and all tables
inside the 'healthcare' PostgreSQL database.

Usage:
    python scripts/create_tables.py

Env overrides (all optional — defaults match local dev):
    DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
"""

import asyncio
import os
from pathlib import Path

import asyncpg
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "healthcare")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

DDL = """
CREATE SCHEMA IF NOT EXISTS "Clinic_1";

CREATE TABLE IF NOT EXISTS "Clinic_1".patients_user (
    id          BIGSERIAL PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    first_name  TEXT NOT NULL DEFAULT '',
    last_name   TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Clinic_1".patients_patient (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES "Clinic_1".patients_user(id) ON DELETE CASCADE,
    phone       TEXT,
    dob         DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS patients_patient_user_id_idx
    ON "Clinic_1".patients_patient (user_id);

CREATE TABLE IF NOT EXISTS "Clinic_1".devices_reading (
    id            BIGSERIAL PRIMARY KEY,
    patient_id    BIGINT NOT NULL REFERENCES "Clinic_1".patients_patient(id) ON DELETE CASCADE,
    reading_type  TEXT NOT NULL,
    value         NUMERIC(10, 3) NOT NULL,
    unit          TEXT,
    recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS devices_reading_patient_recorded_idx
    ON "Clinic_1".devices_reading (patient_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS "Clinic_1".patients_note (
    id          BIGSERIAL PRIMARY KEY,
    patient_id  BIGINT NOT NULL REFERENCES "Clinic_1".patients_patient(id) ON DELETE CASCADE,
    author_id   BIGINT REFERENCES "Clinic_1".patients_user(id) ON DELETE SET NULL,
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS patients_note_patient_created_idx
    ON "Clinic_1".patients_note (patient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS "Clinic_1".care_plans (
    id          BIGSERIAL PRIMARY KEY,
    patient_id  BIGINT NOT NULL REFERENCES "Clinic_1".patients_patient(id) ON DELETE CASCADE,
    plan_type   TEXT NOT NULL CHECK (plan_type IN ('CCM', 'RPM')),
    content     JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS care_plans_patient_created_idx
    ON "Clinic_1".care_plans (patient_id, created_at DESC);
"""


async def main() -> None:
    print(f"Connecting to {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME} ...")
    conn = await asyncpg.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )
    try:
        await conn.execute(DDL)
        print('Done. Schema "Clinic_1" and all tables created in the healthcare database.')
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
