from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.lite import LiteResult
from app.services import lite_service
from app.services.intake_service import IntakeService

router = APIRouter(prefix="/api/lite", tags=["lite"])

@router.post("/research", response_model=LiteResult)
async def research(
    company_name: str = Form(..., min_length=1, max_length=255),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    uploaded_text = ""
    if file is not None:
        # Bound before reusing the existing PDF/DOCX/TXT/MD text extraction path.
        if len(await file.read(10 * 1024 * 1024 + 1)) > 10 * 1024 * 1024:
            raise HTTPException(413, "公司文档不得超过10MB。")
        await file.seek(0)
        _, uploaded_text, _ = await IntakeService().extract_upload_file(file)
    return await run_in_threadpool(lite_service.research, db, user.id, company_name, uploaded_text)

@router.get("/{assessment_id}", response_model=LiteResult)
def get_result(assessment_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return lite_service.get_result(db, user.id, assessment_id)

@router.post("/{assessment_id}/recommend", response_model=LiteResult)
def recommend(assessment_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return lite_service.recommend(db, user.id, assessment_id)
