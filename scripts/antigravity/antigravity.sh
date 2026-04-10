#!/bin/bash
# =============================================================================
# antigravity.sh - Forgewright Antigravity Planning System
# =============================================================================
# Quick commands for managing feature planning with Antigravity
# 
# Usage:
#   ./scripts/antigravity/antigravity.sh <command> [options]
#
# Commands:
#   new <feature-name>     - Create new feature planning folder
#   status                 - Show all feature plans and their status
#   progress <feature>     - Show progress of a feature
#   archive <feature>      - Archive a completed feature
#   list                   - List all feature plans
#   template <name>         - Copy a template to current directory
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
ANTIGRAVITY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PLANNING_DIR="$ANTIGRAVITY_ROOT/antigravity/planning"
TEMPLATE_DIR="$PLANNING_DIR/template"

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# Command: new <feature-name>
# =============================================================================

cmd_new() {
    local feature_name="$1"
    
    if [ -z "$feature_name" ]; then
        log_error "Usage: antigravity.sh new <feature-name>"
        exit 1
    fi
    
    # Convert to kebab-case if needed
    feature_name=$(echo "$feature_name" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
    
    local feature_dir="$PLANNING_DIR/$feature_name"
    
    if [ -d "$feature_dir" ]; then
        log_error "Feature '$feature_name' already exists!"
        exit 1
    fi
    
    log_info "Creating feature plan: $feature_name"
    
    # Create directory
    mkdir -p "$feature_dir"
    
    # Copy templates
    for template in PLAN.md SCOPE.md ARCHITECTURE.md TASKS.md DECISIONS.md RETROSPECTIVE.md; do
        if [ -f "$TEMPLATE_DIR/$template" ]; then
            cp "$TEMPLATE_DIR/$template" "$feature_dir/"
            log_success "Created $template"
        fi
    done
    
    # Update template placeholders with feature name
    sed -i '' "s/\[Feature Name\]/$feature_name/g" "$feature_dir"/*.md 2>/dev/null || \
    sed -i "s/\[Feature Name\]/$feature_name/g" "$feature_dir"/*.md
    
    log_success "Feature plan created: $feature_dir"
    echo ""
    echo "Next steps:"
    echo "  1. cd $feature_dir"
    echo "  2. Edit PLAN.md with your feature details"
    echo "  3. Define scope in SCOPE.md"
    echo "  4. Design architecture in ARCHITECTURE.md"
    echo "  5. Break down tasks in TASKS.md"
    echo "  6. Commit and push: git add . && git commit -m 'feat: add $feature_name feature plan'"
}

# =============================================================================
# Command: status
# =============================================================================

cmd_status() {
    log_info "Feature Plans Status"
    echo "========================================"
    
    if [ ! -d "$PLANNING_DIR" ]; then
        log_warn "No planning directory found"
        exit 0
    fi
    
    local count=0
    
    for feature_dir in "$PLANNING_DIR"/*/; do
        if [ -d "$feature_dir" ] && [ -f "$feature_dir/PLAN.md" ]; then
            local feature_name=$(basename "$feature_dir")
            local plan_file="$feature_dir/PLAN.md"
            
            # Extract status from PLAN.md
            local status=$(grep -m1 "Status" "$plan_file" 2>/dev/null | sed 's/|//g' | awk '{print $2}' || echo "Unknown")
            
            # Extract priority
            local priority=$(grep -m1 "Priority" "$plan_file" 2>/dev/null | sed 's/|//g' | awk '{print $2}' || echo "Unknown")
            
            # Count completed tasks
            local total_tasks=$(grep -c "^| P" "$feature_dir/TASKS.md" 2>/dev/null || echo "0")
            local done_tasks=$(grep -c "Done" "$feature_dir/TASKS.md" 2>/dev/null || echo "0")
            
            printf "${GREEN}%-25s${NC} | ${BLUE}%-10s${NC} | %-8s | Tasks: %s/%s\n" \
                "$feature_name" "$status" "$priority" "$done_tasks" "$total_tasks"
            
            ((count++))
        fi
    done
    
    echo "========================================"
    echo "Total: $count feature plans"
}

# =============================================================================
# Command: progress <feature>
# =============================================================================

cmd_progress() {
    local feature_name="$1"
    
    if [ -z "$feature_name" ]; then
        log_error "Usage: antigravity.sh progress <feature-name>"
        exit 1
    fi
    
    local feature_dir="$PLANNING_DIR/$feature_name"
    
    if [ ! -d "$feature_dir" ]; then
        log_error "Feature '$feature_name' not found"
        exit 1
    fi
    
    if [ ! -f "$feature_dir/TASKS.md" ]; then
        log_error "TASKS.md not found for '$feature_name'"
        exit 1
    fi
    
    echo "========================================"
    echo "Feature: $feature_name"
    echo "========================================"
    
    # Show P0 tasks
    echo ""
    echo "P0 Tasks (Critical):"
    grep "^| P0" "$feature_dir/TASKS.md" 2>/dev/null || echo "  None"
    
    # Show P1 tasks
    echo ""
    echo "P1 Tasks (High):"
    grep "^| P1" "$feature_dir/TASKS.md" 2>/dev/null || echo "  None"
    
    # Show P2 tasks
    echo ""
    echo "P2 Tasks (Medium):"
    grep "^| P2" "$feature_dir/TASKS.md" 2>/dev/null || echo "  None"
    
    # Count progress
    local total_lines=$(grep -c "^| P" "$feature_dir/TASKS.md" 2>/dev/null || echo "0")
    local done_lines=$(grep -c "Done" "$feature_dir/TASKS.md" 2>/dev/null || echo "0")
    
    if [ "$total_lines" -gt 0 ]; then
        local percent=$((done_lines * 100 / total_lines))
        echo ""
        echo "========================================"
        echo "Progress: $done_lines/$total_lines tasks ($percent%)"
    fi
}

# =============================================================================
# Command: archive <feature>
# =============================================================================

cmd_archive() {
    local feature_name="$1"
    
    if [ -z "$feature_name" ]; then
        log_error "Usage: antigravity.sh archive <feature-name>"
        exit 1
    fi
    
    local feature_dir="$PLANNING_DIR/$feature_name"
    
    if [ ! -d "$feature_dir" ]; then
        log_error "Feature '$feature_name' not found"
        exit 1
    fi
    
    # Update status in PLAN.md
    if [ -f "$feature_dir/PLAN.md" ]; then
        sed -i '' 's/Status.*Planning/Status: Archived/g' "$feature_dir/PLAN.md" 2>/dev/null || \
        sed -i 's/Status.*Planning/Status: Archived/g' "$feature_dir/PLAN.md"
        log_success "Updated status to Archived"
    fi
    
    # Move to archived folder
    mkdir -p "$PLANNING_DIR/archived"
    mv "$feature_dir" "$PLANNING_DIR/archived/"
    
    log_success "Archived: $feature_name"
}

# =============================================================================
# Command: list
# =============================================================================

cmd_list() {
    log_info "Available Feature Plans"
    echo "========================================"
    
    if [ ! -d "$PLANNING_DIR" ]; then
        log_warn "No planning directory found"
        exit 0
    fi
    
    for feature_dir in "$PLANNING_DIR"/*/; do
        if [ -d "$feature_dir" ] && [ -f "$feature_dir/PLAN.md" ]; then
            local feature_name=$(basename "$feature_dir")
            echo "  - $feature_name"
        fi
    done
}

# =============================================================================
# Command: template <name>
# =============================================================================

cmd_template() {
    local template_name="$1"
    
    if [ -z "$template_name" ]; then
        log_info "Available Templates:"
        echo "========================================"
        for template in "$TEMPLATE_DIR"/*.md; do
            if [ -f "$template" ]; then
                local name=$(basename "$template")
                echo "  - ${name%.md}"
            fi
        done
        exit 0
    fi
    
    local template_file="$TEMPLATE_DIR/${template_name}.md"
    
    if [ ! -f "$template_file" ]; then
        log_error "Template '$template_name' not found"
        log_info "Run 'antigravity.sh template' to see available templates"
        exit 1
    fi
    
    cp "$template_file" "./${template_name}.md"
    log_success "Copied ${template_name}.md to current directory"
}

# =============================================================================
# Main
# =============================================================================

main() {
    local command="${1:-}"
    shift 2>/dev/null || true
    
    case "$command" in
        new)
            cmd_new "$@"
            ;;
        status)
            cmd_status
            ;;
        progress)
            cmd_progress "$@"
            ;;
        archive)
            cmd_archive "$@"
            ;;
        list)
            cmd_list
            ;;
        template)
            cmd_template "$@"
            ;;
        help|--help|-h)
            echo "Antigravity - Feature Planning System"
            echo ""
            echo "Usage: antigravity.sh <command> [options]"
            echo ""
            echo "Commands:"
            echo "  new <feature-name>      Create new feature planning folder"
            echo "  status                 Show all feature plans and status"
            echo "  progress <feature>     Show progress of a feature"
            echo "  archive <feature>      Archive a completed feature"
            echo "  list                   List all feature plans"
            echo "  template [name]        Copy a template or list templates"
            echo ""
            ;;
        *)
            if [ -n "$command" ]; then
                log_error "Unknown command: $command"
            fi
            echo "Usage: antigravity.sh <command> [options]"
            echo "Run 'antigravity.sh help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"
