/**
 * crypto-js 模块类型声明
 */

declare module 'crypto-js/hmac-sha256' {
	import CryptoJS from 'crypto-js/core';
	function hmacSHA256(message: string, key: string | CryptoJS.lib.WordArray): CryptoJS.lib.WordArray;
	export default hmacSHA256;
}

declare module 'crypto-js/sha256' {
	import CryptoJS from 'crypto-js/core';
	function SHA256(message: string | CryptoJS.lib.WordArray): CryptoJS.lib.WordArray;
	export default SHA256;
}

declare module 'crypto-js/core' {
	namespace CryptoJS {
		namespace lib {
			interface WordArray {
				words: number[];
				sigBytes: number;
				toString(encoder?: Encoder): string;
				concat(wordArray: WordArray): WordArray;
				clamp(): void;
				clone(): WordArray;
			}

			interface WordArrayStatic {
				create(words?: number[], sigBytes?: number): WordArray;
				random(nBytes: number): WordArray;
			}

			interface Encoder {
				stringify(wordArray: WordArray): string;
				parse(str: string): WordArray;
			}
		}

		const lib: {
			WordArray: lib.WordArrayStatic;
		};

		namespace enc {
			const Hex: lib.Encoder;
			const Latin1: lib.Encoder;
			const Utf8: lib.Encoder;
			const Base64: lib.Encoder;
		}
	}

	export default CryptoJS;
}

