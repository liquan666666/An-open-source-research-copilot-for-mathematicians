from fastapi import APIRouter
router=APIRouter(prefix='/papers')
@router.get('')
def lib(): return []