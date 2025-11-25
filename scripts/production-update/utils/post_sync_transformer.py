#!/usr/bin/env python3
"""
Post-Sync Transformer
=====================

Automatically fixes production-specific files after sync.
Handles config files, imports, file generation, and DB protection.
"""

import re
import shutil
import sys
from pathlib import Path
from typing import Dict, List, Optional

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Import logger - handle both possible paths
try:
    from logger import get_logger
except ImportError:
    # Fallback for direct execution
    import sys
    sys.path.insert(0, str(Path(__file__).parent))
    from logger import get_logger


class ConfigTransformer:
    """Transforms config files for production"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.production_config = project_root / "production" / "Backend" / "config" / "settings.py"
        self.logger = get_logger()
    
    def transform(self) -> bool:
        """Transform settings.py for production"""
        if not self.production_config.exists():
            self.logger.warning(f"  ⚠️  Config file not found: {self.production_config}")
            return False
        
        try:
            with open(self.production_config, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # Transform ENVIRONMENT
            content = re.sub(
                r"ENVIRONMENT\s*=\s*os\.getenv\(['\"]TIKTRACK_ENV['\"],\s*['\"]development['\"]\)\.lower\(\)",
                "ENVIRONMENT = 'production'  # Hardcoded for production environment",
                content
            )
            
            # Transform IS_PRODUCTION
            content = re.sub(
                r"IS_PRODUCTION\s*=\s*ENVIRONMENT\s*==\s*['\"]production['\"]",
                "IS_PRODUCTION = True  # Hardcoded for production environment",
                content
            )
            
            # Transform PORT
            content = re.sub(
                r"if IS_PRODUCTION:\s*PORT\s*=\s*5001.*?else:\s*PORT\s*=\s*8080",
                "PORT = 5001  # Production port (hardcoded)",
                content,
                flags=re.DOTALL
            )
            
            # Transform DEVELOPMENT_MODE and CACHE_DISABLED
            content = re.sub(
                r"if IS_PRODUCTION:\s*# Production mode settings\s*DEVELOPMENT_MODE\s*=\s*False\s*CACHE_DISABLED\s*=\s*False.*?else:.*?DEVELOPMENT_MODE\s*=\s*os\.getenv.*?CACHE_DISABLED\s*=\s*os\.getenv.*?",
                "# Development/Production settings - HARDCODED FOR PRODUCTION\nDEVELOPMENT_MODE = False  # Hardcoded for production\nCACHE_DISABLED = False  # Cache enabled in production for performance (hardcoded)",
                content,
                flags=re.DOTALL
            )
            
            # Only write if changed
            if content != original_content:
                with open(self.production_config, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.logger.info("  ✅ Config file transformed for production")
                return True
            else:
                self.logger.info("  ✅ Config file already correct")
                return True
                
        except Exception as e:
            self.logger.error(f"  ❌ Error transforming config: {e}")
            return False


class ImportTransformer:
    """Fixes import statements in production files"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.production_routes_init = project_root / "production" / "Backend" / "routes" / "api" / "__init__.py"
        self.production_trading_methods = project_root / "production" / "Backend" / "routes" / "api" / "trading_methods.py"
        self.logger = get_logger()
    
    def transform(self) -> bool:
        """Fix import statements"""
        success = True
        
        # Fix __init__.py - add quality_lint_bp
        if self.production_routes_init.exists():
            success &= self._fix_routes_init()
        
        # Fix trading_methods.py - add fallback import
        if self.production_trading_methods.exists():
            success &= self._fix_trading_methods()
        
        return success
    
    def _fix_routes_init(self) -> bool:
        """Add quality_lint_bp to routes/api/__init__.py"""
        try:
            with open(self.production_routes_init, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if already has quality_lint_bp
            if 'quality_lint_bp' in content:
                self.logger.info("  ✅ quality_lint_bp already in __init__.py")
                return True
            
            # Add import after quality_check_bp
            if 'from .quality_check import bp as quality_check_bp' in content:
                content = content.replace(
                    'from .quality_check import bp as quality_check_bp',
                    'from .quality_check import bp as quality_check_bp\nfrom .quality_lint import bp as quality_lint_bp'
                )
                
                # Add to __all__ list
                if "'quality_check_bp'" in content:
                    content = content.replace(
                        "'quality_check_bp',",
                        "'quality_check_bp',\n    'quality_lint_bp',"
                    )
                
                with open(self.production_routes_init, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.logger.info("  ✅ Added quality_lint_bp to __init__.py")
                return True
            else:
                self.logger.warning("  ⚠️  Could not find quality_check_bp import")
                return False
                
        except Exception as e:
            self.logger.error(f"  ❌ Error fixing __init__.py: {e}")
            return False
    
    def _fix_trading_methods(self) -> bool:
        """Fix trading_methods.py import with fallback"""
        try:
            with open(self.production_trading_methods, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if already has fallback
            if 'try:' in content and 'from services.trading_methods_seed_data import METHODS_DEFINITION' in content:
                self.logger.info("  ✅ trading_methods.py already has fallback import")
                return True
            
            # Replace direct import with fallback
            old_import = "from migrations.seed_conditions_master_data import METHODS_DEFINITION"
            new_import = """try:
    from services.trading_methods_seed_data import METHODS_DEFINITION
except ImportError:
    # Fallback for development environment
    from migrations.seed_conditions_master_data import METHODS_DEFINITION"""
            
            if old_import in content:
                content = content.replace(old_import, new_import)
                
                with open(self.production_trading_methods, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.logger.info("  ✅ Fixed trading_methods.py import with fallback")
                return True
            else:
                self.logger.info("  ✅ trading_methods.py import already correct")
                return True
                
        except Exception as e:
            self.logger.error(f"  ❌ Error fixing trading_methods.py: {e}")
            return False


class FileGenerator:
    """Generates missing files in production"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.logger = get_logger()
    
    def generate(self) -> bool:
        """Generate missing files"""
        success = True
        
        # Generate trading_methods_seed_data.py
        success &= self._generate_trading_methods_seed_data()
        
        return success
    
    def _generate_trading_methods_seed_data(self) -> bool:
        """Generate trading_methods_seed_data.py from migrations"""
        try:
            source_file = self.project_root / "Backend" / "migrations" / "seed_conditions_master_data.py"
            target_file = self.project_root / "production" / "Backend" / "services" / "trading_methods_seed_data.py"
            
            if not source_file.exists():
                self.logger.warning(f"  ⚠️  Source file not found: {source_file}")
                return False
            
            # Check if target already exists and is up to date
            if target_file.exists():
                # Compare modification times
                if target_file.stat().st_mtime >= source_file.stat().st_mtime:
                    self.logger.info("  ✅ trading_methods_seed_data.py already up to date")
                    return True
            
            # Import the source file as a module to extract METHODS_DEFINITION
            import importlib.util
            spec = importlib.util.spec_from_file_location("seed_conditions_master_data", source_file)
            if spec is None or spec.loader is None:
                self.logger.error("  ❌ Could not load source file as module")
                return False
            
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            if not hasattr(module, 'METHODS_DEFINITION'):
                self.logger.error("  ❌ METHODS_DEFINITION not found in source file")
                return False
            
            methods_def = module.METHODS_DEFINITION
            
            # Create target directory if needed
            target_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Write new file with proper JSON formatting
            import json
            new_content = '''"""
Trading Methods Seed Data
=========================
Seed data for trading methods - extracted from migrations for production use.
This file contains METHODS_DEFINITION that is used by trading_methods API.
"""

import json

METHODS_DEFINITION = ''' + json.dumps(methods_def, indent=4, ensure_ascii=False) + '\n'
            
            with open(target_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            self.logger.info("  ✅ Generated trading_methods_seed_data.py")
            return True
            
        except Exception as e:
            self.logger.error(f"  ❌ Error generating trading_methods_seed_data.py: {e}")
            return False


class DBProtector:
    """Protects DB from being deleted during sync"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        # Note: System uses PostgreSQL only - no file-based database paths
        # These paths are kept for backward compatibility but are not used
        self.production_db = None  # PostgreSQL only - no file path
        self.backup_db = None  # PostgreSQL only - no file path
        self.logger = get_logger()
    
    def backup(self) -> bool:
        """Backup DB before sync (PostgreSQL - handled by backup step)"""
        # PostgreSQL backups are handled by step 04_backup_database.py
        self.logger.info("  ℹ️  PostgreSQL backup handled by backup step")
        return True
    
    def restore(self) -> bool:
        """Restore DB after sync (PostgreSQL - handled by backup step)"""
        # PostgreSQL restores are handled by backup/restore scripts
        self.logger.info("  ℹ️  PostgreSQL restore handled by backup/restore scripts")
        return True
            
            if source_db:
                shutil.copy2(source_db, self.production_db)
                self.logger.info("  ✅ DB restored/copied successfully")
                
                # Remove backup if used
                if self.backup_db.exists():
                    self.backup_db.unlink()
                
                return True
            else:
                self.logger.warning("  ⚠️  No source DB found - server may fail to start")
                self.logger.warning("  ⚠️  Run: cd production/Backend && python3 scripts/create_production_db.py")
                return False
        except Exception as e:
            self.logger.error(f"  ❌ Error restoring DB: {e}")
            return False


class PostSyncTransformer:
    """Main transformer orchestrator"""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.config_transformer = ConfigTransformer(project_root)
        self.import_transformer = ImportTransformer(project_root)
        self.file_generator = FileGenerator(project_root)
        self.db_protector = DBProtector(project_root)
        self.logger = get_logger()
    
    def transform(self, backup_db: bool = True, restore_db: bool = True) -> Dict[str, bool]:
        """
        Run all transformations
        
        Args:
            backup_db: Whether to backup DB before transformations
            restore_db: Whether to restore DB after transformations
        
        Returns:
            Dict with results for each transformer
        """
        results = {}
        
        self.logger.info("  🔄 Running post-sync transformations...")
        
        # Backup DB if needed
        if backup_db:
            results['db_backup'] = self.db_protector.backup()
        
        # Run transformations
        results['config'] = self.config_transformer.transform()
        results['imports'] = self.import_transformer.transform()
        results['files'] = self.file_generator.generate()
        
        # Restore DB if needed
        if restore_db:
            results['db_restore'] = self.db_protector.restore()
        
        # Summary
        all_success = all(results.values())
        if all_success:
            self.logger.info("  ✅ All post-sync transformations completed successfully")
        else:
            failed = [k for k, v in results.items() if not v]
            self.logger.warning(f"  ⚠️  Some transformations failed: {', '.join(failed)}")
        
        return results


def run_transformations(project_root: Optional[Path] = None, 
                       backup_db: bool = True, 
                       restore_db: bool = True) -> Dict[str, bool]:
    """
    Main entry point for running transformations
    
    Args:
        project_root: Project root path (defaults to auto-detect)
        backup_db: Whether to backup DB
        restore_db: Whether to restore DB
    
    Returns:
        Dict with results for each transformation
    """
    if project_root is None:
        project_root = Path(__file__).parent.parent.parent.parent
    
    transformer = PostSyncTransformer(project_root)
    results = transformer.transform(backup_db=backup_db, restore_db=restore_db)
    
    return results


if __name__ == '__main__':
    success = run_transformations()
    sys.exit(0 if success else 1)

