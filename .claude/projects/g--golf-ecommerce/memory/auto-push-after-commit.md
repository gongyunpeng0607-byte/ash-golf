---
name: auto-push-after-commit
description: 每次 commit 后自动 push 到 GitHub
metadata:
  type: feedback
---

每次 git commit 之后，自动执行 `git push origin main` 将改动推送到 GitHub 远端。

**Why:** 用户明确要求所有改动都需要上传到远端。
**How to apply:** 每次提交完成后，紧接着运行 `git push`。
