"""
Gate Router — maps gates to engines and team IDs.
"""

from ..config import TEAM_ENGINE_MAP


GATE_TEAM_MAP = {
    "GATE_0": "team_190",
    "GATE_1_PRODUCE": "team_170",
    "GATE_1_VALIDATE": "team_190",
    "GATE_2": "team_100",
    "GATE_3_PLAN": "team_10",
    "GATE_3_G35": "team_90",
    "GATE_3_MANDATES": "team_10",
    "GATE_4": "team_10",      # Gate owner=Team 10 per Protocol v2.3.0; Team 50 executes QA
    "GATE_5": "team_90",
    "GATE_6": "team_90",      # Gate owner=Team 90 per Protocol v2.3.0; Team 100 approval authority
    "GATE_7": "team_90",      # Gate owner=Team 90 per Protocol v2.3.0; Team 00 human authority
    "GATE_8_DOCS": "team_70",
    "GATE_8_VALIDATE": "team_90",
}


def get_engine_for_gate(gate_key: str) -> str:
    team_id = GATE_TEAM_MAP.get(gate_key, "team_10")
    return TEAM_ENGINE_MAP.get(team_id, "gemini")


def get_team_for_gate(gate_key: str) -> str:
    return GATE_TEAM_MAP.get(gate_key, "team_10")
