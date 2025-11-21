from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Dict, Iterable, Optional


@dataclass(frozen=True)
class PreferenceDefinition:
    name: str
    group: str
    value_type: str  # 'string' | 'number' | 'boolean' | 'json'
    default: Any
    required: bool = False
    allowed_values: Optional[Iterable[Any]] = None
    validate: Optional[Callable[[Any], None]] = None
    alias_of: Optional[str] = None  # migration alias - points to canonical name


class PreferencesRegistry:
    """
    Central registry for preferences metadata.
    Only minimal seed is defined here; full list should be enriched progressively.
    """

    def __init__(self) -> None:
        self._by_name: Dict[str, PreferenceDefinition] = {}
        self._by_group: Dict[str, Dict[str, PreferenceDefinition]] = {}
        self._version: int = 1
        self._seed()

    def _seed(self) -> None:
        # Core UI group examples
        self.register(
            PreferenceDefinition(
                name="ui.page_size",
                group="ui",
                value_type="number",
                default=25,
                required=True,
            )
        )
        self.register(
            PreferenceDefinition(
                name="ui.theme",
                group="ui",
                value_type="string",
                default="light",
                required=True,
                allowed_values=("light", "dark"),
            )
        )
        # Trading group skeleton examples
        self.register(
            PreferenceDefinition(
                name="trading.default_account",
                group="trading",
                value_type="string",
                default="",
                required=False,
            )
        )
        # Colors group example
        self.register(
            PreferenceDefinition(
                name="colors.primary",
                group="colors",
                value_type="string",
                default="#26baac",
                required=True,
            )
        )

    @property
    def version(self) -> int:
        return self._version

    def register(self, definition: PreferenceDefinition) -> None:
        self._by_name[definition.name] = definition
        group_map = self._by_group.setdefault(definition.group, {})
        group_map[definition.name] = definition

    def get(self, name: str) -> Optional[PreferenceDefinition]:
        return self._by_name.get(name)

    def get_group(self, group: str) -> Dict[str, PreferenceDefinition]:
        return self._by_group.get(group, {})

    def validate_value(self, name: str, value: Any) -> None:
        definition = self.get(name)
        if not definition:
            return
        # type check (lenient; DB remains source of truth)
        if definition.value_type == "number" and not isinstance(value, (int, float)):
            raise ValueError(f"Preference '{name}' expects number")
        if definition.value_type == "boolean" and not isinstance(value, bool):
            raise ValueError(f"Preference '{name}' expects boolean")
        if definition.value_type == "string" and not isinstance(value, str):
            raise ValueError(f"Preference '{name}' expects string")
        if definition.allowed_values is not None and value not in definition.allowed_values:
            raise ValueError(f"Preference '{name}' value '{value}' not in allowed set")
        if definition.validate:
            definition.validate(value)


# Singleton registry instance for service usage
REGISTRY = PreferencesRegistry()



