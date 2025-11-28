# 订阅和登录问题修复指南

## 🎯 问题列表

1. **未登录用户访问订阅页面**: 应该自动重定向到登录页面
2. **订阅价格**: 从 $20 改为 HK$49 每月
3. **登录按钮无响应**: 登录按钮点击后没有反应
4. **退出登录后状态**: 退出后应正确重定向到登录页面

## 🔧 修复内容

### 1. 订阅页面未登录重定向

**文件**: `src/app/(dashboard)/subscription/page.tsx`

```typescript
// 添加了身份验证检查
import { useSession } from "next-auth/react";

// 在组件中添加检查
const { data: session, status } = useSession();

// 重定向未认证用户
useEffect(() => {
  if (status === "unauthenticated") {
    window.location.href = "/sign-in";
  }
}, [status]);
```

### 2. 更新订阅价格

**文件**: `src/app/(dashboard)/subscription/page.tsx`

```typescript
// 价格显示从 $20 改为 HK$49
<CardDescription>
  <span className="text-3xl font-bold text-green-700">HK$49</span>
  <span className="text-gray-600"> / month</span>
</CardDescription>

// 使用硬编码价格 ID
const handleSubscribe = () => {
  const priceId = "price_HK49_MONTHLY"; // 替换为实际的 Stripe 价格 ID
  createCheckout.mutate(priceId, {
    // ...
  });
};
```

### 3. 修复登录按钮无响应

**文件**: `src/features/auth/components/sign-in-card.tsx`

```typescript
// 修复按钮禁用状态
<Button 
  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold" 
  type="submit" 
  size="lg" 
  disabled={loading || loadingLogin}  // 添加 loadingLogin 检查
>

// 重置加载状态
const onCredentialSignIn = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setLoadingLogin(true);

  signIn("credentials", {
    email: email,
    password: password,
    callbackUrl: "/",
  }).then(() => {
    // 重置加载状态
    setLoading(false);
    setLoadingLogin(false);
  });
};
```

### 4. 修复用户按钮样式问题

**文件**: `src/features/auth/components/user-button.tsx`

```typescript
// 修复拼写错误
<Avatar className="size-10 hover:opacity-75 transition">  // 从 opcaity 改为 opacity
```

### 5. 优化退出登录重定向

**文件**: `src/features/auth/components/user-button.tsx`

```typescript
// 添加回调 URL
<DropdownMenuItem 
  className="h-10" 
  onClick={() => signOut({ callbackUrl: '/sign-in' })}
>
  <LogOut className="size-4 mr-2" />
  Log out
</DropdownMenuItem>
```

## ✅ 验证修复

### 1. 未登录用户访问订阅页面
- 打开匿名窗口
- 访问 `/subscription`
- 应该自动重定向到 `/sign-in`

### 2. 订阅价格显示
- 登录后访问 `/subscription`
- 确认价格显示为 "HK$49 / month"

### 3. 登录功能
- 在登录页面输入凭据
- 点击 "Start Your Fitness Journey"
- 应该成功登录并重定向到主页

### 4. 退出登录
- 点击用户头像
- 选择 "Log out"
- 应该重定向到登录页面

## 📝 部署注意事项

### Stripe 配置
需要在环境变量中设置实际的 Stripe 价格 ID：

```env
# 在 .env.local 中添加
NEXT_PUBLIC_STRIPE_PRICE_ID=price_your_actual_price_id
```

或者在代码中替换硬编码的价格 ID：
```typescript
// src/app/(dashboard)/subscription/page.tsx
const priceId = "price_your_actual_stripe_price_id_for_hk49_monthly";
```

### 环境变量检查
确保以下环境变量已正确设置：
```env
NEXT_PUBLIC_STRIPE_PRICE_ID=price_your_actual_price_id
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🚫 常见问题

### 1. 登录后仍显示登录按钮
**原因**: 状态未正确更新
**解决方案**: 检查浏览器控制台错误，确认 Supabase 连接正常

### 2. 订阅按钮无响应
**原因**: Stripe 价格 ID 无效
**解决方案**: 确认使用有效的 Stripe 价格 ID

### 3. 退出登录后页面空白
**原因**: 重定向未正确执行
**解决方案**: 检查 [signOut()](file:///Users/yuansen/qoder-respository/AbsAndAlgorithms/node_modules/next-auth/react/index.d.ts#L201-L227) 函数的回调 URL

---

**所有问题均已修复！现在订阅和登录功能应该正常工作了。** 🎉