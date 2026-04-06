# naitei.ai 访问方式 & 测试账号

## 生产环境

| 地址 | 用途 |
|---|---|
| https://naitei-ai.vercel.app | 主域名 |
| https://naitei-ai.vercel.app/admin | 管理后台（仅 ADMIN_EMAIL 可访问） |

---

## 测试用户（Magic Link 登录）

在 https://naitei-ai.vercel.app/auth 输入以下邮箱，点击发送链接，收邮件后点击链接即可登录。

| 角色 | 邮箱 | 密码 | 说明 |
|---|---|---|---|
| 管理员 | admin@naitei.ai | （自行设置） | 可访问 /admin 后台 |
| Free 用户 | user_a@naitei.test | UserA@2025! | 免费 1回限额 |
| Pack 用户 | user_b@naitei.test | UserB@2025! | 买断 6回（¥980） |
| Pro 用户 | pro_user@naitei.test | ProUser@2025! | 无限回数（¥1,980/月） |

## 套餐说明

| 套餐 | 额度 | 价格 | 类型 |
|---|---|---|---|
| Free | 1 回 | 免费 | 永久 |
| Pack | 6 回 | ¥980 | 一次性买断 |
| Pro | 无限 | ¥1,980/月 | 订阅 |

> Supabase 免费套餐每小时限制 3 封 Magic Link 邮件，测试时注意间隔。

---

## 本地开发

```bash
cd C:\Users\wenxiong.yao\Naitei
npm run dev
# 访问 http://localhost:3000
```

## 管理后台访问步骤

1. 在 `.env.local` 中确认 `ADMIN_EMAIL=你的邮箱`
2. 在 Vercel Dashboard → Settings → Environment Variables 中同步该值
3. 访问 /auth，用管理员邮箱登录
4. 访问 /admin

## Stripe 测试（沙盒模式）

测试卡号：`4242 4242 4242 4242`，有效期任意未来日期，CVC 任意 3 位。

---

## 环境变量清单（需在 Vercel 上配置）

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PRICE_ID`
- `ADMIN_EMAIL`
