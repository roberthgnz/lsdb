import { setupDb } from './db.js';
import { log } from './utils.js';

window.db = setupDb();

// Expose functions to window for button clicks
window.createCollections = () => {
    db.collection(['categories', 'articles']);
    log('Collections created: categories, articles');
};

window.insertData = () => {
    db.insert('categories', { title: 'Drinks' });
    db.insert('categories', { title: 'Dinner' });
    db.insert('articles', { title: 'Coffee Guide', category: 'Drinks' });

    log('Sample data inserted');
    log('Current data:', db.all());
};

window.queryData = () => {
    const drinks = db.find('articles', {
        where: {
            category: { $eq: 'Drinks' }
        }
    });

    log('Articles in Drinks category:', drinks);
};

window.clearData = () => {
    localStorage.clear();
    log('Database cleared');
};