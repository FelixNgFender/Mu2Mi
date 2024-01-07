#!/bin/bash

set -e
set -u

function create_user_and_database() {
	local database=${1}
	echo "  Creating user and database '${database}'"
	mkdir -p /var/lib/postgresql/tablespaces/${database}
	psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" <<-EOSQL
    CREATE USER ${database} PASSWORD '${database}';
    CREATE DATABASE ${database};
    GRANT ALL PRIVILEGES ON DATABASE ${database} TO ${database};
    \c ${database};
    GRANT ALL PRIVILEGES ON SCHEMA public TO ${database};
EOSQL
}

if [ -n "${POSTGRES_MULTIPLE_DATABASES}" ]; then
	echo "Multiple database creation requested: {$POSTGRES_MULTIPLE_DATABASES}"
	for db in $(echo ${POSTGRES_MULTIPLE_DATABASES} | tr ',' ' '); do
		create_user_and_database ${db}
	done
	echo "Multiple databases created"
fi
