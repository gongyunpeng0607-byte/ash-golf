"""
批量抓取 — 用你的 Chrome
=======================
1. 关掉所有 Chrome
2. 双击运行
3. 脚本启动 Chrome（你的登录/cookie 全在）
4. 在 Chrome 打开列表页
5. 回来按 Enter → 自动找到所有产品 → 逐个保存
"""

import os, re, sys, io, time, asyncio
from datetime import datetime
from playwright.async_api import async_playwright

try: sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
except: pass

SAVE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
PORT = 9222

# 找 Chrome
CHROME = None
for p in [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars("%LOCALAPPDATA%") + r"\Google\Chrome\Application\chrome.exe",
]:
    if os.path.exists(p): CHROME = p; break


async def main():
    import subprocess, requests

    def log(msg=""): print(msg, flush=True)

    log()
    log("=" * 50)
    log("  批量抓取店铺所有产品")
    log("=" * 50)
    log()

    if not CHROME:
        log("找不到 Chrome")
        input("按 Enter..."); return

    # 关掉 Chrome
    log("关闭现有 Chrome...")
    try: subprocess.run(["taskkill", "/F", "/IM", "chrome.exe"], capture_output=True)
    except: pass
    time.sleep(2)

    # 启动 Chrome（调试模式，用你的默认 profile）
    log("启动 Chrome（你的登录和 cookie 都在）...")
    subprocess.Popen(
        [CHROME, f"--remote-debugging-port={PORT}", "--remote-allow-origins=*"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )

    # 等 Chrome 起来
    for _ in range(30):
        time.sleep(1)
        try:
            r = requests.get(f"http://127.0.0.1:{PORT}/json/version", timeout=2)
            if r.ok: break
        except: pass
    else:
        log("Chrome 启动失败")
        input("按 Enter..."); return

    log("Chrome 已就绪")
    log()
    log("-" * 50)
    log("  1. 在 Chrome 打开产品列表页")
    log("  2. 确保页面加载完")
    log("  3. 回来按 Enter")
    log("-" * 50)
    log()
    input("准备好了按 Enter...")

    # 用 Playwright connect_over_cdp 连上 Chrome
    async with async_playwright() as pw:
        browser = await pw.chromium.connect_over_cdp(f"http://127.0.0.1:{PORT}")

        # 找列表页的 tab
        page = None
        for ctx in browser.contexts:
            for p in ctx.pages:
                url = p.url
                if url and url.startswith("http") and "chrome://" not in url:
                    page = p
                    break
            if page: break

        if not page:
            # 新建一个
            page = await browser.contexts[0].new_page()

        log(f"\n当前页面: {page.url[:80]}")
        log("滚动加载列表...")

        # 滚动到底
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(2)
        for _ in range(60):
            await page.evaluate("window.scrollBy(0, 500)")
            await asyncio.sleep(0.1)
        await asyncio.sleep(3)

        # 找所有产品链接
        links = await page.evaluate("""()=>{
            let ls=new Set();
            document.querySelectorAll('a[href]').forEach(a=>{
                let h=a.href.toLowerCase();
                if(h.includes('/goods')||h.includes('/product')||h.includes('/item')||h.includes('/detail')||
                   h.includes('goods_id')||h.includes('product_id')||h.includes('item_id')||
                   h.includes('goodsid')||h.includes('productid')||h.includes('itemid')||
                   h.includes('goods.html')||h.includes('product.html')||h.includes('detail.html'))
                    ls.add(a.href);
            });
            if(ls.size===0){
                document.querySelectorAll('a[href]').forEach(a=>{
                    let h=a.href;
                    if(h&&h.startsWith('http')&&h!==location.href&&!h.includes('#')&&!h.includes('javascript'))
                        ls.add(h);
                });
            }
            return [...ls];
        }""")

        total = len(links)
        if total == 0:
            log("没找到产品链接")
            input("按 Enter..."); return

        log(f"找到 {total} 个产品，开始抓取...\n")

        import requests as req
        sess = req.Session()
        sess.headers.update({"User-Agent": "Mozilla/5.0"})

        bad = re.compile(r"icon|logo|avatar|favicon|64x64|32x32|qr_code|loading|sprite|placeholder|share_icon|close_btn|back_icon|weixin_icon|wx_icon", re.I)

        for n, url in enumerate(links[:200], 1):
            try:
                log(f"  [{n}/{total}] {url[:60]}...")
                await page.goto(url, wait_until="load", timeout=60000)
                await asyncio.sleep(4)

                title = (await page.title()).strip()[:60] or "product"

                # 滚动
                for _ in range(30):
                    await page.evaluate("window.scrollBy(0, 500)")
                    await asyncio.sleep(0.1)

                # 点击轮播
                for sel in ["[class*='dot']","[class*='bullet']","[class*='indicator']","[class*='thumbnail']"]:
                    for d in await page.query_selector_all(sel):
                        try: await d.click(); await asyncio.sleep(0.15)
                        except: pass

                # 收集图片
                imgs = await page.evaluate("""()=>{
                    let u=[],s=new Set();
                    document.querySelectorAll('img').forEach(el=>{
                        for(let a of['src','data-src','data-original','data-url']){
                            let v=el.getAttribute(a)||'';
                            if(v&&v.startsWith('http')&&!s.has(v)){s.add(v);u.push(v)}
                        }
                    });
                    return u;
                }""")

                # 详情
                desc = await page.evaluate("""()=>{
                    let d=[];
                    document.querySelectorAll('.desc,.detail,.description,[class*="desc"],[class*="detail"]').forEach(el=>{
                        let t=el.innerText.trim();
                        if(t.length>10&&!d.includes(t))d.push(t);
                    });
                    return d;
                }""")

                # 价格
                price = ""
                try:
                    el = await page.query_selector(".price,[class*='price']")
                    if el:
                        t = await el.inner_text()
                        m = re.search(r'(?:[¥￥])\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*[元块]', t)
                        if m: price = f"¥{m.group(1) or m.group(2)}"
                except: pass

                # 过滤
                clean, seen = [], set()
                for u in imgs:
                    b = u.split("?")[0]
                    if b not in seen and not bad.search(u):
                        seen.add(b); clean.append(u)

                if not clean:
                    log(f"    ⚠️ 无图")
                    continue

                safe = re.sub(r'[\\/:*?"<>|]', '_', title)[:40]
                folder = os.path.join(SAVE, f"{safe}_{datetime.now().strftime('%m%d_%H%M%S')}")
                os.makedirs(folder, exist_ok=True)

                ok = 0
                for i, u in enumerate(clean, 1):
                    ext = ".jpg"
                    for e in [".png",".webp",".gif",".jpg"]:
                        if e in u.lower().split("?")[0]: ext = e; break
                    try:
                        r = sess.get(u, timeout=15)
                        if r.ok and len(r.content) > 2048:
                            with open(os.path.join(folder, f"{i:02d}{ext}"), "wb") as f:
                                f.write(r.content)
                            ok += 1
                    except: pass

                with open(os.path.join(folder, "info.txt"), "w", encoding="utf-8") as f:
                    f.write(f"产品名称: {title}\n价格: {price or '无'}\n链接: {url}\n")
                    f.write(f"时间: {datetime.now()}\n图片: {ok}/{len(clean)}\n")
                    if desc: f.write(f"\n详情:\n" + "\n\n".join(desc))

                log(f"    ✅ {ok}张 | {title[:30]}")
            except Exception as e:
                log(f"    ❌ {str(e)[:50]}")
            await asyncio.sleep(0.3)

    log(f"\n🎉 全部在: {SAVE}\n")
    input("按 Enter 退出...")


asyncio.run(main())
