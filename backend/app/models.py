from sqlalchemy import String, Integer, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base

class Process(Base):
    __tablename__ = "processes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    process_key: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    trigger: Mapped[str] = mapped_column(Text, default="")
    outcome: Mapped[str] = mapped_column(Text, default="")
    diagram_json: Mapped[str] = mapped_column(Text, default="")  # React Flow nodes+edges JSON

    steps = relationship("Step", back_populates="process", cascade="all, delete-orphan", order_by="Step.step_order")

class Step(Base):
    __tablename__ = "steps"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    process_id: Mapped[int] = mapped_column(Integer, ForeignKey("processes.id", ondelete="CASCADE"), index=True)
    step_order: Mapped[int] = mapped_column(Integer, index=True)
    title: Mapped[str] = mapped_column(String(255))
    details: Mapped[str] = mapped_column(Text, default="")
    artifact_of_record: Mapped[str] = mapped_column(String(64), default="")

    process = relationship("Process", back_populates="steps")
    tools = relationship("StepTool", back_populates="step", cascade="all, delete-orphan")

    __table_args__ = (UniqueConstraint("process_id", "step_order", name="uq_step_order_per_process"),)

class Tool(Base):
    __tablename__ = "tools"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tool_key: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    purpose: Mapped[str] = mapped_column(Text, default="")

class StepTool(Base):
    __tablename__ = "step_tools"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    step_id: Mapped[int] = mapped_column(Integer, ForeignKey("steps.id", ondelete="CASCADE"), index=True)
    tool_id: Mapped[int] = mapped_column(Integer, ForeignKey("tools.id", ondelete="CASCADE"), index=True)
    usage: Mapped[str] = mapped_column(String(255), default="")

    step = relationship("Step", back_populates="tools")
