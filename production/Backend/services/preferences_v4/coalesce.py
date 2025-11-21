from __future__ import annotations

import asyncio
from typing import Any, Dict, Tuple


class RequestCoalescer:
    """
    Simple in-process coalescer:
    - Keys are tuples that describe the logical request (user, profile, op, args).
    - Concurrent callers await the same task result.
    """

    def __init__(self) -> None:
        self._inflight: Dict[Tuple[Any, ...], asyncio.Task] = {}
        self._lock = asyncio.Lock()

    async def run(self, key: Tuple[Any, ...], coro):
        async with self._lock:
            task = self._inflight.get(key)
            if task is None:
                task = asyncio.create_task(coro)
                self._inflight[key] = task
        try:
            return await task
        finally:
            async with self._lock:
                if self._inflight.get(key) is task:
                    self._inflight.pop(key, None)


# Singleton
COALESCER = RequestCoalescer()



