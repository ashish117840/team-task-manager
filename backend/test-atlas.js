const dns = require('dns').promises;
const net = require('net');

(async () => {
  try {
    const srvs = await dns.resolveSrv('taskdb.bjf6oln.mongodb.net');
    console.log('SRV records:', JSON.stringify(srvs, null, 2));
    for (const r of srvs) {
      const host = r.name;
      const port = r.port || 27017;
      console.log(`Testing TCP ${host}:${port}`);
      await new Promise((resolve) => {
        const s = net.connect(port, host, () => {
          console.log(`TCP OK ${host}:${port}`);
          s.destroy();
          resolve();
        });
        s.on('error', (err) => {
          console.error(`TCP ERR ${host}:${port}`, err.code || err.message);
          resolve();
        });
        s.setTimeout(5000, () => {
          console.error(`TCP TIMEOUT ${host}:${port}`);
          s.destroy();
          resolve();
        });
      });
    }
  } catch (err) {
    console.error('SRV RESOLVE ERR', err.code || err.message);
    process.exit(1);
  }
})();
