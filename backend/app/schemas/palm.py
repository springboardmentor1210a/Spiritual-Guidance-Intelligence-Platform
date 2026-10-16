from pydantic import BaseModel


class PalmLineResult(BaseModel):
    name: str
    status: str
    score: int
    note: str


class PalmMetricResult(BaseModel):
    value: str
    score: int
    note: str


class PalmAnalysisResult(BaseModel):
    palmShape: PalmMetricResult
    fingers: PalmMetricResult
    lines: list[PalmLineResult]


class PalmAnalysisResponse(BaseModel):
    reading_session_id: int
    reading_type: str
    image_filename: str
    analysis: PalmAnalysisResult