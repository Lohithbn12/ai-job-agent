const { collectFounditJobs } = require('./src/scrapers/foundit.scraper');

(async () => {
  try {
    const jobs = await collectFounditJobs(['Data Analyst'], '0-1', 'Bangalore');
    console.log('Jobs found:', jobs.length);
    if (jobs.length > 0) {
      console.log('Sample job:', JSON.stringify(jobs[0], null, 2));
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
})();