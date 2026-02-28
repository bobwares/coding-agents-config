#!/usr/bin/env node
/**
 * Skill Evaluation Engine — agentic-pipeline
 * Analyzes user prompts and suggests relevant domain skills to activate.
 * Never blocks — always exits 0.
 */

const fs = require('fs');
const path = require('path');

const RULES_PATH = path.join(__dirname, 'skill-rules.json');

function loadRules() {
  try {
    return JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8'));
  } catch {
    process.exit(0);
  }
}

function extractFilePaths(prompt) {
  const paths = new Set();
  const extPat = /(?:^|\s|["'`])([\w\-./]+\.(?:[tj]sx?|java|json|ya?ml|md|sh|sql|css|scss))\b/gi;
  const dirPat = /(?:^|\s|["'`])((?:apps|src|packages|services|components|hooks|lib|api|modules|entities|dto|schema|migrations|e2e|__tests__)\/[\w\-./]+)/gi;
  let m;
  while ((m = extPat.exec(prompt)) !== null) paths.add(m[1]);
  while ((m = dirPat.exec(prompt)) !== null) paths.add(m[1]);
  return Array.from(paths);
}

function matchesPattern(text, pattern) {
  try { return new RegExp(pattern, 'i').test(text); } catch { return false; }
}

function matchesGlob(filePath, glob) {
  const re = glob
    .replace(/\./g, '\\.').replace(/\*\*\//g, '(.*\\/)?')
    .replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\?/g, '.');
  try { return new RegExp(`^${re}$`, 'i').test(filePath); } catch { return false; }
}

function evaluateSkill(name, skill, prompt, lower, filePaths, rules) {
  const { triggers = {}, excludePatterns = [] } = skill;
  const s = rules.scoring;
  let score = 0;
  const reasons = [];

  for (const p of excludePatterns) if (matchesPattern(lower, p)) return null;

  for (const kw of (triggers.keywords || [])) {
    if (lower.includes(kw.toLowerCase())) { score += s.keyword; reasons.push(`"${kw}"`); }
  }
  for (const p of (triggers.keywordPatterns || [])) {
    if (matchesPattern(lower, p)) { score += s.keywordPattern; reasons.push(`/${p}/`); }
  }
  for (const p of (triggers.intentPatterns || [])) {
    if (matchesPattern(lower, p)) { score += s.intentPattern; reasons.push('intent'); break; }
  }
  if (triggers.pathPatterns && filePaths.length > 0) {
    for (const fp of filePaths) {
      for (const p of triggers.pathPatterns) {
        if (matchesGlob(fp, p)) { score += s.pathPattern; reasons.push(`path:${fp}`); break; }
      }
    }
  }
  if (rules.directoryMappings && filePaths.length > 0) {
    for (const fp of filePaths) {
      for (const [dir, skill_] of Object.entries(rules.directoryMappings)) {
        if (skill_ === name && (fp === dir || fp.startsWith(dir + '/'))) {
          score += s.directoryMatch; reasons.push('dir-map'); break;
        }
      }
    }
  }
  return score > 0 ? { name, score, reasons: [...new Set(reasons)], priority: skill.priority || 5 } : null;
}

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', c => { input += c; });
  process.stdin.on('end', () => {
    let prompt = input.trim();
    if (!prompt) process.exit(0);

    const rules = loadRules();
    const lower = prompt.toLowerCase();
    const filePaths = extractFilePaths(prompt);
    const { config } = rules;

    const matches = Object.entries(rules.skills)
      .map(([name, skill]) => evaluateSkill(name, skill, prompt, lower, filePaths, rules))
      .filter(m => m && m.score >= config.minConfidenceScore)
      .sort((a, b) => b.score !== a.score ? b.score - a.score : b.priority - a.priority)
      .slice(0, config.maxSkillsToShow);

    if (!matches.length) process.exit(0);

    let out = '<user-prompt-submit-hook>\n';
    out += 'SKILL SUGGESTIONS\n\n';
    if (filePaths.length) out += `Detected paths: ${filePaths.join(', ')}\n\n`;
    out += 'Relevant domain skills:\n';
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const conf = m.score >= config.minConfidenceScore * 3 ? 'HIGH' : m.score >= config.minConfidenceScore * 2 ? 'MED' : 'LOW';
      out += `${i + 1}. ${m.name} [${conf}] — matched: ${m.reasons.slice(0,3).join(', ')}\n`;
    }
    out += '\nActivate relevant skills with the Skill tool before implementing.\n';
    out += '</user-prompt-submit-hook>';

    console.log(out);
    process.exit(0);
  });
}

main();
