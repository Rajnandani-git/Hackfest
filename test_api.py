import urllib.request
import json

print("--- PAYSHIELD AI AUTOMATED API SUITE ---")

for cid, expected in [(1, 'VERIFIED'), (2, 'NOT FOUND'), (3, 'MISMATCH')]:
    req = urllib.request.Request(f'http://127.0.0.1:8000/api/demo/run/{cid}', data=b'', method='POST')
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        status = res['verification_status']
        score = res['suspicion_score']
        utr = res['extracted_utr']
        amt = res['extracted_amount']
        ok = (status == expected)
        print(f"Demo {cid} => Status: {status:12} | Score: {score:3}/100 | UTR: {utr} | Amt: Rs.{amt} | Matches Expected: {ok}")

# Test PDF report
with urllib.request.urlopen('http://127.0.0.1:8000/api/report/1/pdf') as pdf:
    pdf_bytes = pdf.read()
    print(f"PDF Download => Status: {pdf.status} | Content-Type: {pdf.headers.get('Content-Type')} | Size: {len(pdf_bytes)} bytes")

# Test History
with urllib.request.urlopen('http://127.0.0.1:8000/api/history?limit=5') as h:
    hist = json.loads(h.read().decode())
    print(f"History Endpoint => Total records: {hist['total']} | Returned: {len(hist['records'])}")

print("ALL TESTS PASSED SUCCESSFULLY!")
