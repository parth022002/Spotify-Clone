declare module 'use-sound' {
    interface PlayOptions {
        id?: string;
        playbackRate?: number;
        volume?: number;
        interrupt?: boolean;
        onend?: () => void;
        onload?: () => void;
        onplayerror?: () => void;
        onplay?: () => void;
        onpause?: () => void;
        onstop?: () => void;
        format?: string[];
    }

    interface PlayFunction {
        (options?: PlayOptions): void;
    }

    interface ReturnedValue {
        play: PlayFunction;
        pause: () => void;
        stop: () => void;
        sound: any; // You can replace 'any' with a more specific type if needed
    }

    function useSound(src: string, options?: PlayOptions): [PlayFunction, ReturnedValue];

    export default useSound;
}
