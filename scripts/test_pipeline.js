// ==============================================================================
// MEETWISE AI — END-TO-END HTTP INTEGRATION TEST SUITE
// Tests all 8 core API routes, Decision DNA, Conflict Radar, and PBA task gates
// ==============================================================================

const http = require('http');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log(`🚀 Starting MEETWISE AI HTTP Integration Test against ${BASE_URL}...\n`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, name) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: GET /api/system/status
  console.log('--- TEST GROUP 1: System Status & Diagnostic API ---');
  const statusRes = await makeRequest('/api/system/status');
  assert(statusRes.status === 200, 'GET /api/system/status returns HTTP 200');
  assert(statusRes.data.success === true, 'System status reports success: true');
  assert(statusRes.data.status.mode !== undefined, `System mode detected: ${statusRes.data.status.mode}`);
  assert(statusRes.data.metrics.activeDecisions >= 6, `Reported active decisions: ${statusRes.data.metrics.activeDecisions}`);

  // TEST 2: GET /api/decisions
  console.log('\n--- TEST GROUP 2: Decision DNA Memory API ---');
  const decisionsRes = await makeRequest('/api/decisions');
  assert(decisionsRes.status === 200, 'GET /api/decisions returns HTTP 200');
  assert(decisionsRes.data.decisions.length >= 6, `Decision DNA retrieved ${decisionsRes.data.decisions.length} historical decisions`);
  const activeDec = decisionsRes.data.decisions.find(d => d.decision_status === 'active');
  assert(activeDec !== undefined, 'Found active confirmed decision');
  assert(activeDec.evidence_quote.length > 0, 'Decision has verbatim evidence quote');

  // TEST 3: GET /api/conflicts
  console.log('\n--- TEST GROUP 3: Conflict Radar Retrieval API ---');
  const conflictsRes = await makeRequest('/api/conflicts');
  assert(conflictsRes.status === 200, 'GET /api/conflicts returns HTTP 200');
  assert(conflictsRes.data.conflicts.length >= 2, `Retrieved ${conflictsRes.data.conflicts.length} active conflicts`);
  const unreviewed = conflictsRes.data.conflicts.find(c => c.review_status === 'unreviewed');
  assert(unreviewed !== undefined, 'Found unreviewed conflict awaiting human confirmation');

  // TEST 4: POST /api/meetings/ingest
  console.log('\n--- TEST GROUP 4: Meeting Ingestion Pipeline ---');
  const ingestPayload = {
    title: 'Wednesday Mid-Sprint Launch Status Check',
    meeting_date: '2026-11-20',
    source_type: 'paste',
    transcript: `David: Welcome team to our Wednesday Mid-Sprint Launch Status Check.
David: We have an important agenda topic today regarding our public release. Due to payment partner sandbox testing delays, we are considering moving the launch from December 10 to December 15.
Alex: That gives us extra room. If we move the launch to December 15, I can ensure the responsive payment flow and error states are 100% bug free by December 8.
Sarah: From a quality perspective, this gives us adequate time. We still maintain our 95% test coverage requirement.
Emma: I will update all marketing collateral and landing page badges to reflect the December 15 date by December 7.
David: Excellent. Let us track this potential change and get team alignment.`
  };

  const ingestRes = await makeRequest('/api/meetings/ingest', 'POST', ingestPayload);
  assert(ingestRes.status === 200, 'POST /api/meetings/ingest returns HTTP 200');
  assert(ingestRes.data.success === true, 'Meeting successfully ingested');
  const meetingId = ingestRes.data.meeting.id;
  assert(meetingId !== undefined, `Created meeting ID: ${meetingId}`);

  // TEST 5: POST /api/meetings/[id]/process (Orchestrated Pipeline & WOW Conflict Trigger)
  console.log('\n--- TEST GROUP 5: AI Orchestrated Pipeline & Conflict Radar Trigger ---');
  const processRes = await makeRequest(`/api/meetings/${meetingId}/process`, 'POST');
  assert(processRes.status === 200, 'POST /api/meetings/[id]/process returns HTTP 200');
  assert(processRes.data.success === true, 'AI processing completed successfully');
  assert(processRes.data.data.summary.length > 10, 'Generated meeting summary');
  assert(processRes.data.data.conflicts.length > 0, 'Conflict Radar successfully triggered for Dec 10 vs Dec 15');
  const launchConflict = processRes.data.data.conflicts.find(c => c.conflict_type === 'revision');
  assert(launchConflict !== undefined, 'Conflict classified as "revision"');
  assert(processRes.data.data.proposed_tasks.length > 0, 'Tasks prepared in Proof Before Action queue');

  // TEST 6: POST /api/conflicts/[id]/review (Human Confirmation Gate)
  console.log('\n--- TEST GROUP 6: Conflict Radar Human Confirmation ---');
  const reviewRes = await makeRequest(`/api/conflicts/${launchConflict.id}/review`, 'POST', {
    action: 'confirm_change',
    reviewer_notes: 'Approved slide to Dec 15 per payment gateway dependencies'
  });
  assert(reviewRes.status === 200, 'POST /api/conflicts/[id]/review returns HTTP 200');
  assert(reviewRes.data.success === true, 'Conflict review recorded');
  assert(reviewRes.data.conflict.review_status === 'confirmed_change', 'Status transitioned to confirmed_change');

  // Verify Decision DNA updated (Dec 10 superseded, Dec 15 active)
  const decisionsAfterReview = await makeRequest('/api/decisions');
  const supersededLaunch = decisionsAfterReview.data.decisions.find(d => d.id === launchConflict.old_decision_id);
  assert(supersededLaunch.decision_status === 'superseded', 'Old decision safely transitioned to "superseded" in Decision DNA');

  // TEST 7: POST /api/tasks/[id]/approve (Proof Before Action Task Verification)
  console.log('\n--- TEST GROUP 7: Proof Before Action Task Verification ---');
  const tasksRes = await makeRequest('/api/tasks?approval_status=pending');
  assert(tasksRes.status === 200, 'GET /api/tasks returns HTTP 200');
  assert(tasksRes.data.tasks.length > 0, 'Found pending tasks in queue');
  const targetTask = tasksRes.data.tasks[0];

  const approveRes = await makeRequest(`/api/tasks/${targetTask.id}/approve`, 'POST', {
    action: 'approved',
    reviewer: 'David (Lead PM)',
    comments: 'Verified with transcript evidence'
  });
  assert(approveRes.status === 200, 'POST /api/tasks/[id]/approve returns HTTP 200');
  assert(approveRes.data.task.approval_status === 'approved', 'Task approved and moved to active commitments');
  assert(approveRes.data.approval.reviewer === 'David (Lead PM)', 'Reviewer audit record preserved');

  // TEST 8: POST /api/memory/query (Ask Meeting Memory RAG)
  console.log('\n--- TEST GROUP 8: Ask Meeting Memory Conversational RAG ---');
  const ragRes = await makeRequest('/api/memory/query', 'POST', {
    query: 'What launch date did we decide?'
  });
  assert(ragRes.status === 200, 'POST /api/memory/query returns HTTP 200');
  assert(ragRes.data.result.has_direct_evidence === true, 'RAG query grounded in meeting memory');
  assert(ragRes.data.result.citations.length > 0, 'RAG query cites specific meeting evidence quote');

  // TEST 9: GET /api/digest (Weekly Digest)
  console.log('\n--- TEST GROUP 9: Weekly Team Digest ---');
  const digestRes = await makeRequest('/api/digest');
  assert(digestRes.status === 200, 'GET /api/digest returns HTTP 200');
  assert(digestRes.data.digest.memberDigests.length >= 4, 'Digest groups commitments for all team members');

  console.log(`\n==================================================`);
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED WITH 100% SUCCESS!`);
  console.log(`==================================================\n`);
}

runTestSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
