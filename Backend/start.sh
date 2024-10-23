#!/bin/bash

# 脚本名称: start.sh
# 用途: 构建并启动 Spring Boot 应用程序
# 使用方法: ./start.sh

# 配置部分
BUILD_TOOL="gradle" # 可选值: "maven" 或 "gradle"
JAR_NAME="your-app.jar" # 生成的 JAR 文件名称
LOG_FILE="app.log" # 日志文件名称
ENV_FILE=".env" # 环境变量文件

# 功能函数

# 打印日志并记录到文件
log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# 处理错误并退出
handle_error() {
    log "错误: $1"
    exit 1
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        handle_error "$1 未安装。请先安装 $1 并重试。"
    fi
}

# 加载环境变量
load_env() {
    if [ -f "$ENV_FILE" ]; then
        log "加载环境变量文件: $ENV_FILE"
        export $(grep -v '^#' "$ENV_FILE" | xargs) || handle_error "加载环境变量失败"
    else
        log "环境变量文件 $ENV_FILE 不存在，跳过加载。"
    fi
}

# 构建项目
build_project() {
    log "开始构建项目，使用 $BUILD_TOOL..."
    if [ "$BUILD_TOOL" == "maven" ]; then
        mvn clean install -DskipTests || handle_error "Maven 构建失败"
    elif [ "$BUILD_TOOL" == "gradle" ]; then
        ./gradlew clean build || handle_error "Gradle 构建失败"
    else
        handle_error "未知的构建工具: $BUILD_TOOL"
    fi
    log "项目构建成功。"
}

# 查找 JAR 文件
find_jar() {
    if [ "$BUILD_TOOL" == "maven" ]; then
        JAR_PATH=$(find target -name "*.jar" | grep -v "original" | head -n 1)
    elif [ "$BUILD_TOOL" == "gradle" ]; then
        JAR_PATH=$(find build/libs -name "*.jar" | head -n 1)
    fi

    if [ -z "$JAR_PATH" ]; then
        handle_error "未找到生成的 JAR 文件。"
    fi

    log "找到 JAR 文件: $JAR_PATH"
}

# 运行应用程序
run_app() {
    log "启动 Spring Boot 应用程序..."
    nohup java -jar "$JAR_PATH" > "$LOG_FILE" 2>&1 &
    APP_PID=$!
    log "应用程序已启动，PID: $APP_PID"
    log "日志文件: $LOG_FILE"
}

# 主函数
main() {
    log "=== Spring Boot 项目启动脚本 ==="

    # 检查前置条件
    check_command "java"
    if [ "$BUILD_TOOL" == "maven" ]; then
        check_command "mvn"
    elif [ "$BUILD_TOOL" == "gradle" ]; then
        check_command "gradle" || check_command "./gradlew"
    fi

    # 加载环境变量
    load_env

    # 构建项目
    build_project

    # 查找 JAR 文件
    find_jar

    # 运行应用程序
    run_app

    log "=== 启动完成 ==="
}

# 执行主函数
main