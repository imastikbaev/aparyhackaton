from pydantic import BaseModel, field_validator


class OTPRequest(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        digits = "".join(c for c in v if c.isdigit())
        if len(digits) < 10:
            raise ValueError("Некорректный номер телефона")
        return f"+{digits}" if not v.startswith("+") else v


class OTPVerify(BaseModel):
    phone: str
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool = False
