# HealthCare AI Assistant – Data Layer Spec

---

## 1. Overview

This module establishes the **data access layer** for the Healthcare AI Assistant.

It is responsible for fetching and aggregating patient-related data from the database.

All downstream services (care plan generation, compliance checks, RPM/CCM logic) depend on this layer.

---

## 2. Dependencies

* asyncpg (PostgreSQL driver)
* Existing FastAPI application lifecycle
* Database connection pool initialized at startup

---

## 3. Responsibilities (Data Layer Only)

This module does NOT handle business logic.

It only provides data access for:

* Patient verification (new/existing)
* Compliance-related data retrieval
* RPM readings aggregation
* CCM care plan history
* Notes and medical history retrieval

---

## 4. Database Schema (Simplified View)

### User

Represents system users (patients + providers linked via patient table).

### Patient

Core patient profile linked to User.

### RPMTable

Stores remote patient monitoring sessions and readings.

### CarePlan

Stores chronic care management plans and clinical context.

---

## 5. Functions to Implement (`database/db.py`)

All functions are **async** and use `asyncpg pool`.

---

### 5.1 init_db()

**Purpose:**
Initialize DB connection pool at application startup.

**Returns:**
None

---

### 5.2 close_db()

**Purpose:**
Gracefully close DB pool on shutdown.

---

### 5.3 fetch_patient_data(patient_id)

**Returns:**

```python
dict
```

**Includes:**

* basic patient info
* linked user info

---

### 5.4 fetch_patient_info(user_id)

**Returns:**

```python
dict
```

**Purpose:**
Fetch full user profile + linked patient record.

---

### 5.5 fetch_patient_number(patient_id)

**Returns:**

```python
str
```

**Purpose:**
Returns primary phone number of patient.

---

### 5.6 fetch_patient_readings(patient_id)

**Returns:**

```python
list[dict]
```

**Purpose:**
Fetch latest RPM readings for patient.

---

### 5.7 fetch_patient_readings_6_months(patient_id)

**Returns:**

```python
list[dict]
```

**Purpose:**
Fetch RPM readings from last 6 months.

---

### 5.8 fetch_last_three_notes(patient_id)

**Returns:**

```python
list[dict]
```

**Purpose:**
Returns last 3 clinical notes for patient.

---

### 5.9 fetch_six_latest_ccm_care_plans(patient_id)

**Returns:**

```python
list[dict]
```

**Purpose:**
Fetch latest 6 care plans for CCM analysis.

---

## 6. Database Rules

* Must use `asyncpg` connection pool
* No ORM allowed
* All queries must use parameterized SQL (`$1, $2`)
* Foreign keys must be respected at DB level
* No business logic inside DB layer

---

## 7. Application Integration (`app.py`)

* Initialize DB pool on startup
* Close DB pool on shutdown
* Ensure no route executes before DB is ready

---

## 8. Error Handling

* Missing patient → return `None`
* Missing records → return empty list `[]`
* DB errors → raise exception (do not silently fail)

---

## 9. Definition of Done

* [ ] DB pool initializes successfully
* [ ] All 9 functions implemented
* [ ] All queries use asyncpg parameterization
* [ ] No ORM usage anywhere
* [ ] Functions return correct types
* [ ] App starts without DB errors
