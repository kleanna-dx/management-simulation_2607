#!/usr/bin/env python3
"""
Upload SAP BW Excel data to the material-cost-analysis API.
Sends individual rows WITHOUT aggregation.
Maps SAP BW 37 columns to API field names.
"""
import json
import requests
import openpyxl

BASE_URL = "http://localhost:3000"

# SAP BW 원재료(100) 37 column mapping (0-indexed)
# Column order for BW_ZOHPP100 (원재료):
COL_MAP_100 = [
    'calendar_ym',              # 0: 기간(달력 연/월)
    'process_code',             # 1: 공정
    'process_name',             # 2: 공정명
    'machine_code',             # 3: 생산호기
    'machine_name',             # 4: 생산호기명
    'product_level1',           # 5: 제품군1
    'product_level1_name',      # 6: 제품군1명
    'product_level2',           # 7: 제품군2
    'product_level2_name',      # 8: 제품군2명
    'product_level3',           # 9: 제품군3
    'product_level3_name',      # 10: 제품군3명
    'product_level4',           # 11: 제품군4
    'product_level4_name',      # 12: 제품군4명
    'material_code',            # 13: 자재
    'material_name',            # 14: 자재내역
    'material_group',           # 15: 자재그룹
    'material_group_name',      # 16: 자재그룹명
    'material_group_major',     # 17: 자재그룹(대분류)
    'material_group_major_name',# 18: 자재그룹(대분류)명
    'product_type_code',        # 19: 제품구분
    'product_type_name',        # 20: 제품구분명
    'plan_unit_consumption',    # 21: 계획 원단위
    'component_qty',            # 22: 구성수량
    'base_qty',                 # 23: 기준수량
    'plan_unit_consumption_waste', # 24: 계획원단위(LOSS포함)
    'plan_unit_price',          # 25: 계획단가
    'plan_alloc_qty',           # 26: 계획배부량
    'total_production',         # 27: 총생산량
    'production_qty',           # 28: 생산량
    'waste_qty',                # 29: LOSS량
    'actual_unit_consumption',  # 30: 실적원단위
    'actual_alloc_qty',         # 31: 실적배부량
    'actual_unit_price',        # 32: 실적단가
    'issue_qty',                # 33: 투입량
    'issue_amount',             # 34: 투입금액
    'plan_vs_usage_diff',       # 35: 계획대비(사용량차이)
    'plan_vs_price_diff',       # 36: 계획대비(단가차이)
]

# SAP BW 부재료(101) 37 column mapping
# Columns 17-20 differ: 지종, 지종명, 제품구분, 제품구분명
COL_MAP_101 = list(COL_MAP_100)  # Same base
# For 부재료, columns 17-18 are 지종/지종명 instead of 자재그룹(대분류)
# But we map them to the same field names for raw_records storage


def parse_sap_file(filepath, data_source):
    """Parse SAP BW Excel file and return rows for upload."""
    wb = openpyxl.load_workbook(filepath, data_only=True)
    ws = wb.active
    
    # Get all rows as lists
    all_rows = []
    for row in ws.iter_rows(values_only=True):
        all_rows.append(list(row))
    
    if len(all_rows) < 3:
        print(f"Not enough rows in {filepath}")
        return [], []
    
    # Row 0: Headers (Korean)
    # Row 1: Technical names (BIC_xxx) - skip
    # Row 2+: Data
    headers = [str(h) if h else '' for h in all_rows[0]]
    print(f"\nFile: {filepath}")
    print(f"Total rows (including headers): {len(all_rows)}")
    print(f"Column count: {len(headers)}")
    print(f"First 5 headers: {headers[:5]}")
    
    # Check if row 1 is BIC_ technical row
    start_row = 1
    if len(all_rows) > 1 and all_rows[1]:
        row1_first = str(all_rows[1][0]) if all_rows[1][0] else ''
        if row1_first.startswith('BIC_') or row1_first.startswith('0CAL'):
            start_row = 2
            print("Skipping BIC_ technical row (row 1)")
    
    # Use the appropriate column map
    col_map = COL_MAP_100
    
    data_rows = all_rows[start_row:]
    print(f"Data rows to process: {len(data_rows)}")
    
    rows_for_api = []  # For monthly_records
    raw_rows_for_api = []  # For raw_records (objects with field names)
    
    for row_idx, row_data in enumerate(data_rows):
        # Pad to 37 columns
        while len(row_data) < 37:
            row_data.append(None)
        
        # Build raw row object with field names
        raw_obj = {}
        for i, field_name in enumerate(col_map):
            val = row_data[i]
            if val is None:
                raw_obj[field_name] = ''
            else:
                raw_obj[field_name] = str(val)
        raw_rows_for_api.append(raw_obj)
        
        # Build simplified row for monthly_records
        period_val = row_data[0]  # calendar_ym (e.g., 202605)
        machine_code = row_data[3]  # 생산호기 (e.g., PM2)
        material_code_raw = row_data[13]  # 자재 (e.g., 000000000002000003)
        material_name = row_data[14]  # 자재내역
        material_group_desc = row_data[16]  # 자재그룹명
        
        if not period_val or not material_code_raw:
            continue
        
        # Normalize period
        period_str = str(int(period_val)) if isinstance(period_val, (int, float)) else str(period_val).strip()
        if len(period_str) != 6:
            continue
        
        # Normalize material code: remove leading zeros
        mat_code_str = str(material_code_raw).strip()
        try:
            mat_code_str = str(int(mat_code_str))
        except ValueError:
            pass
        
        # Machine code
        machine_str = str(machine_code).strip() if machine_code else ''
        
        # Numeric fields
        def safe_float(val):
            if val is None:
                return 0.0
            try:
                return float(val)
            except (ValueError, TypeError):
                return 0.0
        
        issue_qty = safe_float(row_data[33])       # 투입량
        actual_unit_price = safe_float(row_data[32])  # 실적단가
        issue_amount = safe_float(row_data[34])    # 투입금액
        production_qty = safe_float(row_data[28])  # 생산량
        total_production = safe_float(row_data[27])  # 총생산량
        
        # Product type for notes
        product_type = str(row_data[20]) if row_data[20] else ''  # 제품구분명
        
        rows_for_api.append({
            'period': period_str,
            'machine': machine_str,
            'mat_code': mat_code_str,
            'mat_name': str(material_name) if material_name else '',
            'mat_group_desc': str(material_group_desc) if material_group_desc else '',
            'unit': 'KG',
            'issue_qty': issue_qty,
            'actual_unit_price': actual_unit_price,
            'issue_amount': issue_amount,
            'production_qty': production_qty,
            'total_production': total_production,
            'product_type': product_type,
        })
    
    print(f"Parsed rows for monthly_records: {len(rows_for_api)}")
    print(f"Parsed rows for raw_records: {len(raw_rows_for_api)}")
    return rows_for_api, raw_rows_for_api


def upload_data(rows, raw_rows, data_source, filename):
    """Upload parsed data to the API in chunks."""
    print(f"\n=== Uploading {data_source}: {len(rows)} rows, {len(raw_rows)} rawRows ===")
    
    chunk_size = 500
    
    # First request: all rows + first chunk of rawRows
    first_raw_chunk = raw_rows[:chunk_size]
    payload = {
        'rows': rows,
        'rawRows': first_raw_chunk,
        'fileName': filename
    }
    
    print(f"Sending main payload: {len(rows)} rows + {len(first_raw_chunk)} rawRows...")
    resp = requests.post(f"{BASE_URL}/api/upload/smart", json=payload, timeout=180)
    
    if resp.status_code != 200:
        print(f"ERROR {resp.status_code}: {resp.text[:1000]}")
        return False
    
    result = resp.json()
    print(f"Main upload result: {json.dumps(result, indent=2, ensure_ascii=False)}")
    
    # Send remaining rawRows chunks (appendOnly - only rawRows, no rows)
    for i in range(chunk_size, len(raw_rows), chunk_size):
        chunk = raw_rows[i:i+chunk_size]
        chunk_payload = {
            'rows': [],
            'rawRows': chunk,
            'fileName': filename,
        }
        print(f"  Sending rawRows chunk [{i}:{i+len(chunk)}] ...")
        resp = requests.post(f"{BASE_URL}/api/upload/smart", json=chunk_payload, timeout=180)
        if resp.status_code != 200:
            print(f"  ERROR {resp.status_code}: {resp.text[:300]}")
        else:
            cr = resp.json()
            print(f"  OK: raw_inserted={cr.get('summary',{}).get('raw_records_inserted',0)}")
    
    return True


def verify():
    """Verify final counts."""
    print("\n=== Verification ===")
    
    # Monthly records count
    import subprocess
    result = subprocess.run(
        ['npx', 'wrangler', 'd1', 'execute', 'material-cost-analysis', '--local', 
         '--command=SELECT COUNT(*) as cnt FROM monthly_records'],
        capture_output=True, text=True, cwd='/home/user/webapp'
    )
    print(f"Monthly records count output:\n{result.stdout[-200:]}")
    
    # Raw records
    resp = requests.get(f"{BASE_URL}/api/raw-records?limit=1")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Raw records total: {data.get('total', 'N/A')}")


def main():
    # Upload 원재료 (BW_ZOHPP100)
    print("=" * 60)
    print("UPLOADING 원재료 (BW_ZOHPP100)")
    print("=" * 60)
    rows100, raw100 = parse_sap_file('uploads/BW_ZOHPP100_202605.xlsx', 'BW_ZOHPP100')
    if rows100:
        upload_data(rows100, raw100, 'BW_ZOHPP100', 'BW_ZOHPP100_202605.xlsx')
    
    verify()


if __name__ == '__main__':
    main()
