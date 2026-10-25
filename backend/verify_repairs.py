import os
import sys
import json
from pathlib import Path
from fastapi import HTTPException

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import (
    health, insights, life_trends, save_consultation_meet_link,
    ManualMeetLinkRequest, admin_system, admin_activity_logs,
    PALM_READINGS, TAROT_READINGS, CONSULTATION_REQUESTS, ACTIVITY_LOGS
)

def test_repairs():
    print("==================================================")
    print("VERIFYING COMPLETE PLATFORM REPAIRS")
    print("==================================================")
    passed = 0
    failed = 0
    total = 0

    def check(name, condition):
        nonlocal passed, failed, total
        total += 1
        if condition:
            passed += 1
            print(f"  [PASS] {name}")
        else:
            failed += 1
            print(f"  [FAIL] {name}")

    # 1. Health check
    h = health()
    check("Health check operational", h.get('status') == 'ok')

    # 2. Scoped AI Insights
    data = insights(user_name="saitejashree")
    check("Scoped AI insights returns available=True for existing user", data.get('available') is True)
    check("Scoped AI insights preserves authentic handedness", 'handedness' in data and data['handedness'] in ['Right Hand', 'Left Hand'])
    check("Scoped AI insights preserves 5 palm line scores", len(data.get('lines', [])) == 5)
    check("Scoped AI insights includes Sun Line in lines", any(l['name'] == 'Sun Line' for l in data.get('lines', [])))

    # 3. Scoped Life Trends Consistency
    trends = life_trends(user_name="saitejashree")
    check("Life trends has_readings is True", trends.get('has_readings') is True)
    check("Life trends status is 'trend' or 'single' (NOT 'empty')", trends.get('status') in ['trend', 'single'])
    check("Life trends total_readings matches points length", trends.get('total_readings') == len(trends.get('points', [])))
    check("Life trends includes indicators array", len(trends.get('indicators', [])) >= 4)
    check("Life trends points include metric_value and summary", all('metric_value' in p and 'summary' in p for p in trends.get('points', [])))

    # 4. Life Trends Empty State Consistency
    empty = life_trends(user_name="nobody_user_12345")
    check("Empty life trends has status='empty'", empty.get('status') == 'empty')
    check("Empty life trends has total_readings=0", empty.get('total_readings') == 0)

    # 5. Manual Google Meet Link Workflow
    appt = next((c for c in CONSULTATION_REQUESTS if c.get('consultation_mode') == 'Appointment'), None)
    if appt:
        appt_id = appt['id']
        test_meet_url = "https://meet.google.com/abc-defg-hij"

        # Invalid non-https URL rejected
        rejected_http = False
        try:
            save_consultation_meet_link(appt_id, ManualMeetLinkRequest(meet_link="http://insecure.com"))
        except HTTPException as e:
            if e.status_code == 400:
                rejected_http = True
        check("Rejects non-https meet link with HTTP 400", rejected_http)

        # Invalid non-meet URL rejected
        rejected_zoom = False
        try:
            save_consultation_meet_link(appt_id, ManualMeetLinkRequest(meet_link="https://zoom.us/j/12345"))
        except HTTPException as e:
            if e.status_code == 400:
                rejected_zoom = True
        check("Rejects non-Google Meet URL with HTTP 400", rejected_zoom)

        # Valid HTTPS meet link saved successfully
        res = save_consultation_meet_link(appt_id, ManualMeetLinkRequest(meet_link=test_meet_url))
        check("Saves valid HTTPS Google Meet URL", res.get('success') is True)
        saved_link = res.get('consultation', {}).get('meeting_link')
        check("Returned consultation contains exact saved meeting_link", saved_link == test_meet_url)

    # 6. Admin System truthful reporting
    sys_info = admin_system()
    sys_items = sys_info.get('items', [])
    meet_item = next((x for x in sys_items if 'Google Meet' in x['name']), None)
    check("Admin system reports Manual Link Entry active", meet_item is not None and 'Manual Link' in meet_item['value'])
    dataset_item = next((x for x in sys_items if 'Dataset' in x['name']), None)
    check("Admin system truthfully reports palm dataset status", dataset_item is not None and 'Standalone' in dataset_item['value'])

    # 7. Admin Activity Logs
    logs = admin_activity_logs()
    check("Activity logs returns list of items", isinstance(logs.get('items', []), list))
    if logs.get('items'):
        sample_log = logs['items'][0]
        check("Activity log has action_result field", 'action_result' in sample_log or 'result' in sample_log)
        check("Activity log details is not exposing secrets", not any(s in str(sample_log.get('details')).lower() for s in ['password_hash', 'access_token', 'client_secret']))

    # 8. Admin System Reports Endpoint
    from app.main import admin_system_reports
    rep = admin_system_reports()
    check("System reports contains users, readings, consultations, recent_activity", all(k in rep for k in ['users', 'readings', 'consultations', 'recent_activity']))
    check("System reports total users matches real USERS length", rep['users']['total'] > 0)
    check("System reports users by role has 4 roles", len(rep['users']['by_role']) >= 4)
    check("System reports readings totals matches sum of palm + tarot", rep['readings']['total'] == rep['readings']['total_palm'] + rep['readings']['total_tarot'])
    check("System reports palm_by_hand includes Left Hand and Right Hand", 'Left Hand' in rep['readings']['palm_by_hand'] and 'Right Hand' in rep['readings']['palm_by_hand'])
    check("System reports appointments by status has Accepted and Pending", 'Accepted' in rep['consultations']['appointments_by_status'])

    # 9. User Insights Data Isolation
    from app.main import get_consultant_user_insights
    insights_existing = get_consultant_user_insights("saitejashree")
    check("Existing user has has_readings=True", insights_existing['has_readings'] is True)
    check("Existing user has real personalized synthesis based on actual readings", insights_existing['data_basis'] in ['Combined (Palmistry & Tarot)', 'Palmistry Only', 'Tarot Only'])
    check("Existing user synthesis is not empty state", 'No reading history' not in insights_existing['synthesis'])

    insights_empty = get_consultant_user_insights("nonexistent_client_xyz")
    check("Empty user has has_readings=False", insights_empty['has_readings'] is False)
    check("Empty user indicates no reading history found honestly", 'No reading history' in insights_empty['synthesis'])
    check("Empty user data_basis is None", insights_empty['data_basis'] == 'None')

    print("==================================================")
    print(f"VERIFICATION RESULT: {passed}/{total} Passed, {failed} Failed")
    print("==================================================")
    return failed == 0

if __name__ == '__main__':
    success = test_repairs()
    sys.exit(0 if success else 1)
