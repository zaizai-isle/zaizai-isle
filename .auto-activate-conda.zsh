# Auto-activate this project's local Conda environment when entering the repo.

_zaizai_isle_auto_conda() {
    local project_root="/Volumes/ieb/AEBO25/SA_Requirements/zaizai-isle"
    local project_env="$project_root/.conda-env"

    if [[ "$PWD" == "$project_root" || "$PWD" == "$project_root"/* ]]; then
        if [[ "$CONDA_PREFIX" != "$project_env" && -d "$project_env" ]]; then
            conda activate "$project_env"
        fi
    elif [[ "$CONDA_PREFIX" == "$project_env" ]]; then
        conda deactivate
    fi
}

autoload -Uz add-zsh-hook
add-zsh-hook chpwd _zaizai_isle_auto_conda
_zaizai_isle_auto_conda
