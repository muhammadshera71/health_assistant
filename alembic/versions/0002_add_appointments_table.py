"""add appointments table

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-21
"""

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    from alembic import op

    op.execute("""
        CREATE TABLE IF NOT EXISTS "Clinic_1".appointments (
            id           BIGSERIAL PRIMARY KEY,
            patient_id   BIGINT NOT NULL REFERENCES "Clinic_1".patients_patient(id) ON DELETE CASCADE,
            provider_id  BIGINT REFERENCES "Clinic_1".patients_user(id) ON DELETE SET NULL,
            scheduled_at TIMESTAMPTZ NOT NULL,
            duration_min INTEGER NOT NULL DEFAULT 30,
            status       TEXT NOT NULL DEFAULT 'scheduled'
                             CHECK (status IN ('scheduled', 'completed', 'cancelled')),
            notes        TEXT,
            created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)

    op.execute("""
        CREATE INDEX IF NOT EXISTS appointments_patient_scheduled_idx
            ON "Clinic_1".appointments (patient_id, scheduled_at DESC)
    """)


def downgrade() -> None:
    from alembic import op

    op.execute('DROP TABLE IF EXISTS "Clinic_1".appointments')
