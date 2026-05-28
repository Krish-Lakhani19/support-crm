from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


class NoteCreate(BaseModel):
    note_text: str
    author: Optional[str] = "Support Agent"


class NoteResponse(BaseModel):
    id: int
    ticket_id: str
    note_text: str
    author: str
    created_at: datetime

    class Config:
        from_attributes = True


class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    subject: str
    description: str
    priority: Optional[str] = "Medium"


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    note_text: Optional[str] = None
    note_author: Optional[str] = "Support Agent"


class TicketListItem(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TicketDetail(BaseModel):
    id: int
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    notes: List[NoteResponse] = []

    class Config:
        from_attributes = True


class TicketCreateResponse(BaseModel):
    ticket_id: str
    created_at: datetime


class UpdateResponse(BaseModel):
    success: bool
    updated_at: datetime
