#!/bin/bash

echo "🚀 启动 MathResearchPilot"
echo "================================"
echo ""

# 检查 Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker Desktop"
    exit 1
fi

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose down

# 启动新容器
echo "🔨 构建并启动服务..."
docker-compose up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查 API
echo ""
echo "🔍 检查 API 服务..."
for i in {1..10}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ API 服务已启动"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "⚠️  API 服务启动超时"
        echo "   查看日志: docker-compose logs api"
    else
        sleep 2
    fi
done

# 检查前端
echo ""
echo "🔍 检查前端服务..."
for i in {1..10}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ 前端服务已启动"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "⚠️  前端服务启动超时"
        echo "   查看日志: docker-compose logs web"
    else
        sleep 2
    fi
done

# 显示结果
echo ""
echo "================================"
echo "✨ 服务已启动！"
echo ""
echo "📡 API 文档: http://localhost:8000/docs"
echo "🌐 前端页面: http://localhost:3000"
echo "📝 注册页面: http://localhost:3000/auth/register"
echo ""
echo "💡 查看实时日志："
echo "   docker-compose logs -f"
echo ""
echo "🛑 停止服务："
echo "   docker-compose down"
echo "================================"
