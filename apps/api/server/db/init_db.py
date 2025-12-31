from pathlib import Path
from server.db.session import engine
from server.db.models import Base

def init_db(path:str):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
