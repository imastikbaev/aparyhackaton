import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_send_otp(client: AsyncClient):
    with patch("app.services.otp_service.sms_provider.send_otp", new_callable=AsyncMock) as mock_sms:
        mock_sms.return_value = True
        with patch("app.services.otp_service.OTPService.send", new_callable=AsyncMock):
            response = await client.post("/api/v1/auth/send-otp", json={"phone": "+77001234567"})
    assert response.status_code == 204


@pytest.mark.asyncio
async def test_verify_otp_invalid(client: AsyncClient):
    with patch("app.services.otp_service.OTPService.verify", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = False
        response = await client.post(
            "/api/v1/auth/verify-otp", json={"phone": "+77001234567", "code": "0000"}
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_verify_otp_valid(client: AsyncClient):
    with patch("app.services.otp_service.OTPService.verify", new_callable=AsyncMock) as mock_verify:
        mock_verify.return_value = True
        response = await client.post(
            "/api/v1/auth/verify-otp", json={"phone": "+77001234567", "code": "1234"}
        )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["is_new_user"] is True
