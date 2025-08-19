"""
Type annotation checker utility
Provides helpful suggestions for missing type annotations
"""

import ast
import os
from typing import List, Dict, Any, Tuple, Optional
from pathlib import Path

class TypeAnnotationChecker:
    """Utility class for checking type annotations in Python files"""
    
    def __init__(self, backend_path: str = "Backend"):
        self.backend_path = Path(backend_path)
        self.issues: List[Dict[str, Any]] = []
    
    def check_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """Check a single Python file for missing type annotations"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            issues = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    issue = self._check_function(node, file_path)
                    if issue:
                        issues.append(issue)
            
            return issues
        except Exception as e:
            return [{
                'file': str(file_path),
                'line': 0,
                'type': 'parse_error',
                'message': f'Could not parse file: {str(e)}',
                'suggestion': 'Check file syntax'
            }]
    
    def _check_function(self, node: ast.FunctionDef, file_path: Path) -> Dict[str, Any]:
        """Check if a function has proper type annotations"""
        # Skip if it's a method in a class (has self parameter)
        if node.args.args and node.args.args[0].arg == 'self':
            return self._check_method(node, file_path)
        
        # Check for missing return type annotation
        if not node.returns:
            return {
                'file': str(file_path),
                'line': node.lineno,
                'type': 'missing_return_type',
                'function': node.name,
                'message': f'Function "{node.name}" missing return type annotation',
                'suggestion': self._get_return_type_suggestion(node),
                'template': self._get_function_template(node)
            }
        
        # Check for missing parameter type annotations
        missing_params = []
        for arg in node.args.args:
            if not arg.annotation:
                missing_params.append(arg.arg)
        
        if missing_params:
            return {
                'file': str(file_path),
                'line': node.lineno,
                'type': 'missing_param_types',
                'function': node.name,
                'message': f'Function "{node.name}" missing type annotations for parameters: {", ".join(missing_params)}',
                'suggestion': self._get_param_type_suggestion(node, missing_params),
                'template': self._get_function_template(node)
            }
        
        return None
    
    def _check_method(self, node: ast.FunctionDef, file_path: Path) -> Dict[str, Any]:
        """Check if a method has proper type annotations"""
        # Skip __init__ and other special methods
        if node.name.startswith('__'):
            return None
        
        # Check for missing return type annotation
        if not node.returns:
            return {
                'file': str(file_path),
                'line': node.lineno,
                'type': 'missing_return_type',
                'function': f'method {node.name}',
                'message': f'Method "{node.name}" missing return type annotation',
                'suggestion': self._get_method_return_suggestion(node),
                'template': self._get_method_template(node)
            }
        
        return None
    
    def _get_return_type_suggestion(self, node: ast.FunctionDef) -> str:
        """Get suggestion for return type based on function name"""
        name = node.name.lower()
        
        if 'get' in name or 'fetch' in name or 'retrieve' in name:
            if 'all' in name or 'list' in name:
                return 'List[Model]'
            else:
                return 'Optional[Model]'
        elif 'create' in name or 'add' in name:
            return 'Model'
        elif 'update' in name or 'modify' in name:
            return 'Optional[Model]'
        elif 'delete' in name or 'remove' in name:
            return 'bool'
        elif 'validate' in name:
            return 'Tuple[bool, str]'
        elif 'to_dict' in name:
            return 'Dict[str, Any]'
        elif 'is_' in name or 'has_' in name:
            return 'bool'
        else:
            return 'Any'
    
    def _get_method_return_suggestion(self, node: ast.FunctionDef) -> str:
        """Get suggestion for method return type"""
        name = node.name.lower()
        
        if name == 'to_dict':
            return 'Dict[str, Any]'
        elif name == '__repr__':
            return 'str'
        elif name.startswith('is_') or name.startswith('has_'):
            return 'bool'
        else:
            return 'Any'
    
    def _get_param_type_suggestion(self, node: ast.FunctionDef, missing_params: List[str]) -> str:
        """Get suggestion for parameter types"""
        suggestions = []
        
        for param in missing_params:
            if param in ['db', 'session']:
                suggestions.append(f'{param}: Session')
            elif param in ['data', 'kwargs']:
                suggestions.append(f'{param}: Dict[str, Any]')
            elif param.endswith('_id') or param in ['id', 'user_id', 'item_id']:
                suggestions.append(f'{param}: int')
            elif param in ['name', 'title', 'description', 'content']:
                suggestions.append(f'{param}: str')
            elif param in ['amount', 'price', 'quantity']:
                suggestions.append(f'{param}: float')
            elif param in ['is_active', 'enabled', 'visible']:
                suggestions.append(f'{param}: bool')
            else:
                suggestions.append(f'{param}: Any')
        
        return ', '.join(suggestions)
    
    def _get_function_template(self, node: ast.FunctionDef) -> str:
        """Get template for function based on its type"""
        name = node.name.lower()
        
        if 'get' in name:
            return """
@staticmethod
def get_by_id(db: Session, item_id: int) -> Optional[Model]:
    \"\"\"קבלת רשומה לפי מזהה\"\"\"
    return db.query(Model).filter(Model.id == item_id).first()
"""
        elif 'create' in name:
            return """
@staticmethod
def create(db: Session, data: Dict[str, Any]) -> Model:
    \"\"\"יצירת רשומה חדשה\"\"\"
    item = Model(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
"""
        elif 'validate' in name:
            return """
def validate_data(data: Dict[str, Any]) -> Tuple[bool, str]:
    \"\"\"בדיקת תקינות נתונים\"\"\"
    errors: List[str] = []
    
    if not data.get('required_field'):
        errors.append("Required field is missing")
    
    if errors:
        return False, "; ".join(errors)
    
    return True, "Valid"
"""
        else:
            return """
def function_name(param1: str, param2: Optional[int] = None) -> Dict[str, Any]:
    \"\"\"תיאור הפונקציה\"\"\"
    result: Dict[str, Any] = {}
    return result
"""
    
    def _get_method_template(self, node: ast.FunctionDef) -> str:
        """Get template for method"""
        name = node.name.lower()
        
        if name == 'to_dict':
            return """
def to_dict(self) -> Dict[str, Any]:
    \"\"\"המרה למילון\"\"\"
    result: Dict[str, Any] = {}
    for c in self.__table__.columns:
        value = getattr(self, c.name)
        if hasattr(value, 'strftime'):
            result[c.name] = value.strftime('%Y-%m-%d %H:%M:%S') if value else None
        else:
            result[c.name] = value
    return result
"""
        elif name == '__repr__':
            return """
def __repr__(self) -> str:
    \"\"\"ייצוג מחרוזת\"\"\"
    return f"<{self.__class__.__name__}(id={self.id})>"
"""
        else:
            return """
def method_name(self, param: str) -> Any:
    \"\"\"תיאור המתודה\"\"\"
    result: Any = None
    return result
"""
    
    def check_all_files(self) -> List[Dict[str, Any]]:
        """Check all Python files in the backend directory"""
        all_issues = []
        
        for file_path in self.backend_path.rglob("*.py"):
            # Skip __init__.py and template files
            if file_path.name == "__init__.py" or "templates" in str(file_path):
                continue
            
            issues = self.check_file(file_path)
            all_issues.extend(issues)
        
        return all_issues
    
    def generate_report(self) -> str:
        """Generate a comprehensive report of type annotation issues"""
        issues = self.check_all_files()
        
        if not issues:
            return "✅ No type annotation issues found!"
        
        report = f"🔍 Found {len(issues)} type annotation issues:\n\n"
        
        for issue in issues:
            report += f"📁 {issue['file']}:{issue['line']}\n"
            report += f"   {issue['message']}\n"
            report += f"   💡 Suggestion: {issue['suggestion']}\n"
            report += f"   📝 Template:\n{issue['template']}\n"
            report += "-" * 50 + "\n"
        
        return report

def main():
    """Main function to run type annotation checker"""
    checker = TypeAnnotationChecker()
    report = checker.generate_report()
    print(report)

if __name__ == "__main__":
    main()
