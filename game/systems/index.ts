
import type { World, InputState } from '../../types';
import { abilitySystem } from './abilitySystem';
import { physicsSystem } from './physicsSystem';
import { collisionSystem } from './collisionSystem';
import { renderSystem } from './renderSystem';
import { attachmentSystem } from './attachmentSystem';
import { statusSystem } from './statusSystem';
import { combatSystem } from './combatSystem';
import { movingPlatformSystem } from './movingPlatformSystem';
import { entitySystem } from './entitySystem';
import { targetSystem } from './targetSystem';
import { bossSystem } from './bossSystem';

export function runSystems(world: World, canvas: HTMLCanvasElement, input: InputState) {
    if (world.status === 'playing') {
        if (world.respawnPlayer) {
            statusSystem.respawn(world, world.playerId);
            world.respawnPlayer = false;
        }

        abilitySystem(world, input);
        movingPlatformSystem(world);
        entitySystem(world);
        bossSystem(world); // Add Boss AI
        physicsSystem(world);
        collisionSystem(world);
        targetSystem(world);
        combatSystem(world);
        attachmentSystem(world);
        statusSystem.update(world);
    }
    
    renderSystem(world, canvas);
}
