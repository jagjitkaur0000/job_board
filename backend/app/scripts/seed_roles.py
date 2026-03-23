# app/scripts/seed_roles.py

from app.db.session import SessionLocal
from app.models.role import Role


def seed_roles():
    db = SessionLocal()
    roles = ["candidate", "recruiter"]

    try:
        for role_name in roles:
            existing = db.query(Role).filter(Role.name == role_name).first()
            if not existing:
                db.add(Role(name=role_name))
                print(f"Inserted role: {role_name}")
            else:
                print(f"Role already exists: {role_name}")

        db.commit()

    except Exception as e:
        db.rollback()
        print("Error while seeding roles:", e)
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_roles()