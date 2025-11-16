import crypto from 'crypto';

export function verifyNonce(nonce: string) {
	if (!nonce) return false;

	const [payload, signature] = nonce.split('.');
	if (!payload || !signature) return false;

	const expectedSig = crypto
		.createHmac('sha256', process.env.NONCE_SECRET!)
		.update(payload)
		.digest('hex');
    
	// using timingSafeEqual to avoid timing attacks
	const valid =
		signature.length === expectedSig.length &&
		crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'));

	return valid;
}
