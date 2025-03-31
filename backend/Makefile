init_db:
	@sqlite3 ./pkg/db/social-network.db .databases

run:
	@fresh "./*.go"

init:
	@go install github.com/gravityblast/fresh@latest
	@go install -tags 'sqlite3' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	export PATH="$PATH:/home/hackerman/go/bin"


migration:
	@echo "Enter migration name:"
	@read MIGRATION_NAME && migrate create -ext sql -dir ./pkg/db/migrations/sqlite $$MIGRATION_NAME