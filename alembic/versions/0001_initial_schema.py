"""initial schema — Clinic_1

Revision ID: 0001
Revises:
Create Date: 2026-04-21
"""

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    from alembic import op

    op.execute('CREATE SCHEMA IF NOT EXISTS "Clinic_1"')

    op.execute("""
        CREATE TABLE IF NOT EXISTS "Clinic_1".patients_user (
            id          BIGSERIAL PRIMARY KEY,
            email       TEXT NOT NULL UNIQUE,
            first_name  TEXT NOT NULL DEFAULT '',
            last_name   TEXT NOT NULL DEFAULT '',
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS "Clinic_1".patients_patient (
            id          BIGSERIAL PRIMARY KEY,
            user_id     BIGINT NOT NULL REFERENCES "Clinic_1".patients_user(id) ON DELETE CASCADE,
            phone       TEXT,
            dob         DATE,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE INDEX IF NOT EXISTS patients_patient_user_id_idx
            ON "Clinic_1".patients_patient (user_id)
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS "Clinic_1".devices_reading (
            id            BIGSERIAL PRIMARY KEY,
            patient_id    BIGINT NOT NULL REFERENCES "Clinic_1".patients_patient(id) ON DELETE CASCADE,
            reading_type  TEXT NOT NULL,
            value         NUMERIC(10, 3) NOT NULL,
            unit          TEXT,
            recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE INDEX IF NOT EXISTS devices_reading_patient_recorded_idx
            ON "Clinic_1".devices_reading (patient_id, recorded_at DESC)
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS "Clinic_1".patients_note (
            id          BIGSERIAL PRIMARY KEY,
            patient_id  BIGINT NOT NULL REFERENCES "Clinic_1".patients_patient(id) ON DELETE CASCADE,
            author_id   BIGINT REFERENCES "Clinic_1".patients_user(id) ON DELETE SET NULL,
            body        TEXT NOT NULL,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE INDEX IF NOT EXISTS patients_note_patient_created_idx
            ON "Clinic_1".patients_note (patient_id, created_at DESC)
    """)

    op.execute("""
        CREATE TABLE IF NOT EXISTS "Clinic_1".care_plans (
            id          BIGSERIAL PRIMARY KEY,
            patient_id  BIGINT NOT NULL REFERENCES "Clinic_1".patients_patient(id) ON DELETE CASCADE,
            plan_type   TEXT NOT NULL CHECK (plan_type IN ('CCM', 'RPM')),
            content     JSONB NOT NULL DEFAULT '{}'::JSONB,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE INDEX IF NOT EXISTS care_plans_patient_created_idx
            ON "Clinic_1".care_plans (patient_id, created_at DESC)
    """)


def downgrade() -> None:
    from alembic import op

    op.execute('DROP SCHEMA IF EXISTS "Clinic_1" CASCADE')
