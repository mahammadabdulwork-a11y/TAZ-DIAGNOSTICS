import mysql from "mysql2/promise";

async function probeWithPassword() {
  const hosts = ["127.0.0.1", "localhost"];
  const ports = [3306, 3307, 3308, 33060];
  const password = "Bhavan@07";

  console.log("Probing MySQL with password 'Bhavan@07' across hosts and ports...");

  for (const host of hosts) {
    for (const port of ports) {
      try {
        const conn = await mysql.createConnection({
          host,
          port,
          user: "root",
          password,
          connectTimeout: 2000
        });

        console.log(`\n=================================================`);
        console.log(` SUCCESS! Connected to MySQL at ${host}:${port}!`);
        console.log(`=================================================\n`);

        await conn.query("CREATE DATABASE IF NOT EXISTS `taz_company`;");
        console.log("Database 'taz_company' created/verified successfully.");
        await conn.end();
        return { success: true, host, port };
      } catch (err) {
        console.log(` Host: ${host}:${port} -> ${err.message}`);
      }
    }
  }
}

probeWithPassword();
