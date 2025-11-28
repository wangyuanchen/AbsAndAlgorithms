# 受保护操作指南

## 🎯 功能需求

AI菜单生成接口需要实现以下保护机制：
1. 首先判断用户是否登录，未登录则跳转到登录页面
2. 登录成功后，检查用户是否订阅成功
3. 只有订阅成功的用户才能使用AI菜单生成功能
4. 未订阅用户跳转到订阅页面

## 🔧 实现方案

### 1. 创建自定义钩子

**文件**: `src/hooks/use-protected-action.ts`

```typescript
import { useSession } from "next-auth/react";
import { useSubscriptionStatus } from "@/features/subscriptions/api/use-subscription";
import { toast } from "sonner";

interface UseProtectedActionOptions {
  requireSubscription?: boolean;
}

export const useProtectedAction = (options: UseProtectedActionOptions = {}) => {
  const { requireSubscription = false } = options;
  const { data: session, status } = useSession();
  const { data: subscriptionData, isLoading: isSubscriptionLoading } = useSubscriptionStatus();

  const checkAccess = () => {
    // 检查认证状态
    if (status === "unauthenticated" || !session) {
      toast.error("Authentication required", {
        description: "Please sign in to continue",
        action: {
          label: "Sign In",
          onClick: () => window.location.href = "/sign-in",
        },
      });
      return false;
    }

    // 如果需要检查订阅状态
    if (requireSubscription) {
      if (isSubscriptionLoading) {
        toast.error("Checking subscription status...");
        return false;
      }

      if (!subscriptionData?.isSubscribed) {
        toast.error("Subscription required", {
          description: "Please subscribe to access this feature",
          action: {
            label: "Subscribe",
            onClick: () => window.location.href = "/subscription",
          },
        });
        return false;
      }
    }

    return true;
  };

  return { checkAccess, isAuthenticated: status === "authenticated", isSubscriptionLoading };
};
```

### 2. 更新菜单生成器组件

**文件**: `src/features/menus/components/menu-generator.tsx`

```typescript
// 导入新的钩子
import { useProtectedAction } from "@/hooks/use-protected-action";

export const MenuGenerator = () => {
  const { status } = useSession();
  const { checkAccess } = useProtectedAction({ requireSubscription: true }); // 需要订阅
  
  // ...

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查访问权限（包括认证和订阅）
    if (!checkAccess()) {
      return;
    }
    
    // 继续处理菜单生成逻辑
    // ...
  };
};
```

### 3. 后端API保护

**文件**: `src/app/api/[[...route]]/menus.ts`

```typescript
.post(
  "/",
  verifyAuth(), // 要求认证
  zValidator(
    "json",
    z.object({
      ingredients: z.string(),
      name: z.string().optional(),
    }),
  ),
  async (c) => {
    const auth = c.get("authUser");
    
    // 检查认证
    if (!auth.token?.id) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const userId = auth.token.id as string;

    // 检查订阅状态
    const supabase = await createClient();
    
    const { data: userSubscription } = await supabase
      .from('subscription')
      .select('*')
      .eq('userId', userId)
      .single();

    const hasActiveSubscription = 
      userSubscription &&
      userSubscription.status === "active" &&
      userSubscription.currentPeriodEnd &&
      new Date(userSubscription.currentPeriodEnd).getTime() > Date.now();

    if (!hasActiveSubscription) {
      return c.json({ 
        error: "Active subscription required to generate menus",
        code: "SUBSCRIPTION_REQUIRED" 
      }, 403);
    }

    // 继续处理AI菜单生成逻辑
    // ...
  },
)
```

## ✅ 功能流程

### 1. 未登录用户点击AI生成
```
用户点击"Generate Menu"按钮
→ 检查认证状态
→ 未登录：显示错误提示并提供登录按钮
→ 用户点击登录按钮
→ 跳转到 /sign-in 页面
```

### 2. 已登录但未订阅用户点击AI生成
```
用户点击"Generate Menu"按钮
→ 检查认证状态
→ 已登录：继续检查订阅状态
→ 未订阅：显示错误提示并提供订阅按钮
→ 用户点击订阅按钮
→ 跳转到 /subscription 页面
```

### 3. 已登录且已订阅用户点击AI生成
```
用户点击"Generate Menu"按钮
→ 检查认证状态
→ 已登录：继续检查订阅状态
→ 已订阅：允许生成菜单
→ 调用AI生成接口
→ 显示生成结果
```

## 📝 使用示例

### 在其他组件中使用
```typescript
import { useProtectedAction } from "@/hooks/use-protected-action";

const MyComponent = () => {
  const { checkAccess } = useProtectedAction({ requireSubscription: true });
  
  const handleAction = () => {
    if (checkAccess()) {
      // 用户有权限执行操作
      performAction();
    }
    // 如果没有权限，钩子会自动显示错误提示
  };
  
  return (
    <button onClick={handleAction}>
      Protected Action
    </button>
  );
};
```

### 仅检查认证状态（不需要订阅）
```typescript
const { checkAccess } = useProtectedAction({ requireSubscription: false });
```

## 🚫 错误处理

### 1. 认证错误
- 显示提示："Authentication required"
- 提供 "Sign In" 操作按钮
- 点击后跳转到登录页面

### 2. 订阅错误
- 显示提示："Subscription required"
- 提供 "Subscribe" 操作按钮
- 点击后跳转到订阅页面

### 3. 网络错误
- 显示通用错误消息
- 提供重试选项

## 📚 相关文件

- `src/hooks/use-protected-action.ts` - 核心保护钩子
- `src/features/menus/components/menu-generator.tsx` - 菜单生成器组件
- `src/app/api/[[...route]]/menus.ts` - 后端API保护
- `src/features/subscriptions/api/use-subscription.ts` - 订阅状态检查

---

**现在AI菜单生成功能已完全受保护，只有登录并订阅的用户才能使用！** 🎉