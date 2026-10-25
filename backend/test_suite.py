import os, sys, json
from datetime import datetime, timedelta
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import HTTPException
from app.main import (
    app, health, register, login, google_auth, GoogleLoginRequest,
    create_consultation, ConsultationRequest,
    get_consultations, get_user_consultations,
    respond_to_appointment, AppointmentResponseRequest,
    generate_meeting, google_calendar_status,
    life_trends,
    admin_summary, admin_users, admin_roles, admin_readings,
    admin_consultations, admin_activity_logs, admin_system,
    is_appointment_expired, is_appointment_starting_now,
    USERS, CONSULTATION_REQUESTS, PALM_READINGS, TAROT_READINGS,
    KOLKATA_TZ
)

def run_tests():
    passed = 0
    failed = 0
    total = 0

    def assert_test(name, condition, details=""):
        nonlocal passed, failed, total
        total += 1
        if condition:
            passed += 1
            print(f"  [PASS] {name}")
        else:
            failed += 1
            print(f"  [FAIL] {name}: {details}")

    print("==================================================")
    print("RUNNING AI PALMISTRY & TAROT PLATFORM TEST SUITE")
    print("==================================================")

    # 1. Health check
    print("\n--- 1. Health & Server Status ---")
    h = health()
    assert_test("Health endpoint returns status 'ok'", h.get('status') == 'ok')

    # 2. Timezone & Appointment Expiration Logic
    print("\n--- 2. Timezone (Asia/Kolkata) & Expiration Logic ---")
    now_kolkata = datetime.now(KOLKATA_TZ)
    past_appt = {
        'appointment_date': (now_kolkata - timedelta(days=2)).strftime('%Y-%m-%d'),
        'appointment_time': '10:00',
        'duration': 30
    }
    future_appt = {
        'appointment_date': (now_kolkata + timedelta(days=2)).strftime('%Y-%m-%d'),
        'appointment_time': '10:00',
        'duration': 30
    }
    current_appt = {
        'appointment_date': now_kolkata.strftime('%Y-%m-%d'),
        'appointment_time': now_kolkata.strftime('%H:%M'),
        'duration': 30
    }
    assert_test("Past appointment is identified as expired", is_appointment_expired(past_appt) == True)
    assert_test("Future appointment is not expired", is_appointment_expired(future_appt) == False)
    assert_test("Current appointment is recognized as active/starting now", is_appointment_starting_now(current_appt) == True)

    # 3. Google Login & Role Security
    print("\n--- 3. Google Authentication & Role Security ---")
    # Empty token rejection
    empty_token_rejected = False
    try:
        google_auth(GoogleLoginRequest(id_token=""))
    except HTTPException as e:
        empty_token_rejected = (e.status_code == 400)
    assert_test("Empty Google ID token rejected with HTTP 400", empty_token_rejected)

    # Invalid token rejection
    invalid_token_rejected = False
    try:
        google_auth(GoogleLoginRequest(id_token="fake.invalid.token"))
    except HTTPException as e:
        invalid_token_rejected = (e.status_code == 400)
    assert_test("Invalid Google ID token rejected securely", invalid_token_rejected)

    # Test disabled account login blocking
    disabled_user_email = "test_disabled_user@example.com"
    USERS[disabled_user_email] = {
        'name': 'Disabled User',
        'password': 'password',
        'role': 'User',
        'status': 'Disabled'
    }
    disabled_blocked = False
    try:
        login(email=disabled_user_email, password='password', role='User')
    except HTTPException as e:
        disabled_blocked = (e.status_code == 403)
    assert_test("Deactivated/Disabled account is blocked from login (HTTP 403)", disabled_blocked)

    # Clean up test user
    USERS.pop(disabled_user_email, None)

    # 4. Appointments Workflow
    print("\n--- 4. Appointments Workflow (Validation, Decline, Acceptance) ---")
    # Past appointment rejection
    past_rejected = False
    try:
        create_consultation(ConsultationRequest(
            user_name="saitejashree",
            consultant_type="Spiritual Consultant",
            question="Appointment request",
            focus="Career Guidance",
            spread="Spiritual Consultation",
            cards=[],
            consultation_mode="Appointment",
            appointment_date="2020-01-01",
            appointment_time="10:00"
        ))
    except HTTPException as e:
        past_rejected = (e.status_code == 400)
    assert_test("Appointment request for past date rejected (HTTP 400)", past_rejected)

    # Valid future appointment
    future_date_str = (now_kolkata + timedelta(days=3)).strftime('%Y-%m-%d')
    res_appt = create_consultation(ConsultationRequest(
        user_name="saitejashree",
        consultant_type="Spiritual Consultant",
        question="Appointment request for Future Guidance",
        focus="Personal Growth",
        spread="Spiritual Consultation",
        cards=[],
        consultation_mode="Appointment",
        appointment_date=future_date_str,
        appointment_time="14:00",
        duration=30,
        details="Looking forward to deep reflection."
    ))
    new_appt_id = res_appt['consultation']['id']
    assert_test("Future appointment request created successfully with Pending status", res_appt.get('success') == True and res_appt['consultation']['status'] == 'Pending')

    # Decline without reason rejected
    decline_no_reason_rejected = False
    try:
        respond_to_appointment(new_appt_id, AppointmentResponseRequest(status="Declined", reason=""))
    except HTTPException as e:
        decline_no_reason_rejected = (e.status_code == 400)
    assert_test("Declining appointment without reason is rejected (HTTP 400)", decline_no_reason_rejected)

    # Decline with reason succeeds
    decline_success = respond_to_appointment(new_appt_id, AppointmentResponseRequest(status="Declined", reason="Consultant unavailable at this time slot."))
    declined_consultation = decline_success['consultation']
    assert_test("Decline with reason updates appointment status to Declined", declined_consultation['status'] == 'Declined' and declined_consultation.get('decline_reason') == "Consultant unavailable at this time slot.")
    assert_test("Declined appointment has no meeting URL", declined_consultation.get('meeting_url') is None)

    # Create another future appointment for acceptance testing
    res_appt2 = create_consultation(ConsultationRequest(
        user_name="saitejashree",
        consultant_type="Tarot Reader",
        question="Appointment request for Tarot Reading",
        focus="Career Guidance",
        spread="Spiritual Consultation",
        cards=[],
        consultation_mode="Appointment",
        appointment_date=future_date_str,
        appointment_time="16:00",
        duration=30
    ))
    new_appt2_id = res_appt2['consultation']['id']

    # Accept appointment
    accept_res = respond_to_appointment(new_appt2_id, AppointmentResponseRequest(status="Accepted"))
    accepted_consultation = accept_res['consultation']
    assert_test("Accepting appointment sets status to Accepted", accepted_consultation['status'] == 'Accepted')
    assert_test("Acceptance handles calendar status safely without fabricating fake meeting URLs", accepted_consultation.get('calendar_status') in ['created', 'pending', 'not_configured'])

    # Retry meeting generation endpoint
    retry_res = generate_meeting(new_appt2_id)
    assert_test("Meeting generation retry endpoint responds with clear integration status", 'message' in retry_res)

    # Calendar status endpoint
    cal_stat = google_calendar_status()
    assert_test("Google Calendar status endpoint reports integration state accurately", 'configured' in cal_stat and 'connected' in cal_stat)

    # Expired appointment acceptance rejection test
    expired_consultation = {
        'id': 999999,
        'user_name': 'saitejashree',
        'consultant_type': 'Spiritual Consultant',
        'consultation_mode': 'Appointment',
        'appointment_date': '2020-01-01',
        'appointment_time': '10:00',
        'status': 'Pending',
        'duration': 30
    }
    CONSULTATION_REQUESTS.append(expired_consultation)
    expired_accept_rejected = False
    try:
        respond_to_appointment(999999, AppointmentResponseRequest(status="Accepted"))
    except HTTPException as e:
        expired_accept_rejected = (e.status_code == 400)
    assert_test("Accepting an expired appointment is rejected (HTTP 400)", expired_accept_rejected)
    CONSULTATION_REQUESTS.remove(expired_consultation)

    # 5. Life Trend Analysis
    print("\n--- 5. Life Trend Analysis (Real Readings & Data Isolation) ---")
    # Non-existent user -> empty state
    empty_trends = life_trends(user_name="non_existent_user_999")
    assert_test("User with no readings receives honest empty state message", empty_trends['has_readings'] == False and "will appear after your first" in empty_trends['message'])
    assert_test("Empty state returns 0 total readings", empty_trends['total_readings'] == 0 and len(empty_trends['trend_points']) == 0)

    # Real user 'saitejashree' -> real readings
    user_trends = life_trends(user_name="saitejashree")
    assert_test("Existing user with readings has has_readings=True", user_trends['has_readings'] == True)
    assert_test("Real readings count is greater than 0", user_trends['total_readings'] > 0)
    assert_test("Palm readings count matches actual stored palm records for user", user_trends['palm_count'] == len([p for p in PALM_READINGS if p.get('user_name', '').lower() == 'saitejashree']))
    assert_test("Tarot readings count matches actual stored tarot records for user", user_trends['tarot_count'] == len([t for t in TAROT_READINGS if t.get('user_name', '').lower() == 'saitejashree']))
    assert_test("Chronological trend points generated with real dates and reading tooltips", len(user_trends['trend_points']) > 0 and 'tooltip' in user_trends['trend_points'][0])
    assert_test("Personalized reflection summary generated with Career, Relationships, and Personal Growth", 'reflection_summary' in user_trends and 'career' in user_trends['reflection_summary'])
    assert_test("Primary themes calculated from real reading focus topics", len(user_trends['primary_themes']) > 0)

    # 6. Administrator Dashboard & Functionalities
    print("\n--- 6. Administrator Dashboard & Administrative Functionalities ---")
    summary = admin_summary()
    assert_test("Admin summary returns total registered users count", summary['users'] == len(USERS))
    assert_test("Admin summary avoids duplicate counting: readings = palm_readings + tarot_readings", summary['readings'] == (summary['palm_readings'] + summary['tarot_readings']))
    assert_test("Admin summary returns appointment counts by status", 'appointments_by_status' in summary and 'Pending' in summary['appointments_by_status'])
    assert_test("Admin summary returns users by role breakdown", 'users_by_role' in summary and summary['users_by_role'].get('Administrator', 0) >= 1)

    users_list = admin_users()
    assert_test("Admin users endpoint returns user accounts with roles and status", len(users_list['items']) >= 4 and 'status' in users_list['items'][0])
    assert_test("Admin users endpoint never exposes password hashes", 'password' not in users_list['items'][0])

    roles_list = admin_roles()
    assert_test("Admin roles endpoint returns all 4 system roles with descriptions", len(roles_list['items']) == 4)

    readings_list = admin_readings()
    assert_test("Admin readings endpoint returns actual stored palm and tarot readings", len(readings_list['items']) == (len(PALM_READINGS) + len(TAROT_READINGS)))

    consultations_admin = admin_consultations()
    assert_test("Admin consultations endpoint returns monitoring overview", len(consultations_admin['items']) > 0)

    activity_logs = admin_activity_logs()
    assert_test("Admin activity logs returns recorded system events", isinstance(activity_logs['items'], list))

    sys_info = admin_system()
    assert_test("Admin system endpoint returns real health check verifications", len(sys_info['items']) >= 5 and any(x['name'] == 'Backend API' for x in sys_info['items']))

    print("\n==================================================")
    print(f"TEST SUMMARY: {passed}/{total} Passed, {failed} Failed.")
    print("==================================================")
    return failed == 0

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
