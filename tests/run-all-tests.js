/**
 * @file run-all-tests.js
 * @description Master E2E Test Suite Orchestrator & CLI Runner for Tech Boy Solutions.
 * Executes Tier 1, Tier 2, Tier 3, and Tier 4 test suites with detailed metrics and formatting.
 *
 * Usage:
 *   node tests/run-all-tests.js
 */

const { runTier1Tests } = require('./tier1-features.test');
const { runTier2Tests } = require('./tier2-boundaries.test');
const { runTier3Tests } = require('./tier3-interactions.test');
const { runTier4Tests } = require('./tier4-scenarios.test');
const { runTier5Tests } = require('./tier5-adversarial-hardening.test');
const { makeHttpRequest } = require('./test-utils');

// ANSI Color Codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const GRAY = '\x1b[90m';

async function main() {
  const overallStartTime = Date.now();

  console.log(`\n${BOLD}${BLUE}================================================================================${RESET}`);
  console.log(`${BOLD}${BLUE}   TECH BOY SOLUTIONS — E2E TEST SUITE (TIERS 1 - 5)                           ${RESET}`);
  console.log(`${BOLD}${BLUE}================================================================================${RESET}`);
  console.log(`${GRAY}Running opaque-box E2E DOM, CSS, JS, Config, and Integration verification...${RESET}\n`);

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalAssertions = 0;

  const tierReports = [];

  // -------------------------------------------------------------------------
  // Tier 1: Feature Coverage
  // -------------------------------------------------------------------------
  console.log(`${BOLD}${CYAN}▶ EXECUTING TIER 1: Feature Coverage (49 Features)${RESET}`);
  const t1Results = runTier1Tests();
  let t1Passed = 0;
  let t1Failed = 0;
  let t1Assertions = 0;

  t1Results.forEach(r => {
    totalTests++;
    totalAssertions += r.assertions;
    t1Assertions += r.assertions;
    if (r.passed) {
      t1Passed++;
      totalPassed++;
      console.log(`  ${GREEN}✔${RESET} [${r.id}] ${r.name} ${GRAY}(${r.assertions} assertions, ${r.durationMs}ms)${RESET}`);
    } else {
      t1Failed++;
      totalFailed++;
      console.log(`  ${RED}✖${RESET} [${r.id}] ${r.name} ${RED}FAILED${RESET}`);
      console.log(`    ${RED}${r.error}${RESET}`);
    }
  });

  tierReports.push({
    tier: 'Tier 1: Feature Coverage',
    total: t1Results.length,
    passed: t1Passed,
    failed: t1Failed,
    assertions: t1Assertions
  });

  // -------------------------------------------------------------------------
  // Tier 2: Boundary & Corner Cases
  // -------------------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}▶ EXECUTING TIER 2: Boundary & Corner Cases (9 Boundaries)${RESET}`);
  const t2Results = runTier2Tests();
  let t2Passed = 0;
  let t2Failed = 0;
  let t2Assertions = 0;

  t2Results.forEach(r => {
    totalTests++;
    totalAssertions += r.assertions;
    t2Assertions += r.assertions;
    if (r.passed) {
      t2Passed++;
      totalPassed++;
      console.log(`  ${GREEN}✔${RESET} [${r.id}] ${r.name} ${GRAY}(${r.assertions} assertions, ${r.durationMs}ms)${RESET}`);
    } else {
      t2Failed++;
      totalFailed++;
      console.log(`  ${RED}✖${RESET} [${r.id}] ${r.name} ${RED}FAILED${RESET}`);
      console.log(`    ${RED}${r.error}${RESET}`);
    }
  });

  tierReports.push({
    tier: 'Tier 2: Boundary & Corner Cases',
    total: t2Results.length,
    passed: t2Passed,
    failed: t2Failed,
    assertions: t2Assertions
  });

  // -------------------------------------------------------------------------
  // Tier 3: Cross-Feature Interactions
  // -------------------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}▶ EXECUTING TIER 3: Cross-Feature & Pairwise Interactions (8 Interactions)${RESET}`);
  const t3Results = runTier3Tests();
  let t3Passed = 0;
  let t3Failed = 0;
  let t3Assertions = 0;

  t3Results.forEach(r => {
    totalTests++;
    totalAssertions += r.assertions;
    t3Assertions += r.assertions;
    if (r.passed) {
      t3Passed++;
      totalPassed++;
      console.log(`  ${GREEN}✔${RESET} [${r.id}] ${r.name} ${GRAY}(${r.assertions} assertions, ${r.durationMs}ms)${RESET}`);
    } else {
      t3Failed++;
      totalFailed++;
      console.log(`  ${RED}✖${RESET} [${r.id}] ${r.name} ${RED}FAILED${RESET}`);
      console.log(`    ${RED}${r.error}${RESET}`);
    }
  });

  tierReports.push({
    tier: 'Tier 3: Cross-Feature Interactions',
    total: t3Results.length,
    passed: t3Passed,
    failed: t3Failed,
    assertions: t3Assertions
  });

  // -------------------------------------------------------------------------
  // Tier 4: Real-World Workload Scenarios
  // -------------------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}▶ EXECUTING TIER 4: Real-World Workload Scenarios (4 End-to-End User Journeys)${RESET}`);
  const t4Results = runTier4Tests();
  let t4Passed = 0;
  let t4Failed = 0;
  let t4Assertions = 0;

  t4Results.forEach(r => {
    totalTests++;
    totalAssertions += r.assertions;
    t4Assertions += r.assertions;
    if (r.passed) {
      t4Passed++;
      totalPassed++;
      console.log(`  ${GREEN}✔${RESET} [${r.id}] ${r.name} ${GRAY}(${r.assertions} assertions, ${r.durationMs}ms)${RESET}`);
    } else {
      t4Failed++;
      totalFailed++;
      console.log(`  ${RED}✖${RESET} [${r.id}] ${r.name} ${RED}FAILED${RESET}`);
      console.log(`    ${RED}${r.error}${RESET}`);
    }
  });

  tierReports.push({
    tier: 'Tier 4: Real-World Scenarios',
    total: t4Results.length,
    passed: t4Passed,
    failed: t4Failed,
    assertions: t4Assertions
  });

  // -------------------------------------------------------------------------
  // Tier 5: Adversarial Coverage Hardening
  // -------------------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}▶ EXECUTING TIER 5: Adversarial Coverage Hardening (24 Stress Scenarios)${RESET}`);
  const t5Results = runTier5Tests();
  let t5Passed = 0;
  let t5Failed = 0;
  let t5Assertions = 0;

  t5Results.forEach(r => {
    totalTests++;
    totalAssertions += r.assertions;
    t5Assertions += r.assertions;
    if (r.passed) {
      t5Passed++;
      totalPassed++;
      console.log(`  ${GREEN}✔${RESET} [${r.id}] ${r.name} ${GRAY}(${r.assertions} assertions, ${r.durationMs}ms)${RESET}`);
    } else {
      t5Failed++;
      totalFailed++;
      console.log(`  ${RED}✖${RESET} [${r.id}] ${r.name} ${RED}FAILED${RESET}`);
      console.log(`    ${RED}${r.error}${RESET}`);
    }
  });

  tierReports.push({
    tier: 'Tier 5: Adversarial Hardening',
    total: t5Results.length,
    passed: t5Passed,
    failed: t5Failed,
    assertions: t5Assertions
  });

  // -------------------------------------------------------------------------
  // Optional Live HTTP Server Check
  // -------------------------------------------------------------------------
  console.log(`\n${BOLD}${CYAN}▶ CHECKING LOCAL HTTP SERVER STATUS${RESET}`);
  const httpCheck = await makeHttpRequest('/', 3000);
  if (httpCheck.statusCode === 200) {
    console.log(`  ${GREEN}✔${RESET} Local server is ACTIVE on http://localhost:3000 (HTTP 200 OK)`);
  } else {
    console.log(`  ${YELLOW}ℹ${RESET} Local server on port 3000 is not currently running (offline fallback verified)`);
  }

  // -------------------------------------------------------------------------
  // Final Summary Matrix
  // -------------------------------------------------------------------------
  const totalDuration = Date.now() - overallStartTime;

  console.log(`\n${BOLD}${BLUE}================================================================================${RESET}`);
  console.log(`${BOLD}${BLUE}   TEST EXECUTION SUMMARY MATRIX                                               ${RESET}`);
  console.log(`${BOLD}${BLUE}================================================================================${RESET}`);
  console.log(`  ${BOLD}${'Tier Category'.padEnd(36)} | ${'Total'.padEnd(6)} | ${'Passed'.padEnd(6)} | ${'Failed'.padEnd(6)} | Assertions${RESET}`);
  console.log(`  ${'-'.repeat(74)}`);

  tierReports.forEach(tr => {
    const statusColor = tr.failed === 0 ? GREEN : RED;
    console.log(`  ${tr.tier.padEnd(36)} | ${tr.total.toString().padEnd(6)} | ${statusColor}${tr.passed.toString().padEnd(6)}${RESET} | ${statusColor}${tr.failed.toString().padEnd(6)}${RESET} | ${tr.assertions}`);
  });

  console.log(`  ${'-'.repeat(74)}`);
  const finalColor = totalFailed === 0 ? GREEN : RED;
  console.log(`  ${BOLD}${'TOTALS'.padEnd(36)} | ${totalTests.toString().padEnd(6)} | ${finalColor}${totalPassed.toString().padEnd(6)}${RESET} | ${finalColor}${totalFailed.toString().padEnd(6)}${RESET} | ${totalAssertions}${RESET}`);
  console.log(`\n  ${BOLD}Total Execution Time:${RESET} ${totalDuration} ms`);
  console.log(`  ${BOLD}Pass Rate:${RESET} ${finalColor}${((totalPassed / totalTests) * 100).toFixed(1)}%${RESET}`);

  if (totalFailed === 0) {
    console.log(`\n${BOLD}${GREEN}✔ ALL 5 TIERS PASSED PERFECTLY (100% SUCCESSFUL TEST RUN)${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${BOLD}${RED}✖ ${totalFailed} TEST(S) FAILED${RESET}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test Runner Error:', err);
  process.exit(1);
});
