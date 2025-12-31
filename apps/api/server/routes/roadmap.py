from fastapi import APIRouter
router=APIRouter(prefix='/roadmap')
@router.get('/current')
def cur(): return {}