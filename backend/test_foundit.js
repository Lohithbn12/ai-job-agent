const axios = require('axios');

(async () => {
  try {
    const response = await axios.post('http://localhost:8000/search-jobs/', {
      keywords: ['Data Analyst'],
      experience_level: '0-1',
      location: 'Bangalore',
      sources: ['foundit']
    });
    console.log('Response status:', response.status);
    console.log('Response data keys:', Object.keys(response.data));
    console.log('Jobs found:', response.data.jobs ? response.data.jobs.length : 'no jobs key');
    if (response.data.jobs && response.data.jobs.length > 0) {
      console.log('Sample job:', JSON.stringify(response.data.jobs[0], null, 2));
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
})();