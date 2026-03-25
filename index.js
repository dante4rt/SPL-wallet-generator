const bip39 = require('bip39');
const bs58 = require('bs58');
const { Keypair } = require("@solana/web3.js");
const crypto = require('crypto');
const fs = require('fs');
const readlineSync = require('readline-sync');
const colors = require('colors');

// Function to generate wallets
const generateWallets = async (numWallets) => {
    if (isNaN(numWallets) || numWallets <= 0) {
        console.log('Please enter a valid positive number.'.red); // Red color for error message
        process.exit(1);
    }

    const wallets = [];
    const loadingAnimation = ['|', '/', '-', '\\'];
    let animationIndex = 0;

    // Display loading animation while generating wallets
    const loadingInterval = setInterval(() => {
        process.stdout.write(`\rPlease wait... ${loadingAnimation[animationIndex]}`);
        animationIndex = (animationIndex + 1) % loadingAnimation.length;
    }, 100);

    try {
        for (let i = 0; i < numWallets; i++) {
            // Generate a random mnemonic
            const mnemonic = bip39.generateMnemonic();

            // Convert mnemonic to entropy and derive a seed
            const entropy = bip39.mnemonicToEntropy(mnemonic);
            const seed = crypto.createHash('sha256').update(entropy).digest();

            // Derive a key pair from the seed
            const derivedKeyPair = Keypair.fromSeed(seed);

            // Encode private and public keys as strings
            const derivedStringPrivKey = bs58.encode(derivedKeyPair.secretKey);
            const derivedStringPubKey = derivedKeyPair.publicKey.toBase58();

            // Store wallet information
            const walletInfo = {
                mnemonic,
                privateKey: derivedStringPrivKey,
                publicKey: derivedStringPubKey,
            };

            wallets.push(walletInfo);

            // Introduce a delay between iterations to simulate the loading animation
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    } catch (error) {
        console.error('\nAn error occurred during wallet generation:'.red); // Red color for error message
        console.error(error.message);
        process.exit(1);
    } finally {
        // Stop the loading animation
        clearInterval(loadingInterval);
        process.stdout.write('\rDone!                    \n'.green); // Green color for success message
    }

    // Append wallet information to the "results.txt" file
    wallets.forEach(wallet => {
        const resultString = `Address: ${wallet.publicKey} | Mnemonic: ${wallet.mnemonic} | Private Key: ${wallet.privateKey}\n`;
        fs.appendFileSync('results.txt', resultString);
    });

    return wallets;
};

// Get the number of wallets to generate from user input
const numWallets = readlineSync.questionInt('Enter the number of wallets to generate: ');

// Inform the user that wallets are being generated
console.log(`Generating ${numWallets} wallets...`);

// Generate wallets and display the results
(async () => {
    const generatedWallets = await generateWallets(numWallets);

    console.log(`${numWallets} wallets generated and appended to results.txt:`.cyan); // Cyan color for info message
    console.log(generatedWallets);

    if (numWallets > 3) {
        console.log(`Check 'results.txt' for the full list of generated wallets.`.cyan);
    }
})();
