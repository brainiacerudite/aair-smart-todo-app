import { parseTasksFromText, validateParsedTasks } from '../src/utils/aiParser'
import { ParsedTask } from '../src/types'

describe('aiParser - Business Logic Tests', () => {
    describe('parseTasksFromText', () => {
        describe('Single Task Parsing', () => {
            it('should parse a simple task without description', () => {
                const input = ['Buy milk']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({
                    title: 'Buy milk',
                })
            })

            it('should handle extra whitespace', () => {
                const input = ['  Buy milk  ']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({
                    title: 'Buy milk',
                })
            })

            it('should parse task with " - " separator', () => {
                const input = ['Buy milk - call mom']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({
                    title: 'Buy milk',
                    description: 'call mom',
                })
            })

            it('should parse task with ": " separator', () => {
                const input = ['Call John: Discuss project deadline']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({
                    title: 'Call John',
                    description: 'Discuss project deadline',
                })
            })

            it('should parse task with " - " (em dash) separator', () => {
                const input = ['Write report - Include Q4 metrics and forecasts']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({
                    title: 'Write report',
                    description: 'Include Q4 metrics and forecasts',
                })
            })

            it('should handle multiple separators in description', () => {
                const input = ['Buy milk - Brand: Organic - Size: 2L']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({
                    title: 'Buy milk',
                    description: 'Brand: Organic - Size: 2L',
                })
            })
        })

        describe('Multiple Tasks Parsing', () => {
            it('should parse multiple simple tasks', () => {
                const input = ['Buy milk', 'Call John', 'Write report']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(3)
                expect(result[0]).toEqual({ title: 'Buy milk' })
                expect(result[1]).toEqual({ title: 'Call John' })
                expect(result[2]).toEqual({ title: 'Write report' })
            })

            it('should parse multiple tasks with mixed separators', () => {
                const input = [
                    'Buy milk - Get organic',
                    'Call John: Discuss deadline',
                    'Write report',
                ]
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(3)
                expect(result[0]).toEqual({
                    title: 'Buy milk',
                    description: 'Get organic',
                })
                expect(result[1]).toEqual({
                    title: 'Call John',
                    description: 'Discuss deadline',
                })
                expect(result[2]).toEqual({ title: 'Write report' })
            })
        })

        describe('Edge Cases', () => {
            it('should handle empty array', () => {
                const input: string[] = []
                const result = parseTasksFromText(input)

                expect(result).toEqual([])
            })

            it('should handle empty string', () => {
                const input = ['']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({ title: '' })
            })

            it('should handle whitespace-only string', () => {
                const input = ['   ']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({ title: '' })
            })

            it('should not parse separator with empty title', () => {
                const input = [' - This is description only']
                const result = parseTasksFromText(input)

                // should fall back to treating whole string as title
                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({
                    title: '- This is description only',
                })
            })

            it('should not parse separator with empty description', () => {
                const input = ['Buy milk - ']
                const result = parseTasksFromText(input)

                // should fall back to treating whole string as title
                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({
                    title: 'Buy milk -',
                })
            })

            it('should handle special characters', () => {
                const input = ['Buy @groceries #urgent - Store: Walmart $50 budget']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({
                    title: 'Buy @groceries #urgent',
                    description: 'Store: Walmart $50 budget',
                })
            })

            it('should handle unicode characters', () => {
                const input = ['Acheter du lait 🥛 - Marché français']
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(1)
                expect(result[0]).toEqual({
                    title: 'Acheter du lait 🥛',
                    description: 'Marché français',
                })
            })
        })

        describe('Real-World AI Output Scenarios', () => {
            it('should handle typical OpenAI response format', () => {
                // OpenAI often returns tasks in format: "Title - Description"
                const input = [
                    'Schedule dentist appointment - Call Dr. Smith at 555-1234',
                    'Review pull requests - Focus on security updates',
                    'Prepare presentation - Include sales metrics for Q4',
                ]
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(3)
                expect(result[0].title).toBe('Schedule dentist appointment')
                expect(result[0].description).toBe('Call Dr. Smith at 555-1234')
                expect(result[1].title).toBe('Review pull requests')
                expect(result[2].title).toBe('Prepare presentation')
            })

            it('should handle typical Gemini response format', () => {
                // Gemini sometimes uses colon separator
                const input = [
                    'Meeting: Discuss Q1 roadmap with team',
                    'Email: Send invoice to client',
                    'Research: Look into new frameworks',
                ]
                const result = parseTasksFromText(input)

                expect(result).toHaveLength(3)
                expect(result[0].title).toBe('Meeting')
                expect(result[0].description).toBe('Discuss Q1 roadmap with team')
                expect(result[1].title).toBe('Email')
                expect(result[2].title).toBe('Research')
            })
        })
    })

    describe('validateParsedTasks', () => {
        describe('Valid Task Validation', () => {
            it('should return true for valid single task', () => {
                const tasks: ParsedTask[] = [{ title: 'Buy milk' }]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(true)
            })

            it('should return true for multiple valid tasks', () => {
                const tasks: ParsedTask[] = [
                    { title: 'Buy milk' },
                    { title: 'Call John' },
                    { title: 'Write report', description: 'Q4 metrics' },
                ]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(true)
            })

            it('should return true for task with description', () => {
                const tasks: ParsedTask[] = [
                    { title: 'Buy milk', description: 'Get organic' },
                ]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(true)
            })
        })

        describe('Invalid Task Validation', () => {
            it('should return false for empty array', () => {
                const tasks: ParsedTask[] = []
                const result = validateParsedTasks(tasks)

                expect(result).toBe(false)
            })

            it('should return false for task with empty title', () => {
                const tasks: ParsedTask[] = [{ title: '' }]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(false)
            })

            it('should return false for task with whitespace-only title', () => {
                const tasks: ParsedTask[] = [{ title: '   ' }]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(false)
            })

            it('should return false if ANY task has empty title', () => {
                const tasks: ParsedTask[] = [
                    { title: 'Buy milk' },
                    { title: '' }, // invalid
                    { title: 'Call John' },
                ]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(false)
            })

            it('should return false for task with empty title but valid description', () => {
                const tasks: ParsedTask[] = [
                    { title: '', description: 'This has description but no title' },
                ]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(false)
            })
        })

        describe('Edge Case Validation', () => {
            it('should return true for single character title', () => {
                const tasks: ParsedTask[] = [{ title: 'A' }]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(true)
            })

            it('should return true for very long title', () => {
                const tasks: ParsedTask[] = [
                    { title: 'A'.repeat(500) }, // 500 character title
                ]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(true)
            })

            it('should return true for task with only special characters in title', () => {
                const tasks: ParsedTask[] = [{ title: '@#$%^&*()' }]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(true)
            })

            it('should return true for task with unicode emoji title', () => {
                const tasks: ParsedTask[] = [{ title: '🎉🎊🎈' }]
                const result = validateParsedTasks(tasks)

                expect(result).toBe(true)
            })
        })
    })

    describe('Integration: Parse + Validate', () => {
        it('should parse and validate typical user input', () => {
            const input = [
                'Buy milk - Get organic 2% from Whole Foods',
                'Call John: Discuss project deadline',
                'Write report',
            ]
            const parsed = parseTasksFromText(input)
            const isValid = validateParsedTasks(parsed)

            expect(isValid).toBe(true)
            expect(parsed).toHaveLength(3)
        })

        it('should parse but fail validation for empty input', () => {
            const input = ['', '  ', '   ']
            const parsed = parseTasksFromText(input)
            const isValid = validateParsedTasks(parsed)

            expect(isValid).toBe(false)
            expect(parsed).toHaveLength(3)
            expect(parsed[0].title).toBe('')
        })

        it('should handle mixed valid and invalid after parsing', () => {
            const input = ['Buy milk', '', 'Call John']
            const parsed = parseTasksFromText(input)
            const isValid = validateParsedTasks(parsed)

            // should fail validation because one task has empty title
            expect(isValid).toBe(false)
            expect(parsed).toHaveLength(3)
        })
    })
})
