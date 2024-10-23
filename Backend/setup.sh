#!/bin/bash

LOG_FILE="setup_log.txt"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

handle_error() {
    log "Error: $1"
    exit 1
}

if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
else
    handle_error "Unsupported operating system"
fi

log "Detected $OS operating system"

check_and_install() {
    if ! command -v $1 &> /dev/null; then
        log "Installing $1..."
        if [ "$OS" == "macOS" ]; then
            brew install $1 || handle_error "$1 installation failed"
        elif [ "$OS" == "Linux" ]; then
            sudo apt-get install -y $1 || handle_error "$1 installation failed"
        fi
    else
        log "$1 is already installed, skipping"
    fi
}

install_dependencies() {
    if [ "$OS" == "macOS" ]; then
        if ! command -v brew &> /dev/null; then
            log "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || handle_error "Homebrew installation failed"
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
        log "Installing Node.js packages..."
        npm install -g react-scripts tailwindcss || handle_error "Node.js packages installation failed"
    else
        log "Node.js packages are already installed, skipping"
    fi
}

install_spring_boot() {
    if ! command -v spring &> /dev/null; then
        log "Installing Spring Boot CLI..."
        curl -s "https://get.sdkman.io" | bash
        source "$HOME/.sdkman/bin/sdkman-init.sh"
        sdk install springboot || handle_error "Spring Boot installation failed"
    else
        log "Spring Boot CLI is already installed, skipping"
    fi
}

install_chromadb() {
    log "Setting up Python virtual environment..."
    VENV_DIR="$HOME/chroma_env"

    if [ ! -d "$VENV_DIR" ]; then
        python3 -m venv $VENV_DIR || handle_error "Failed to create virtual environment"
        log "Virtual environment created in $VENV_DIR"
    else
        log "Virtual environment already exists, skipping creation"
    fi

    # Activate virtual environment
    source $VENV_DIR/bin/activate

    # Install ChromaDB
    if ! pip3 list | grep -q chromadb; then
        log "Installing ChromaDB..."
        pip3 install chromadb || handle_error "ChromaDB installation failed"
    else
        log "ChromaDB is already installed, skipping"
    fi

    # Exit virtual environment
    deactivate
}

setup_docker_services() {
    if ! docker info &> /dev/null; then
        handle_error "Docker is not running, please start Docker and rerun the script"
    fi

    if ! docker network ls | grep -q elastic; then
        log "Creating Docker network 'elastic'..."
        docker network create elastic || handle_error "Failed to create Docker network"
    else
        log "Docker network 'elastic' already exists, skipping creation"
    fi

    start_container() {
        local name=$1
        local image=$2
        local port=$3
        if ! docker ps | grep -q $name; then
            log "Starting $name container..."
            $4 || handle_error "$name container failed to start"
        else
            log "$name container is already running, skipping start"
        fi
    }

    start_container "elasticsearch" "docker.elastic.co/elasticsearch/elasticsearch:8.15.0" "9200" \
        "docker run -d --name elasticsearch --net elastic -p 9200:9200 -e \"discovery.type=single-node\" -e \"xpack.security.enabled=false\" -e \"ES_JAVA_OPTS=-Xms512m -Xmx512m\" docker.elastic.co/elasticsearch/elasticsearch:8.15.0"

    log "Waiting for Elasticsearch to start..."
    sleep 30

    start_container "kibana" "docker.elastic.co/kibana/kibana:8.15.0" "5601" \
        "docker run -d --name kibana --net elastic -p 5601:5601 -e \"ELASTICSEARCH_HOSTS=http://elasticsearch:9200\" docker.elastic.co/kibana/kibana:8.15.0"

    start_container "chroma" "ghcr.io/chroma-core/chroma:0.4.15" "8000" \
        "docker run -d --name chroma --net elastic -p 8000:8000 ghcr.io/chroma-core/chroma:0.4.15"
}

main() {
    log "Starting to install dependencies..."
    install_dependencies
    install_node_packages
    install_spring_boot
    install_chromadb
    setup_docker_services

    log "Installation completed. Note that some components may require additional configuration."
    log "You can access the services via the following addresses:"
    log "Elasticsearch: http://localhost:9200"
    log "Kibana: http://localhost:5601"
    log "Chroma: http://localhost:8000"
}

main