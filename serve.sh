#!/bin/sh
# Local preview: http://127.0.0.1:4000/ with live reload.
#
# The version pinning is not optional. GitHub Pages runs Jekyll 3.10, and:
#   - Ruby 4.x   removes stdlib pieces Jekyll 3.10 needs
#   - Bundler 4.x raises "uninitialized class variable @@accept_charset in CGI"
#                 on Ruby 3.3
# So this pins Ruby 3.3 and Bundler 2.7.2 explicitly.
#
# First run only:
#   brew install ruby@3.3
#   PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH" gem install bundler -v '~> 2.7'
#   ./serve.sh --install
set -e
cd "$(dirname "$0")"

export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"
export GEM_HOME="$PWD/vendor/gems"
export GEM_PATH="$PWD/vendor/gems"
export PATH="$GEM_HOME/bin:$PATH"

if [ ! -x "/opt/homebrew/opt/ruby@3.3/bin/ruby" ]; then
  echo "Ruby 3.3 not found. Run: brew install ruby@3.3" >&2
  exit 1
fi

if [ "$1" = "--install" ]; then
  bundle _2.7.2_ config set --local path vendor/bundle
  bundle _2.7.2_ install
  exit 0
fi

if [ ! -d vendor/bundle ]; then
  echo "Dependencies not installed. Run: ./serve.sh --install" >&2
  exit 1
fi

exec bundle _2.7.2_ exec jekyll serve --livereload --host 127.0.0.1 --port 4000 "$@"
