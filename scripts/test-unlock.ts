import { userProgress } from '../src/lib/storage';
import { ProgressService } from '../src/lib/progress-service';

// Mock State
const mockBadges = ['badge-explorer'];
const scenarioNormal = { id: 'learning-patterns', required_badge_id: 'badge-explorer' };
const scenarioLocked = { id: 'advanced-ai', required_badge_id: 'badge-detective' };

function testUnlock() {
    console.log('--- Testing Unlock Logic ---');

    // Check unlocked
    const isUnlocked1 = ProgressService.isUnlocked(scenarioNormal as any, mockBadges);
    console.log(`Scenario (Req: badge-explorer) with User (Has: badge-explorer) -> Unlocked? ${isUnlocked1}`);

    if (isUnlocked1 !== true) console.error('FAIL: Should be unlocked');

    // Check locked
    const isUnlocked2 = ProgressService.isUnlocked(scenarioLocked as any, mockBadges);
    console.log(`Scenario (Req: badge-detective) with User (Has: badge-explorer) -> Unlocked? ${isUnlocked2}`);

    if (isUnlocked2 !== false) console.error('FAIL: Should be locked');

    console.log('--- End Test ---');
}

testUnlock();
