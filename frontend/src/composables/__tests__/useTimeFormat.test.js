import { describe, it, expect } from 'vitest'
import { useTimeFormat } from '../useTimeFormat'

describe('useTimeFormat', () => {
  const { minutesToHumanFormat, humanFormatToMinutes, isValidTimeFormat } = useTimeFormat()

  describe('minutesToHumanFormat', () => {
    it('should convert minutes to human format correctly', () => {
      expect(minutesToHumanFormat(0)).toBe('0m')
      expect(minutesToHumanFormat(30)).toBe('30m')
      expect(minutesToHumanFormat(60)).toBe('1h')
      expect(minutesToHumanFormat(90)).toBe('1h30m')
      expect(minutesToHumanFormat(1440)).toBe('1d')
      expect(minutesToHumanFormat(1500)).toBe('1d1h')
      expect(minutesToHumanFormat(1530)).toBe('1d1h30m')
      expect(minutesToHumanFormat(4320)).toBe('3d')
      expect(minutesToHumanFormat(4500)).toBe('3d3h')
      expect(minutesToHumanFormat(4524)).toBe('3d3h24m')
    })

    it('should handle edge cases', () => {
      expect(minutesToHumanFormat(null)).toBe('0m')
      expect(minutesToHumanFormat(undefined)).toBe('0m')
      expect(minutesToHumanFormat('')).toBe('0m')
    })
  })

  describe('humanFormatToMinutes', () => {
    it('should convert human format to minutes correctly', () => {
      expect(humanFormatToMinutes('0m')).toBe(0)
      expect(humanFormatToMinutes('30m')).toBe(30)
      expect(humanFormatToMinutes('1h')).toBe(60)
      expect(humanFormatToMinutes('1h30m')).toBe(90)
      expect(humanFormatToMinutes('1d')).toBe(1440)
      expect(humanFormatToMinutes('1d1h')).toBe(1500)
      expect(humanFormatToMinutes('1d1h30m')).toBe(1530)
      expect(humanFormatToMinutes('3d')).toBe(4320)
      expect(humanFormatToMinutes('3d3h')).toBe(4500)
      expect(humanFormatToMinutes('3d3h24m')).toBe(4524)
    })

    it('should handle different order of components', () => {
      expect(humanFormatToMinutes('24m3h2d')).toBe(4524)
      expect(humanFormatToMinutes('30m1h')).toBe(90)
      expect(humanFormatToMinutes('1h1d')).toBe(1500)
    })

    it('should handle spaces and case insensitive', () => {
      expect(humanFormatToMinutes('2D 3H 24M')).toBe(4524)
      expect(humanFormatToMinutes(' 1h 30m ')).toBe(90)
      expect(humanFormatToMinutes('1D1H30M')).toBe(1530)
    })

    it('should handle edge cases', () => {
      expect(humanFormatToMinutes('')).toBe(0)
      expect(humanFormatToMinutes(null)).toBe(0)
      expect(humanFormatToMinutes(undefined)).toBe(0)
      expect(humanFormatToMinutes('invalid')).toBe(0)
    })
  })

  describe('isValidTimeFormat', () => {
    it('should validate correct formats', () => {
      expect(isValidTimeFormat('1d')).toBe(true)
      expect(isValidTimeFormat('1h')).toBe(true)
      expect(isValidTimeFormat('1m')).toBe(true)
      expect(isValidTimeFormat('1d2h')).toBe(true)
      expect(isValidTimeFormat('2h30m')).toBe(true)
      expect(isValidTimeFormat('1d2h30m')).toBe(true)
      expect(isValidTimeFormat('365d')).toBe(true)
      expect(isValidTimeFormat('24h')).toBe(true)
      expect(isValidTimeFormat('59m')).toBe(true)
    })

    it('should handle case insensitive and spaces', () => {
      expect(isValidTimeFormat('1D2H30M')).toBe(true)
      expect(isValidTimeFormat(' 1d 2h 30m ')).toBe(true)
    })

    it('should reject invalid formats', () => {
      expect(isValidTimeFormat('')).toBe(false)
      expect(isValidTimeFormat('invalid')).toBe(false)
      expect(isValidTimeFormat('1x')).toBe(false)
      expect(isValidTimeFormat('1d2x')).toBe(false)
      expect(isValidTimeFormat('abc')).toBe(false)
      expect(isValidTimeFormat('1')).toBe(false)
      expect(isValidTimeFormat('d')).toBe(false)
      expect(isValidTimeFormat(null)).toBe(false)
      expect(isValidTimeFormat(undefined)).toBe(false)
    })
  })

  describe('integration tests', () => {
    it('should convert back and forth correctly', () => {
      const testCases = [0, 30, 60, 90, 1440, 1500, 1530, 4524]
      
      testCases.forEach(minutes => {
        const humanFormat = minutesToHumanFormat(minutes)
        const backToMinutes = humanFormatToMinutes(humanFormat)
        expect(backToMinutes).toBe(minutes)
      })
    })

    it('should handle user input variations', () => {
      const variations = [
        { input: '2d3h24m', expected: 4524 },
        { input: '2D3H24M', expected: 4524 },
        { input: ' 2d 3h 24m ', expected: 4524 },
        { input: '24m3h2d', expected: 4524 },
        { input: '3h24m2d', expected: 4524 }
      ]

      variations.forEach(({ input, expected }) => {
        expect(humanFormatToMinutes(input)).toBe(expected)
      })
    })
  })
})