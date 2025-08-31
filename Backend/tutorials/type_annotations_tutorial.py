"""
Interactive Tutorial for Type Annotations
Run this file to learn about type annotations in TikTrack
"""

import sys
import os
from typing import Dict, Any, List, Optional, Tuple

def print_header(title: str) -> None:
    """Print a formatted header"""

def print_section(title: str) -> None:
    """Print a formatted section"""

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
        for j, option in enumerate(q['options']):
        
        while True:
            try:
                answer = int(input("\nYour answer (1-4): ")) - 1
                if 0 <= answer <= 3:
                    break
            except ValueError:
        
        if answer == q['correct']:
            score += 1
        else:
        
    
    if score == total:
    elif score >= total * 0.7:
    else:

def show_examples() -> None:
    """Show practical examples of type annotations"""
    print_header("Practical Examples")
    
    examples = [
        {
            "title": "Model Methods",
            "code": '''
def to_dict(self) -> Dict[str, Any]:
    """Convert to dictionary"""
    result: Dict[str, Any] = {}
    return result

def __repr__(self) -> str:
    """String representation"""
    return f"<{self.__class__.__name__}(id={self.id})>"
'''
        },
        {
            "title": "Service Methods",
            "code": '''
@staticmethod
def get_all(db: Session) -> List[Model]:
    """Get all records"""
    return db.query(Model).all()

@staticmethod
def get_by_id(db: Session, item_id: int) -> Optional[Model]:
    """Get record by ID"""
    return db.query(Model).filter(Model.id == item_id).first()

@staticmethod
def create(db: Session, data: Dict[str, Any]) -> Model:
    """Create new record"""
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
    """API endpoint for getting records"""
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
    """Validate data"""
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

def main() -> None:
    """Main tutorial function"""
    print_header("TikTrack Type Annotations Tutorial")
    
    
    while True:
        
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
            break
        else:

if __name__ == "__main__":
    main()
