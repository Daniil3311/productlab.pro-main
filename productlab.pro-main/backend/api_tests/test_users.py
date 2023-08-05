from fastapi.testclient import TestClient


def test_get_users(app):
    client = TestClient(app)
    response_1 = client.get("/api/users", params={"limit": 10, "offset": 0})
    assert response_1.status_code == 200
    assert not len(response_1.json()["result"]) > 10
    response_2 = client.get("/api/users")
    assert response_2.status_code == 200
    response_3 = client.get("/api/users", params={"limit": 1000000, "offset": 0})
    assert response_3.status_code == 200
    response_4 = client.get("/api/users", params={"limit": 1000000, "offset": 100})
    assert response_4.status_code == 200
    response_5 = client.get("/api/users", params={"limit": 327})
    assert response_5.status_code == 200
    response_6 = client.get("/api/users", params={"offset": 100})
    assert response_6.status_code == 200

