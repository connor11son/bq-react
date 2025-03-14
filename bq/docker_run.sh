docker run --name bisque --rm -p 8080:8080  -v $(pwd)/etc:/source/etc -v $(pwd)/core-restart.sh:/source/core-restart.sh amilworks/bisque-module-dev:git
