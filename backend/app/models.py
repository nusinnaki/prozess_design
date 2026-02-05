from sqlalchemy import String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base

class Process(Base):
    __tablename__ = "processes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    process_key: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    trigger: Mapped[str] = mapped_column(Text, default="")
    outcome: Mapped[str] = mapped_column(Text, default="")
    diagram_json: Mapped[str] = mapped_column(Text, default="")
