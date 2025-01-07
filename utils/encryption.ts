// @ts-ignore
import crypto from 'crypto-browserify';

const publicKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAo/4Al1MNPAWQ3/aRDWsjxuUQlDb/S0ZWhFbCXZsGN3txFFlRhXE9
EdEix+GvDtFHfszJkgZgSGKqjNFQxQnnl76VLObM6MZWWIfdhC5biEM5iXq+4YcK
2SuFsijM7SOnCMdQuepSLqo5L9znDzdVPyBRvy60WLZAK5fMKgglU0IwDShDTqdV
M6s4EnfeOhMRTOdFqwxWOO3N62Yj+CwB2JXJGGn9H4V6iVhJKwpUgYQjLFl9PCwG
KTlfU09kAerWaSmexYcppJ3qBJPwbmR/5aD6minegs9EYhb0cN4zo1lrRZcRmK0Y
7DSrbmKKgPfrS7jK41XHroudr/QHFlOi1QIDAQAB
-----END RSA PUBLIC KEY-----
`;



export const encryptPassword = (password: string): string => {
  try {

    console.log(password);
    
    const buffer = Buffer.from(password, 'utf8');
    
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      buffer
    );

    return encrypted.toString('base64');

  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
};

