from datetime import datetime
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


class AvailabilityCreate(BaseModel):
    start_at: datetime
    end_at: datetime

    @model_validator(mode="after")
    def validate_slot(self):
        if self.start_at.tzinfo is None:
            raise ValueError(
                "Start time must include a timezone."
            )

        if self.end_at.tzinfo is None:
            raise ValueError(
                "End time must include a timezone."
            )

        if self.end_at <= self.start_at:
            raise ValueError(
                "End time must be after start time."
            )

        return self


class AvailabilityResponse(BaseModel):
    id: int
    professional_id: int
    start_at: datetime
    end_at: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)


class ProfessionalResponse(BaseModel):
    id: int
    email: str
    role: str


class AppointmentCreate(BaseModel):
    availability_id: int

    session_type: str = Field(
        min_length=2,
        max_length=100,
    )

    notes: str | None = Field(
        default=None,
        max_length=2000,
    )


class AppointmentResponse(BaseModel):
    id: int
    availability_id: int
    customer_id: int
    professional_id: int
    session_type: str
    notes: str | None
    status: str
    meeting_url: str | None
    created_at: datetime

    availability: AvailabilityResponse

    model_config = ConfigDict(from_attributes=True)


class NotificationResponse(BaseModel):
    id: int
    appointment_id: int | None
    title: str
    message: str
    notification_type: str
    read_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)