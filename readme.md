# 面向中老年小商户的AI理财助手 🚀

xxxxxxx

## 项目进展 🗓️

**2024/08/13:**

- **完成**:
  1. CRUD 操作实现（负责: 王昌昊）
  2. 基本的Security验证逻辑实现（负责: 宋国成，王昌昊）
  3. H2 in-memory 数据库集成替换了PostgreSQL，配置位于`application.properties`中（负责: 王昌昊）
  4. 测试了注册与登录接口，注册功能修复了写入用户信息时密码未加密的问题（负责: 宋国成）
  5. 自定义使用md5加密方法，完成了token的生成和验证（负责：宋国成）
  6. 配置跨域访问（负责：宋国成）
  7. 关于登录与注册问题的解决，创建一个新的UserServiceImpl的类型，把login与signup的实现方法封装在里面，原来的UserService实现了UserDetailsService，并且重写了loadUserByUsername方法，会导致配置类与UserService的互相依赖。

## TODO 列表 📋
- [x] 示例完成✅(隔壁老王）

- [ ] 测试 CRUD 功能
- [ ] 完成注释和文档编写
- [ ] 实现请求拦截器
- [x] 实现 Login Token 功能

## 使用说明 📖

如何安装和使用这个项目的简要指南。
