@echo off\r\ncd /d %~dp0\r\n.\node_modules\.bin\vitest.cmd run --pool=forks --no-file-parallelism --reporter=basic > ..\t3.txt 2>&1\r\n
