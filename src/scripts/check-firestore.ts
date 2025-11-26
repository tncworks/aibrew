import { Firestore } from '@google-cloud/firestore';
import { loadConfig } from '../services/config/index.js';

async function main() {
    try {
        console.log('Loading config...');
        const config = loadConfig();
        console.log(`Config loaded for env: ${config.name}`);
        console.log(`Firestore Project ID: ${config.firestore.projectId}`);

        const firestore = new Firestore({
            projectId: config.firestore.projectId,
        });

        console.log('Attempting to list collections...');
        const collections = await firestore.listCollections();
        console.log('Collections found:');
        if (collections.length === 0) {
            console.log('No collections found (but connection successful).');
        } else {
            collections.forEach(col => console.log(` - ${col.id}`));
        }

        console.log('Attempting to write a test document...');
        const testDocRef = firestore.collection('test_connectivity').doc('ping');
        await testDocRef.set({
            timestamp: new Date(),
            message: 'Hello from check-firestore.ts'
        });
        console.log('Write successful.');

        console.log('Attempting to read the test document...');
        const doc = await testDocRef.get();
        if (doc.exists) {
            console.log('Read successful:', doc.data());
        } else {
            console.error('Read failed: Document not found.');
        }

        console.log('Attempting to delete the test document...');
        await testDocRef.delete();
        console.log('Delete successful.');

        console.log('Firestore connection and R/W test successful.');
    } catch (error) {
        console.error('Error connecting to Firestore:', error);
        console.error(JSON.stringify(error, null, 2));
        process.exit(1);
    }
}

main();
