# 订阅数据问题诊断和修复指南

## 🎯 问题描述

订阅成功后数据库中没有相应的订阅记录，导致无法验证用户订阅状态。

## 🔍 问题分析

可能的原因包括：
1. Stripe webhook 未正确配置或未被触发
2. 环境变量配置不正确
3. 数据库表结构不匹配
4. 用户元数据未正确传递

## 🛠️ 修复方案

### 1. 增强错误处理和日志

**文件**: `src/app/api/[[...route]]/subscriptions.ts`

```typescript
// 添加 webhook 配置验证
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
  return c.json({ error: "Webhook configuration error" }, 500);
}

// 添加详细的日志记录
console.log("Processing subscription event:", event.type, {
  subscriptionId: subscription.id,
  userId: userId,
  customerId: subscription.customer,
  status: subscription.status
});

// 改进错误处理
if (updateError) {
  console.error("Failed to update subscription:", updateError);
} else {
  console.log("Subscription updated successfully for user:", userId);
}
```

### 2. 验证环境变量

确保以下环境变量已正确设置：
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PRICE_ID=price_your_stripe_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
```

### 3. 检查 Stripe Webhook 配置

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 进入 "Developers" → "Webhooks"
3. 确保已添加正确的 webhook 端点：
   - URL: `https://your-domain.com/api/subscriptions/webhook`
   - 事件类型: 
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

### 4. 测试数据库连接

**文件**: `scripts/test-subscription-data.js`

```bash
# 运行测试脚本
node scripts/test-subscription-data.js
```

### 5. 手动验证数据库表结构

确保 `subscription` 表具有以下字段：
- `userId` (文本, 主键或唯一)
- `subscriptionId` (文本)
- `customerId` (文本)
- `priceId` (文本)
- `status` (文本)
- `currentPeriodEnd` (时间戳)
- `createdAt` (时间戳)
- `updatedAt` (时间戳)

## ✅ 验证修复

### 1. 检查 webhook 日志
```bash
# 查看开发服务器日志中的 webhook 处理信息
npm run dev
# 观察是否有 "Processing subscription event" 日志
```

### 2. 测试订阅流程
1. 登录应用
2. 访问订阅页面
3. 完成 Stripe 支付流程
4. 检查数据库中是否创建了订阅记录

### 3. 验证订阅状态
```bash
# 使用测试脚本检查订阅数据
node scripts/test-subscription-data.js
```

## 🚫 常见问题

### 1. Webhook 未触发
**症状**: 数据库中没有订阅记录
**解决方案**: 
- 检查 Stripe webhook 配置
- 确保端点 URL 可访问
- 检查防火墙设置

### 2. 元数据丢失
**症状**: 日志显示 "No userId in subscription metadata"
**解决方案**:
- 检查结账会话创建代码中的元数据设置
- 确保 `userId` 正确传递给 Stripe

### 3. 数据库写入失败
**症状**: 日志显示 "Failed to insert/update subscription"
**解决方案**:
- 检查数据库表结构
- 验证字段类型匹配
- 检查数据库权限

## 📚 相关资源

- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**通过以上步骤，应该能够诊断并修复订阅数据未正确保存到数据库的问题！** 🎉