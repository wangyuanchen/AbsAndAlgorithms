# Webhook 日期处理错误修复指南

## 🎯 问题描述

Webhook 处理时出现 "RangeError: Invalid time value" 错误。

## 🔍 问题分析

这个错误通常发生在以下情况：
1. Stripe webhook 中的日期字段为 null、undefined 或无效值
2. 日期转换过程中出现异常
3. 日期值超出了 JavaScript Date 对象的有效范围

## 🛠️ 修复方案

### 1. 安全的日期处理

**文件**: `src/app/api/[[...route]]/subscriptions.ts`

```typescript
// 安全处理日期值
let currentPeriodEnd: string | null = null;
if (subscription.current_period_end) {
  try {
    currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  } catch (dateError) {
    console.error("Error parsing current_period_end:", dateError);
    currentPeriodEnd = null;
  }
}
```

### 2. 安全的对象属性访问

```typescript
// 使用可选链操作符安全访问嵌套属性
priceId: subscription.items?.data?.[0]?.price?.id || '',
```

### 3. 增强的错误日志

```typescript
console.log("Processing subscription event:", event.type, {
  subscriptionId: subscription.id,
  userId: userId,
  customerId: subscription.customer,
  status: subscription.status,
  currentPeriodEnd: subscription.current_period_end  // 记录原始值用于调试
});
```

## ✅ 验证修复

### 1. 运行测试脚本
```bash
node scripts/test-date-processing.js
```

### 2. 检查服务器日志
观察是否还有 "Invalid time value" 错误

### 3. 测试各种日期场景
- 正常的时间戳
- null/undefined 值
- 边界值时间戳
- 无效的时间戳

## 🚫 常见问题

### 1. 日期字段缺失
**错误**: `subscription.current_period_end` 为 undefined
**解决方案**: 添加检查和默认值处理

### 2. 嵌套对象访问错误
**错误**: `subscription.items.data[0].price.id` 访问不存在的属性
**解决方案**: 使用可选链操作符 `subscription.items?.data?.[0]?.price?.id`

### 3. 时间戳格式错误
**错误**: 时间戳不是 Unix 时间戳格式
**解决方案**: 确保正确转换时间戳（乘以 1000）

## 📚 相关资源

- [JavaScript Date 对象](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [Stripe Subscription Object](https://stripe.com/docs/api/subscriptions/object)
- [可选链操作符](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)

## 🧪 测试用例

**文件**: `scripts/test-date-processing.js`
```javascript
// 测试各种边界情况
const testCases = [
  null,           // null 值
  undefined,      // undefined 值
  0,              // 零值
  1234567890,     // 正常时间戳
  -1,             // 负数时间戳
  'invalid',      // 无效字符串
  9999999999999,  // 超大时间戳
];
```

---

**通过以上改进，应该能够解决 Webhook 中的日期处理错误！** 🎉