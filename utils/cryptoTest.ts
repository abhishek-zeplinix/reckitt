//@ts-ignore
import crypto from 'crypto-browserify';

const publicKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAo/4Al1MNPAWQ3/aRDWsjxuUQlDb/S0ZWhFbCXZsGN3txFFlRhXE9
EdEix+GvDtFHfszJkgZgSGKqjNFQxQnnl76VLObM6MZWWIfdhC5biEM5iXq+4YcK
2SuFsijM7SOnCMdQuepSLqo5L9znDzdVPyBRvy60WLZAK5fMKgglU0IwDShDTqdV
M6s4EnfeOhMRTOdFqwxWOO3N62Yj+CwB2JXJGGn9H4V6iVhJKwpUgYQjLFl9PCwG
KTlfU09kAerWaSmexYcppJ3qBJPwbmR/5aD6minegs9EYhb0cN4zo1lrRZcRmK0Y
7DSrbmKKgPfrS7jK41XHroudr/QHFlOi1QIDAQAB
-----END RSA PUBLIC KEY-----`;

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-256-CBC,EFDC1F6CEA9989EF23C43D3F11FCCECB

HbwimaS7/vsnec27EaBmJaN7ksVEoVuvKV6q8/MU6Y81PwLqUj0pa04QiWTFOuBJ
Bb5buuMqWqCkR/ufKjfxWkiFK9mUyc4b90kbSxAyaHI7ToVcLSpfJi+YX88KRu6E
wU/lJ6tK4SaEtHTFrg2oxxr3pZXnkRPdEPz+7Ui2I6VVZ7LTkA31AHPrXOS2PjRD
vqbmiohmaHEcGOFpZCo2RCA0K25OVSE8CJXmk7vTUH9F4fapWy+eCZUBA0Lad4v7
MS7cp/TO9I6YgDT8Er9hUo1AcXje5K3aDUureWWIEmOQdvFx75UzTP428zg0pLKd
35N+sr5BVfsz7rihC/IKh+QN7UiH6/3noMZKB0z9zVwl87uaSfr3Dzh2QAxifxks
1DM3nHCQuVNQjS5gPgRTZhUPC7JEPTfOu4QPsc89FmV/XIbykvXZIkOVx7mAf8L2
qZ66jlouckKqN/NDWJPNDJPBmc5nmjqcBq4X2sdyOC1PVrNJGjZ4d9hXTgIHUEZs
15mGWTN7Z9fPeliVG6hSb9mQp5Qsh1nLMJ8o4NTmvMsilBsiAJLzpkSaRppCLlbk
lYcpG1OfhvzHKuF4BA/5slqDDqq3CHkTJ0aobb7o+tx7ojALK8W0TxV1mhU71jgO
oPwmhL3NiQrcy81IVIsnRSaoSUB9pVrzgxedDuH8i/g6Bt9YEoK7CYGVwbC/7sVt
de6dY81UuJgbdnzd/rIsMXPtztX7XQYJ4ySZYTcB9kalPX25cT8aDe8OlZl2WrfK
boWIoIi0BeUrchJU+pScS0PrmCThxgY7d2vGBZ2+Q7uAzkcWW5EzwHAUt0hD5Gvq
cMugslnjK83muRjTzOlOdk80XIlEcAQM59t6t+OkLOPXK9fUA10YcIvuuB3MJmxY
6bsl0JD6YZFQIeQ+L/+jlcJoKb0AgD9NVy/lHYmzXWSG1/hmFoNKagOdDKFAsO33
29qrSVktYUaBQRJq6feP7yv/A6JFElRiH8MF46OrMegea3qx7thpd+LfhmwbWyta
EekenCh1Ey5IWmkinrUTbtpXwck9bxf6lBDBNYaP+80BK174dWZx52yf9ggQm0OH
6WMakXDuGT/XbPk4pXWlF19v1j8bFiSOme0byBHFRI7emHrEHC4gXzjEQUqr+zi0
jRR6OY6mB7tBEfxppxTWht+w4eFJ1Z/9KRBLLcnZUQyPAAA6vw4mys5S3GfJ/JUa
ipbXxd0FDN/VkU3kkwttRTproGZorV0K2fMdqY46N8bJQ79Soza764aeFKTBBDQu
tCLUyTXKnFmD8dEXyf+rmFzKP4tuNCYHrYMBIiuITw9jjNyUjTY2hjqwGlhQSjqm
I+5+Y8d+6njhb1LjM9RI0cecHmnVLQ7QFgalgcHCfTJK+QndGKhGBFDqxm0Sps+o
KBkuITu3jslfUyWv1GY8DPBBwrml+whH/G4UyrRML/I3PcmB23dViBiXSjqQLFx5
MhpKmihNRrG4MeD9c+PLs06WDvoDukCpLfqdYrj3IpzaqY2DF2I7OqoHid6tIU4z
trPdaKNkPbbtzp5yO4Ft4WM3LFdDZ4al0EsE/sr0P+0ALvgjRPhbLckJrfUQLkob
-----END RSA PRIVATE KEY-----`;

const mypass = 'mypass';

export const encryptPassword = (password: string): string => {
  try {
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



export const decryptPassword = (encryptedPassword: string): string => {

    
  try {
    const buffer = Buffer.from(encryptedPassword, 'base64');
    
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase: mypass,  
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      buffer
    );

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt password');
  }
};

// Test function
export const testEncryptionDecryption = (password: string) => {
  try {
    console.log('Original password:', password);
    
    const encrypted = encryptPassword(password);
    console.log('Encrypted password:', encrypted);
    
    const decrypted = decryptPassword(encrypted);
    console.log('Decrypted password:', decrypted);
    
    console.log('Test successful:', password === decrypted);
    
    return {
      success: true,
      original: password,
      encrypted,
      decrypted,
      matches: password === decrypted
    };
  } catch (error: any) {    
    console.error('Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
