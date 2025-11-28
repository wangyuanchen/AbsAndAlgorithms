# Node.js 升级指南

## 🎯 当前状态

- **当前 Node.js 版本**: v18.20.8
- **推荐 Node.js 版本**: v20.x 或更高
- **警告信息**: 
  ```
  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js
  ```

## 🔧 升级选项

### 选项 1: 使用 nvm (推荐)

#### 1. 安装 nvm (如果尚未安装)
```bash
# macOS/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

#### 2. 重新加载终端配置
```bash
source ~/.bashrc
# 或者
source ~/.zshrc
```

#### 3. 安装 Node.js 20
```bash
nvm install 20
nvm use 20
nvm alias default 20
```

#### 4. 验证安装
```bash
node --version  # 应该显示 v20.x.x
npm --version
```

### 选项 2: 直接下载安装

#### 1. 访问 Node.js 官网
https://nodejs.org/

#### 2. 下载 LTS 版本 (推荐)
- 选择最新的 LTS 版本 (通常是 v20.x)

#### 3. 安装并验证
```bash
node --version
npm --version
```

## 🔄 项目迁移步骤

### 1. 升级 Node.js 版本
```bash
nvm install 20
nvm use 20
```

### 2. 清理依赖项
```bash
# 删除 node_modules 和锁文件
rm -rf node_modules
rm package-lock.json

# 重新安装依赖
npm install
```

### 3. 测试应用
```bash
# 启动开发服务器
npm run dev

# 运行构建测试
npm run build
```

### 4. 验证功能
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 订阅功能
- [ ] Supabase 连接
- [ ] Stripe 支付

## 📝 注意事项

### 1. 环境变量兼容性
确保所有环境变量在新版本中仍然有效：
```bash
# 检查环境变量
cat .env.local
```

### 2. 依赖项兼容性
检查 package.json 中的依赖项是否与 Node.js 20 兼容：
```bash
# 查看过时的包
npm outdated
```

### 3. 构建工具兼容性
确保构建工具与 Node.js 20 兼容：
- Next.js v14+
- TypeScript v5+
- 其他构建工具

## 🚫 可能遇到的问题

### 1. 依赖项不兼容
**错误示例**:
```
Error: The engine "node" is incompatible with this module
```

**解决方案**:
```bash
# 更新依赖项
npm update
```

### 2. 构建失败
**错误示例**:
```
ReferenceError: fetch is not defined
```

**解决方案**:
Node.js 20 内置了 fetch，无需额外安装。

### 3. 加密模块问题
**错误示例**:
```
Error: crypto.getRandomValues() not supported
```

**解决方案**:
Node.js 20 对加密模块有更好的支持，通常不需要额外配置。

## ✅ 验证升级成功

### 1. 版本检查
```bash
node --version  # 应该显示 v20.x.x
npm --version   # 应该显示 9.x 或更高
```

### 2. 功能测试
```bash
# 测试基本功能
npm run dev
# 访问 http://localhost:3000

# 测试 API
curl http://localhost:3000/api/health
```

### 3. Supabase 连接测试
```bash
# 测试 Supabase 客户端
node -e "
import { createClient } from '@supabase/supabase-js'
console.log('Supabase client created successfully')
"
```

## 📚 相关资源

- [Node.js 官方下载页面](https://nodejs.org/)
- [nvm GitHub 仓库](https://github.com/nvm-sh/nvm)
- [Supabase Node.js 支持讨论](https://github.com/orgs/supabase/discussions/37217)
- [Next.js 系统要求](https://nextjs.org/docs/getting-started/installation#system-requirements)

## 🛠️ 回滚方案

如果升级后出现问题，可以回滚到 Node.js 18：

```bash
# 使用 nvm 切换回 Node.js 18
nvm install 18
nvm use 18

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

---

**升级到 Node.js 20 将确保你的应用获得最佳性能和长期支持！** 🎉