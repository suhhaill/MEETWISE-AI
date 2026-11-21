-- ==============================================================================
-- MEETWISE AI — IDEMPOTENT DATABASE SEED SCRIPT
-- Workspace: NovaTech Product Team
-- Team: Alex (Frontend), Sarah (QA), David (PM), Emma (Designer)
-- ==============================================================================

-- 1. SEED WORKSPACE
INSERT INTO workspaces (id, name, description, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'NovaTech Product Team',
    'Core product engineering and design team building NovaTech v2.0 Next-Gen Platform.',
    NOW() - INTERVAL '30 days',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. SEED MEMBERS
INSERT INTO members (id, workspace_id, name, email, role, avatar_url, created_at)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'David', 'david@novatech.io', 'Product Manager', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', NOW() - INTERVAL '30 days'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Alex', 'alex@novatech.io', 'Frontend Developer', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80', NOW() - INTERVAL '30 days'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Sarah', 'sarah@novatech.io', 'QA Engineer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80', NOW() - INTERVAL '30 days'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Emma', 'emma@novatech.io', 'Designer', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED HISTORICAL MEETINGS
INSERT INTO meetings (id, workspace_id, title, meeting_date, source_type, transcript, original_file_name, processing_status, summary, key_topics)
VALUES 
    (
        'c0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'Sprint 42 Kickoff & Q4 Launch Alignment',
        '2026-11-10',
        'txt',
        'David: Good morning everyone. Let us lock in our Q4 roadmap milestones. After syncing with executive stakeholders, we have officially decided to launch the new product on December 10, 2026.
Sarah: Understood. To guarantee quality before launch, I insist on having at least 95% automated test coverage on checkout and auth modules before code freeze.
David: Fully agree Sarah, 95% coverage is locked in as a requirement.
Emma: From the design system side, we evaluated UI libraries and we decided to adopt Tailwind CSS and Radix UI design tokens across all dashboard views.
David: Excellent. Also, we will postpone the public API developer portal release to Q1 2027 so we keep all engineering focused on core platform stability.
Alex: That makes sense. I will finalize the responsive navigation and user settings pages by November 28.
Sarah: And I will implement the end-to-end integration test suite for payment processing by December 2.
Emma: I will deliver the final high-fidelity design specs for the conflict comparison modal by November 25.
David: I will draft the launch day release runbook and escalation matrix by December 4. Thank you all, let us execute.',
        'sprint_42_kickoff.txt',
        'completed',
        'Sprint 42 kickoff confirmed the December 10 launch date, 95% QA test coverage on core auth/payment flows, Tailwind/Radix UI standards, and deferred public API release to Q1 2027.',
        '["Launch Milestones", "Quality Gate & Coverage", "UI Design System", "Resource Allocation"]'::jsonb
    ),
    (
        'c0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'Launch Readiness & Infrastructure Sync',
        '2026-11-17',
        'txt',
        'David: Welcome back team. Today is our infrastructure and compliance gate check.
David: We confirmed today that we require a full SOC2 compliance audit sign-off prior to opening external production invitations.
Alex: On the infrastructure side, we decided to enable automated database backups every 6 hours with cross-region read replicas for disaster recovery.
Alex: I will also set up the staging replica database and verify automated failover by December 1.
Sarah: I will run penetration tests on authentication tokens and audit logging by December 5.
Emma: I should review dark mode contrast accessibility according to WCAG AAA standards by December 3.
Alex: I can look into integrating Gemini 2.0 streaming response fallback for transcription retry by December 4.
David: And I will compile the security compliance report for the SOC2 external reviewer by December 6.',
        'launch_readiness_sync.txt',
        'completed',
        'Infrastructure sync confirmed mandatory SOC2 sign-off before public user onboarding and established 6-hour automated cross-region database backups with staging failover verification.',
        '["SOC2 Compliance", "Disaster Recovery & Backups", "Security Penetration", "Accessibility"]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 4. SEED DECISIONS (DECISION DNA)
INSERT INTO decisions (id, workspace_id, meeting_id, description, decision_type, decision_status, evidence_quote, source_speaker, confidence, supersedes_decision_id)
VALUES 
    (
        'd0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'Launch date confirmed for December 10, 2026 across all platforms.',
        'confirmed',
        'active',
        'After syncing with executive stakeholders, we have officially decided to launch the new product on December 10, 2026.',
        'David',
        0.98,
        NULL
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'Target minimum 95% automated test coverage on checkout and auth modules before code freeze.',
        'confirmed',
        'active',
        'Fully agree Sarah, 95% coverage is locked in as a requirement.',
        'David',
        0.95,
        NULL
    ),
    (
        'd0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'Adopt Tailwind CSS and Radix UI design tokens across all client dashboard views.',
        'confirmed',
        'active',
        'we evaluated UI libraries and we decided to adopt Tailwind CSS and Radix UI design tokens across all dashboard views.',
        'Emma',
        0.99,
        NULL
    ),
    (
        'd0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'Postpone public API developer portal release to Q1 2027 to prioritize core platform stability.',
        'confirmed',
        'active',
        'we will postpone the public API developer portal release to Q1 2027 so we keep all engineering focused on core platform stability.',
        'David',
        0.92,
        NULL
    ),
    (
        'd0000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000002',
        'Require SOC2 compliance audit sign-off prior to opening external production invitations.',
        'confirmed',
        'active',
        'We confirmed today that we require a full SOC2 compliance audit sign-off prior to opening external production invitations.',
        'David',
        0.96,
        NULL
    ),
    (
        'd0000000-0000-0000-0000-000000000006',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000002',
        'Enable automated database backups every 6 hours with cross-region read replicas.',
        'confirmed',
        'active',
        'we decided to enable automated database backups every 6 hours with cross-region read replicas for disaster recovery.',
        'Alex',
        0.95,
        NULL
    )
ON CONFLICT (id) DO NOTHING;

-- 5. SEED TASKS (PROOF BEFORE ACTION)
INSERT INTO tasks (id, workspace_id, meeting_id, decision_id, title, description, assignee_id, assignee_name, due_date, task_status, approval_status, evidence_quote, source_speaker, confidence)
VALUES 
    (
        'e0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        NULL,
        'Finalize responsive navigation and user settings pages',
        'Implement mobile drawer, responsive breakpoints, and settings persistence in Next.js.',
        'b0000000-0000-0000-0000-000000000002',
        'Alex',
        '2026-11-28',
        'completed',
        'approved',
        'I will finalize the responsive navigation and user settings pages by November 28.',
        'Alex',
        0.98
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000002',
        'Implement end-to-end integration test suite for payment processing',
        'Write Cypress and Playwright tests covering Stripe checkout webhooks and error recovery.',
        'b0000000-0000-0000-0000-000000000003',
        'Sarah',
        '2026-12-02',
        'in_progress',
        'approved',
        'And I will implement the end-to-end integration test suite for payment processing by December 2.',
        'Sarah',
        0.95
    ),
    (
        'e0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        NULL,
        'Deliver final high-fidelity design specs for conflict comparison modal',
        'Export Figma specs with color tokens, typography scales, and interactive states.',
        'b0000000-0000-0000-0000-000000000004',
        'Emma',
        '2026-11-25',
        'completed',
        'approved',
        'I will deliver the final high-fidelity design specs for the conflict comparison modal by November 25.',
        'Emma',
        0.97
    ),
    (
        'e0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        'Draft launch day release runbook and escalation matrix',
        'Specify rollout sequence, rollback thresholds, and on-call engineer contacts.',
        'b0000000-0000-0000-0000-000000000001',
        'David',
        '2026-12-04',
        'in_progress',
        'approved',
        'I will draft the launch day release runbook and escalation matrix by December 4.',
        'David',
        0.92
    ),
    (
        'e0000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000006',
        'Set up staging replica database and verify automated failover',
        'Configure PostgreSQL read replica in AWS us-east-2 and simulate primary failure.',
        'b0000000-0000-0000-0000-000000000002',
        'Alex',
        '2026-12-01',
        'pending',
        'approved',
        'I will also set up the staging replica database and verify automated failover by December 1.',
        'Alex',
        0.94
    ),
    (
        'e0000000-0000-0000-0000-000000000006',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000002',
        NULL,
        'Run penetration test on authentication tokens and audit logging',
        'Verify JWT expiration, refresh rotation, and tamper-evident logging.',
        'b0000000-0000-0000-0000-000000000003',
        'Sarah',
        '2026-12-05',
        'pending',
        'approved',
        'I will run penetration tests on authentication tokens and audit logging by December 5.',
        'Sarah',
        0.96
    ),
    (
        'e0000000-0000-0000-0000-000000000007',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000002',
        NULL,
        'Review dark mode contrast accessibility according to WCAG AAA standards',
        'Audit all dashboard components for 7:1 text contrast and accessible focus states.',
        'b0000000-0000-0000-0000-000000000004',
        'Emma',
        '2026-12-03',
        'pending',
        'pending',
        'I should review dark mode contrast accessibility according to WCAG AAA standards by December 3.',
        'Emma',
        0.89
    ),
    (
        'e0000000-0000-0000-0000-000000000008',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000002',
        NULL,
        'Integrate Gemini 2.0 streaming response fallback for transcription retry',
        'Implement fallback retry with exponential backoff on Gemini multimodal transcription.',
        'b0000000-0000-0000-0000-000000000002',
        'Alex',
        '2026-12-04',
        'pending',
        'pending',
        'I can look into integrating Gemini 2.0 streaming response fallback for transcription retry by December 4.',
        'Alex',
        0.93
    ),
    (
        'e0000000-0000-0000-0000-000000000009',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000005',
        'Compile security compliance report for SOC2 reviewer',
        'Collate vulnerability scan reports, encrypted backup evidence, and role-based access logs.',
        'b0000000-0000-0000-0000-000000000001',
        'David',
        '2026-12-06',
        'pending',
        'pending',
        'And I will compile the security compliance report for the SOC2 external reviewer by December 6.',
        'David',
        0.91
    )
ON CONFLICT (id) DO NOTHING;

-- 6. SEED CONFLICTS (CONFLICT RADAR)
INSERT INTO conflicts (id, workspace_id, old_decision_id, new_decision_id, conflict_type, explanation, severity, review_status, reviewer_notes)
VALUES 
    (
        'f0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000001',
        NULL,
        'revision',
        'Historical decision confirmed product launch for December 10, 2026. However, incoming proposal considers moving launch to December 15 due to payment partner sandbox testing. Requires human confirmation to supersede.',
        'high',
        'unreviewed',
        NULL
    ),
    (
        'f0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000002',
        NULL,
        'contradiction',
        'Historical decision locked in 95% test coverage requirement on auth/checkout before code freeze. A proposal was made to relax coverage to 85% on auth to expedite delivery date.',
        'medium',
        'unreviewed',
        NULL
    )
ON CONFLICT (id) DO NOTHING;

-- 7. SEED AUDIT APPROVALS
INSERT INTO approvals (id, workspace_id, task_id, action, reviewer, comments, reviewed_at)
VALUES 
    (
        '10000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'e0000000-0000-0000-0000-000000000001',
        'approved',
        'David (Lead PM)',
        'Approved as critical frontend milestone for Sprint 42.',
        NOW() - INTERVAL '10 days'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'e0000000-0000-0000-0000-000000000002',
        'approved',
        'David (Lead PM)',
        'Approved with mandatory mock Stripe webhook test cases.',
        NOW() - INTERVAL '10 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 8. SEED REMINDERS
INSERT INTO reminders (id, workspace_id, task_id, scheduled_at, status, created_at)
VALUES 
    (
        '20000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'e0000000-0000-0000-0000-000000000005',
        NOW() + INTERVAL '2 days',
        'scheduled',
        NOW()
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'e0000000-0000-0000-0000-000000000006',
        NOW() + INTERVAL '5 days',
        'scheduled',
        NOW()
    )
ON CONFLICT (id) DO NOTHING;
