#!/usr/bin/env python3
"""
Verify runtime import paths to ensure code loads from TikTrackApp, not TikTrackApp-Production.
"""

import os
import sys
import importlib.util
from pathlib import Path


def _find_spec_path(module_name: str) -> str:
    spec = importlib.util.find_spec(module_name)
    if spec and spec.origin:
        return spec.origin
    return "NOT FOUND"


def main() -> None:
    cwd = Path.cwd()
    pythonpath = os.environ.get("PYTHONPATH", "")
    print("CWD:", cwd)
    print("PYTHONPATH:", pythonpath or "(empty)")
    print("sys.path[0:5]:", sys.path[:5])

    backend_path = _find_spec_path("Backend")
    models_path = _find_spec_path("models")
    print("Backend module path:", backend_path)
    print("models module path:", models_path)

    flags = []
    for label, path in (("Backend", backend_path), ("models", models_path)):
        if "TikTrackApp-Production" in path:
            flags.append(f"{label} resolves to TikTrackApp-Production")
        if "TikTrackApp" in path and "TikTrackApp-Production" not in path:
            flags.append(f"{label} resolves to TikTrackApp (OK)")

    if "TikTrackApp-Production" in pythonpath:
        flags.append("PYTHONPATH includes TikTrackApp-Production")

    if flags:
        print("Checks:")
        for item in flags:
            print("-", item)
    else:
        print("Checks: no module resolution info available (inspect sys.path)")

    print("Tip: run from /Users/nimrod/Documents/TikTrack/TikTrackApp")


if __name__ == "__main__":
    main()
