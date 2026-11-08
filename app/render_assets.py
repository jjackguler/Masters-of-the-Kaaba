import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for name,w in [('icon',1024),('splash',2732)]:
      pg=await b.new_page(viewport={'width':w,'height':w})
      await pg.goto(f'file:///home/claude/kabe-app/assets/{name}.html');await pg.wait_for_timeout(800)
      await pg.screenshot(path=f'/home/claude/kabe-app/assets/{name}.png')
    # dark splash variant identical
    await b.close()
asyncio.run(main())
