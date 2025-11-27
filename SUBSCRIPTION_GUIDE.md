# 订阅功能使用指南

## 🎯 功能逻辑

1. **用户登录** → 2. **订阅支付** → 3. **使用 AI 功能**

### 权限控制
- ✅ **已登录 + 已订阅** → 可以使用 AI 功能
- ❌ **未登录** → 跳转到登录页
- ❌ **已登录但未订阅** → 显示订阅页面

---

## 📋 订阅状态页面逻辑

### 1. **未订阅状态**
显示订阅价格和功能列表，包含"Subscribe Now"按钮

```typescript
// src/app/(dashboard)/subscription/page.tsx
if (!subscriptionData?.isSubscribed) {
  // 显示订阅计划和价格
  // 点击按钮 → 跳转到 Stripe 支付页面
}
```

### 2. **已订阅状态**
显示订阅信息：
- ✅ 订阅状态（Active）
- 📅 下次续费日期
- 🆔 订阅 ID
- 🔧 管理订阅按钮

```typescript
if (subscriptionData?.isSubscribed) {
  // 显示：
  // - Status: Active
  // - Next billing date: 2024年12月1日
  // - Subscription ID: sub_xxx
  // - 管理订阅按钮
  // - 取消订阅按钮
}
```

---

## 🔌 API 接口

### 1. 获取订阅状态

**接口**: `GET /api/subscriptions/status`

**返回**:
```json
{
  "data": {
    "isSubscribed": true,
    "status": "active",
    "currentPeriodEnd": "2024-12-01T00:00:00.000Z",
    "customerId": "cus_xxx",
    "subscriptionId": "sub_xxx",
    "priceId": "price_xxx"
  }
}
```

**使用示例**:
```typescript
const { data: subscriptionData } = useSubscriptionStatus();

if (subscriptionData?.isSubscribed) {
  // 用户已订阅,可以使用 AI 功能
}
```

### 2. 创建支付会话

**接口**: `POST /api/subscriptions/checkout`

**请求**:
```json
{
  "priceId": "price_xxx"
}
```

**返回**:
```json
{
  "url": "https://checkout.stripe.com/xxx"
}
```

### 3. 创建订阅管理门户

**接口**: `POST /api/subscriptions/portal`

**返回**:
```json
{
  "url": "https://billing.stripe.com/xxx"
}
```

---

## 🛡️ 在 AI 功能中检查订阅

### Server Component

```typescript
// app/menus/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MenusPage() {
  const supabase = await createClient();
  
  // 检查用户登录
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/sign-in');
  }
  
  // 检查订阅状态
  const { data: subscription } = await supabase
    .from('subscription')
    .select('*')
    .eq('userId', user.id)
    .single();
  
  const isSubscribed = subscription &&
    subscription.status === 'active' &&
    new Date(subscription.currentPeriodEnd).getTime() > Date.now();
  
  if (!isSubscribed) {
    redirect('/subscription');
  }
  
  // 用户已订阅,显示 AI 功能
  return (
    <div>
      {/* AI 菜单生成器 */}
    </div>
  );
}
```

### API Route

```typescript
// app/api/menus/generate/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  // 检查用户登录
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 检查订阅状态
  const { data: subscription } = await supabase
    .from('subscription')
    .select('*')
    .eq('userId', user.id)
    .single();
  
  const isSubscribed = subscription &&
    subscription.status === 'active' &&
    new Date(subscription.currentPeriodEnd).getTime() > Date.now();
  
  if (!isSubscribed) {
    return NextResponse.json(
      { error: 'Subscription required' },
      { status: 403 }
    );
  }
  
  // 用户已订阅,调用 AI API
  const body = await request.json();
  // ... AI 生成逻辑
  
  return NextResponse.json({ success: true });
}
```

---

## 🎨 UI 组件示例

### 订阅检查 Hook

```typescript
// src/hooks/use-check-subscription.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSubscriptionStatus } from '@/features/subscriptions/api/use-subscription';

export function useCheckSubscription() {
  const router = useRouter();
  const { data: subscriptionData, isLoading } = useSubscriptionStatus();
  
  useEffect(() => {
    if (!isLoading && !subscriptionData?.isSubscribed) {
      router.push('/subscription');
    }
  }, [isLoading, subscriptionData, router]);
  
  return {
    isSubscribed: subscriptionData?.isSubscribed || false,
    isLoading,
  };
}
```

### 使用示例

```typescript
// app/menus/generate-form.tsx
'use client';

import { useCheckSubscription } from '@/hooks/use-check-subscription';

export function MenuGenerateForm() {
  const { isSubscribed, isLoading } = useCheckSubscription();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isSubscribed) {
    return null; // 会自动跳转到订阅页
  }
  
  return (
    <form>
      {/* AI 生成表单 */}
    </form>
  );
}
```

---

## 📊 数据库表结构

### subscription 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | text | 主键 |
| userId | text | 用户 ID |
| subscriptionId | text | Stripe 订阅 ID |
| customerId | text | Stripe 客户 ID |
| priceId | text | Stripe 价格 ID |
| status | text | 状态：active, canceled, past_due |
| currentPeriodEnd | timestamp | 当前订阅周期结束时间 |
| createdAt | timestamp | 创建时间 |
| updatedAt | timestamp | 更新时间 |

---

## 🔄 订阅流程

### 1. 用户点击订阅
```
用户 → 点击"Subscribe Now" → API: /api/subscriptions/checkout 
→ 返回 Stripe Checkout URL → 跳转到 Stripe 支付页面
```

### 2. 支付成功
```
Stripe → 发送 Webhook → API: /api/subscriptions/webhook 
→ 创建/更新 subscription 记录 → 用户重定向回 /subscription?success=true
```

### 3. 查看订阅信息
```
页面加载 → API: /api/subscriptions/status 
→ 返回订阅状态 → 显示订阅信息
```

### 4. 使用 AI 功能
```
访问 AI 页面 → 检查登录 → 检查订阅 
→ 已订阅: 显示功能 / 未订阅: 跳转订阅页
```

---

## ⚡ 快速开始

### 1. 配置环境变量

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 2. 测试订阅流程

```bash
# 1. 启动开发服务器
npm run dev

# 2. 访问订阅页面
http://localhost:3000/subscription

# 3. 点击订阅按钮测试
```

### 3. 测试 Webhook（本地）

```bash
# 安装 Stripe CLI
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 Webhook
stripe listen --forward-to localhost:3000/api/subscriptions/webhook

# 在另一个终端触发测试事件
stripe trigger customer.subscription.created
```

---

## 🎯 最佳实践

1. **Server Component 优先** - 订阅检查在服务器端完成
2. **使用 middleware** - 在特定路由自动检查订阅
3. **错误处理** - 友好的错误提示
4. **Loading 状态** - 订阅状态加载时显示 loading
5. **缓存策略** - 使用 React Query 缓存订阅状态

---

**现在你的项目已完全支持订阅功能！** 🎉
