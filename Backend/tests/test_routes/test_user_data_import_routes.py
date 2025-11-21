#!/usr/bin/env python3
"""
User Data Import Routes - API Tests
===================================

Ensures orchestrator endpoints propagate real results/errors without fallbacks.
"""

import os
import sys

import pytest
from flask import Flask

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from routes.api.user_data_import import user_data_import_bp


class _DummySession:
    def commit(self):
        return None

    def rollback(self):
        return None

    def close(self):
        return None


@pytest.fixture(autouse=True)
def fake_db_session(monkeypatch):
    dummy = _DummySession()

    def generator():
        yield dummy

    monkeypatch.setattr('routes.api.user_data_import.get_db', lambda: generator())


@pytest.fixture
def client():
    app = Flask(__name__)
    app.config.update(TESTING=True)
    app.register_blueprint(user_data_import_bp)
    return app.test_client()


def test_link_trading_account_success(client, monkeypatch):
    captured = {}

    class DummyOrchestrator:
        def __init__(self, db):
            self.db = db

        def link_trading_account_to_file(self, session_id, override_account_number, **kwargs):
            captured.update({
                'session': session_id,
                'account': override_account_number,
                **kwargs
            })
            return {'success': True, 'linked': True}

    monkeypatch.setattr('routes.api.user_data_import.ImportOrchestrator', DummyOrchestrator)

    response = client.post('/api/user-data-import/session/7/link-account', json={
        'account_number': 'U123456',
        'trading_account_id': 3,
        'confirm_overwrite': True
    })

    assert response.status_code == 200
    assert response.get_json()['linked'] is True
    assert captured['session'] == 7
    assert captured['account'] == 'U123456'
    assert captured['target_trading_account_id'] == 3
    assert captured['confirm_overwrite'] is True


def test_link_trading_account_handles_exception(client, monkeypatch):
    class ExplodingOrchestrator:
        def __init__(self, db):
            self.db = db

        def link_trading_account_to_file(self, *args, **kwargs):
            raise RuntimeError('boom')

    monkeypatch.setattr('routes.api.user_data_import.ImportOrchestrator', ExplodingOrchestrator)

    response = client.post('/api/user-data-import/session/8/link-account', json={})
    assert response.status_code == 500
    assert response.get_json()['success'] is False


def test_account_link_status_propagates_payload(client, monkeypatch):
    class DummyOrchestrator:
        def __init__(self, db):
            self.db = db

        def get_account_link_status(self, session_id):
            return {'success': False, 'error': 'link missing'}

    monkeypatch.setattr('routes.api.user_data_import.ImportOrchestrator', DummyOrchestrator)

    response = client.get('/api/user-data-import/session/5/account-link/status')
    assert response.status_code == 400
    assert response.get_json()['error'] == 'link missing'


def test_preview_generation_success(client, monkeypatch):
    class DummyOrchestrator:
        def __init__(self, db):
            self.db = db

        def generate_preview(self, session_id, task_type=None):
            return {'success': True, 'preview_data': {'rows': [1, 2]}}

    class DummyNormalizer:
        def normalize_output(self, payload):
            return payload

    monkeypatch.setattr('routes.api.user_data_import.ImportOrchestrator', DummyOrchestrator)
    monkeypatch.setattr('routes.api.user_data_import._get_date_normalizer', lambda: DummyNormalizer())

    response = client.get('/api/user-data-import/session/11/preview?task_type=executions')
    assert response.status_code == 200
    assert response.get_json()['preview_data']['rows'] == [1, 2]


def test_accept_duplicate_validates_payload(client):
    response = client.post('/api/user-data-import/session/4/accept-duplicate', json={})
    assert response.status_code == 400
    assert response.get_json()['success'] is False


def test_accept_duplicate_calls_orchestrator(client, monkeypatch):
    class DummyOrchestrator:
        def __init__(self, db):
            self.db = db

        def accept_duplicate(self, session_id, record_index, duplicate_type):
            return {'success': True, 'record_index': record_index}

    monkeypatch.setattr('routes.api.user_data_import.ImportOrchestrator', DummyOrchestrator)

    response = client.post('/api/user-data-import/session/4/accept-duplicate', json={
        'record_index': 2,
        'duplicate_type': 'within_file'
    })
    assert response.status_code == 200
    assert response.get_json()['success'] is True


def test_get_active_session_handles_empty(client, monkeypatch):
    class DummyManager:
        def __init__(self, db):
            self.db = db

        def get_latest_active_session(self, statuses):
            return None

    monkeypatch.setattr('routes.api.user_data_import.ImportSessionManager', DummyManager)

    response = client.get('/api/user-data-import/sessions/active')
    assert response.status_code == 200
    assert response.get_json()['session'] is None

#!/usr/bin/env python3
"""
User Data Import Routes - API Tests
===================================

Focuses on the orchestration endpoints to ensure they respect the fallback
policy (no dummy payloads) and propagate orchestration outcomes properly.
"""

import os
import sys

import pytest
from flask import Flask

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from routes.api.user_data_import import user_data_import_bp


class _DummySession:
    def commit(self):
        return None

    def rollback(self):
        return None

    def close(self):
        return None


@pytest.fixture(autouse=True)
def fake_db_session(monkeypatch):
    dummy = _DummySession()

    def generator():
        yield dummy

    monkeypatch.setattr('routes.api.user_data_import.get_db', lambda: generator())


@pytest.fixture
def client():
    app = Flask(__name__)
    app.config.update(TESTING=True)
    app.register_blueprint(user_data_import_bp)
    return app.test_client()


def test_link_trading_account_success(client, monkeypatch):
    captured = {}

    class DummyOrchestrator:
        def __init__(self, db):
            self.db = db

        def link_trading_account_to_file(self, session_id, override_account_number, **kwargs):
            captured.update({
                'session': session_id,
                'account': override_account_number,
                **kwargs
            })
            return {'success': True, 'linked': True}

    monkeypatch.setattr('routes.api.user_data_import.ImportOrchestrator', DummyOrchestrator)

    response = client.post('/api/user-data-import/session/7/link-account', json={
        'account_number': 'U123456',
        'trading_account_id': 3,
        'confirm_overwrite': True
    })

    assert response.status_code == 200
    assert response.get_json()['linked'] is True
    assert captured['session'] == 7
    assert captured['account'] == 'U123456'
    assert captured['target_trading_account_id'] == 3
    assert captured['confirm_overwrite'] is True


def test_link_trading_account_handles_exception(client, monkeypatch):
    class ExplodingOrchestrator:
        def __init__(self, db):
            self.db = db

        def link_trading_account_to_file(self, *args, **kwargs):
            raise RuntimeError('boom')

    monkeypatch.setattr('routes.api.user_data_import.ImportOrchestrator', ExplodingOrchestrator)

    response = client.post('/api/user-data-import/session/8/link-account', json={})
    assert response.status_code == 500
    assert response.get_json()['success'] is False


def test_account_link_status_propagates_payload(client, monkeypatch):
    class DummyOrchestrator:
        def __init__(self, db):
            self.db = db

        def get_account_link_status(self, session_id):
            return {'success': False, 'error': 'link missing'}

    monkeypatch.setattr('routes.api.user_data_import.ImportOrchestrator', DummyOrchestrator)

    response = client.get('/api/user-data-import/session/5/account-link/status')
    assert response.status_code == 400
    assert response.get_json()['error'] == 'link missing'


def test_preview_generation_success(client, monkeypatch):
    class DummyOrchestrator:
        def __init__(self, db):
            self.db = db

        def generate_preview(self, session_id, task_type=None):
            return {'success': True, 'preview_data': {'rows': [1, 2]}}

    class DummyNormalizer:
        def normalize_output(self, payload):
            return payload

    monkeypatch.setattr('routes.api.user_data_import.ImportOrchestrator', DummyOrchestrator)
    monkeypatch.setattr('routes.api.user_data_import._get_date_normalizer', lambda: DummyNormalizer())

    response = client.get('/api/user-data-import/session/11/preview?task_type=executions')
    assert response.status_code == 200
    assert response.get_json()['preview_data']['rows'] == [1, 2]


def test_accept_duplicate_validates_payload(client):
    response = client.post('/api/user-data-import/session/4/accept-duplicate', json={})
    assert response.status_code == 400
    assert response.get_json()['success'] is False


def test_accept_duplicate_calls_orchestrator(client, monkeypatch):
    class DummyOrchestrator:
        def __init__(self, db):
            self.db = db

        def accept_duplicate(self, session_id, record_index, duplicate_type):
            return {'success': True, 'record_index': record_index}

    monkeypatch.setattr('routes.api.user_data_import.ImportOrchestrator', DummyOrchestrator)

    response = client.post('/api/user-data-import/session/4/accept-duplicate', json={
        'record_index': 2,
        'duplicate_type': 'within_file'
    })
    assert response.status_code == 200
    assert response.get_json()['success'] is True


def test_get_active_session_handles_empty(client, monkeypatch):
    class DummySession:
        def to_dict(self):
            return {'id': 1, 'status': 'ready'}

        def get_summary_stats(self):
            return {'records': 10}

    class DummyManager:
        def __init__(self, db):
            self.db = db

        def get_latest_active_session(self, statuses):
            return None

    monkeypatch.setattr('routes.api.user_data_import.ImportSessionManager', DummyManager)

    response = client.get('/api/user-data-import/sessions/active')
    assert response.status_code == 200
    assert response.get_json()['session'] is None


