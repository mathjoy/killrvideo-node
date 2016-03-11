import Promise from 'bluebird';

/**
 * Searches for videos that match the given query and returns the page specified.
 * 
 * @param {string} query - The search term/query
 * @param {number} pageSize - The number of videos per page.
 * @param {string} pagingToken - A token representing the current paging state.
 * @returns {Promise.<SearchResults>} The videos found
 */
export function searchVideos(query, pageSize, pagingToken) {
  return Promise.reject(new Error('TODO: Not implemented'));
};

/**
 * Gets search query suggestions for the specified query. Can be used for typeahead support.
 * 
 * @param {string} query - The query to get suggestions for
 * @param {number} limit - The max number of suggestions to retrieve
 * @returns {Promise.<Array.<string>>} A promise that resolves to the query suggestions.
 */
export function getQuerySuggestions(query, limit) {
  return Promise.reject(new Error('TODO: Not implemented'));
};