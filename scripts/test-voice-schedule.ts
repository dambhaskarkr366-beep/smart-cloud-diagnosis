import assert from 'node:assert/strict';
import { buildWeatherWarning, extractScheduleDraft, normalizeDateFromText, normalizeTimeRange } from '../src/lib/voiceSchedule';

const baseDate = new Date('2026-04-15T00:00:00');

assert.equal(normalizeDateFromText('后天早上开会', baseDate), '2026-04-17');
assert.equal(normalizeDateFromText('明天下午见客户', baseDate), '2026-04-16');
assert.equal(normalizeDateFromText('下周三复盘', baseDate), '2026-04-22');
assert.equal(normalizeDateFromText('4月20号巡检', baseDate), '2026-04-20');

assert.equal(normalizeTimeRange('后天早上开会'), '08:00-09:00');
assert.equal(normalizeTimeRange('明天9点30开会'), '09:30-10:30');

const draft = extractScheduleDraft('后天早上和王工在上海张江A栋3层会议室做设备巡检复盘，记得带故障报告。', baseDate);
assert.equal(draft.normalizedDate, '2026-04-17');
assert.equal(draft.normalizedTimeRange, '08:00-09:00');
assert.equal(draft.location, '上海张江A栋3层会议室');
assert.ok(draft.people.startsWith('王工'));
assert.equal(draft.notes, '带故障报告');

assert.equal(buildWeatherWarning(95, 20), '有雷暴风险，建议优先改为线上会议或提前出行。');
assert.equal(buildWeatherWarning(1, 80), '降雨概率高，建议预留通勤缓冲并准备雨具。');

console.log('voice-schedule parser tests passed');
