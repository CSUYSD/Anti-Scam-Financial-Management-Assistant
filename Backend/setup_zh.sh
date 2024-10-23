#!/bin/bash

LOG_FILE="setup_log_zh.txt"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

handle_error() {
    log "错误: $1"
    exit 1
}

if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
else
    handle_error "不支持的操作系统"
fi

log "检测到 $OS 操作系统"

check_and_install() {
    if ! command -v $1 &> /dev/null; then
        log "安装 $1..."
        if [ "$OS" == "macOS" ]; then
            brew install $1 || handle_error "$1 安装失败"
        elif [ "$OS" == "Linux" ]; then
            sudo apt-get install -y $1 || handle_error "$1 安装失败"
        fi
    else
        log "$1 已安装，跳过"
    fi
}

install_dependencies() {
    if [ "$OS" == "macOS" ]; then
        if ! command -v brew &> /dev/null; then
            log "安装 Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || handle_error "Homebrew 安装失败"
        fi
        brew update
    elif [ "$OS" == "Linux" ]; then
        sudo apt-get update
    fi

    for pkg in node java rabbitmq redis nvim docker python; do
        check_and_install $pkg
    done

    if [ "$OS" == "macOS" ]; then
        brew services start rabbitmq
        brew services start redis
    elif [ "$OS" == "Linux" ]; then
        sudo systemctl start rabbitmq-server
        sudo systemctl start redis-server
    fi
}

install_node_packages() {
    if ! command -v react-scripts &> /dev/null || ! command -v tailwindcss &> /dev/null; then
        log "安装 Node.js 包..."
        npm install -g react-scripts tailwindcss || handle_error "Node.js 包安装失败"
    else
        log "Node.js 包已安装，跳过"
    fi
}

install_spring_boot() {
    if ! command -v spring &> /dev/null; then
        log "安装 Spring Boot CLI..."
        curl -s "https://get.sdkman.io" | bash
        source "$HOME/.sdkman/bin/sdkman-init.sh"
        sdk install springboot || handle_error "Spring Boot 安装失败"
    else
        log "Spring Boot CLI 已安装，跳过"
    fi
}

install_chromadb() {
    log "设置 Python 虚拟环境..."
    VENV_DIR="$HOME/chroma_env"

    if [ ! -d "$VENV_DIR" ]; then
        python3 -m venv $VENV_DIR || handle_error "创建虚拟环境失败"
        log "虚拟环境已创建在 $VENV_DIR"
    else
        log "虚拟环境已存在，跳过创建"
    fi

    # 激活虚拟环境
    source $VENV_DIR/bin/activate

    # 安装 ChromaDB
    if ! pip3 list | grep -q chromadb; then
        log "安装 ChromaDB..."
        pip3 install chromadb || handle_error "ChromaDB 安装失败"
    else
        log "ChromaDB 已安装，跳过"
    fi

    # 退出虚拟环境
    deactivate
}

setup_docker_services() {
    if ! docker info &> /dev/null; then
        handle_error "Docker 未运行，请启动 Docker 并重新运行脚本"
    fi

    if ! docker network ls | grep -q elastic; then
        log "创建 Docker 网络 'elastic'..."
        docker network create elastic || handle_error "创建 Docker 网络失败"
    else
        log "Docker 网络 'elastic' 已存在，跳过创建"
    fi

    start_container() {
        local name=$1
        local image=$2
        local port=$3
        if ! docker ps | grep -q $name; then
            log "启动 $name 容器..."
            $4 || handle_error "$name 容器启动失败"
        else
            log "$name 容器已运行，跳过启动"
        fi
    }

    start_container "elasticsearch" "docker.elastic.co/elasticsearch/elasticsearch:8.15.0" "9200" \
        "docker run -d --name elasticsearch --net elastic -p 9200:9200 -e \"discovery.type=single-node\" -e \"xpack.security.enabled=false\" -e \"ES_JAVA_OPTS=-Xms512m -Xmx512m\" docker.elastic.co/elasticsearch/elasticsearch:8.15.0"

    log "等待 Elasticsearch 启动..."
    sleep 30

    start_container "kibana" "docker.elastic.co/kibana/kibana:8.15.0" "5601" \
        "docker run -d --name kibana --net elastic -p 5601:5601 -e \"ELASTICSEARCH_HOSTS=http://elasticsearch:9200\" docker.elastic.co/kibana/kibana:8.15.0"

    start_container "chroma" "ghcr.io/chroma-core/chroma:0.4.15" "8000" \
        "docker run -d --name chroma --net elastic -p 8000:8000 ghcr.io/chroma-core/chroma:0.4.15"
}

main() {
    log "开始安装依赖..."
    install_dependencies
    install_node_packages
    install_spring_boot
    install_chromadb
    setup_docker_services

    log "安装完成。请注意某些组件可能需要额外配置。"
    log "您可以通过以下地址访问服务："
    log "Elasticsearch: http://localhost:9200"
    log "Kibana: http://localhost:5601"
    log "Chroma: http://localhost:8000"
}

main