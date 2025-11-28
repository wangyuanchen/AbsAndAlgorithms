# 用户注册 500 错误修复指南

## 🎯 问题描述

用户注册时调用 `/api/users` 接口返回 500 错误。

## 🔍 错误分析

通过调试发现具体错误信息：
```
"null value in column \"id\" of relation \"user\" violates not-null constraint"
```

这表明在插入用户数据时，没有提供 `id` 字段，但数据库表要求该字段不能为空。

## 🛠️ 修复内容

### 1. 为用户生成 UUID

**文件**: `src/app/api/[[...route]]/users.ts`

```typescript
// 修复前
const { error: insertError } = await supabase
  .from('user')
  .insert({
    email,
    name,
    password: hashedPassword,
  });

// 修复后
const { error: insertError } = await supabase
  .from('user')
  .insert({
    id: crypto.randomUUID(), // 生成 UUID
    email,
    name,
    password: hashedPassword,
  });
```

### 2. 改进错误处理

为了更好地调试，增加了详细的错误日志：

```typescript
if (insertError) {
  console.error('Failed to create user:', insertError);
  return c.json({ error: "Failed to create user", details: insertError.message }, 500);
}
```

### 3. 优化用户存在性检查

改进了对 Supabase 查询错误的处理：

```typescript
// 检查是否有错误（除了"记录未找到"的情况）
if (fetchError && fetchError.code !== 'PGRST116') {  // PGRST116 是 'Record not found'
  console.error('Database error:', fetchError);
  return c.json({ error: "Database error" }, 500);
}
```

## ✅ 验证修复

### 测试注册功能
```bash
# 测试注册新用户
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 应该返回
null

# 再次注册相同邮箱应该返回错误
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# 应该返回
{"error":"Email already in use"}
```

## 📝 注意事项

1. **UUID 生成**: 使用 `crypto.randomUUID()` 生成唯一的用户 ID
2. **错误处理**: 提供详细的错误信息便于调试
3. **重复检查**: 正确处理 Supabase 查询的"记录未找到"情况

## 🚫 常见问题

### 1. 仍然返回 500 错误
**可能原因**: 
- Supabase 环境变量未正确设置
- 数据库表结构不匹配

**解决方案**:
- 检查 `.env.local` 中的 Supabase 配置
- 确认 `user` 表结构包含 `id` 字段

### 2. 注册成功但无法登录
**可能原因**: 密码哈希处理问题

**解决方案**: 
- 检查 `bcryptjs` 版本兼容性
- 确认密码哈希和验证逻辑一致

---

**用户注册功能现已恢复正常工作！** 🎉