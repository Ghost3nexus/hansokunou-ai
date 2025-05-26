import asyncio
from backend.app.main import root


def test_root_direct():
    result = asyncio.run(root())
    assert result['status'] == 'operational'
