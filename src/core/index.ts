/**
 * Core Module Entry Point
 * 
 * 모든 사업부를 등록하고 core 모듈을 export합니다.
 * 새 사업부 추가 시: 여기에 import + registry.register() 추가.
 */

export * from './types'
export { registry } from './registry'

// Division Plugins
import { registry } from './registry'
import { PsDivision } from '../divisions/ps'
import { HlDivision } from '../divisions/hl'

// 사업부 등록
registry.register(new PsDivision())
registry.register(new HlDivision())
