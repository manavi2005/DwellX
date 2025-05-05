import path from 'path';
import dotenv from 'dotenv';

// __dirname points to server/ at runtime
dotenv.config({ path: path.join(__dirname, '.env') });
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mysql from 'mysql2';
import authRoutes, { requireAuth } from './auth.routes';
import router from './auth.routes';
import preferenceRoutes from './preferences';
import housingRoutes from './housing_routes';
import favoritesRoutes from './favorites_routes';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);

app.use(cookieParser());
app.use(express.json());

const db = mysql.createConnection({
  host: '34.30.114.65',
  user: 'root',
  password: 'instance-1',
  database: 'dwellx'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to DB:', err);
  } else {
    console.log('Connected to MySQL on GCP');
  }
});

app.use('/api/auth', authRoutes);  
router.get('/register', (_req, res) => {
  res.send('Please register via POST /api/auth/register');
});
app.get(
  '/api/ping',
  requireAuth,
  (req: Request, res: Response) => {
    // requireAuth has attached req.user.uid
    res.json({ ok: true, uid: req.user!.uid });
  }
);

app.get('/api/test-db', (req: Request, res: Response) => {
  db.query('SELECT * FROM hospitals', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database query failed' });
    res.json(results);
  });
});



//preferences
app.use('/api/preferences', preferenceRoutes); 
//housing
app.use('/api', housingRoutes);
//favs
app.use('/api', favoritesRoutes);


//fetchHousingHospitalParkData
app.get('/api/query1', (req, res) => {
    const query = `
    SELECT 
        h.\`index\`,
        h.\`Community Area Number\`,
        h.\`Property Type\`,
        h.\`Address\` AS housing_address,
        h.\`Zip Code\`,
        h.\`Units\`,
        hosp.\`BLDGID\`,
        hosp.\`FACILITY\` AS hospital_name,
        hosp.\`ADDRESS\` AS hospital_address,
        hosp.\`ZIP\` AS hospital_zip,
        MIN(ph.\`distance\`) AS min_distance,
        GROUP_CONCAT(DISTINCT p.park ORDER BY ph.\`distance\` ASC SEPARATOR ', ') AS park_names
    FROM housing h
    JOIN parks_houses ph ON h.\`index\` = ph.\`housing_id\`
    JOIN parks p ON p.\`OBJECTID_1\` = ph.\`park_id\`
    JOIN hospitals hosp ON h.\`Zip Code\` = hosp.\`ZIP\`
    WHERE ph.\`distance\` <= 5
    GROUP BY 
        h.\`index\`,
        h.\`Community Area Number\`,
        h.\`Property Type\`,
        h.\`Address\`,
        h.\`Zip Code\`,
        h.\`Units\`,
        hosp.\`BLDGID\`,
        hosp.\`FACILITY\`,
        hosp.\`ADDRESS\`,
        hosp.\`ZIP\`
    LIMIT 15;
  `; 
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query: ' + err.stack);
        res.status(500).send(`Query 1 failed: ${err.message}`);

        return;
      }
      res.json(results);
    });
  });

// query2 - crime analysis around housing
app.get('/api/query2', (req, res) => {
    const query = `
      SELECT 
          h.\`index\`,
          h.\`Address\`,
          h.\`Zip Code\`,
          h.\`Property Type\`,
          COUNT(c.\`index\`) AS total_crimes,
          ROUND(COUNT(c.\`index\`) / 24.0, 2) AS avg_crimes_per_month
      FROM 
          housing h
      JOIN 
          crime_housing ch ON h.\`index\` = ch.\`housing_id\`
      JOIN 
          crime c ON ch.\`case_number\` = c.\`index\`
      WHERE 
          (6371 * ACOS(
              COS(RADIANS(c.\`LATITUDE\`)) * COS(RADIANS(h.\`Latitude\`)) *
              COS(RADIANS(h.\`Longitude\`) - RADIANS(c.\`LONGITUDE\`)) +
              SIN(RADIANS(c.\`LATITUDE\`)) * SIN(RADIANS(h.\`Latitude\`))
          )) <= 1.609
          AND (
              c.\`iucr\` LIKE '0%' OR 
              c.\`iucr\` LIKE '%ASSAULT%' OR 
              c.\`iucr\` LIKE '%BATTERY%' OR 
              c.\`iucr\` LIKE '%HOMICIDE%' OR 
              c.\`iucr\` LIKE '%ROBBERY%' OR 
              c.\`iucr\` LIKE '%WEAPON%'
          )
      GROUP BY 
          h.\`index\`, h.\`Address\`, h.\`Zip Code\`, h.\`Property Type\`
      HAVING 
          COUNT(c.\`index\`) > 3
      ORDER BY 
          total_crimes DESC
      LIMIT 15;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query2: ' + err.stack);
        res.status(500).send('Error fetching crime-housing data');
        return;
      }
      res.json(results);
    });
  });
  
// query3 - top scoring school communities
app.get('/api/query3', (req, res) => {

    const query = `
      WITH RatedSchools AS (
        SELECT 
          s.school_id,
          sd.housing_id,
          h.\`Community Area Name\` AS community_name,
          h.\`Zip Code\` AS zip_code,
          sd.distance,
  
          CASE 
            WHEN s.culture_climate_rating = 'WELL ORGANIZED' THEN 3
            WHEN s.culture_climate_rating = 'ORGANIZED' THEN 2
            ELSE 1
          END AS climate_score,
  
          CASE 
            WHEN s.student_attainment_rating = 'NO DATA AVAILABLE' THEN 1
            ELSE 0
          END AS attainment_flag,
  
          CASE 
            WHEN s.student_growth_rating = 'NO DATA AVAILABLE' THEN 1
            ELSE 0
          END AS growth_flag
  
        FROM schools s
        JOIN school_district sd ON s.school_id = sd.school_id
        JOIN housing h ON sd.housing_id = h.\`index\`  
      ),
  
      ScoredCommunities AS (
        SELECT 
          community_name, 
          zip_code,
          AVG(distance) AS avg_distance,
          COUNT(DISTINCT school_id) AS school_count,
          (SUM(climate_score) * 2 + SUM(attainment_flag + growth_flag)) AS total_score
  
        FROM RatedSchools
        GROUP BY community_name, zip_code
      )
  
      SELECT sc.*
      FROM ScoredCommunities sc
      JOIN (
          SELECT zip_code, MAX(total_score) AS max_score
          FROM ScoredCommunities
          GROUP BY zip_code
      ) max_scores
      ON sc.zip_code = max_scores.zip_code AND sc.total_score = max_scores.max_score
      ORDER BY total_score DESC, avg_distance ASC
      LIMIT 15;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query3: ' + err.stack);
        res.status(500).send('Error fetching top scoring school communities');
        return;
      }
      res.json(results);
    });
  });
// query4 - housing ranked by school rating, crime count, and nearby hospitals
app.get('/api/query4', (req, res) => {

    const query = `
      SELECT 
          h.\`index\`,
          h.\`Property Name\`,
          h.address,
          h.\`Zip Code\`,
  
          (
              SELECT AVG(
                  CASE 
                      WHEN s.culture_climate_rating = 'WELL ORGANIZED' THEN 5
                      WHEN s.culture_climate_rating = 'ORGANIZED' THEN 4
                      WHEN s.culture_climate_rating = 'NOT YET ORGANIZED' THEN 2
                      WHEN s.culture_climate_rating = 'NOT ENOUGH DATA' THEN 1
                      ELSE 0
                  END
              )
              FROM schools s
              JOIN school_district sd ON s.school_id = sd.school_id
              WHERE sd.housing_id = h.\`index\`
          ) AS avg_school_rating,
  
          (
              SELECT COUNT(*)
              FROM crime_housing ch
              WHERE ch.housing_id = h.\`index\`
          ) AS nearby_crime_count,
  
          (
              SELECT COUNT(*)
              FROM hospitals hosp
              WHERE hosp.zip = h.\`Zip Code\`
          ) AS nearby_hospital_count
  
      FROM housing h
  
      WHERE (
          SELECT COUNT(*) 
          FROM hospitals hosp
          WHERE hosp.zip = h.\`Zip Code\`
      ) > 0
  
      HAVING 
          nearby_crime_count <= 1500
          AND avg_school_rating >= 2
  
      ORDER BY 
          avg_school_rating DESC, 
          nearby_crime_count ASC, 
          nearby_hospital_count DESC
  
      LIMIT 15;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query4: ' + err.stack);
        res.status(500).send('Error fetching housing with school/crime/hospital analysis');
        return;
      }
      res.json(results);
    });
  });
    
// query5 - zip codes with most amenities (parks, schools, hospitals)
app.get('/api/query5', (req, res) => {

    const query = `
      SELECT
          h.\`Zip Code\`,
          SUM(ph.num_parks) AS num_parks,
          SUM(sd.num_schools) AS num_schools,
          SUM(hosp.num_hospitals) AS num_hospitals,
          SUM(ph.num_parks) + SUM(sd.num_schools) + SUM(hosp.num_hospitals) AS total_count
      FROM housing h
      LEFT JOIN (
          SELECT housing_id, COUNT(DISTINCT park_id) AS num_parks
          FROM parks_houses
          WHERE distance <= 8
          GROUP BY housing_id
      ) ph ON h.\`index\` = ph.housing_id
      LEFT JOIN (
          SELECT housing_id, COUNT(DISTINCT school_id) AS num_schools
          FROM school_district
          WHERE distance <= 5
          GROUP BY housing_id
      ) sd ON h.\`index\` = sd.housing_id
      LEFT JOIN (
          SELECT ZIP, COUNT(DISTINCT BLDGID) AS num_hospitals
          FROM hospitals
          GROUP BY ZIP
      ) hosp ON h.\`Zip Code\` = hosp.ZIP
      GROUP BY h.\`Zip Code\`
      ORDER BY total_count DESC
      LIMIT 15;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query5: ' + err.stack);
        res.status(500).send('Error fetching zip code amenity rankings');
        return;
      }
      res.json(results);
    });
  });
  app.get('/api/houses/:zip', (req, res) => {
    const zip = parseInt(req.params.zip, 10);
    if (isNaN(zip)) {
      res.status(400).json({ error: 'Invalid ZIP code' });
      return;
    }
  
    const sql = `
      SELECT
        h.\`index\`               AS housing_id,
        h.\`Property Name\`       AS property_name,
        h.address                 AS address,
        h.\`Zip Code\`            AS zip_code,
        h.units                   AS units
      FROM housing h
      WHERE h.\`Zip Code\` = ?
    `;
  
    db.query(sql, [zip], (err, results) => {
      if (err) {
        console.error('Error querying housing by ZIP:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      res.json(results);
    });
  });
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
export { requireAuth };