import json
import os
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.experiment_config import ExperimentConfig


def seed_users(db: Session):
    """Ensure required test users exist for QA verification"""
    required_users = [
        {
            "username": "admin",
            "email": "admin@example.com",
            "password": "admin123",
            "full_name": "Admin User",
            "is_superuser": True,
        },
        {
            "username": "testuser",
            "email": "test@test.com",
            "password": "test123",
            "full_name": "Test User",
            "is_superuser": False,
        },
    ]

    created_count = 0
    for user_data in required_users:
        existing = db.query(User).filter(User.username == user_data["username"]).first()
        if existing:
            continue

        user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            full_name=user_data["full_name"],
            is_active=True,
            is_superuser=user_data["is_superuser"],
        )
        db.add(user)
        created_count += 1
        print(f"✅ Seeded user: {user_data['username']}")

    if created_count > 0:
        db.commit()
        print(f"✅ Total users seeded: {created_count}")
    else:
        user_count = db.query(User).count()
        print(f"ℹ️ Users already exist ({user_count}), skipping user seed")


def seed_experiments(db: Session):
    """Seed experiment configs from JSON files"""
    config_count = db.query(ExperimentConfig).count()
    if config_count > 0:
        print(f"ℹ️ Experiment configs already exist ({config_count}), skipping seed")
        return
    
    seed_dir = os.path.join(os.path.dirname(__file__), "experiments")
    json_files = [f for f in os.listdir(seed_dir) if f.endswith('.json')]
    
    for json_file in json_files:
        file_path = os.path.join(seed_dir, json_file)
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        config = ExperimentConfig(
            name=data['name'],
            category=data['category'],
            difficulty=data.get('difficulty', 'easy'),
            description=data['description'],
            principle_equation=data['principle_equation'],
            principle_explanation=data['principle_explanation'],
            instruments=data.get('instruments', []),
            reagents=data.get('reagents', []),
            steps=data.get('steps', []),
            reactions=data.get('reactions', []),
            safety_rules=data.get('safety_rules', [])
        )
        db.add(config)
        print(f"✅ Seeded experiment: {data['name']}")
    
    db.commit()
    print(f"✅ Total experiments seeded: {len(json_files)}")


def run_seed():
    """Main seed function"""
    print("🌱 Running database seed...")
    db = SessionLocal()
    try:
        seed_users(db)
        seed_experiments(db)
        print("✅ Seed completed successfully!")
    except Exception as e:
        print(f"❌ Seed failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
