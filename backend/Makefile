init_db:
	@sqlite3 ./pkg/db/social-network.db .databases

run:
	@fresh "./*.go"

init:
	@go install github.com/gravityblast/fresh@latest
	@export PATH="$HOME/go/bin/fresh:$PATH"
	@go install -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	@export PATH="$HOME/go/bin/migrate:$PATH"

migration:
	@echo "Enter migration name:"
	@read MIGRATION_NAME
	@migrate create -ext sql 