const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb',
  port: 5432
});

// // the following assumes that you named your connection variable `pool`
// pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})

const properties = require("./json/properties.json");
const users = require("./json/users.json");

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {
  return pool
    .query(`SELECT * 
    FROM users 
    WHERE email = $1`, [email])
    .then((result) => {
      if (result.rows.length > 0) {
        console.log(result.rows);
        return result.rows[0];
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = function(id) {
  return pool
    .query(`SELECT *
    FROM users 
    WHERE id = $1`, [id])
    .then((result) => {
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        return null;
      }
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

const addUser = function(user) {
  return pool
    .query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`, [user.name, user.email, user.password])
    .then((result) => {
      console.log(result);
      return result;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */

const getAllReservations = (guest_id, limit = 10) => {
  return pool
    .query(`SELECT properties.*, reservations.id, reservations.start_date, avg(rating) as average_rating
      FROM reservations
      JOIN properties ON reservations.property_id = properties.id
      JOIN property_reviews ON properties.id = property_reviews.property_id
      WHERE reservations.guest_id = $1
      GROUP BY properties.id, reservations.id
      ORDER BY reservations.start_date
      LIMIT $2`, [guest_id, limit])
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      // console.log(err.message);
      throw err;
    });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = function(options, limit = 10) {

  const queryParams = [];

  let queryString = `
  SELECT properties.id, properties.owner_id, properties.title, properties.thumbnail_photo_url, properties.cover_photo_url, properties.cost_per_night, properties.parking_spaces, properties.number_of_bathrooms, properties.number_of_bedrooms, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_reviews.property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city.trim()}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(`${options.owner_id.trim()}`);
    if (queryParams.length === 1) {
      queryString += `WHERE owner_id = $${queryParams.length} `;
    } else if (queryParams.length >= 2) {
      queryString += `AND owner_id = $${queryParams.length} `;
    }
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100}`, `${options.maximum_price_per_night * 100}`);
    if (queryParams.length === 2) {
      queryString += `WHERE cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length} `;
    } else if (queryParams.length >= 3) {
      queryString += `AND cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length} `;
    }
  } else if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night * 100}`);
    if (queryParams.length === 1) {
      queryString += `WHERE cost_per_night >= $${queryParams.length - 1} `;
    } else if (queryParams.length >= 2) {
      queryString += `AND cost_per_night >= $${queryParams.length - 1} `;
    }
  } else if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night * 100}`);
    if (queryParams.length === 1) {
      queryString += `WHERE cost_per_night <= $${queryParams.length} `;
    } else if (queryParams.length >= 2) {
      queryString += `AND cost_per_night <= $${queryParams.length} `;
    }
  }

  queryString += `GROUP BY properties.id, properties.owner_id, properties.title, properties.thumbnail_photo_url, properties.cover_photo_url, properties.cost_per_night, properties.parking_spaces, properties.number_of_bathrooms, properties.number_of_bedrooms`;

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating.trim()}`);
    queryString += `
    HAVING AVG(property_reviews.rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += ` 
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `;

  console.log(queryString, queryParams);

  return pool
    .query(queryString, queryParams)
    .then((res) => {
      console.log(res.rows);
      return res.rows;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });

};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */

const addProperty = function(property) {
  const queryParams = [];

  let queryString = `
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`;
  
  queryParams.push(property.owner_id);
  queryParams.push(`%${property.title.trim()}%`);

  if (property.description) {
    queryParams.push(`%${property.description.trim()}%`);
  } else {
    queryParams.push(null);
  }

  queryParams.push(`${property.thumbnail_photo_url.trim()}`);
  queryParams.push(`${property.cover_photo_url.trim()}`);
  queryParams.push(property.cost_per_night.trim());
  queryParams.push(`%${property.street.trim()}%`);
  queryParams.push(`%${property.city.trim()}%`);
  queryParams.push(`%${property.province.trim()}%`);
  queryParams.push(`%${property.post_code.trim()}%`);
  queryParams.push(`%${property.country.trim()}%`);
  queryParams.push(property.parking_spaces);
  queryParams.push(property.number_of_bathrooms);
  queryParams.push(property.number_of_bedrooms);
  queryParams.push(true);
  console.log(queryString, queryParams);

  return pool
    .query(queryString, queryParams)
    .then((res) => {
      console.log(res.rows);
      return res.rows;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
