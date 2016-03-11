/**
 * A video search result.
 * @typedef SearchResult
 * @property {string} videoId - The uuid of the video
 * @property {string} name - The name of the video
 * @property {date} addedDate - The date the video was added to the site
 * @property {string} userId - The uuid of the author of the video
 * @property {string} previewImageLocation - A URL pointing to a thumbnail preview image.
 */

/**
 * A page of search results.
 * @typedef SearchResults
 * @property {Array<SearchResult>} videos - An array of the videos found.
 * @property {string} pagingToken - A paging token for getting subsequent pages.
 */