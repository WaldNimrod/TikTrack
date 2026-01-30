from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TradingAccount(BaseModel):
    name: str
    broker: str
    currency: str = 'USD'

@app.get('/health')
async def health():
    return {'status': 'healthy', 'team': 20}