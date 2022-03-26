from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
BaseModel = declarative_base()
engine = create_engine("sqlite+pysqlite:///:memory:", echo=True, future=True)
