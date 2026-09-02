"""Request body validation. Pydantic models mirroring the Zod schemas."""
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

Status = Literal["Active", "Inactive"]
ResourceType = Literal["PDF", "ZIP", "JPG", "DOCX", "PPTX"]


class LoginBody(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class AdminCreate(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)


class AdminUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    status: Optional[Status] = None
    password: Optional[str] = Field(default=None, min_length=6)


class StudentCreate(BaseModel):
    name: str = Field(min_length=1)
    studentId: str = Field(min_length=1)
    email: EmailStr
    approvedUnits: Optional[list[str]] = None
    pendingUnits: Optional[list[str]] = None
    status: Optional[Status] = None


class StudentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    studentId: Optional[str] = Field(default=None, min_length=1)
    email: Optional[EmailStr] = None
    approvedUnits: Optional[list[str]] = None
    pendingUnits: Optional[list[str]] = None
    status: Optional[Status] = None


class UnitActionBody(BaseModel):
    unitCode: str = Field(min_length=1)
    action: Literal["grant", "revoke"]


class UnitRequestCreate(BaseModel):
    studentId: str = Field(min_length=1)
    requestingUnit: str = Field(min_length=1)
    reason: Optional[str] = None


class UnitRequestDecision(BaseModel):
    status: Literal["Approved", "Rejected"]


class ResourceCreate(BaseModel):
    title: str = Field(min_length=1)
    filename: str = Field(min_length=1)
    description: Optional[str] = None
    category: str = Field(min_length=1)
    type: Optional[ResourceType] = None
    units: Optional[list[str]] = None
    visible: Optional[bool] = None


class ResourceUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1)
    filename: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = None
    category: Optional[str] = Field(default=None, min_length=1)
    type: Optional[ResourceType] = None
    units: Optional[list[str]] = None
    visible: Optional[bool] = None
