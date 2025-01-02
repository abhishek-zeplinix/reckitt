// @ts-ignore
import crypto from 'crypto-browserify';

const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtMfyJFrSKukTDuRdMDIL
q8+IFC1GD6y3kORPurUL2YNu+FdiqAIQTix+XOfMhFYG2xJwCVSyuHvo+LZYAJrM
240c9IRd85M+PWtPqGnZS7jgsoHbDyfKxhmZ7+d8IWo/f98xbkD7RbXmsPmHCdEv
dHNMWaZgNaOUxQughJuNjgQv9yd7q9msOQAwV6ikituBKEcqVJQnJP+F/9nhwEf/
Mm/WusuNzhBCkpgVYnUeE0WYoxbDi0YT3JwLu4QwmUrDJ7qxcfRA5g5bK/qEQiR4
hGWIj8NtGXMLszFbFm2D3D5rqVaSNM0KRA71gpe0FHVp1I7a/hFOkbjo4iuIE2yw
VwIDAQAB
-----END PUBLIC KEY-----`;

  
export const encryptPassword = (password: any) => {

    const buffer = Buffer.from(password, 'utf8');

    // Encrypt the data with the public key using RSA
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // Use OAEP padding for security
      },
      buffer
    );

    return encrypted.toString('base64'); // Return as base64 string

  };
  


  //for backend decryption 

   
// const decryptPassword = (encryptedData) => {  
//   const buffer = Buffer.from(encryptedData, 'base64'); // Decode base64 to bufferconst
//    decrypted = crypto.privateDecrypt( 
//       {      key: privateKey,
//             padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,  
//       },    buffer  ); 
//     return decrypted.toString('utf8'); 
//    };