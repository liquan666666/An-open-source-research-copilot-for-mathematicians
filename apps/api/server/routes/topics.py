from fastapi import APIRouter
router=APIRouter(prefix='/topics')
@router.post('/recommend')
def rec(p:dict): return []