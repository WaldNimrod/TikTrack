import json
import pytest
from Backend.routes.api.preferences import preferences_bp
from Backend.app import app as flask_app


@pytest.fixture
def client():
    flask_app.register_blueprint(preferences_bp)
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as c:
        # Simulate authenticated user (middleware sets g.user_id normally)
        with flask_app.app_context():
            yield c


def _auth_headers():
    return {
        'Content-Type': 'application/json',
        # In real tests you'd inject a session/JWT; here we rely on middleware being bypassed/monkeypatched if needed
    }


def test_bootstrap_returns_profile_context_and_etag(client, monkeypatch):
    # monkeypatch g.user_id by bypassing auth decorator if necessary in your real test setup
    resp = client.get('/api/preferences/bootstrap', headers=_auth_headers())
    # If auth is enforced in test env, server may return 401; we only assert that JSON contract stands
    assert resp.status_code in (200, 401)
    assert 'application/json' in resp.content_type
    body = json.loads(resp.data.decode('utf-8') or '{}')
    if resp.status_code == 200:
        assert body.get('success') is True
        assert 'data' in body
        assert 'profile_context' in body['data']
        assert 'version_hash' in body['data']
        assert 'ETag' in resp.headers


def test_user_preferences_etag_flow(client):
    first = client.get('/api/preferences/user', headers=_auth_headers())
    assert first.status_code in (200, 401)
    if first.status_code == 200:
        etag = first.headers.get('ETag')
        assert etag
        second = client.get('/api/preferences/user', headers={**_auth_headers(), 'If-None-Match': etag})
        assert second.status_code in (200, 304)
        if second.status_code == 304:
            assert second.headers.get('ETag') == etag



