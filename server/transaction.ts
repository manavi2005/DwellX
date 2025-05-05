import pool from './db';

// Interfaces
interface PreferenceAverages {
  avg_school: number;
  avg_safety_level: number;
  avg_recreation_proximity: number;
  avg_hospital_proximity: number;
}

interface HousingResult {
  housing_id: number;
  property_name: string;
  address: string;
  zip_code: string;
  avg_school_rating: number;
  nearby_crime_count: number;
  nearby_hospital_count: number;
}

export async function fetchRecommendedHousing() {
  const connection = await pool.getConnection();

  try {
    await connection.query('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await connection.beginTransaction();

    const [preferenceRows] = await connection.query(`
      SELECT 
        AVG(school) AS avg_school,
        AVG(safety_level) AS avg_safety_level,
        AVG(recreation_proximity) AS avg_recreation_proximity,
        AVG(hospital_proximity) AS avg_hospital_proximity
      FROM preferences;
    `);

    const preferences = (preferenceRows as PreferenceAverages[])[0];
    const avgMinSchoolRating = preferences.avg_school;
    const avgMaxCrimeRating = preferences.avg_safety_level;
    const avgMaxRecreationDistanceKm = preferences.avg_recreation_proximity;
    const avgMaxHospitalDistanceKm = preferences.avg_hospital_proximity;

    const [housingResultsRaw] = await connection.query(
      `
      WITH HousingSchoolStats AS (
          SELECT
              h.\`index\` AS housing_id,
              h.\`Property Name\` AS property_name,
              h.address,
              h.\`Zip Code\` AS zip_code,
              AVG(
                CASE s.culture_climate_rating
                  WHEN 'WELL ORGANIZED' THEN 5
                  WHEN 'ORGANIZED' THEN 4
                  WHEN 'NOT YET ORGANIZED' THEN 2
                  WHEN 'NOT ENOUGH DATA' THEN 1
                  ELSE 0
                END
              ) AS avg_school_rating
          FROM housing h
          LEFT JOIN school_district sd ON h.\`index\` = sd.housing_id
          LEFT JOIN schools s ON sd.School_ID = s.school_id
          GROUP BY h.\`index\`
      ),
      CrimeStats AS (
          SELECT
              housing_id,
              COUNT(*) AS nearby_crime_count
          FROM crime_housing
          GROUP BY housing_id
      ),
      HospitalStats AS (
          SELECT
              zip AS zip_code,
              COUNT(*) AS nearby_hospital_count
          FROM hospitals
          GROUP BY zip
      )
      SELECT 
          hs.housing_id,
          hs.property_name,
          hs.address,
          hs.zip_code,
          hs.avg_school_rating,
          COALESCE(c.nearby_crime_count, 0) AS nearby_crime_count,
          COALESCE(h.nearby_hospital_count, 0) AS nearby_hospital_count
      FROM HousingSchoolStats hs
      LEFT JOIN CrimeStats c ON hs.housing_id = c.housing_id
      LEFT JOIN HospitalStats h ON hs.zip_code = h.zip_code
      HAVING hs.avg_school_rating >= ?
         AND nearby_crime_count <= ?
      ORDER BY avg_school_rating DESC,
               nearby_crime_count ASC,
               nearby_hospital_count DESC
      LIMIT 15;
    `,
      [avgMinSchoolRating, avgMaxCrimeRating] 
    );

    const housingResults = housingResultsRaw as HousingResult[];

    await connection.commit();
    return housingResults;

  } catch (error) {
    await connection.rollback();
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}