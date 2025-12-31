from fastapi import APIRouter
router=APIRouter(prefix='/tasks')
@router.post('/today')
def today(): return []
@router.delete('/today')
def reset(): return {}