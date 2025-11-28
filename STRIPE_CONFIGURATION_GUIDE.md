# Stripe 配置指南

## 🎯 问题描述

订阅功能中的 "Failed to create checkout session" 错误通常是由于缺少或错误的 Stripe 配置引起的。

## 🔧 解决方案

### 1. 添加 Stripe 环境变量

在 `.env.local` 文件中添加以下环境变量：

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PRICE_ID=price_your_stripe_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
```

### 2. 获取 Stripe 密钥

#### 获取 STRIPE_SECRET_KEY
1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 点击右上角的 "Developers"
3. 选择 "API keys"
4. 复制 "Secret key" (以 `sk_test_` 或 `sk_live_` 开头)

#### 获取 NEXT_PUBLIC_STRIPE_PRICE_ID
1. 在 Stripe Dashboard 中点击 "Products"
2. 创建一个新的产品或选择现有产品
3. 点击产品的价格
4. 复制价格 ID (以 `price_` 开头)

#### 获取 STRIPE_WEBHOOK_SECRET
1. 在 Stripe Dashboard 中点击 "Developers" → "Webhooks"
2. 点击 "Add endpoint"
3. 添加端点 URL: `https://your-domain.com/api/subscriptions/webhook`
4. 选择事件类型: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
5. 创建端点后，点击 "Reveal" 显示签名密钥

### 3. 测试配置

#### 验证环境变量
```bash
# 检查环境变量是否正确设置
cat .env.local | grep STRIPE
```

#### 测试 Stripe 连接
```bash
# 在项目根目录运行
node -e "
require('dotenv').config();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
stripe.products.list().then(products => {
  console.log('Stripe connection successful');
  console.log('Products count:', products.data.length);
}).catch(err => {
  console.error('Stripe connection failed:', err.message);
});
"
```

## 🛠️ 代码改进

### 1. 增强错误处理

**文件**: `src/app/api/[[...route]]/subscriptions.ts`

```typescript
// 添加配置验证
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY environment variable");
  return c.json({ error: "Payment configuration error" }, 500);
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.error("Missing NEXT_PUBLIC_APP_URL environment variable");
  return c.json({ error: "App configuration error" }, 500);
}

// Stripe 操作错误处理
try {
  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: { userId },
  });
} catch (stripeError: any) {
  console.error("Failed to create Stripe customer:", stripeError);
  return c.json({ 
    error: "Failed to initialize payment session", 
    details: stripeError.message 
  }, 500);
}
```

### 2. 使用环境变量

**文件**: `src/app/(dashboard)/subscription/page.tsx`

```typescript
// 使用环境变量而不是硬编码值
const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_HK49_MONTHLY";
```

## ✅ 验证配置

### 1. 环境变量检查
```bash
# 确保所有 Stripe 环境变量都已设置
echo $STRIPE_SECRET_KEY
echo $NEXT_PUBLIC_STRIPE_PRICE_ID
echo $STRIPE_WEBHOOK_SECRET
```

### 2. 功能测试
1. 启动开发服务器: `npm run dev`
2. 访问订阅页面: `http://localhost:3000/subscription`
3. 点击 "Subscribe Now" 按钮
4. 应该重定向到 Stripe Checkout 页面

## 🚫 常见错误

### 1. Missing STRIPE_SECRET_KEY
**错误信息**: "Payment configuration error"
**解决方案**: 在 `.env.local` 中添加 `STRIPE_SECRET_KEY`

### 2. Invalid Price ID
**错误信息**: "No such price"
**解决方案**: 确认 `NEXT_PUBLIC_STRIPE_PRICE_ID` 是有效的价格 ID

### 3. Webhook Verification Failed
**错误信息**: "Webhook processing failed"
**解决方案**: 确认 `STRIPE_WEBHOOK_SECRET` 与 Stripe Dashboard 中的设置一致

## 📚 相关资源

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Keys](https://dashboard.stripe.com/apikeys)
- [Stripe Products](https://dashboard.stripe.com/products)
- [Stripe Webhooks](https://dashboard.stripe.com/webhooks)

---

**正确配置 Stripe 后，订阅功能应该可以正常工作了！** 🎉