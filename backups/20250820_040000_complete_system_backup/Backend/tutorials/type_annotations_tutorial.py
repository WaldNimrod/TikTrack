"""
Interactive Tutorial for Type Annotations
Run this file to learn about type annotations in TikTrack
"""

import sys
import os
from typing import Dict, Any, List, Optional, Tuple

def print_header(title: str) -> None:
    """Print a formatted header"""
    print("\n" + "="*50)
    print(f"🎯 {title}")
    print("="*50)

def print_section(title: str) -> None:
    """Print a formatted section"""
    print(f"\n📚 {title}")
    print("-" * 30)

def interactive_quiz() -> None:
    """Interactive quiz about type annotations"""
    print_header("Interactive Quiz - Type Annotations")
    
    questions = [
        {
            "question": "What's the correct type annotation for a function that returns a dictionary?",
            "options": [
                "def func() -> dict:",
                "def func() -> Dict[str, Any]:",
                "def func() -> {}:",
                "def func() -> Any:"
            ],
            "correct": 1,
            "explanation": "Use Dict[str, Any] for dictionaries with string keys and any values"
        },
        {
            "question": "What's the correct type annotation for an optional parameter?",
            "options": [
                "def func(param: str = None):",
                "def func(param: Optional[str] = None):",
                "def func(param: str | None = None):",
                "def func(param: str or None = None):"
            ],
            "correct": 1,
            "explanation": "Use Optional[str] for parameters that can be None"
        },
        {
            "question": "What's the correct type annotation for a database session parameter?",
            "options": [
                "def func(db: any):",
                "def func(db: Session):",
                "def func(db: sqlalchemy.orm.Session):",
                "def func(db: database):"
            ],
            "correct": 1,
            "explanation": "Use Session from sqlalchemy.orm for database sessions"
        }
    ]
    
    score = 0
    total = len(questions)
    
    for i, q in enumerate(questions, 1):
        print(f"\n❓ Question {i}: {q['question']}")
        for j, option in enumerate(q['options']):
            print(f"   {j+1}. {option}")
        
        while True:
            try:
                answer = int(input("\nYour answer (1-4): ")) - 1
                if 0 <= answer <= 3:
                    break
                print("Please enter a number between 1 and 4")
            except ValueError:
                print("Please enter a valid number")
        
        if answer == q['correct']:
            print("✅ Correct!")
            score += 1
        else:
            print(f"❌ Wrong! The correct answer is: {q['options'][q['correct']]}")
        
        print(f"💡 Explanation: {q['explanation']}")
    
    print(f"\n🎉 Quiz completed! Score: {score}/{total}")
    if score == total:
        print("🌟 Perfect! You're ready to write type annotations!")
    elif score >= total * 0.7:
        print("👍 Good job! Keep practicing!")
    else:
        print("📚 Review the guidelines and try again!")

def show_examples() -> None:
    """Show practical examples of type annotations"""
    print_header("Practical Examples")
    
    examples = [
        {
            "title": "Model Methods",
            "code": '''
def to_dict(self) -> Dict[str, Any]:
    """המרה למילון"""
    result: Dict[str, Any] = {}
    return result

def __repr__(self) -> str:
    """ייצוג מחרוזת"""
    return f"<{self.__class__.__name__}(id={self.id})>"
'''
        },
        {
            "title": "Service Methods",
            "code": '''
@staticmethod
def get_all(db: Session) -> List[Model]:
    """קבלת כל הרשומות"""
    return db.query(Model).all()

@staticmethod
def get_by_id(db: Session, item_id: int) -> Optional[Model]:
    """קבלת רשומה לפי מזהה"""
    return db.query(Model).filter(Model.id == item_id).first()

@staticmethod
def create(db: Session, data: Dict[str, Any]) -> Model:
    """יצירת רשומה חדשה"""
    item = Model(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
'''
        },
        {
            "title": "API Routes",
            "code": '''
def get_items() -> Any:
    """API endpoint לקבלת רשומות"""
    try:
        db: Session = next(get_db())
        items = Service.get_all(db)
        return jsonify({
            "status": "success",
            "data": [item.to_dict() for item in items],
            "message": "Items retrieved successfully",
            "version": "v1"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
'''
        },
        {
            "title": "Validation Functions",
            "code": '''
def validate_data(data: Dict[str, Any]) -> Tuple[bool, str]:
    """בדיקת תקינות נתונים"""
    errors: List[str] = []
    
    if not data.get('required_field'):
        errors.append("Required field is missing")
    
    if errors:
        return False, "; ".join(errors)
    
    return True, "Valid"
'''
        }
    ]
    
    for example in examples:
        print_section(example['title'])
        print(example['code'])

def show_common_mistakes() -> None:
    """Show common mistakes and how to fix them"""
    print_header("Common Mistakes & Fixes")
    
    mistakes = [
        {
            "mistake": "Missing return type annotation",
            "wrong": "def get_user(user_id):\n    return user",
            "correct": "def get_user(user_id: int) -> Optional[User]:\n    return user",
            "explanation": "Always specify what the function returns"
        },
        {
            "mistake": "Missing parameter type annotations",
            "wrong": "def process_data(data):\n    result = {}\n    return result",
            "correct": "def process_data(data: Dict[str, Any]) -> Dict[str, Any]:\n    result: Dict[str, Any] = {}\n    return result",
            "explanation": "Specify types for all parameters and variables"
        },
        {
            "mistake": "Wrong type for optional parameters",
            "wrong": "def func(param: str = None):",
            "correct": "def func(param: Optional[str] = None):",
            "explanation": "Use Optional[T] for parameters that can be None"
        },
        {
            "mistake": "Missing type for database session",
            "wrong": "def func(db):",
            "correct": "def func(db: Session):",
            "explanation": "Always type database sessions as Session"
        }
    ]
    
    for i, mistake in enumerate(mistakes, 1):
        print(f"\n❌ Mistake {i}: {mistake['mistake']}")
        print(f"Wrong:")
        print(f"   {mistake['wrong']}")
        print(f"Correct:")
        print(f"   {mistake['correct']}")
        print(f"💡 {mistake['explanation']}")

def show_tools() -> None:
    """Show available tools for type checking"""
    print_header("Available Tools")
    
    tools = [
        {
            "name": "Mypy",
            "command": "mypy Backend/",
            "description": "Static type checker for Python",
            "purpose": "Find type annotation issues"
        },
        {
            "name": "Pre-commit hooks",
            "command": "pre-commit run --all-files",
            "description": "Automated checks before commit",
            "purpose": "Prevent commits with type issues"
        },
        {
            "name": "VS Code extensions",
            "command": "Auto-installed with setup",
            "description": "Real-time type checking in IDE",
            "purpose": "See issues while coding"
        },
        {
            "name": "Type annotation checker",
            "command": "python Backend/utils/type_checker.py",
            "description": "Custom utility for TikTrack",
            "purpose": "Find missing annotations with suggestions"
        }
    ]
    
    for tool in tools:
        print(f"\n🔧 {tool['name']}")
        print(f"   Command: {tool['command']}")
        print(f"   Description: {tool['description']}")
        print(f"   Purpose: {tool['purpose']}")

def main() -> None:
    """Main tutorial function"""
    print_header("TikTrack Type Annotations Tutorial")
    
    print("Welcome to the Type Annotations Tutorial!")
    print("This tutorial will help you understand how to write proper type annotations.")
    
    while True:
        print("\n📋 Choose an option:")
        print("1. 📚 Show examples")
        print("2. ❌ Show common mistakes")
        print("3. 🛠️ Show available tools")
        print("4. 🎯 Take interactive quiz")
        print("5. 🚪 Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == "1":
            show_examples()
        elif choice == "2":
            show_common_mistakes()
        elif choice == "3":
            show_tools()
        elif choice == "4":
            interactive_quiz()
        elif choice == "5":
            print("\n👋 Thanks for using the tutorial!")
            print("Remember: Always add type annotations to your functions!")
            break
        else:
            print("Please enter a valid choice (1-5)")

if __name__ == "__main__":
    main()
