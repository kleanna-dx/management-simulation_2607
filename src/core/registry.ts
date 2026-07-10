/**
 * Division Registry — 사업부 플러그인 관리
 * 
 * 모든 사업부를 등록하고, 코드로 조회할 수 있는 중앙 레지스트리입니다.
 * 새 사업부 추가 시: registry.register(new XxxDivision()) 한 줄이면 끝.
 */

import type { DivisionPlugin, DivisionConfig } from './types'

class DivisionRegistry {
  private divisions: Map<string, DivisionPlugin> = new Map()

  /**
   * 사업부 플러그인 등록
   */
  register(division: DivisionPlugin): void {
    this.divisions.set(division.config.code, division)
  }

  /**
   * 사업부 코드로 플러그인 조회
   */
  get(code: string): DivisionPlugin | undefined {
    return this.divisions.get(code.toUpperCase())
  }

  /**
   * 등록된 모든 사업부 목록
   */
  list(): DivisionConfig[] {
    return Array.from(this.divisions.values()).map(d => d.config)
  }

  /**
   * 등록된 사업부 코드 목록
   */
  codes(): string[] {
    return Array.from(this.divisions.keys())
  }

  /**
   * 기본 사업부 (첫 번째 등록된 것)
   */
  getDefault(): DivisionPlugin | undefined {
    const first = this.divisions.values().next()
    return first.done ? undefined : first.value
  }

  /**
   * 사업부 코드 유효성 검사
   */
  isValid(code: string): boolean {
    return this.divisions.has(code.toUpperCase())
  }
}

// 싱글톤 인스턴스
export const registry = new DivisionRegistry()
