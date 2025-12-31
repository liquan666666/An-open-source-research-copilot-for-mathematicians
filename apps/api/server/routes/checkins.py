from fastapi import APIRouter
router=APIRouter(prefix='/checkins')
@router.post('')
def c(p:dict): return p