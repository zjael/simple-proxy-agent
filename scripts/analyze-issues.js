#!/usr/bin/env node

/**
 * GitHub Issues Analyzer
 *
 * This script helps analyze issues from the repository.
 *
 * Since we don't have direct GitHub API access, you can:
 * 1. Export issues from GitHub: gh issue list --json number,title,state,labels,createdAt --limit 100 > issues.json
 * 2. Run this script: node scripts/analyze-issues.js issues.json
 *
 * Or manually provide issue details to investigate.
 */

const fs = require('fs');
const path = require('path');

console.log('GitHub Issues Analyzer\n');

const issuesFile = process.argv[2];

if (!issuesFile) {
  console.log('Usage: node scripts/analyze-issues.js <issues.json>');
  console.log('\nTo export issues from GitHub:');
  console.log('  gh issue list --json number,title,state,labels,createdAt --limit 100 > issues.json');
  console.log('  node scripts/analyze-issues.js issues.json');
  console.log('\nOr visit: https://github.com/zjael/simple-proxy-agent/issues');
  process.exit(1);
}

if (!fs.existsSync(issuesFile)) {
  console.error(`Error: File not found: ${issuesFile}`);
  process.exit(1);
}

const issues = JSON.parse(fs.readFileSync(issuesFile, 'utf-8'));

console.log(`Found ${issues.length} issues\n`);

// Categorize issues
const categories = {
  open: [],
  closed: [],
  bugs: [],
  features: [],
  socks: [],
  http: [],
  auth: [],
  timeout: [],
  typescript: [],
};

issues.forEach(issue => {
  if (issue.state === 'OPEN') categories.open.push(issue);
  if (issue.state === 'CLOSED') categories.closed.push(issue);

  const title = issue.title.toLowerCase();
  const labels = issue.labels?.map(l => l.name.toLowerCase()) || [];

  if (labels.includes('bug') || title.includes('bug') || title.includes('error') || title.includes('fail')) {
    categories.bugs.push(issue);
  }
  if (labels.includes('enhancement') || labels.includes('feature')) {
    categories.features.push(issue);
  }
  if (title.includes('socks')) categories.socks.push(issue);
  if (title.includes('http')) categories.http.push(issue);
  if (title.includes('auth')) categories.auth.push(issue);
  if (title.includes('timeout')) categories.timeout.push(issue);
  if (title.includes('typescript') || title.includes('types')) categories.typescript.push(issue);
});

console.log('Summary:');
console.log(`  Open: ${categories.open.length}`);
console.log(`  Closed: ${categories.closed.length}`);
console.log(`  Bugs: ${categories.bugs.length}`);
console.log(`  Features: ${categories.features.length}`);
console.log('\nBy Topic:');
console.log(`  SOCKS-related: ${categories.socks.length}`);
console.log(`  HTTP-related: ${categories.http.length}`);
console.log(`  Auth-related: ${categories.auth.length}`);
console.log(`  Timeout-related: ${categories.timeout.length}`);
console.log(`  TypeScript: ${categories.typescript.length}`);

console.log('\n\nOpen Issues:');
categories.open.forEach(issue => {
  console.log(`  #${issue.number}: ${issue.title}`);
  console.log(`    Created: ${new Date(issue.createdAt).toLocaleDateString()}`);
  console.log(`    Labels: ${issue.labels?.map(l => l.name).join(', ') || 'none'}`);
  console.log('');
});

console.log('\nRecent Bugs:');
categories.bugs.slice(0, 10).forEach(issue => {
  console.log(`  #${issue.number} [${issue.state}]: ${issue.title}`);
});
