/**
 * Utility functions for RSA encryption of passwords using Web Crypto API
 */

/**
 * Custom error class for encryption-related errors
 */
class EncryptionError extends Error {
    constructor(message: string, public originalError?: Error) {
        super(message);
        this.name = 'EncryptionError';
    }
}

/**
 * Validates and sanitizes a PEM-formatted public key
 */
function sanitizePemKey(pemKey: string): string {
    const trimmed = pemKey.trim();
    if (!trimmed.startsWith('-----BEGIN PUBLIC KEY-----') || 
        !trimmed.endsWith('-----END PUBLIC KEY-----')) {
        throw new EncryptionError('Invalid PEM key format');
    }
    return trimmed;
}

/**
 * Converts a PEM-formatted public key to a binary format
 */
function pemToBinary(pemKey: string): Uint8Array {
    try {
        const base64 = pemKey
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replace('-----END PUBLIC KEY-----', '')
            .replace(/[\n\r\s]/g, '');

        // Validate base64 string
        if (!/^[A-Za-z0-9+/=]+$/.test(base64)) {
            throw new EncryptionError('Invalid base64 characters in PEM key');
        }

        const binary = atob(base64);
        // Fixed: Use Array.from instead of spread operator
        return new Uint8Array(Array.from(binary, char => char.charCodeAt(0)));
    } catch (error) {
        if (error instanceof EncryptionError) throw error;
        throw new EncryptionError('Failed to convert PEM to binary', error as Error);
    }
}

/**
 * Imports a public key from PEM format for use with Web Crypto API
 */
export async function importPublicKey(pemKey: string): Promise<CryptoKey> {
    try {
        const sanitizedPem = sanitizePemKey(pemKey);
        const binaryKey = pemToBinary(sanitizedPem);

        return await window.crypto.subtle.importKey(
            'spki',
            binaryKey,
            {
                name: 'RSA-OAEP',
                hash: 'SHA-256',
            },
            true,
            ['encrypt']
        );
    } catch (error) {
        if (error instanceof EncryptionError) throw error;
        throw new EncryptionError('Failed to import public key', error as Error);
    }
}

/**
 * Validates the password input
 */
function validatePassword(password: string): void {
    if (typeof password !== 'string') {
        throw new EncryptionError('Password must be a string');
    }
    if (password.length === 0) {
        throw new EncryptionError('Password cannot be empty');
    }
    // Add additional password validation rules as needed
    const maxPasswordLength = 1024; // Adjust based on your RSA key size
    if (password.length > maxPasswordLength) {
        throw new EncryptionError(`Password length cannot exceed ${maxPasswordLength} characters`);
    }
}

/**
 * Encrypts a password using RSA-OAEP with the provided public key
 */
export async function encryptPassword(password: string): Promise<string> {
    // Your public key - consider moving this to a configuration file
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnb09N9GZxHcQ72oXX4tt
V2dO/91gvU9EVQj0hwmzXWDDeUXFQhKmA63iMc71c93Rp0+u8Yx1UdeqdrI2NZ8g
FAlR7K9Xufz4XPVLwil3+buX7qIVmF+AbOnHWGFBvhPAWhGykGbNgsf0/08uf/ui
887FT6ynHbm4CiixI+EflUnaDHEFW2hvb0ocOnHLhwE0JBSzP3rkaQq3fgKR79rd
whyL1L6PzVsbw7kRtbcKKMp+PUdbp5bRJiJ1CLzyw8HNo8XT+JVOZlmLUmhZcDWT
Y+t2v2Y5kxE4ck1nSniEkWOzeNoz9xlVuLI+KR/xtoMj7yEHGQen1KwWZARu5sB9
pwIDAQAB
-----END PUBLIC KEY-----`;

    try {
        // Validate input
        validatePassword(password);

        // Import the public key
        const publicKey = await importPublicKey(publicKeyPem);

        // Encode the password
        const encoder = new TextEncoder();
        const encodedPassword = encoder.encode(password);

        // Encrypt the password
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            publicKey,
            encodedPassword
        );

        // Convert to Base64
        // Fixed: Use Array.from instead of spread operator
        return btoa(String.fromCharCode.apply(null, 
            Array.from(new Uint8Array(encryptedBuffer))));
    } catch (error) {
        if (error instanceof EncryptionError) throw error;
        throw new EncryptionError('Failed to encrypt password', error as Error);
    }
}

/**
 * Example usage:
 * 
 * try {
 *     const encryptedPassword = await encryptPassword('myPassword123');
 *     console.log('Encrypted password:', encryptedPassword);
 * } catch (error) {
 *     if (error instanceof EncryptionError) {
 *         console.error('Encryption error:', error.message);
 *         if (error.originalError) {
 *             console.error('Original error:', error.originalError);
 *         }
 *     } else {
 *         console.error('Unexpected error:', error);
 *     }
 * }
 */