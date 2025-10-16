const sgMail = require('@sendgrid/mail')
const crypto = require('crypto')
const bip39 = require('bip39')
require('dotenv').config()
const fs = require('fs')
const CryptoJS = require("crypto-js");
const SENDGRID_VALID_EMAIL = process.env.SENDGRID_VALID_EMAIL
const SENDGRID_APIKEY = process.env.SENDGRID_APIKEY

sgMail.setApiKey(SENDGRID_APIKEY)

const data = {
  email: 'photogerman@gmail.com',
  name: 'Abraxas',
  sender_ebook: 'Pepito'
}

async function sendEmail(data) {

  const book = fs.readFileSync('Jung, Carl Gustav - Sincronicidad.epub')
  const base64String = new Buffer.from(book).toString('base64')
  const msg = {
    personalizations: [
      {
        to: [
          {
            email: data.email,
            name: 'Germán Lugo' 
          }
        ]
      }
    ],
    from: {
      email: 'german.lugo@chocosfera.com',
      name: 'Fractalbook services'
    },
    replyTo: {
      email: 'no_reply@chocosfera.com',
      name: 'No Reply Team'
    },
    templateId: "d-e32810fe03784e9c900debca2148537b",
    dynamic_template_data: {
      name: data.name,
      sender_ebook: data.username
    },
    mailSettings: {
      sandboxMode: {
        enable: false
      }
    },
    attachments: [
      {
        content: base64String,
        filename: 'sincronicidad.epub',
        type: 'application/epub+zip',
        disposition: 'attachment'
      }
    ],

  }
  try {
    await sgMail.send(msg)
    console.log("Email sent")
  } catch ( error ) {
    console.log(error.response.body)
  }
}

// sendEmail(data)

const createEncryptedPassPhrase = () => {
  const passphrase = bip39.generateMnemonic()
  const encryptionKey = crypto.randomBytes(32) // To .env
  const iv = crypto.randomBytes(16) // To .env
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv)
  let encrypted = cipher.update(passphrase, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  console.log(`Passphrase: ${passphrase}`)
  console.log(`Encrypted passphrase: ${encrypted}`)
  console.log(`Encryption key: ${ encryptionKey }`)
  console.log(`IV: ${ iv }`)

  // const encrypted = '...'; // Replace with your actual encrypted passphrase
  const encryptionKeyBuff = Buffer.from( encryptionKey, 'hex' ); // Replace with your actual encryption key
  // const iv2 = Buffer.from( iv, 'hex' ); // Replace with your actual IV

  // Create a decipher using AES-256-CBC algorithm
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8')

  console.log(`Decrypted passphrase: ${decrypted}`)
}



// sendEmail(data)

// createEncryptedPassPhrase()

const passphrase = bip39.generateMnemonic(); // La passphrase que se va a encriptar
console.log(passphrase)
const encryptionKey = process.env.ENTROPY; // La clave de encriptación que se usará para encriptar y descifrar la passphrase
const encryptedPassphrase = encrypt(passphrase, encryptionKey); // Encripta la passphrase usando la clave de encriptación

// Función para encriptar una cadena de texto usando AES-256
function encrypt(text, key) {
  const encrypted = CryptoJS.AES.encrypt(text, key);
  return encrypted.toString();
}

// Función para descifrar una cadena de texto usando AES-256
function decrypt(text, key) {
  const decrypted = CryptoJS.AES.decrypt(text, key);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Función para almacenar la passphrase en la base de datos
function storePassphrase(encryptedPassphrase) {
  // Código para almacenar la passphrase en la base de datos
}

// Función para recuperar la passphrase de la base de datos y descifrarla
function retrievePassphrase(encryptionKey) {
  // const encryptedPassphrase = // Código para recuperar la passphrase encriptada de la base de datos
  const decryptedPassphrase = decrypt(encryptedPassphrase, encryptionKey);
  return decryptedPassphrase;
}

// Ejemplo de uso
storePassphrase(encryptedPassphrase); // Almacena la passphrase encriptada en la base de datos
const retrievedPassphrase = retrievePassphrase(encryptionKey); // Recupera la passphrase de la base de datos y la descifra usando la clave de encriptación
console.log(retrievedPassphrase); // Muestra la passphrase descifrada en la consola
