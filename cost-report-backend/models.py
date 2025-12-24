from pydantic import BaseModel
from typing import List

class ServiceCost(BaseModel):
    name: str
    cost: float
    recommendation: str

class CostReport(BaseModel):
    title: str
    generatedAt: str
    account: str
    timeRange: str
    summary: str
    services: List[ServiceCost]
    totalCost: float