import sqlite3
import json

conn = sqlite3.connect('casino_crm.db')
cursor = conn.cursor()

# Query PRAGMATIC config
cursor.execute("SELECT * FROM stable_configs WHERE provider = 'PRAGMATIC';")
result = cursor.fetchone()

if result:
    print("=" * 80)
    print("PRAGMATIC CONFIGURATION")
    print("=" * 80)

    # Column names from the schema
    cursor.execute("PRAGMA table_info(stable_configs);")
    columns = [col[1] for col in cursor.fetchall()]

    # Display each field
    for i, col_name in enumerate(columns):
        value = result[i]

        # Pretty print JSON fields
        if col_name in ['cost', 'maximum_amount', 'minimum_amount', 'minimum_stake_to_wager', 'maximum_stake_to_wager', 'maximum_withdraw']:
            if value:
                try:
                    data = json.loads(value) if isinstance(
                        value, str) else value
                    print(f"\n{col_name.upper()}:")
                    print(json.dumps(data, indent=2))
                except:
                    print(f"\n{col_name.upper()}: {value}")
            else:
                print(f"\n{col_name.upper()}: (empty)")
        else:
            print(f"{col_name}: {value}")
else:
    print("❌ No PRAGMATIC configuration found in database")

conn.close()
