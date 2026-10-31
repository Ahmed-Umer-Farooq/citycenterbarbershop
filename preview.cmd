@echo off
REM Local preview for this static site.
REM Double-clicking index.html does not work: the pages use absolute paths
REM ("/assets/..."), which file:// resolves to the drive root. Serving the
REM folder over http fixes that and matches exactly how Vercel will serve it.
cd /d "%~dp0"
set PORT=8080
echo.
echo   City Center Barbershop - local preview
echo   http://localhost:%PORT%/
echo.
echo   Leave this window open while you browse. Close it to stop.
echo.
start "" "http://localhost:%PORT%/"
where python >nul 2>nul && (
  python -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)
where npx >nul 2>nul && (
  npx --yes serve -l %PORT% .
  goto :eof
)
echo   Could not find python or npx on this machine.
echo   Install either one, or run any static server in this folder.
pause
