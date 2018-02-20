
export function canSpeack(): boolean {
    if ('speechSynthesis' in window) {
        return true
    } else {
        return false
    }
}

export interface VoiceParams {
    /** 0 to 1 */
    volume?: number
    /** 0.1 to 10 */
    rate?: number
    /** 0 to 2 */
    pitch?: number
}

export function speak(msg: string, params?: VoiceParams): void {
    if (canSpeack()) {
        const voice = new SpeechSynthesisUtterance(msg)
        if (params) {
            if (params.volume && params.volume >= 0 && params.volume <= 1) {
                voice.volume = params.volume
            }
            if (params.rate && params.rate >= 0.1 && params.rate <= 10) {
                voice.rate = params.rate
            }
            if (params.pitch && params.pitch >= 0 && params.pitch <= 2) {
                voice.pitch = params.pitch
            }
        }
        window.speechSynthesis.speak(voice)
    }
}

export function stopSpeak() {
    if (canSpeack()) {
        window.speechSynthesis.cancel()
    }
}

export function canListen(): boolean {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        return true
    } else {
        return false
    }
}

export interface ListenEvent {
    onStart?: () => void
    onSpeechEnd?: () => void
    onError?: (event: any) => void
    onResult?: (text: string) => void
}

export function listen(event?: ListenEvent) {
    if (canListen) {
        try {
            const SpeechRecognition = window['SpeechRecognition'] || window['webkitSpeechRecognition']
            const recognition = new SpeechRecognition()
            if (event) {
                if (event.onStart) {
                    recognition['onstart'] = event.onStart
                }
                if (event.onSpeechEnd) {
                    recognition['onspeechend'] = event.onSpeechEnd
                }
                if (event.onError) {
                    recognition['onerror'] = event.onError
                }
                if (event.onResult) {
                    recognition['onresult'] = (resEvent: any) => {
                        const current = resEvent.resultIndex
                        const transcript = resEvent.results[current][0].transcript
                        const mobileRepeatBug = (current === 1 && transcript === resEvent.results[0][0].transcript)
                        if (!mobileRepeatBug) {
                            event.onResult(transcript)
                        }
                    }
                }
            }
            return recognition
        } catch (error) {
            console.error(error)
            return null
        }
    } else {
        return null
    }
}
