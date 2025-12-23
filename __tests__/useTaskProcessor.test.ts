import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useTaskProcessor } from '../src/hooks/useTaskProcessor'
import { AIService } from '../src/services/ai'

// mock the AI service
jest.mock('../src/services/ai', () => ({
    AIService: {
        transcribeAudio: jest.fn(),
        parseTasks: jest.fn(),
    },
}))

// mock the aiParser util
jest.mock('../src/utils/aiParser', () => ({
    parseTasksFromText: jest.fn((taskStrings: string[]) =>
        taskStrings.map((str) => ({ title: str }))
    ),
    validateParsedTasks: jest.fn((tasks) => tasks.length > 0 && tasks.every((t: any) => t.title.trim().length > 0)),
}))

describe('useTaskProcessor - Business Logic Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('processAudioToTasks', () => {
        describe('Success Cases', () => {
            it('should successfully process audio and return tasks', async () => {
                // mock successful transcription
                const mockTranscribedText = 'Buy milk and call John'
                const mockTaskStrings = ['Buy milk', 'Call John']

                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                const mockParseTasks = AIService.parseTasks as jest.MockedFunction<typeof AIService.parseTasks>

                mockTranscribeAudio.mockResolvedValue(mockTranscribedText)
                mockParseTasks.mockResolvedValue(mockTaskStrings)

                const { result } = renderHook(() => useTaskProcessor())

                // initial state
                expect(result.current.isProcessing).toBe(false)
                expect(result.current.error).toBe(null)
                expect(result.current.suggestedTasks).toEqual([])

                // process audio
                let processResult: { originalText: string; suggestedTasks: any[] }
                await act(async () => {
                    processResult = await result.current.processAudioToTasks('file://audio.m4a')
                })

                // verify AI service was called correctly
                expect(AIService.transcribeAudio).toHaveBeenCalledWith('file://audio.m4a')
                expect(AIService.parseTasks).toHaveBeenCalledWith(mockTranscribedText)

                // verify results
                expect(result.current.isProcessing).toBe(false)
                expect(result.current.error).toBe(null)
                expect(result.current.originalText).toBe(mockTranscribedText)
                expect(result.current.suggestedTasks).toHaveLength(2)
                expect(processResult!.originalText).toBe(mockTranscribedText)
                expect(processResult!.suggestedTasks).toHaveLength(2)
            })

            it('should handle complex task descriptions', async () => {
                const mockTranscribedText = 'Schedule meeting with team to discuss Q4 roadmap'
                const mockTaskStrings = [
                    'Schedule meeting - Discuss Q4 roadmap with team',
                ]

                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                const mockParseTasks = AIService.parseTasks as jest.MockedFunction<typeof AIService.parseTasks>

                mockTranscribeAudio.mockResolvedValue(mockTranscribedText)
                mockParseTasks.mockResolvedValue(mockTaskStrings)

                const { result } = renderHook(() => useTaskProcessor())

                await act(async () => {
                    await result.current.processAudioToTasks('file://audio.m4a')
                })

                expect(result.current.suggestedTasks).toHaveLength(1)
                expect(result.current.error).toBe(null)
            })
        })

        describe('Fallback Strategy: GPT Fails but Transcription Works', () => {
            it('should fallback to original text when GPT parsing fails', async () => {
                const mockTranscribedText = 'Buy milk'

                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                const mockParseTasks = AIService.parseTasks as jest.MockedFunction<typeof AIService.parseTasks>

                mockTranscribeAudio.mockResolvedValue(mockTranscribedText)
                mockParseTasks.mockRejectedValue(new Error('GPT API rate limit exceeded'))

                const { result } = renderHook(() => useTaskProcessor())

                await act(async () => {
                    await result.current.processAudioToTasks('file://audio.m4a')
                })

                // should still succeed with fallback
                expect(result.current.isProcessing).toBe(false)
                expect(result.current.error).toBe(null)
                expect(result.current.originalText).toBe(mockTranscribedText)
                expect(result.current.suggestedTasks).toHaveLength(1)
                expect(result.current.suggestedTasks[0].title).toBe(mockTranscribedText)
            })

            it('should fallback when GPT returns invalid response', async () => {
                const mockTranscribedText = 'Call John urgently'

                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                const mockParseTasks = AIService.parseTasks as jest.MockedFunction<typeof AIService.parseTasks>

                mockTranscribeAudio.mockResolvedValue(mockTranscribedText)
                mockParseTasks.mockRejectedValue(new Error('Invalid JSON response'))

                const { result } = renderHook(() => useTaskProcessor())

                await act(async () => {
                    await result.current.processAudioToTasks('file://audio.m4a')
                })

                expect(result.current.suggestedTasks).toHaveLength(1)
                expect(result.current.suggestedTasks[0].title).toBe(mockTranscribedText)
                expect(result.current.error).toBe(null)
            })
        })

        describe('Error Handling: Complete Failures', () => {
            it('should throw error when audioUri is null', async () => {
                const { result } = renderHook(() => useTaskProcessor())

                try {
                    await act(async () => {
                        await result.current.processAudioToTasks(null)
                    })
                    fail('Should have thrown an error')
                } catch (error) {
                    expect(error).toEqual(new Error('No audio URI provided'))
                }

                expect(result.current.isProcessing).toBe(false)
            })

            it('should throw error when audioUri is empty string', async () => {
                const { result } = renderHook(() => useTaskProcessor())

                // empty string is truthy for the initial null check but should fail
                try {
                    await act(async () => {
                        await result.current.processAudioToTasks('')
                    })
                    fail('Should have thrown an error')
                } catch (error) {
                    expect(error).toBeDefined()
                }

                expect(result.current.isProcessing).toBe(false)
            })

            it('should handle transcription API failure', async () => {
                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                mockTranscribeAudio.mockRejectedValue(new Error('Transcription API is unavailable'))

                const { result } = renderHook(() => useTaskProcessor())

                try {
                    await act(async () => {
                        await result.current.processAudioToTasks('file://audio.m4a')
                    })
                    fail('Should have thrown an error')
                } catch (error) {
                    expect(error).toEqual(new Error('Transcription API is unavailable'))
                }

                expect(result.current.isProcessing).toBe(false)
            })

            it('should handle empty transcription result', async () => {
                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                mockTranscribeAudio.mockResolvedValue('   ')

                const { result } = renderHook(() => useTaskProcessor())

                try {
                    await act(async () => {
                        await result.current.processAudioToTasks('file://audio.m4a')
                    })
                    fail('Should have thrown an error')
                } catch (error) {
                    expect(error).toEqual(new Error('No text was transcribed from the audio'))
                }

                expect(result.current.isProcessing).toBe(false)
            })

            it('should handle network timeout error', async () => {
                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                mockTranscribeAudio.mockRejectedValue(new Error('Network timeout'))

                const { result } = renderHook(() => useTaskProcessor())

                try {
                    await act(async () => {
                        await result.current.processAudioToTasks('file://audio.m4a')
                    })
                    fail('Should have thrown an error')
                } catch (error) {
                    expect(error).toEqual(new Error('Network timeout'))
                }
            })
        })

        describe('State Management', () => {
            it('should set isProcessing to true during processing', async () => {
                let resolveTranscription: (value: string) => void
                const transcriptionPromise = new Promise<string>((resolve) => {
                    resolveTranscription = resolve
                })

                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                const mockParseTasks = AIService.parseTasks as jest.MockedFunction<typeof AIService.parseTasks>

                mockTranscribeAudio.mockReturnValue(transcriptionPromise)
                mockParseTasks.mockResolvedValue(['Buy milk'])

                const { result } = renderHook(() => useTaskProcessor())

                // start processing
                act(() => {
                    result.current.processAudioToTasks('file://audio.m4a')
                })

                // should be processing
                await waitFor(() => {
                    expect(result.current.isProcessing).toBe(true)
                })

                // complete the transcription
                await act(async () => {
                    resolveTranscription!('Buy milk')
                    await transcriptionPromise
                })

                // should be done
                await waitFor(() => {
                    expect(result.current.isProcessing).toBe(false)
                })
            })

            it('should clear results when clearResults is called', async () => {
                const mockTranscribedText = 'Buy milk'

                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                const mockParseTasks = AIService.parseTasks as jest.MockedFunction<typeof AIService.parseTasks>

                mockTranscribeAudio.mockResolvedValue(mockTranscribedText)
                mockParseTasks.mockResolvedValue(['Buy milk'])

                const { result } = renderHook(() => useTaskProcessor())

                // process audio
                await act(async () => {
                    await result.current.processAudioToTasks('file://audio.m4a')
                })

                expect(result.current.originalText).toBe(mockTranscribedText)
                expect(result.current.suggestedTasks).toHaveLength(1)

                // clear results
                act(() => {
                    result.current.clearResults()
                })

                expect(result.current.originalText).toBe(null)
                expect(result.current.suggestedTasks).toEqual([])
                expect(result.current.error).toBe(null)
            })
        })
    })

    describe('processAudioToText', () => {
        describe('Success Cases', () => {
            it('should successfully transcribe audio to text', async () => {
                const mockTranscribedText = 'Buy milk'

                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                mockTranscribeAudio.mockResolvedValue(mockTranscribedText)

                const { result } = renderHook(() => useTaskProcessor())

                let transcribedText: string
                await act(async () => {
                    transcribedText = await result.current.processAudioToText('file://audio.m4a')
                })

                expect(AIService.transcribeAudio).toHaveBeenCalledWith('file://audio.m4a')
                expect(transcribedText!).toBe(mockTranscribedText)
                expect(result.current.isProcessing).toBe(false)
                expect(result.current.error).toBe(null)
            })

            it('should NOT call parseTasks when using processAudioToText', async () => {
                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                mockTranscribeAudio.mockResolvedValue('Buy milk')

                const { result } = renderHook(() => useTaskProcessor())

                await act(async () => {
                    await result.current.processAudioToText('file://audio.m4a')
                })

                expect(AIService.transcribeAudio).toHaveBeenCalled()
                expect(AIService.parseTasks).not.toHaveBeenCalled()
            })
        })

        describe('Error Handling', () => {
            it('should throw error when audioUri is null', async () => {
                const { result } = renderHook(() => useTaskProcessor())

                try {
                    await act(async () => {
                        await result.current.processAudioToText(null)
                    })
                    fail('Should have thrown an error')
                } catch (error) {
                    expect(error).toEqual(new Error('No audio URI provided'))
                }
            })

            it('should handle empty transcription result', async () => {
                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                mockTranscribeAudio.mockResolvedValue('')

                const { result } = renderHook(() => useTaskProcessor())

                try {
                    await act(async () => {
                        await result.current.processAudioToText('file://audio.m4a')
                    })
                    fail('Should have thrown an error')
                } catch (error) {
                    expect(error).toEqual(new Error('No text was transcribed from the audio'))
                }
            })

            it('should handle transcription failure', async () => {
                const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
                mockTranscribeAudio.mockRejectedValue(new Error('Audio format not supported'))

                const { result } = renderHook(() => useTaskProcessor())

                try {
                    await act(async () => {
                        await result.current.processAudioToText('file://audio.m4a')
                    })
                    fail('Should have thrown an error')
                } catch (error) {
                    expect(error).toEqual(new Error('Audio format not supported'))
                }
            })
        })
    })

    describe('Integration: Multiple Operations', () => {
        it('should handle sequential processAudioToTasks calls', async () => {
            const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
            const mockParseTasks = AIService.parseTasks as jest.MockedFunction<typeof AIService.parseTasks>

            mockTranscribeAudio
                .mockResolvedValueOnce('Buy milk')
                .mockResolvedValueOnce('Call John')
            mockParseTasks
                .mockResolvedValueOnce(['Buy milk'])
                .mockResolvedValueOnce(['Call John'])

            const { result } = renderHook(() => useTaskProcessor())

            // first call
            await act(async () => {
                await result.current.processAudioToTasks('file://audio1.m4a')
            })
            expect(result.current.originalText).toBe('Buy milk')

            // second call
            await act(async () => {
                await result.current.processAudioToTasks('file://audio2.m4a')
            })
            expect(result.current.originalText).toBe('Call John')
        })

        it('should handle error after successful operation', async () => {
            const mockTranscribeAudio = AIService.transcribeAudio as jest.MockedFunction<typeof AIService.transcribeAudio>
            const mockParseTasks = AIService.parseTasks as jest.MockedFunction<typeof AIService.parseTasks>

            mockTranscribeAudio
                .mockResolvedValueOnce('Buy milk')
                .mockRejectedValueOnce(new Error('Network error'))
            mockParseTasks.mockResolvedValue(['Buy milk'])

            const { result } = renderHook(() => useTaskProcessor())

            // success
            await act(async () => {
                await result.current.processAudioToTasks('file://audio1.m4a')
            })
            expect(result.current.error).toBe(null)

            // failure
            try {
                await act(async () => {
                    await result.current.processAudioToTasks('file://audio2.m4a')
                })
                fail('Should have thrown an error')
            } catch (error) {
                expect(error).toEqual(new Error('Network error'))
            }
        })
    })
})
