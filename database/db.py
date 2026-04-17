from __future__ import annotations

import asyncpg


async def fetch_patient_data(pool: asyncpg.Pool, patient_id: int) -> dict | None:
    query = """
        SELECT p.id,
               p.user_id,
               p.phone,
               p.dob,
               p.created_at,
               u.email,
               u.first_name,
               u.last_name
        FROM renal_consultants.patients_patient p
        JOIN renal_consultants.patients_user u ON u.id = p.user_id
        WHERE p.id = $1
    """
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, patient_id)
    return dict(row) if row else None


async def fetch_patient_info(pool: asyncpg.Pool, user_id: int) -> dict | None:
    query = """
        SELECT u.id AS user_id,
               u.email,
               u.first_name,
               u.last_name,
               u.created_at AS user_created_at,
               p.id AS patient_id,
               p.phone,
               p.dob,
               p.created_at AS patient_created_at
        FROM renal_consultants.patients_user u
        LEFT JOIN renal_consultants.patients_patient p ON p.user_id = u.id
        WHERE u.id = $1
    """
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, user_id)
    return dict(row) if row else None


async def fetch_patient_number(pool: asyncpg.Pool, patient_id: int) -> str | None:
    query = """
        SELECT phone
        FROM renal_consultants.patients_patient
        WHERE id = $1
    """
    async with pool.acquire() as conn:
        value = await conn.fetchval(query, patient_id)
    return value


async def fetch_patient_readings(pool: asyncpg.Pool, patient_id: int) -> list[dict]:
    query = """
        SELECT id, patient_id, reading_type, value, unit, recorded_at
        FROM renal_consultants.devices_reading
        WHERE patient_id = $1
        ORDER BY recorded_at DESC
        LIMIT 50
    """
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, patient_id)
    return [dict(r) for r in rows]


async def fetch_patient_readings_6_months(pool: asyncpg.Pool, patient_id: int) -> list[dict]:
    query = """
        SELECT id, patient_id, reading_type, value, unit, recorded_at
        FROM renal_consultants.devices_reading
        WHERE patient_id = $1
          AND recorded_at >= NOW() - INTERVAL '6 months'
        ORDER BY recorded_at DESC
    """
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, patient_id)
    return [dict(r) for r in rows]


async def fetch_last_three_notes(pool: asyncpg.Pool, patient_id: int) -> list[dict]:
    query = """
        SELECT id, patient_id, author_id, body, created_at
        FROM renal_consultants.patients_note
        WHERE patient_id = $1
        ORDER BY created_at DESC
        LIMIT 3
    """
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, patient_id)
    return [dict(r) for r in rows]


async def fetch_six_latest_ccm_care_plans(pool: asyncpg.Pool, patient_id: int) -> list[dict]:
    query = """
        SELECT id, patient_id, plan_type, content, created_at
        FROM renal_consultants.care_plans
        WHERE patient_id = $1
          AND plan_type = 'CCM'
        ORDER BY created_at DESC
        LIMIT 6
    """
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, patient_id)
    return [dict(r) for r in rows]
