import sqlite3
import json

conn = sqlite3.connect('casino_crm.db')
cursor = conn.cursor()

# Get all tables
cursor.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = cursor.fetchall()

print("\n" + "="*100)
print("📊 COMPLETE DATABASE OVERVIEW - CAMPEON CRM")
print("="*100)

for table_name in tables:
    table = table_name[0]
    print(f"\n\n{'='*100}")
    print(f"TABLE: {table.upper()}")
    print('='*100)

    # Get schema
    cursor.execute(f"PRAGMA table_info({table});")
    columns = cursor.fetchall()
    print("\n📋 COLUMNS:")
    for col in columns:
        col_id, col_name, col_type, notnull, default, pk = col
        print(f"  {col_id+1}. {col_name:<30} ({col_type})")

    # Get all rows
    cursor.execute(f"SELECT * FROM {table};")
    rows = cursor.fetchall()

    print(f"\n📈 DATA: ({len(rows)} rows)")
    print("-" * 100)

    if not rows:
        print("  [Empty table]")
    else:
        for idx, row in enumerate(rows, 1):
            print(f"\n  ROW {idx}:")
            for col_idx, col in enumerate(columns):
                col_name = col[1]
                value = row[col_idx]

                # Pretty print JSON fields
                if col_name in ['cost', 'maximum_amount', 'minimum_amount', 'minimum_stake_to_wager', 'maximum_stake_to_wager', 'maximum_withdraw', 'trigger_name', 'trigger_description', 'minimum_amount']:
                    if value:
                        try:
                            data = json.loads(value) if isinstance(
                                value, str) else value
                            print(
                                f"    {col_name}: {json.dumps(data, indent=6)}")
                        except:
                            print(f"    {col_name}: {value}")
                    else:
                        print(f"    {col_name}: (null)")
                else:
                    # Truncate long values
                    str_val = str(value)
                    if len(str_val) > 80:
                        str_val = str_val[:80] + "..."
                    print(f"    {col_name}: {str_val}")

print("\n\n" + "="*100)
print("✅ DATABASE SCAN COMPLETE")
print("="*100 + "\n")

conn.close()
