import db from './db';

export async function getHousesByPreferences(preferences: any) {
    const { recreation_proximity, hospital_proximity, safety_level, zipcode } = preferences;

    const zip = zipcode ? zipcode : null;
  
    const [rawResult]: any = await db.query(
      `CALL get_houses_by_preferences(?, ?, ?, ?)`,
      [
        recreation_proximity || 5,
        hospital_proximity || 5,
        safety_level || 2,
        zip
      ]
    );
  
    const hospitalCrimeResults = rawResult[0];
    const parkSchoolResults = rawResult[1];
  
    return [hospitalCrimeResults, parkSchoolResults];
}
