@echo off
REM Pre-commit hook to format code before committing

echo Running pre-commit formatting...

cd backend
pip install ruff -q 2>nul
ruff check --fix . 2>nul
ruff format . 2>nul
cd ..

cd frontend
call npm install --silent 2>nul
call npx prettier --write src\ 2>nul
cd ..

echo Formatting complete!
