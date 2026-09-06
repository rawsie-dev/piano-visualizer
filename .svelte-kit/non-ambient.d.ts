
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>
		};
		Pathname(): "/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.svg" | "/icons.svg" | "/piano/A0.mp3" | "/piano/A1.mp3" | "/piano/A2.mp3" | "/piano/A3.mp3" | "/piano/A4.mp3" | "/piano/A5.mp3" | "/piano/A6.mp3" | "/piano/A7.mp3" | "/piano/C1.mp3" | "/piano/C2.mp3" | "/piano/C3.mp3" | "/piano/C4.mp3" | "/piano/C5.mp3" | "/piano/C6.mp3" | "/piano/C7.mp3" | "/piano/C8.mp3" | "/piano/Ds1.mp3" | "/piano/Ds2.mp3" | "/piano/Ds3.mp3" | "/piano/Ds4.mp3" | "/piano/Ds5.mp3" | "/piano/Ds6.mp3" | "/piano/Ds7.mp3" | "/piano/Fs1.mp3" | "/piano/Fs2.mp3" | "/piano/Fs3.mp3" | "/piano/Fs4.mp3" | "/piano/Fs5.mp3" | "/piano/Fs6.mp3" | "/piano/Fs7.mp3" | string & {};
	}
}