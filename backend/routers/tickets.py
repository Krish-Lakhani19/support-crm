from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
from datetime import datetime

from database import get_db
import models
import schemas

router = APIRouter()

VALID_STATUSES = {"Open", "In Progress", "Closed"}
VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}


def generate_ticket_id(db: Session) -> str:
    last = db.query(models.Ticket).order_by(models.Ticket.id.desc()).first()
    next_num = (last.id + 1) if last else 1
    return f"TKT-{str(next_num).zfill(4)}"


@router.post("/tickets", response_model=schemas.TicketCreateResponse, status_code=201)
def create_ticket(payload: schemas.TicketCreate, db: Session = Depends(get_db)):
    ticket_id = generate_ticket_id(db)

    ticket = models.Ticket(
        ticket_id=ticket_id,
        customer_name=payload.customer_name.strip(),
        customer_email=payload.customer_email.lower().strip(),
        subject=payload.subject.strip(),
        description=payload.description.strip(),
        status="Open",
        priority=payload.priority if payload.priority in VALID_PRIORITIES else "Medium",
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return schemas.TicketCreateResponse(ticket_id=ticket.ticket_id, created_at=ticket.created_at)


@router.get("/tickets", response_model=List[schemas.TicketListItem])
def list_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Ticket)

    if status and status in VALID_STATUSES:
        query = query.filter(models.Ticket.status == status)

    if priority and priority in VALID_PRIORITIES:
        query = query.filter(models.Ticket.priority == priority)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                func.lower(models.Ticket.customer_name).like(func.lower(term)),
                func.lower(models.Ticket.customer_email).like(func.lower(term)),
                func.lower(models.Ticket.subject).like(func.lower(term)),
                func.lower(models.Ticket.description).like(func.lower(term)),
                models.Ticket.ticket_id.like(term),
            )
        )

    offset = (page - 1) * limit
    tickets = query.order_by(models.Ticket.created_at.desc()).offset(offset).limit(limit).all()
    return tickets


@router.get("/tickets/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(models.Ticket).count()
    open_count = db.query(models.Ticket).filter(models.Ticket.status == "Open").count()
    in_progress = db.query(models.Ticket).filter(models.Ticket.status == "In Progress").count()
    closed = db.query(models.Ticket).filter(models.Ticket.status == "Closed").count()

    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress,
        "closed": closed,
    }


@router.get("/tickets/{ticket_id}", response_model=schemas.TicketDetail)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    return ticket


@router.put("/tickets/{ticket_id}", response_model=schemas.UpdateResponse)
def update_ticket(ticket_id: str, payload: schemas.TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")

    if payload.status and payload.status in VALID_STATUSES:
        ticket.status = payload.status

    if payload.priority and payload.priority in VALID_PRIORITIES:
        ticket.priority = payload.priority

    ticket.updated_at = datetime.utcnow()

    if payload.note_text and payload.note_text.strip():
        note = models.Note(
            ticket_id=ticket_id,
            note_text=payload.note_text.strip(),
            author=payload.note_author or "Support Agent",
        )
        db.add(note)

    db.commit()
    db.refresh(ticket)

    return schemas.UpdateResponse(success=True, updated_at=ticket.updated_at)


@router.delete("/tickets/{ticket_id}", status_code=204)
def delete_ticket(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail=f"Ticket {ticket_id} not found")
    db.delete(ticket)
    db.commit()
