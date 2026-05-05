#!/bin/bash
set -euo pipefail

# Один скрипт, чтобы не вспоминать каждый раз про локальный SDK и служебные папки.
ROOT="/Users/macbookairm313/Documents/Дискретная математика"

export DOTNET_CLI_HOME="$ROOT/.dotnet-cli"
export NUGET_PACKAGES="$ROOT/.nuget/packages"
export DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
export DOTNET_NOLOGO=1

"$ROOT/.dotnet/dotnet" run --project "$ROOT/SocialGraphLab/SocialGraphLab.csproj" --urls http://localhost:5187
