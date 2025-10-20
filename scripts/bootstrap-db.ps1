Param(
  [string]$MigrationFile = "supabase/migrations/20240101000000_initial_schema.sql",
  [string]$DbService = "db",
  [string]$DbUser = "",
  [string]$DbName = ""
)

if (-Not (Test-Path $MigrationFile)) {
  Write-Error "Migration file not found: $MigrationFile"
  exit 1
}

# Resolve defaults
if ([string]::IsNullOrEmpty($DbUser)) {
  if ($env:POSTGRES_USER) { $DbUser = $env:POSTGRES_USER } else { $DbUser = 'postgres' }
}
if ([string]::IsNullOrEmpty($DbName)) {
  if ($env:POSTGRES_DB) { $DbName = $env:POSTGRES_DB } else { $DbName = 'campusconnect' }
}

Write-Host "Starting db service..."
& docker compose up -d $DbService

Write-Host "Waiting for Postgres to be ready..."
do {
  Start-Sleep -Seconds 1
  & docker compose exec -T $DbService pg_isready -U $DbUser 2>$null
} until ($LASTEXITCODE -eq 0)

Write-Host "Applying migration $MigrationFile"
Get-Content $MigrationFile -Raw | docker compose exec -T $DbService psql -U $DbUser -d $DbName -f -

Write-Host "Database bootstrap complete."