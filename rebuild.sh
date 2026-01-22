#!/bin/bash

# bcrypt 兼容性修复 - 重建脚本
# 该脚本将停止容器、清理、并重新构建项目

set -e

echo "🔧 开始修复 bcrypt 兼容性问题..."
echo ""

# 停止并清理现有容器
echo "📦 停止现有容器..."
docker-compose down -v

echo ""
echo "🏗️  重新构建镜像(可能需要几分钟)..."
docker-compose build --no-cache api

echo ""
echo "🚀 启动服务..."
docker-compose up -d

echo ""
echo "⏳ 等待服务启动(15秒)..."
sleep 15

echo ""
echo "✅ 服务已启动!"
echo ""
echo "📍 访问地址:"
echo "   Web界面: http://localhost:3000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "🧪 测试健康检查..."
curl -s http://localhost:8000/health | jq . || echo "健康检查响应: $(curl -s http://localhost:8000/health)"

echo ""
echo "📝 查看日志命令:"
echo "   docker-compose logs -f api"
echo "   docker-compose logs -f web"
echo ""
echo "🎉 修复完成!现在可以尝试注册用户了。"
