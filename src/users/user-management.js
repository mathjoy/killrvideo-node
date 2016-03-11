import Promise from 'bluebird';

import { cassandra } from '../common/cassandra';
import { createHash, validatePassword } from '../common/password-hash';

/**
 * User profile
 * @typedef {object} UserProfile
 * @property {string} userId - The user's uuid
 * @property {string} firstName - The user's first name
 * @property {string} lastName - The user's last name
 * @property {string} email - The user's email address
 */

/**
 * Creates a new user.
 * 
 * @param {UserProfile} user - The profile for the user to create
 * @param {string} password - A password for the user
 * @returns {Promise.<boolean>} True if the user was successfully created or false if a user with that email 
 * address already exists.
 */
export function createUser(user, password) {
  // TODO: Insert, need message bus to publish event
  return Promise.reject(new Error('TODO: Not implemented'));
};

/**
 * Verifies a user's credentials. Returns a Promise that resolves to either the user's Id if the
 * credentials are correct, or null if they are not correct.
 * 
 * @param {string} emailAddress - The email address to look the user up by.
 * @param {string} password - The password to verify.
 * @returns {Promise.<string>} The user's id if valid or null if password is not valid.
 */
export function verifyCredentials(emailAddress, password) {
  // Get the user's password from C* and verify
  const getUser = cassandra
    .executeAsync('SELECT email, password, userid FROM user_credentials WHERE email = ?', [ emailAddress ])
    .then(result => result.first());
    
  const checkPassword = getUser.then(row => !row ? false : validatePassword(password, row.password));
  
  return Promise.join(getUser, checkPassword, (row, isValid) => {
    return isValid ? row.userId : null;
  });
};

/**
 * Gets a user's profile information by their user Id.
 * 
 * @param {string} userId - The uuid string of the user to lookup.
 * @returns {Promise.<UserProfile>} The user's profile or null if not found.
 */
export function getUserProfile(userId) {
  return cassandra  
    .executeAsync('SELECT userid, firstname, lastname, email FROM users WHERE userid = ?', [ userId ])
    .then(result => mapRowToUserProfile(result.first()));
};

/**
 * Gets the user profiles for multiple users by Ids.
 * 
 * @param {Array.<string>} userIds - The uuid strings of the users to lookup.
 * @returns {Promise.<Array.<UserProfile>>} The profiles for those users with nulls for users that were not found.
 */
export function getUserProfiles(userIds) {
  // Sanity check to not allow more than 20 user Ids at a time since we're doing a multi-get
  if (!userIds || userIds.length === 0) return Promise.resolve([]);
  if (userIds.length > 20) return Promise.reject(new Error('Cannot do multi-get on more than 20 userIds'));
  
  // Do query for each user Id in parallel, then map row returned from each query to a user profile
  return Promise.map(userIds, userId => {
      return cassandra
        .executeAsync('SELECT userid, firstname, lastname, email FROM users WHERE userid = ?', [ userId ]);
    })
    .map(result => mapRowToUserProfile(result.first()));
};

/**
 * Helper function to map a C* row to a UserProfile.
 */
function mapRowToUserProfile(row) {
  if (!row) return null;
  
  return {
    userId: row['userid'],
    firstName: row['firstname'],
    lastName: row['lastname'],
    email: row['email']
  };
}
