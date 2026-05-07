"""
Seed a single realistic Pakistani patient into the database.

Usage:
    python scripts/seed_patient.py
"""

import asyncio
import os
import random
from datetime import datetime, timezone
from pathlib import Path

import asyncpg
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = int(os.getenv("DB_PORT", "5432"))
DB_NAME     = os.getenv("DB_NAME", "healthcare")
DB_USER     = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

FIRST_NAMES = [
    "Hamza", "Usman", "Bilal", "Tariq", "Imran", "Fahad", "Zubair", "Salman",
    "Faisal", "Aamir", "Sohail", "Kamran", "Adnan", "Naveed", "Waqas",
    "Ayesha", "Fatima", "Zainab", "Sana", "Hina", "Nadia", "Rabia", "Amna",
    "Saima", "Rukhsana", "Mehwish", "Sobia", "Uzma", "Naila", "Bushra",
]

LAST_NAMES = [
    "Khan", "Malik", "Iqbal", "Chaudhry", "Butt", "Sheikh", "Qureshi",
    "Siddiqui", "Ansari", "Mirza", "Baig", "Hussain", "Ali", "Ahmed",
    "Nawaz", "Riaz", "Javed", "Raza", "Zafar", "Hashmi",
]


def generate_patient() -> dict:
    first = random.choice(FIRST_NAMES)
    last  = random.choice(LAST_NAMES)
    suffix = random.randint(10, 999)
    email  = f"{first.lower()}.{last.lower()}{suffix}@gmail.com"
    return {"first_name": first, "last_name": last, "email": email}


async def main() -> None:
    conn = await asyncpg.connect(
        host=DB_HOST, port=DB_PORT,
        database=DB_NAME, user=DB_USER, password=DB_PASSWORD,
    )
    try:
        for _ in range(50):
            patient = generate_patient()
            exists = await conn.fetchval(
                'SELECT 1 FROM "Clinic_1".patients_user WHERE email = $1',
                patient["email"],
            )
            if not exists:
                break
        else:
            print("Could not generate a unique email after 50 attempts.")
            return

        now = datetime.now(timezone.utc)

        user_id = await conn.fetchval(
            '''
            INSERT INTO "Clinic_1".patients_user (email, first_name, last_name, created_at)
            VALUES ($1, $2, $3, $4)
            RETURNING id
            ''',
            patient["email"], patient["first_name"], patient["last_name"], now,
        )

        patient_id = await conn.fetchval(
            '''
            INSERT INTO "Clinic_1".patients_patient (user_id, created_at)
            VALUES ($1, $2)
            RETURNING id
            ''',
            user_id, now,
        )

        print(f"Patient created successfully")
        print(f"  id          : {patient_id}")
        print(f"  name        : {patient['first_name']} {patient['last_name']}")
        print(f"  email       : {patient['email']}")

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
