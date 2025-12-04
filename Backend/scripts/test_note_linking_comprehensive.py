#!/usr/bin/env python3
"""
Comprehensive Note Linking Test
Tests saving notes linked to all object types (trading_account, trade, trade_plan, ticker)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from models.note import Note
from models.ai_analysis import AIAnalysisRequest
from config.database import db

# Test configuration
ADMIN_USER_ID = 10

# Test objects for each relation type
TEST_OBJECTS = [
    (1, "חשבון מסחר", 14),
    (2, "טרייד", 169),
    (3, "תוכנית השקעה", 364),
    (4, "טיקר", 433)  # AAPL
]


def create_test_notes():
    """Create test notes linked to all object types"""
    print("=" * 80)
    print("Comprehensive Note Linking Test")
    print("=" * 80)
    
    # Get a completed analysis with response_text
    analysis = AIAnalysisRequest.query.filter_by(
        user_id=ADMIN_USER_ID,
        status='completed'
    ).filter(AIAnalysisRequest.response_text.isnot(None)).first()
    
    if not analysis:
        print("❌ No completed analysis found with response_text")
        return []
    
    print(f"\n✅ Using analysis #{analysis.id} (Template: {analysis.template_id})")
    print(f"   Response text length: {len(analysis.response_text)} characters\n")
    
    created_notes = []
    
    for related_type_id, related_type_name, related_id in TEST_OBJECTS:
        # Create note
        note = Note(
            user_id=ADMIN_USER_ID,
            content=analysis.response_text[:10000],  # Ensure it fits
            related_type_id=related_type_id,
            related_id=related_id
        )
        
        try:
            db.session.add(note)
            db.session.commit()
            db.session.refresh(note)
            
            created_notes.append({
                "note_id": note.id,
                "related_type_id": related_type_id,
                "related_type_name": related_type_name,
                "related_id": related_id
            })
            
            print(f"✅ Note #{note.id} created → {related_type_name} (ID: {related_id})")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Failed to create note for {related_type_name}: {str(e)}")
    
    print(f"\n✅ Created {len(created_notes)} notes")
    return created_notes


def verify_notes(created_notes):
    """Verify all created notes exist and are correct"""
    print("\n" + "=" * 80)
    print("Verification")
    print("=" * 80)
    
    all_valid = True
    
    for note_info in created_notes:
        note = Note.query.filter_by(id=note_info["note_id"]).first()
        
        if not note:
            print(f"❌ Note #{note_info['note_id']} not found in database")
            all_valid = False
            continue
        
        # Verify all fields
        if note.user_id != ADMIN_USER_ID:
            print(f"❌ Note #{note.id} has wrong user_id: {note.user_id} (expected {ADMIN_USER_ID})")
            all_valid = False
        
        if note.related_type_id != note_info["related_type_id"]:
            print(f"❌ Note #{note.id} has wrong related_type_id: {note.related_type_id} (expected {note_info['related_type_id']})")
            all_valid = False
        
        if note.related_id != note_info["related_id"]:
            print(f"❌ Note #{note.id} has wrong related_id: {note.related_id} (expected {note_info['related_id']})")
            all_valid = False
        
        if not note.content or len(note.content) == 0:
            print(f"❌ Note #{note.id} has no content")
            all_valid = False
        
        if all_valid:
            print(f"✅ Note #{note.id} verified: {note_info['related_type_name']} (ID: {note_info['related_id']})")
    
    return all_valid


def main():
    """Run the test"""
    with app.app_context():
        created_notes = create_test_notes()
        
        if created_notes:
            all_valid = verify_notes(created_notes)
            
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            print(f"Notes created: {len(created_notes)}")
            for note_info in created_notes:
                print(f"  - Note #{note_info['note_id']} → {note_info['related_type_name']} (ID: {note_info['related_id']})")
            
            if all_valid:
                print("\n✅ All notes verified successfully!")
            else:
                print("\n⚠️  Some notes have validation issues")
        else:
            print("\n❌ No notes were created")


if __name__ == "__main__":
    main()

