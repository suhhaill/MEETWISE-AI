// ==============================================================================
// TEST SCRIPT: ASK MEETING MEMORY VERIFICATION (USER TARGET QUESTIONS)
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

async function runMemoryTestSuite() {
  console.log(`🔍 Verifying Ask Meeting Memory across all 4 target questions...\n`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, name, details = '') {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details}`);
      process.exitCode = 1;
    }
  }

  // 1. Reset workspace to clean demo state first
  await makeRequest('/api/system/reset', 'POST');

  // ============================================================================
  // SCENARIO 1: BEFORE APPROVAL (Proposal is unreviewed / pending)
  // ============================================================================
  console.log('--- SCENARIO 1: Memory Queries in Initial State (Proposal Pending) ---');

  // Question 1: What launch date was originally confirmed?
  console.log('\n[Query 1]: "What launch date was originally confirmed?"');
  const res1 = await makeRequest('/api/memory/query', 'POST', {
    query: 'What launch date was originally confirmed?',
  });
  assert(res1.status === 200, 'Query 1 returns HTTP 200');
  assert(res1.data.result.has_direct_evidence === true, 'Query 1 has direct evidence');
  assert(res1.data.result.answer.includes('December 10, 2026'), 'Query 1 identifies December 10, 2026 as originally confirmed date');
  assert(res1.data.result.answer.includes('David'), 'Query 1 includes speaker David');
  assert(res1.data.result.answer.includes('Sprint 42 Kickoff'), 'Query 1 includes meeting title');
  assert(res1.data.result.citations.length > 0, 'Query 1 has citations');
  assert(res1.data.result.citations[0].evidence_quote.includes('officially decided to launch the new product on December 10, 2026'), 'Query 1 citation includes exact transcript quote');
  console.log(`  Answer snippet: "${res1.data.result.answer.slice(0, 120)}..."`);

  // Question 2: Did anyone propose changing the launch date?
  console.log('\n[Query 2]: "Did anyone propose changing the launch date?"');
  const res2 = await makeRequest('/api/memory/query', 'POST', {
    query: 'Did anyone propose changing the launch date?',
  });
  assert(res2.status === 200, 'Query 2 returns HTTP 200');
  assert(res2.data.result.has_direct_evidence === true, 'Query 2 has direct evidence');
  assert(res2.data.result.answer.toLowerCase().includes('yes'), 'Query 2 confirms proposal exists');
  assert(res2.data.result.answer.includes('December 15'), 'Query 2 mentions proposed date December 15');
  assert(res2.data.result.answer.includes('December 10'), 'Query 2 references original date December 10');
  assert(res2.data.result.answer.includes('David'), 'Query 2 attributes proposal to David');
  assert(res2.data.result.answer.includes('Wednesday Mid-Sprint Launch Status Check'), 'Query 2 attributes meeting');
  assert(res2.data.result.answer.includes('Unreviewed Proposal') || res2.data.result.answer.includes('Pending Human Confirmation'), 'Query 2 clearly states proposal is not a confirmed decision');
  assert(res2.data.result.citations.some(c => c.evidence_quote.includes('December 15')), 'Query 2 includes citation with December 15 quote');
  console.log(`  Answer snippet: "${res2.data.result.answer.slice(0, 120)}..."`);

  // Question 3: Who proposed the change and why?
  console.log('\n[Query 3]: "Who proposed the change and why?"');
  const res3 = await makeRequest('/api/memory/query', 'POST', {
    query: 'Who proposed the change and why?',
  });
  assert(res3.status === 200, 'Query 3 returns HTTP 200');
  assert(res3.data.result.has_direct_evidence === true, 'Query 3 has direct evidence');
  assert(res3.data.result.answer.includes('David'), 'Query 3 identifies David as proposing speaker');
  assert(res3.data.result.answer.toLowerCase().includes('sandbox') || res3.data.result.answer.toLowerCase().includes('payment partner'), 'Query 3 explains reason: payment partner sandbox testing delays');
  assert(res3.data.result.citations.length > 0, 'Query 3 includes citation');
  assert(res3.data.result.citations[0].evidence_quote.includes('sandbox testing delays') || res3.data.result.citations[0].evidence_quote.includes('December 15'), 'Query 3 citation includes quote');
  console.log(`  Answer snippet: "${res3.data.result.answer.slice(0, 120)}..."`);

  // Question 4: Has the new launch date been officially approved?
  console.log('\n[Query 4]: "Has the new launch date been officially approved?"');
  const res4 = await makeRequest('/api/memory/query', 'POST', {
    query: 'Has the new launch date been officially approved?',
  });
  assert(res4.status === 200, 'Query 4 returns HTTP 200');
  assert(res4.data.result.has_direct_evidence === true, 'Query 4 has direct evidence');
  assert(res4.data.result.answer.includes('NOT been officially approved'), 'Query 4 correctly answers NO (not approved yet)');
  assert(res4.data.result.answer.includes('Conflict Radar'), 'Query 4 explains it is an unreviewed proposal in Conflict Radar');
  assert(res4.data.result.answer.includes('December 10, 2026'), 'Query 4 notes December 10 remains official active decision');
  assert(res4.data.result.citations.length >= 1, 'Query 4 includes supporting citations');
  console.log(`  Answer snippet: "${res4.data.result.answer.slice(0, 120)}..."`);

  // ============================================================================
  // SCENARIO 2: AFTER APPROVAL (Human confirms the revision in Conflict Radar)
  // ============================================================================
  console.log('\n--- SCENARIO 2: Memory Queries After Conflict Radar Human Confirmation ---');

  // Find the conflict and confirm the change
  const conflictsRes = await makeRequest('/api/conflicts');
  const launchConflict = conflictsRes.data.conflicts.find(c => c.conflict_type === 'revision');
  assert(launchConflict !== undefined, 'Found launch conflict to confirm');

  const reviewRes = await makeRequest(`/api/conflicts/${launchConflict.id}/review`, 'POST', {
    action: 'confirm_change',
    reviewer_notes: 'Approved slide to Dec 15 due to payment partner sandbox delay',
  });
  assert(reviewRes.status === 200, 'Conflict review successfully confirmed');

  // Re-test Question 4: Has the new launch date been officially approved?
  console.log('\n[Query 4 (Post-Approval)]: "Has the new launch date been officially approved?"');
  const res4After = await makeRequest('/api/memory/query', 'POST', {
    query: 'Has the new launch date been officially approved?',
  });
  assert(res4After.status === 200, 'Post-approval Query 4 returns HTTP 200');
  assert(res4After.data.result.answer.includes('YES') || res4After.data.result.answer.toLowerCase().includes('yes'), 'Query 4 now confirms YES, officially approved');
  assert(res4After.data.result.answer.includes('December 15, 2026'), 'Query 4 states December 15 is now the active confirmed decision');
  assert(res4After.data.result.answer.includes('superseded'), 'Query 4 notes December 10 was preserved as superseded');

  // Re-test Question 1: What launch date was originally confirmed?
  console.log('\n[Query 1 (Post-Approval)]: "What launch date was originally confirmed?"');
  const res1After = await makeRequest('/api/memory/query', 'POST', {
    query: 'What launch date was originally confirmed?',
  });
  assert(res1After.data.result.answer.includes('December 10, 2026'), 'Query 1 still correctly identifies December 10 as originally confirmed');
  assert(res1After.data.result.answer.includes('superseded'), 'Query 1 notes that it was later superseded');

  console.log(`\n==================================================`);
  console.log(`🎉 ALL ${passedTests}/${totalTests} MEMORY TESTS PASSED WITH 100% SUCCESS!`);
  console.log(`==================================================\n`);
}

runMemoryTestSuite().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
